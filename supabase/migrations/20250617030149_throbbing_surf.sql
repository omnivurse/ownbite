-- Create bloodwork_trends table
CREATE TABLE IF NOT EXISTS bloodwork_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  biomarker text NOT NULL,                         -- e.g., 'iron', 'vitamin_d'
  value numeric NOT NULL,                          -- e.g., 13.5
  unit text DEFAULT 'mg/dL',                       -- optional: store measurement unit
  taken_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE bloodwork_trends ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own bloodwork trends" ON bloodwork_trends;
DROP POLICY IF EXISTS "Users can insert their own bloodwork trends" ON bloodwork_trends;
DROP POLICY IF EXISTS "Users can update their own bloodwork trends" ON bloodwork_trends;
DROP POLICY IF EXISTS "Users can delete their own bloodwork trends" ON bloodwork_trends;

-- Create policies for bloodwork_trends
CREATE POLICY "Users can view their own bloodwork trends"
  ON bloodwork_trends
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bloodwork trends"
  ON bloodwork_trends
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bloodwork trends"
  ON bloodwork_trends
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own bloodwork trends"
  ON bloodwork_trends
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create view to summarize trend data by month/quarter (for charting)
CREATE OR REPLACE VIEW bloodwork_trends_summary AS
SELECT
  user_id,
  biomarker,
  date_trunc('month', taken_at) AS month,
  avg(value) AS avg_value,
  min(value) AS min_value,
  max(value) AS max_value,
  count(*) AS reading_count
FROM bloodwork_trends
GROUP BY user_id, biomarker, date_trunc('month', taken_at);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_bloodwork_trends_user_biomarker
ON bloodwork_trends (user_id, biomarker);

CREATE INDEX IF NOT EXISTS idx_bloodwork_trends_taken_at
ON bloodwork_trends (taken_at);

-- Create the sync_bloodwork_trends function if it doesn't exist
CREATE OR REPLACE FUNCTION sync_bloodwork_trends()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new trend point when a nutrient status is added
  INSERT INTO bloodwork_trends (
    user_id,
    biomarker,
    value,
    unit,
    taken_at
  )
  VALUES (
    NEW.user_id,
    NEW.nutrient_name,
    NEW.current_value,
    NEW.unit,
    COALESCE(
      (SELECT uploaded_at::date FROM bloodwork_results WHERE id = NEW.bloodwork_id),
      CURRENT_DATE
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS sync_bloodwork_trends_trigger ON user_nutrient_status;

-- Create the trigger
CREATE TRIGGER sync_bloodwork_trends_trigger
AFTER INSERT ON user_nutrient_status
FOR EACH ROW
EXECUTE FUNCTION sync_bloodwork_trends();

-- Function to get trend status for a biomarker
CREATE OR REPLACE FUNCTION get_biomarker_trend(
  p_user_id uuid,
  p_biomarker text,
  p_months int DEFAULT 6
)
RETURNS TABLE (
  current_value numeric,
  previous_value numeric,
  change_percent numeric,
  trend text,
  unit text,
  reading_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date date;
BEGIN
  -- Calculate start date based on months parameter
  start_date := CURRENT_DATE - (p_months * INTERVAL '1 month');
  
  RETURN QUERY
  WITH recent_readings AS (
    SELECT
      value,
      unit,
      taken_at,
      ROW_NUMBER() OVER (ORDER BY taken_at DESC) as row_num
    FROM bloodwork_trends
    WHERE 
      user_id = p_user_id AND
      biomarker = p_biomarker AND
      taken_at >= start_date
    ORDER BY taken_at DESC
  )
  SELECT
    (SELECT value FROM recent_readings WHERE row_num = 1) as current_value,
    (SELECT value FROM recent_readings WHERE row_num = 2) as previous_value,
    CASE
      WHEN (SELECT value FROM recent_readings WHERE row_num = 2) IS NOT NULL AND
           (SELECT value FROM recent_readings WHERE row_num = 2) <> 0
      THEN
        (((SELECT value FROM recent_readings WHERE row_num = 1) - 
          (SELECT value FROM recent_readings WHERE row_num = 2)) / 
          (SELECT value FROM recent_readings WHERE row_num = 2)) * 100
      ELSE NULL
    END as change_percent,
    CASE
      WHEN (SELECT value FROM recent_readings WHERE row_num = 2) IS NULL THEN 'no_trend'
      WHEN ABS(((SELECT value FROM recent_readings WHERE row_num = 1) - 
                (SELECT value FROM recent_readings WHERE row_num = 2)) / 
                (SELECT value FROM recent_readings WHERE row_num = 2)) < 0.05 THEN 'stable'
      WHEN (SELECT value FROM recent_readings WHERE row_num = 1) > 
           (SELECT value FROM recent_readings WHERE row_num = 2) THEN 'increasing'
      ELSE 'decreasing'
    END as trend,
    (SELECT unit FROM recent_readings WHERE row_num = 1) as unit,
    (SELECT COUNT(*) FROM recent_readings) as reading_count;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_biomarker_trend(uuid, text, int) TO authenticated;

-- Add comment to track this migration
COMMENT ON TABLE bloodwork_trends IS 'Stores individual data points for biomarkers over time';
COMMENT ON VIEW bloodwork_trends_summary IS 'Monthly aggregated view of biomarker trends for charting';
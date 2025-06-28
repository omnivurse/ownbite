-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  sitting_hours numeric DEFAULT 0,
  driving_hours numeric DEFAULT 0,
  screen_time_hours numeric DEFAULT 0,
  screen_time_breakdown jsonb DEFAULT '{}',
  sleep_hours numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create diet_spending table
CREATE TABLE IF NOT EXISTS diet_spending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  amount numeric DEFAULT 0,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Create nutrition_logs table
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  hydration_pct numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create food_logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  is_fast_food boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create substance_logs table
CREATE TABLE IF NOT EXISTS substance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  substance_type text,
  amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create meal_tracking table
CREATE TABLE IF NOT EXISTS meal_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE SET NULL,
  adherence_pct numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create diary_logs table
CREATE TABLE IF NOT EXISTS diary_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  entry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_spending ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE substance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- SELECT policies
  DROP POLICY IF EXISTS "Users can view their activity" ON activity_logs;
  DROP POLICY IF EXISTS "Users can view their diet spending" ON diet_spending;
  DROP POLICY IF EXISTS "Users can view their nutrition" ON nutrition_logs;
  DROP POLICY IF EXISTS "Users can view their food logs" ON food_logs;
  DROP POLICY IF EXISTS "Users can view their substance logs" ON substance_logs;
  DROP POLICY IF EXISTS "Users can view their meal tracking" ON meal_tracking;
  DROP POLICY IF EXISTS "Users can view their diary logs" ON diary_logs;
  
  -- INSERT policies
  DROP POLICY IF EXISTS "Users can insert their activity" ON activity_logs;
  DROP POLICY IF EXISTS "Users can insert their diet spending" ON diet_spending;
  DROP POLICY IF EXISTS "Users can insert their nutrition" ON nutrition_logs;
  DROP POLICY IF EXISTS "Users can insert their food logs" ON food_logs;
  DROP POLICY IF EXISTS "Users can insert their substance logs" ON substance_logs;
  DROP POLICY IF EXISTS "Users can insert their meal tracking" ON meal_tracking;
  DROP POLICY IF EXISTS "Users can insert their diary logs" ON diary_logs;
  
  -- UPDATE policies
  DROP POLICY IF EXISTS "Users can update their activity" ON activity_logs;
  DROP POLICY IF EXISTS "Users can update their diet spending" ON diet_spending;
  DROP POLICY IF EXISTS "Users can update their nutrition" ON nutrition_logs;
  DROP POLICY IF EXISTS "Users can update their food logs" ON food_logs;
  DROP POLICY IF EXISTS "Users can update their substance logs" ON substance_logs;
  DROP POLICY IF EXISTS "Users can update their meal tracking" ON meal_tracking;
  DROP POLICY IF EXISTS "Users can update their diary logs" ON diary_logs;
  
  -- DELETE policies
  DROP POLICY IF EXISTS "Users can delete their activity" ON activity_logs;
  DROP POLICY IF EXISTS "Users can delete their diet spending" ON diet_spending;
  DROP POLICY IF EXISTS "Users can delete their nutrition" ON nutrition_logs;
  DROP POLICY IF EXISTS "Users can delete their food logs" ON food_logs;
  DROP POLICY IF EXISTS "Users can delete their substance logs" ON substance_logs;
  DROP POLICY IF EXISTS "Users can delete their meal tracking" ON meal_tracking;
  DROP POLICY IF EXISTS "Users can delete their diary logs" ON diary_logs;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies for SELECT operations
CREATE POLICY "Users can view their activity" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their diet spending" ON diet_spending
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their nutrition" ON nutrition_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their food logs" ON food_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their substance logs" ON substance_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their meal tracking" ON meal_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their diary logs" ON diary_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for INSERT operations
CREATE POLICY "Users can insert their activity" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their diet spending" ON diet_spending
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their nutrition" ON nutrition_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their food logs" ON food_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their substance logs" ON substance_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their meal tracking" ON meal_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their diary logs" ON diary_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for UPDATE operations
CREATE POLICY "Users can update their activity" ON activity_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their diet spending" ON diet_spending
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their nutrition" ON nutrition_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their food logs" ON food_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their substance logs" ON substance_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their meal tracking" ON meal_tracking
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their diary logs" ON diary_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create policies for DELETE operations
CREATE POLICY "Users can delete their activity" ON activity_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their diet spending" ON diet_spending
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their nutrition" ON nutrition_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their food logs" ON food_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their substance logs" ON substance_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their meal tracking" ON meal_tracking
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their diary logs" ON diary_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_date_idx ON activity_logs(date);
CREATE INDEX IF NOT EXISTS diet_spending_user_id_idx ON diet_spending(user_id);
CREATE INDEX IF NOT EXISTS diet_spending_date_idx ON diet_spending(date);
CREATE INDEX IF NOT EXISTS nutrition_logs_user_id_idx ON nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS nutrition_logs_date_idx ON nutrition_logs(date);
CREATE INDEX IF NOT EXISTS food_logs_user_id_idx ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS food_logs_date_idx ON food_logs(date);
CREATE INDEX IF NOT EXISTS substance_logs_user_id_idx ON substance_logs(user_id);
CREATE INDEX IF NOT EXISTS substance_logs_date_idx ON substance_logs(date);
CREATE INDEX IF NOT EXISTS meal_tracking_user_id_idx ON meal_tracking(user_id);
CREATE INDEX IF NOT EXISTS meal_tracking_date_idx ON meal_tracking(date);
CREATE INDEX IF NOT EXISTS diary_logs_user_id_idx ON diary_logs(user_id);
CREATE INDEX IF NOT EXISTS diary_logs_date_idx ON diary_logs(date);

-- Create function to get KPI dashboard data
CREATE OR REPLACE FUNCTION get_kpi_dashboard(
  p_user_id uuid DEFAULT auth.uid(),
  p_timeframe text DEFAULT 'week'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  start_date date;
  result json;
  days text[];
  hydration_avg numeric;
  sitting_data numeric[];
  driving_data numeric[];
  sleep_data numeric[];
  fast_food_count integer;
  alcohol_days integer;
  weekly_spend numeric;
  meal_adherence_avg numeric;
  diary_data integer[];
  scan_count integer;
  protein_pct numeric;
  carbs_pct numeric;
  fat_pct numeric;
BEGIN
  -- Set start date based on timeframe
  CASE p_timeframe
    WHEN 'week' THEN start_date := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'month' THEN start_date := CURRENT_DATE - INTERVAL '30 days';
    WHEN 'year' THEN start_date := CURRENT_DATE - INTERVAL '365 days';
    ELSE start_date := CURRENT_DATE - INTERVAL '7 days';
  END CASE;

  -- Generate day labels
  WITH date_series AS (
    SELECT generate_series(start_date, CURRENT_DATE, '1 day'::interval)::date as day
  )
  SELECT array_agg(to_char(day, 'Dy')) INTO days FROM date_series;

  -- Get hydration average
  SELECT COALESCE(AVG(hydration_pct), 75) INTO hydration_avg
  FROM nutrition_logs
  WHERE user_id = p_user_id AND date >= start_date;

  -- Get sitting hours data
  WITH sitting_series AS (
    SELECT generate_series(start_date, CURRENT_DATE, '1 day'::interval)::date as day
  ),
  sitting_data AS (
    SELECT day, COALESCE(al.sitting_hours, 0) as hours
    FROM sitting_series ss
    LEFT JOIN activity_logs al ON ss.day = al.date AND al.user_id = p_user_id
  )
  SELECT array_agg(hours) INTO sitting_data FROM sitting_data;

  -- Get driving hours data
  WITH driving_series AS (
    SELECT generate_series(start_date, CURRENT_DATE, '1 day'::interval)::date as day
  ),
  driving_data AS (
    SELECT day, COALESCE(al.driving_hours, 0) as hours
    FROM driving_series ss
    LEFT JOIN activity_logs al ON ss.day = al.date AND al.user_id = p_user_id
  )
  SELECT array_agg(hours) INTO driving_data FROM driving_data;

  -- Get sleep hours data
  WITH sleep_series AS (
    SELECT generate_series(start_date, CURRENT_DATE, '1 day'::interval)::date as day
  ),
  sleep_data AS (
    SELECT day, COALESCE(al.sleep_hours, 0) as hours
    FROM sleep_series ss
    LEFT JOIN activity_logs al ON ss.day = al.date AND al.user_id = p_user_id
  )
  SELECT array_agg(hours) INTO sleep_data FROM sleep_data;

  -- Get fast food count
  SELECT COUNT(*) INTO fast_food_count
  FROM food_logs
  WHERE user_id = p_user_id AND date >= start_date AND is_fast_food = true;

  -- Get alcohol days
  SELECT COUNT(DISTINCT date) INTO alcohol_days
  FROM substance_logs
  WHERE user_id = p_user_id AND date >= start_date AND substance_type = 'alcohol';

  -- Get weekly spend
  SELECT COALESCE(SUM(amount), 0) INTO weekly_spend
  FROM diet_spending
  WHERE user_id = p_user_id AND date >= start_date;

  -- Get meal plan adherence average
  SELECT COALESCE(AVG(adherence_pct), 0) INTO meal_adherence_avg
  FROM meal_tracking
  WHERE user_id = p_user_id AND date >= start_date;

  -- Get diary entries data
  WITH diary_series AS (
    SELECT generate_series(start_date, CURRENT_DATE, '1 day'::interval)::date as day
  ),
  diary_data AS (
    SELECT day, COALESCE(dl.entry_count, 0) as entries
    FROM diary_series ds
    LEFT JOIN diary_logs dl ON ds.day = dl.date AND dl.user_id = p_user_id
  )
  SELECT array_agg(entries) INTO diary_data FROM diary_data;

  -- Get scan count
  SELECT COUNT(*) INTO scan_count
  FROM food_scans
  WHERE user_id = p_user_id AND created_at >= start_date;

  -- Get macro percentages from food entries
  SELECT 
    COALESCE(SUM(protein) * 4 / NULLIF(SUM(calories), 0) * 100, 25) as protein_pct,
    COALESCE(SUM(carbs) * 4 / NULLIF(SUM(calories), 0) * 100, 50) as carbs_pct,
    COALESCE(SUM(fat) * 9 / NULLIF(SUM(calories), 0) * 100, 25) as fat_pct
  INTO protein_pct, carbs_pct, fat_pct
  FROM food_entries
  WHERE user_id = p_user_id AND timestamp >= start_date;

  -- Build result JSON
  result := json_build_object(
    'hydration_pct', COALESCE(hydration_avg, 75),
    'sitting_hours', json_build_object(
      'labels', days,
      'data', COALESCE(sitting_data, ARRAY[6, 7, 8, 6, 7, 5, 6])
    ),
    'driving_hours', json_build_object(
      'labels', days,
      'data', COALESCE(driving_data, ARRAY[1.5, 2, 1, 2.5, 1, 0.5, 1])
    ),
    'screen_usage', json_build_object(
      'labels', ARRAY['Social Media', 'Work', 'Entertainment', 'Education'],
      'data', ARRAY[2, 6, 3, 1]
    ),
    'sleep_hours', json_build_object(
      'labels', days,
      'data', COALESCE(sleep_data, ARRAY[7, 6.5, 7, 8, 6, 7.5, 7])
    ),
    'fast_food_count', COALESCE(fast_food_count, 2),
    'alcohol_days', COALESCE(alcohol_days, 1),
    'weekly_spend', COALESCE(weekly_spend, 85),
    'meal_streak_pct', COALESCE(meal_adherence_avg, 80),
    'diary_entries', json_build_object(
      'labels', days,
      'data', COALESCE(diary_data, ARRAY[2, 3, 1, 2, 3, 2, 1])
    ),
    'weekly_scans', COALESCE(scan_count, 8),
    'macro_ratio', json_build_object(
      'labels', ARRAY['Protein', 'Carbs', 'Fat'],
      'data', ARRAY[ROUND(protein_pct), ROUND(carbs_pct), ROUND(fat_pct)]
    ),
    'goal_completion', 85,
    'streak_days', 5
  );

  RETURN result;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_kpi_dashboard(uuid, text) TO authenticated;

-- Add comments to track this migration
COMMENT ON TABLE activity_logs IS 'Tracks user activity metrics like sitting time and sleep';
COMMENT ON TABLE diet_spending IS 'Tracks user spending on food';
COMMENT ON TABLE nutrition_logs IS 'Tracks user nutrition metrics like hydration';
COMMENT ON TABLE food_logs IS 'Tracks user food consumption patterns';
COMMENT ON TABLE substance_logs IS 'Tracks user substance consumption like alcohol';
COMMENT ON TABLE meal_tracking IS 'Tracks user meal plan adherence';
COMMENT ON TABLE diary_logs IS 'Tracks user diary entry activity';
COMMENT ON FUNCTION get_kpi_dashboard IS 'Aggregates KPI dashboard data for a user';
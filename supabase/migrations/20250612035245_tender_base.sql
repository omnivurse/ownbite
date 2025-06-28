/*
  # Bloodwork Integration for Nutrient Analysis

  1. New Tables
    - `bloodwork_results` - Store uploaded bloodwork files and analysis
    - `nutrient_ranges` - Reference ranges for vitamins/minerals
    - `nutrient_recommendations` - AI-powered food suggestions based on deficiencies
    - `user_nutrient_status` - Current nutrient status tracking for each user

  2. Security
    - Enable RLS on user-specific tables
    - Allow public read access to reference data
    - Users can only access their own bloodwork and nutrient status

  3. Functions
    - `analyze_nutrient_status` - Automatically determine if nutrient levels are optimal/low/high
    - `get_nutrient_recommendations` - Get personalized food recommendations based on deficiencies
*/

-- Create bloodwork_results table
CREATE TABLE IF NOT EXISTS bloodwork_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  file_url text,
  file_name text,
  source_type text CHECK (source_type IN ('pdf', 'csv', 'manual')) DEFAULT 'manual',
  notes text,
  parsed_data jsonb DEFAULT '{}',
  analysis_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create nutrient_ranges table (reference data)
CREATE TABLE IF NOT EXISTS nutrient_ranges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_name text NOT NULL UNIQUE,
  unit text NOT NULL,
  min_value numeric NOT NULL,
  max_value numeric NOT NULL,
  optimal_min numeric,
  optimal_max numeric,
  description text,
  category text, -- 'vitamin', 'mineral', 'hormone', 'metabolic'
  created_at timestamptz DEFAULT now()
);

-- Create nutrient_recommendations table
CREATE TABLE IF NOT EXISTS nutrient_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_name text NOT NULL,
  deficiency_level text CHECK (deficiency_level IN ('low', 'very_low', 'high', 'very_high')),
  recommended_foods text[] NOT NULL,
  foods_to_avoid text[],
  explanation text,
  priority_level integer DEFAULT 1, -- 1=high, 2=medium, 3=low
  created_at timestamptz DEFAULT now()
);

-- Create user_nutrient_status table (current status for each user)
CREATE TABLE IF NOT EXISTS user_nutrient_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bloodwork_id uuid REFERENCES bloodwork_results(id) ON DELETE CASCADE,
  nutrient_name text NOT NULL,
  current_value numeric NOT NULL,
  unit text NOT NULL,
  status text CHECK (status IN ('optimal', 'low', 'very_low', 'high', 'very_high')) NOT NULL,
  recommendations_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, nutrient_name, bloodwork_id)
);

-- Enable Row Level Security
ALTER TABLE bloodwork_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrient_status ENABLE ROW LEVEL SECURITY;

-- Create policies for bloodwork_results
CREATE POLICY "Users can view their own bloodwork"
  ON bloodwork_results
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own bloodwork"
  ON bloodwork_results
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own bloodwork"
  ON bloodwork_results
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own bloodwork"
  ON bloodwork_results
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Create policies for user_nutrient_status
CREATE POLICY "Users can view their own nutrient status"
  ON user_nutrient_status
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own nutrient status"
  ON user_nutrient_status
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own nutrient status"
  ON user_nutrient_status
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own nutrient status"
  ON user_nutrient_status
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Allow everyone to read reference data
CREATE POLICY "Anyone can view nutrient ranges"
  ON nutrient_ranges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view nutrient recommendations"
  ON nutrient_recommendations
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bloodwork_results_user_id_idx ON bloodwork_results(user_id);
CREATE INDEX IF NOT EXISTS bloodwork_results_uploaded_at_idx ON bloodwork_results(uploaded_at);
CREATE INDEX IF NOT EXISTS user_nutrient_status_user_id_idx ON user_nutrient_status(user_id);
CREATE INDEX IF NOT EXISTS user_nutrient_status_nutrient_idx ON user_nutrient_status(nutrient_name);
CREATE INDEX IF NOT EXISTS nutrient_ranges_name_idx ON nutrient_ranges(nutrient_name);

-- Insert reference data for common nutrients
INSERT INTO nutrient_ranges (nutrient_name, unit, min_value, max_value, optimal_min, optimal_max, description, category) VALUES
('Vitamin D', 'ng/mL', 30, 100, 40, 80, 'Essential for bone health and immune function', 'vitamin'),
('Vitamin B12', 'pg/mL', 300, 900, 400, 700, 'Important for nerve function and red blood cell formation', 'vitamin'),
('Iron', 'μg/dL', 60, 170, 80, 150, 'Essential for oxygen transport and energy production', 'mineral'),
('Ferritin', 'ng/mL', 15, 300, 30, 200, 'Iron storage protein, indicates iron stores', 'mineral'),
('Magnesium', 'mg/dL', 1.7, 2.2, 1.8, 2.1, 'Important for muscle and nerve function', 'mineral'),
('Zinc', 'μg/dL', 70, 120, 80, 110, 'Essential for immune function and wound healing', 'mineral'),
('Folate', 'ng/mL', 3, 20, 5, 15, 'Important for DNA synthesis and red blood cell formation', 'vitamin'),
('Calcium', 'mg/dL', 8.5, 10.5, 9.0, 10.2, 'Essential for bone health and muscle function', 'mineral')
ON CONFLICT (nutrient_name) DO NOTHING;

-- Insert food recommendations for common deficiencies (with properly cast empty arrays)
INSERT INTO nutrient_recommendations (nutrient_name, deficiency_level, recommended_foods, foods_to_avoid, explanation, priority_level) VALUES
('Vitamin D', 'low', ARRAY['fatty fish', 'egg yolks', 'fortified milk', 'mushrooms'], ARRAY[]::text[], 'Increase sun exposure and consume vitamin D rich foods', 1),
('Vitamin D', 'very_low', ARRAY['salmon', 'mackerel', 'sardines', 'cod liver oil', 'fortified cereals'], ARRAY[]::text[], 'Consider supplementation and increase dietary sources', 1),
('Iron', 'low', ARRAY['lean red meat', 'spinach', 'lentils', 'tofu', 'dark chocolate'], ARRAY['tea with meals', 'coffee with meals'], 'Combine with vitamin C for better absorption', 1),
('Iron', 'very_low', ARRAY['beef liver', 'oysters', 'white beans', 'fortified cereals'], ARRAY['dairy with iron-rich meals'], 'Urgent: consult healthcare provider', 1),
('Iron', 'high', ARRAY['vitamin C rich foods'], ARRAY['red meat', 'iron supplements', 'fortified cereals'], 'Reduce iron intake and consult healthcare provider', 1),
('Vitamin B12', 'low', ARRAY['fish', 'meat', 'poultry', 'eggs', 'dairy products'], ARRAY[]::text[], 'Essential for vegetarians to supplement', 1),
('Vitamin B12', 'very_low', ARRAY['beef liver', 'clams', 'nutritional yeast', 'fortified plant milk'], ARRAY[]::text[], 'Consider B12 injections or high-dose supplements', 1),
('Magnesium', 'low', ARRAY['almonds', 'spinach', 'black beans', 'avocado', 'dark chocolate'], ARRAY[]::text[], 'Important for muscle and heart health', 2),
('Magnesium', 'very_low', ARRAY['pumpkin seeds', 'chia seeds', 'quinoa', 'dark leafy greens'], ARRAY[]::text[], 'Consider magnesium supplementation', 2),
('Zinc', 'low', ARRAY['oysters', 'beef', 'pumpkin seeds', 'chickpeas', 'cashews'], ARRAY[]::text[], 'Essential for immune function', 2),
('Zinc', 'very_low', ARRAY['shellfish', 'hemp seeds', 'sesame seeds', 'pine nuts'], ARRAY[]::text[], 'Consider zinc supplementation', 2),
('Folate', 'low', ARRAY['leafy greens', 'legumes', 'asparagus', 'broccoli', 'citrus fruits'], ARRAY[]::text[], 'Important for DNA synthesis', 2),
('Folate', 'very_low', ARRAY['fortified cereals', 'liver', 'black-eyed peas', 'brussels sprouts'], ARRAY[]::text[], 'Consider folate supplementation', 1),
('Calcium', 'low', ARRAY['dairy products', 'sardines', 'kale', 'almonds', 'sesame seeds'], ARRAY['high sodium foods'], 'Important for bone health', 2),
('Calcium', 'very_low', ARRAY['fortified plant milk', 'tahini', 'collard greens', 'canned salmon with bones'], ARRAY['excessive caffeine'], 'Consider calcium supplementation', 1)
ON CONFLICT DO NOTHING;

-- Function to analyze nutrient status
CREATE OR REPLACE FUNCTION analyze_nutrient_status(
  p_user_id uuid,
  p_nutrient_name text,
  p_value numeric,
  p_unit text
)
RETURNS text AS $$
DECLARE
  range_record nutrient_ranges%ROWTYPE;
  status_result text;
BEGIN
  -- Get the reference range for this nutrient
  SELECT * INTO range_record 
  FROM nutrient_ranges 
  WHERE nutrient_name = p_nutrient_name;
  
  IF NOT FOUND THEN
    RETURN 'unknown'; -- No reference range available
  END IF;
  
  -- Determine status based on value
  IF p_value < range_record.min_value * 0.7 THEN
    status_result := 'very_low';
  ELSIF p_value < range_record.min_value THEN
    status_result := 'low';
  ELSIF p_value > range_record.max_value * 1.3 THEN
    status_result := 'very_high';
  ELSIF p_value > range_record.max_value THEN
    status_result := 'high';
  ELSE
    status_result := 'optimal';
  END IF;
  
  RETURN status_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized food recommendations
CREATE OR REPLACE FUNCTION get_nutrient_recommendations(p_user_id uuid)
RETURNS TABLE(
  nutrient_name text,
  status text,
  recommended_foods text[],
  foods_to_avoid text[],
  explanation text,
  priority_level integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uns.nutrient_name,
    uns.status,
    nr.recommended_foods,
    nr.foods_to_avoid,
    nr.explanation,
    nr.priority_level
  FROM user_nutrient_status uns
  JOIN nutrient_recommendations nr ON uns.nutrient_name = nr.nutrient_name 
    AND uns.status = nr.deficiency_level
  WHERE uns.user_id = p_user_id
    AND uns.status IN ('low', 'very_low', 'high', 'very_high')
  ORDER BY nr.priority_level, uns.nutrient_name;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION analyze_nutrient_status(uuid, text, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_nutrient_recommendations(uuid) TO authenticated;

-- Add comment to track this migration
COMMENT ON TABLE bloodwork_results IS 'Stores uploaded bloodwork files and analysis results';
COMMENT ON TABLE user_nutrient_status IS 'Current nutrient status and deficiencies for each user';
COMMENT ON TABLE nutrient_ranges IS 'Reference ranges for vitamins, minerals, and other nutrients';
COMMENT ON TABLE nutrient_recommendations IS 'Food recommendations based on nutrient deficiencies or excesses';
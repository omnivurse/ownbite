/*
  # Bloodwork and Nutrition Goals Integration

  1. New Tables
    - `nutrition_goals` - User's daily nutrition targets
    - `daily_goal_logs` - Progress tracking for goals
    - `bloodwork_results` - Uploaded bloodwork files and analysis
    - `nutrient_ranges` - Reference ranges for nutrients
    - `nutrient_recommendations` - Food suggestions for deficiencies
    - `user_nutrient_status` - Current nutrient status per user

  2. Security
    - Enable RLS on all user tables
    - Create policies for authenticated users to manage their own data
    - Allow public read access to reference data

  3. Functions
    - BMR/TDEE calculation for personalized goals
    - Daily goal tracking with tolerance
    - Nutrient status analysis
    - Personalized food recommendations
*/

-- Create nutrition_goals table
CREATE TABLE IF NOT EXISTS nutrition_goals (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  calories_goal integer NOT NULL DEFAULT 2000,
  protein_goal_g integer NOT NULL DEFAULT 100,
  fat_goal_g integer NOT NULL DEFAULT 70,
  carbs_goal_g integer NOT NULL DEFAULT 150,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  weight_kg integer,
  height_cm integer,
  age integer,
  activity_level text CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) DEFAULT 'moderate',
  goal_type text CHECK (goal_type IN ('maintain', 'lose', 'gain')) DEFAULT 'maintain',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_goal_logs table
CREATE TABLE IF NOT EXISTS daily_goal_logs (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date DEFAULT CURRENT_DATE,
  actual_calories integer DEFAULT 0,
  actual_protein_g integer DEFAULT 0,
  actual_fat_g integer DEFAULT 0,
  actual_carbs_g integer DEFAULT 0,
  met_calories_goal boolean DEFAULT false,
  met_protein_goal boolean DEFAULT false,
  met_fat_goal boolean DEFAULT false,
  met_carbs_goal boolean DEFAULT false,
  overall_goal_met boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, log_date)
);

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
  category text,
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
  priority_level integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create user_nutrient_status table
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
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloodwork_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrient_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Nutrition goals policies
  DROP POLICY IF EXISTS "Users can view their own nutrition goals" ON nutrition_goals;
  DROP POLICY IF EXISTS "Users can insert their own nutrition goals" ON nutrition_goals;
  DROP POLICY IF EXISTS "Users can update their own nutrition goals" ON nutrition_goals;
  DROP POLICY IF EXISTS "Users can delete their own nutrition goals" ON nutrition_goals;
  
  -- Daily goal logs policies
  DROP POLICY IF EXISTS "Users can view their own goal logs" ON daily_goal_logs;
  DROP POLICY IF EXISTS "Users can insert their own goal logs" ON daily_goal_logs;
  DROP POLICY IF EXISTS "Users can update their own goal logs" ON daily_goal_logs;
  
  -- Bloodwork results policies
  DROP POLICY IF EXISTS "Users can view their own bloodwork" ON bloodwork_results;
  DROP POLICY IF EXISTS "Users can insert their own bloodwork" ON bloodwork_results;
  DROP POLICY IF EXISTS "Users can update their own bloodwork" ON bloodwork_results;
  DROP POLICY IF EXISTS "Users can delete their own bloodwork" ON bloodwork_results;
  
  -- User nutrient status policies
  DROP POLICY IF EXISTS "Users can view their own nutrient status" ON user_nutrient_status;
  DROP POLICY IF EXISTS "Users can insert their own nutrient status" ON user_nutrient_status;
  DROP POLICY IF EXISTS "Users can update their own nutrient status" ON user_nutrient_status;
  DROP POLICY IF EXISTS "Users can delete their own nutrient status" ON user_nutrient_status;
  
  -- Reference data policies
  DROP POLICY IF EXISTS "Anyone can view nutrient ranges" ON nutrient_ranges;
  DROP POLICY IF EXISTS "Anyone can view nutrient recommendations" ON nutrient_recommendations;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies for nutrition_goals
CREATE POLICY "Users can view their own nutrition goals"
  ON nutrition_goals FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own nutrition goals"
  ON nutrition_goals FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own nutrition goals"
  ON nutrition_goals FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own nutrition goals"
  ON nutrition_goals FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- Create policies for daily_goal_logs
CREATE POLICY "Users can view their own goal logs"
  ON daily_goal_logs FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own goal logs"
  ON daily_goal_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own goal logs"
  ON daily_goal_logs FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Create policies for bloodwork_results
CREATE POLICY "Users can view their own bloodwork"
  ON bloodwork_results FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own bloodwork"
  ON bloodwork_results FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own bloodwork"
  ON bloodwork_results FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own bloodwork"
  ON bloodwork_results FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- Create policies for user_nutrient_status
CREATE POLICY "Users can view their own nutrient status"
  ON user_nutrient_status FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own nutrient status"
  ON user_nutrient_status FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own nutrient status"
  ON user_nutrient_status FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own nutrient status"
  ON user_nutrient_status FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- Allow everyone to read reference data
CREATE POLICY "Anyone can view nutrient ranges"
  ON nutrient_ranges FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Anyone can view nutrient recommendations"
  ON nutrient_recommendations FOR SELECT TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS nutrition_goals_user_id_idx ON nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS daily_goal_logs_user_id_idx ON daily_goal_logs(user_id);
CREATE INDEX IF NOT EXISTS daily_goal_logs_date_idx ON daily_goal_logs(log_date);
CREATE INDEX IF NOT EXISTS bloodwork_results_user_id_idx ON bloodwork_results(user_id);
CREATE INDEX IF NOT EXISTS bloodwork_results_uploaded_at_idx ON bloodwork_results(uploaded_at);
CREATE INDEX IF NOT EXISTS user_nutrient_status_user_id_idx ON user_nutrient_status(user_id);
CREATE INDEX IF NOT EXISTS user_nutrient_status_nutrient_idx ON user_nutrient_status(nutrient_name);
CREATE INDEX IF NOT EXISTS nutrient_ranges_name_idx ON nutrient_ranges(nutrient_name);

-- Insert reference data for common nutrients (only if not exists)
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

-- Insert food recommendations (with properly cast empty arrays)
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

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS calculate_recommended_goals(text, integer, integer, integer, text, text);
DROP FUNCTION IF EXISTS update_daily_goal_log(uuid, date);
DROP FUNCTION IF EXISTS analyze_nutrient_status(uuid, text, numeric, text);
DROP FUNCTION IF EXISTS get_nutrient_recommendations(uuid);

-- Function to calculate recommended goals based on user profile
CREATE FUNCTION calculate_recommended_goals(
  p_gender text,
  p_weight_kg integer,
  p_height_cm integer,
  p_age integer,
  p_activity_level text,
  p_goal_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bmr numeric;
  tdee numeric;
  calories_goal integer;
  protein_goal integer;
  fat_goal integer;
  carbs_goal integer;
BEGIN
  -- Calculate BMR using Mifflin-St Jeor Equation
  IF p_gender = 'male' THEN
    bmr := 10 * p_weight_kg + 6.25 * p_height_cm - 5 * p_age + 5;
  ELSE
    bmr := 10 * p_weight_kg + 6.25 * p_height_cm - 5 * p_age - 161;
  END IF;

  -- Calculate TDEE based on activity level
  CASE p_activity_level
    WHEN 'sedentary' THEN tdee := bmr * 1.2;
    WHEN 'light' THEN tdee := bmr * 1.375;
    WHEN 'moderate' THEN tdee := bmr * 1.55;
    WHEN 'active' THEN tdee := bmr * 1.725;
    WHEN 'very_active' THEN tdee := bmr * 1.9;
    ELSE tdee := bmr * 1.55;
  END CASE;

  -- Adjust for goal type
  CASE p_goal_type
    WHEN 'lose' THEN calories_goal := ROUND(tdee - 500);
    WHEN 'gain' THEN calories_goal := ROUND(tdee + 500);
    ELSE calories_goal := ROUND(tdee);
  END CASE;

  -- Calculate macros (protein: 1.6g/kg, fat: 25% of calories, carbs: remainder)
  protein_goal := ROUND(p_weight_kg * 1.6);
  fat_goal := ROUND(calories_goal * 0.25 / 9);
  carbs_goal := ROUND((calories_goal - (protein_goal * 4) - (fat_goal * 9)) / 4);

  RETURN json_build_object(
    'calories_goal', calories_goal,
    'protein_goal_g', protein_goal,
    'fat_goal_g', fat_goal,
    'carbs_goal_g', carbs_goal
  );
END;
$$;

-- Function to update daily goal logs
CREATE FUNCTION update_daily_goal_log(p_user_id uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  goals_record nutrition_goals%ROWTYPE;
  daily_totals record;
  tolerance_percent numeric := 0.1; -- 10% tolerance
BEGIN
  -- Get user's nutrition goals
  SELECT * INTO goals_record FROM nutrition_goals WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN; -- No goals set, nothing to update
  END IF;

  -- Calculate daily totals from food_entries
  SELECT 
    COALESCE(SUM(calories), 0) as total_calories,
    COALESCE(SUM(protein), 0) as total_protein,
    COALESCE(SUM(carbs), 0) as total_carbs,
    COALESCE(SUM(fat), 0) as total_fat
  INTO daily_totals
  FROM food_entries 
  WHERE user_id = p_user_id 
    AND DATE(timestamp) = p_date;

  -- Insert or update daily goal log
  INSERT INTO daily_goal_logs (
    user_id,
    log_date,
    actual_calories,
    actual_protein_g,
    actual_fat_g,
    actual_carbs_g,
    met_calories_goal,
    met_protein_goal,
    met_fat_goal,
    met_carbs_goal,
    overall_goal_met
  ) VALUES (
    p_user_id,
    p_date,
    daily_totals.total_calories,
    daily_totals.total_protein,
    daily_totals.total_fat,
    daily_totals.total_carbs,
    daily_totals.total_calories BETWEEN (goals_record.calories_goal * (1 - tolerance_percent)) AND (goals_record.calories_goal * (1 + tolerance_percent)),
    daily_totals.total_protein >= (goals_record.protein_goal_g * (1 - tolerance_percent)),
    daily_totals.total_fat BETWEEN (goals_record.fat_goal_g * (1 - tolerance_percent)) AND (goals_record.fat_goal_g * (1 + tolerance_percent)),
    daily_totals.total_carbs BETWEEN (goals_record.carbs_goal_g * (1 - tolerance_percent)) AND (goals_record.carbs_goal_g * (1 + tolerance_percent)),
    (daily_totals.total_calories BETWEEN (goals_record.calories_goal * (1 - tolerance_percent)) AND (goals_record.calories_goal * (1 + tolerance_percent)))
    AND (daily_totals.total_protein >= (goals_record.protein_goal_g * (1 - tolerance_percent)))
    AND (daily_totals.total_fat BETWEEN (goals_record.fat_goal_g * (1 - tolerance_percent)) AND (goals_record.fat_goal_g * (1 + tolerance_percent)))
    AND (daily_totals.total_carbs BETWEEN (goals_record.carbs_goal_g * (1 - tolerance_percent)) AND (goals_record.carbs_goal_g * (1 + tolerance_percent)))
  )
  ON CONFLICT (user_id, log_date) 
  DO UPDATE SET
    actual_calories = EXCLUDED.actual_calories,
    actual_protein_g = EXCLUDED.actual_protein_g,
    actual_fat_g = EXCLUDED.actual_fat_g,
    actual_carbs_g = EXCLUDED.actual_carbs_g,
    met_calories_goal = EXCLUDED.met_calories_goal,
    met_protein_goal = EXCLUDED.met_protein_goal,
    met_fat_goal = EXCLUDED.met_fat_goal,
    met_carbs_goal = EXCLUDED.met_carbs_goal,
    overall_goal_met = EXCLUDED.overall_goal_met;
END;
$$;

-- Function to analyze nutrient status
CREATE FUNCTION analyze_nutrient_status(
  p_user_id uuid,
  p_nutrient_name text,
  p_value numeric,
  p_unit text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Function to get personalized food recommendations
CREATE FUNCTION get_nutrient_recommendations(p_user_id uuid)
RETURNS TABLE(
  nutrient_name text,
  status text,
  recommended_foods text[],
  foods_to_avoid text[],
  explanation text,
  priority_level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_recommended_goals(text, integer, integer, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_goal_log(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_nutrient_status(uuid, text, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_nutrient_recommendations(uuid) TO authenticated;

-- Add comment to track this migration
COMMENT ON SCHEMA public IS 'Added comprehensive nutrition goals and bloodwork integration with proper table references';
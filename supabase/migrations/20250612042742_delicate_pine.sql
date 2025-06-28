/*
  # Meal Plans and Bloodwork Analysis System

  1. New Tables
    - `bloodwork_results`
      - Stores uploaded bloodwork files and analysis results
      - Links to user and tracks analysis status
    
    - `user_nutrient_status`
      - Current nutrient status and deficiencies for each user
      - Links to bloodwork results and nutrient ranges
    
    - `nutrient_ranges`
      - Reference ranges for vitamins, minerals, and other nutrients
      - Defines normal, optimal, and deficiency ranges
    
    - `nutrient_recommendations`
      - Food recommendations based on nutrient deficiencies or excesses
      - Provides actionable dietary advice
    
    - `meal_plans`
      - AI-generated personalized meal plans based on bloodwork analysis
      - Stores 7-day meal schedules with nutritional data

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Reference tables are publicly readable
    - Proper foreign key constraints

  3. Performance
    - Indexes on frequently queried columns
    - GIN index for array searches
    - Optimized for user-based queries
*/

-- Create bloodwork_results table
CREATE TABLE IF NOT EXISTS bloodwork_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  file_url text,
  file_name text,
  source_type text DEFAULT 'manual' CHECK (source_type IN ('pdf', 'csv', 'manual')),
  notes text,
  parsed_data jsonb DEFAULT '{}',
  analysis_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user_nutrient_status table
CREATE TABLE IF NOT EXISTS user_nutrient_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  bloodwork_id uuid REFERENCES bloodwork_results(id) ON DELETE CASCADE,
  nutrient_name text NOT NULL,
  current_value numeric NOT NULL,
  unit text NOT NULL,
  status text NOT NULL CHECK (status IN ('optimal', 'low', 'very_low', 'high', 'very_high')),
  recommendations_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint for user_nutrient_status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_nutrient_status_user_id_nutrient_name_bloodwork_id_key'
  ) THEN
    ALTER TABLE user_nutrient_status 
    ADD CONSTRAINT user_nutrient_status_user_id_nutrient_name_bloodwork_id_key 
    UNIQUE(user_id, nutrient_name, bloodwork_id);
  END IF;
END $$;

-- Create nutrient_ranges table (reference data)
CREATE TABLE IF NOT EXISTS nutrient_ranges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_name text NOT NULL,
  unit text NOT NULL,
  min_value numeric NOT NULL,
  max_value numeric NOT NULL,
  optimal_min numeric,
  optimal_max numeric,
  description text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint for nutrient_ranges if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'nutrient_ranges_nutrient_name_key'
  ) THEN
    ALTER TABLE nutrient_ranges 
    ADD CONSTRAINT nutrient_ranges_nutrient_name_key 
    UNIQUE(nutrient_name);
  END IF;
END $$;

-- Create nutrient_recommendations table (reference data)
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

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_nutrients text[] NOT NULL,
  plan_data jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE bloodwork_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrient_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrient_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrient_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for bloodwork_results to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own bloodwork" ON bloodwork_results;
DROP POLICY IF EXISTS "Users can insert their own bloodwork" ON bloodwork_results;
DROP POLICY IF EXISTS "Users can update their own bloodwork" ON bloodwork_results;
DROP POLICY IF EXISTS "Users can delete their own bloodwork" ON bloodwork_results;

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

-- Drop existing policies for user_nutrient_status to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own nutrient status" ON user_nutrient_status;
DROP POLICY IF EXISTS "Users can insert their own nutrient status" ON user_nutrient_status;
DROP POLICY IF EXISTS "Users can update their own nutrient status" ON user_nutrient_status;
DROP POLICY IF EXISTS "Users can delete their own nutrient status" ON user_nutrient_status;

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

-- Drop existing policies for nutrient_ranges to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view nutrient ranges" ON nutrient_ranges;

-- Create policies for nutrient_ranges (public reference data)
CREATE POLICY "Anyone can view nutrient ranges"
  ON nutrient_ranges
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop existing policies for nutrient_recommendations to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view nutrient recommendations" ON nutrient_recommendations;

-- Create policies for nutrient_recommendations (public reference data)
CREATE POLICY "Anyone can view nutrient recommendations"
  ON nutrient_recommendations
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop existing policies for meal_plans to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can insert their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete their own meal plans" ON meal_plans;

-- Create policies for meal_plans
CREATE POLICY "Users can view their own meal plans"
  ON meal_plans
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own meal plans"
  ON meal_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own meal plans"
  ON meal_plans
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own meal plans"
  ON meal_plans
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bloodwork_results_user_id_idx ON bloodwork_results(user_id);
CREATE INDEX IF NOT EXISTS bloodwork_results_uploaded_at_idx ON bloodwork_results(uploaded_at);
CREATE INDEX IF NOT EXISTS user_nutrient_status_user_id_idx ON user_nutrient_status(user_id);
CREATE INDEX IF NOT EXISTS user_nutrient_status_nutrient_idx ON user_nutrient_status(nutrient_name);
CREATE INDEX IF NOT EXISTS nutrient_ranges_name_idx ON nutrient_ranges(nutrient_name);
CREATE INDEX IF NOT EXISTS meal_plans_user_id_idx ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS meal_plans_created_at_idx ON meal_plans(created_at);
CREATE INDEX IF NOT EXISTS meal_plans_target_nutrients_idx ON meal_plans USING gin(target_nutrients);

-- Insert sample nutrient ranges (only if they don't exist)
INSERT INTO nutrient_ranges (nutrient_name, unit, min_value, max_value, optimal_min, optimal_max, description, category) 
SELECT * FROM (VALUES
  ('Vitamin D', 'ng/mL', 20, 50, 30, 40, 'Essential for bone health and immune function', 'Vitamins'),
  ('Vitamin B12', 'pg/mL', 200, 900, 400, 700, 'Important for nerve function and red blood cell formation', 'Vitamins'),
  ('Iron', 'μg/dL', 60, 170, 80, 150, 'Essential for oxygen transport and energy production', 'Minerals'),
  ('Magnesium', 'mg/dL', 1.7, 2.2, 1.8, 2.1, 'Important for muscle and nerve function', 'Minerals'),
  ('Zinc', 'μg/dL', 70, 120, 80, 110, 'Essential for immune function and wound healing', 'Minerals'),
  ('Folate', 'ng/mL', 2.7, 17.0, 4.0, 15.0, 'Important for DNA synthesis and red blood cell formation', 'Vitamins'),
  ('Calcium', 'mg/dL', 8.5, 10.5, 9.0, 10.2, 'Essential for bone health and muscle function', 'Minerals'),
  ('Potassium', 'mEq/L', 3.5, 5.0, 3.8, 4.5, 'Important for heart rhythm and muscle function', 'Electrolytes')
) AS v(nutrient_name, unit, min_value, max_value, optimal_min, optimal_max, description, category)
WHERE NOT EXISTS (
  SELECT 1 FROM nutrient_ranges WHERE nutrient_ranges.nutrient_name = v.nutrient_name
);

-- Insert sample nutrient recommendations (only if they don't exist)
INSERT INTO nutrient_recommendations (nutrient_name, deficiency_level, recommended_foods, foods_to_avoid, explanation, priority_level)
SELECT * FROM (VALUES
  ('Vitamin D', 'low', ARRAY['fatty fish', 'egg yolks', 'fortified dairy', 'mushrooms'], ARRAY[]::text[], 'Increase sun exposure and consume vitamin D rich foods', 1),
  ('Vitamin D', 'very_low', ARRAY['salmon', 'mackerel', 'sardines', 'cod liver oil'], ARRAY[]::text[], 'Consider supplementation and increase dietary sources', 1),
  ('Iron', 'low', ARRAY['lean red meat', 'spinach', 'lentils', 'quinoa'], ARRAY['coffee with meals', 'tea with meals'], 'Combine with vitamin C for better absorption', 2),
  ('Iron', 'very_low', ARRAY['beef liver', 'oysters', 'dark chocolate', 'tofu'], ARRAY['dairy with iron-rich meals'], 'May need iron supplementation under medical supervision', 1),
  ('Magnesium', 'low', ARRAY['almonds', 'spinach', 'avocado', 'dark chocolate'], ARRAY['excessive alcohol'], 'Include magnesium-rich foods daily', 2),
  ('Vitamin B12', 'low', ARRAY['beef', 'fish', 'dairy products', 'nutritional yeast'], ARRAY[]::text[], 'Essential for vegetarians to supplement', 1),
  ('Zinc', 'low', ARRAY['oysters', 'beef', 'pumpkin seeds', 'chickpeas'], ARRAY['high fiber foods with zinc'], 'Important for immune function', 2)
) AS v(nutrient_name, deficiency_level, recommended_foods, foods_to_avoid, explanation, priority_level)
WHERE NOT EXISTS (
  SELECT 1 FROM nutrient_recommendations 
  WHERE nutrient_recommendations.nutrient_name = v.nutrient_name 
  AND nutrient_recommendations.deficiency_level = v.deficiency_level
);

-- Add comments to track this migration
COMMENT ON TABLE bloodwork_results IS 'Stores uploaded bloodwork files and analysis results';
COMMENT ON TABLE user_nutrient_status IS 'Current nutrient status and deficiencies for each user';
COMMENT ON TABLE nutrient_ranges IS 'Reference ranges for vitamins, minerals, and other nutrients';
COMMENT ON TABLE nutrient_recommendations IS 'Food recommendations based on nutrient deficiencies or excesses';
COMMENT ON TABLE meal_plans IS 'Stores AI-generated personalized meal plans based on bloodwork analysis';
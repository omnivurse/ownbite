/*
  # Meal Plans and Nutrition Goals Schema

  1. New Tables
    - `meal_plans`
      - Stores AI-generated personalized meal plans based on bloodwork analysis
      - Links to user and tracks target nutrients
      - Includes plan data as JSONB for flexibility
    
    - `nutrition_goals`
      - Stores user's nutrition goals and preferences
      - Includes demographic data for goal calculation
      - Tracks daily targets for calories, protein, carbs, fat
    
    - `daily_goal_logs`
      - Tracks daily progress against nutrition goals
      - Records whether goals were met each day
      - Enables streak tracking and progress analytics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure users can only access their own records

  3. Functions
    - Meal plan recommendation function based on nutrient status
    - Goal calculation helpers
*/

-- =====================================================
-- MEAL PLANS TABLE
-- =====================================================

-- Create meal_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_nutrients text[] NOT NULL,
  plan_data jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own meal plans" ON meal_plans;
  DROP POLICY IF EXISTS "Users can insert their own meal plans" ON meal_plans;
  DROP POLICY IF EXISTS "Users can update their own meal plans" ON meal_plans;
  DROP POLICY IF EXISTS "Users can delete their own meal plans" ON meal_plans;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies for meal_plans
CREATE POLICY "Users can view their own meal plans"
  ON meal_plans FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own meal plans"
  ON meal_plans FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own meal plans"
  ON meal_plans FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own meal plans"
  ON meal_plans FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- NUTRITION GOALS TABLE
-- =====================================================

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
  activity_level text DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal_type text DEFAULT 'maintain' CHECK (goal_type IN ('maintain', 'lose', 'gain')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own nutrition goals" ON nutrition_goals;
  DROP POLICY IF EXISTS "Users can insert their own nutrition goals" ON nutrition_goals;
  DROP POLICY IF EXISTS "Users can update their own nutrition goals" ON nutrition_goals;
  DROP POLICY IF EXISTS "Users can delete their own nutrition goals" ON nutrition_goals;
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

-- =====================================================
-- DAILY GOAL LOGS TABLE
-- =====================================================

-- Create daily_goal_logs table for tracking progress
CREATE TABLE IF NOT EXISTS daily_goal_logs (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
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

-- Enable Row Level Security
ALTER TABLE daily_goal_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own goal logs" ON daily_goal_logs;
  DROP POLICY IF EXISTS "Users can insert their own goal logs" ON daily_goal_logs;
  DROP POLICY IF EXISTS "Users can update their own goal logs" ON daily_goal_logs;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS meal_plans_user_id_idx ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS meal_plans_created_at_idx ON meal_plans(created_at);
CREATE INDEX IF NOT EXISTS meal_plans_target_nutrients_idx ON meal_plans USING GIN(target_nutrients);

CREATE INDEX IF NOT EXISTS nutrition_goals_user_id_idx ON nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS daily_goal_logs_user_id_idx ON daily_goal_logs(user_id);
CREATE INDEX IF NOT EXISTS daily_goal_logs_date_idx ON daily_goal_logs(log_date);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get meal plan recommendations based on nutrient status
CREATE OR REPLACE FUNCTION get_meal_plan_recommendations(p_user_id uuid)
RETURNS TABLE(
  recommended_nutrients text[],
  priority_score integer,
  explanation text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  critical_nutrients text[];
  suboptimal_nutrients text[];
BEGIN
  -- Get critical nutrient deficiencies (if user_nutrient_status table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_nutrient_status') THEN
    SELECT ARRAY_AGG(nutrient_name) INTO critical_nutrients
    FROM user_nutrient_status
    WHERE user_id = p_user_id 
      AND status IN ('very_low', 'very_high');

    -- Get suboptimal nutrients
    SELECT ARRAY_AGG(nutrient_name) INTO suboptimal_nutrients
    FROM user_nutrient_status
    WHERE user_id = p_user_id 
      AND status IN ('low', 'high');
  END IF;

  -- Return recommendations based on priority
  IF critical_nutrients IS NOT NULL AND array_length(critical_nutrients, 1) > 0 THEN
    RETURN QUERY SELECT 
      critical_nutrients,
      1 as priority_score,
      'Critical nutrient deficiencies detected. Immediate dietary intervention recommended.' as explanation;
  ELSIF suboptimal_nutrients IS NOT NULL AND array_length(suboptimal_nutrients, 1) > 0 THEN
    RETURN QUERY SELECT 
      suboptimal_nutrients,
      2 as priority_score,
      'Suboptimal nutrient levels detected. Dietary optimization recommended.' as explanation;
  ELSE
    RETURN QUERY SELECT 
      ARRAY['Vitamin D', 'Iron', 'Vitamin B12']::text[],
      3 as priority_score,
      'Maintain optimal nutrition with a balanced diet rich in essential nutrients.' as explanation;
  END IF;
END;
$$;

-- Function to calculate nutrition goals based on user profile
CREATE OR REPLACE FUNCTION calculate_nutrition_goals(
  p_user_id uuid,
  p_gender text DEFAULT 'male',
  p_weight_kg integer DEFAULT 70,
  p_height_cm integer DEFAULT 175,
  p_age integer DEFAULT 30,
  p_activity_level text DEFAULT 'moderate',
  p_goal_type text DEFAULT 'maintain'
)
RETURNS TABLE(
  calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bmr numeric;
  activity_multiplier numeric;
  total_calories numeric;
  goal_multiplier numeric;
BEGIN
  -- Calculate BMR using Mifflin-St Jeor Equation
  IF p_gender = 'male' THEN
    bmr := 10 * p_weight_kg + 6.25 * p_height_cm - 5 * p_age + 5;
  ELSE
    bmr := 10 * p_weight_kg + 6.25 * p_height_cm - 5 * p_age - 161;
  END IF;

  -- Activity level multipliers
  activity_multiplier := CASE p_activity_level
    WHEN 'sedentary' THEN 1.2
    WHEN 'light' THEN 1.375
    WHEN 'moderate' THEN 1.55
    WHEN 'active' THEN 1.725
    WHEN 'very_active' THEN 1.9
    ELSE 1.55
  END;

  -- Goal type adjustments
  goal_multiplier := CASE p_goal_type
    WHEN 'lose' THEN 0.8  -- 20% deficit
    WHEN 'gain' THEN 1.2  -- 20% surplus
    ELSE 1.0  -- maintain
  END;

  total_calories := bmr * activity_multiplier * goal_multiplier;

  RETURN QUERY SELECT 
    ROUND(total_calories)::integer as calories,
    ROUND(p_weight_kg * 1.6)::integer as protein_g,  -- 1.6g per kg body weight
    ROUND(total_calories * 0.45 / 4)::integer as carbs_g,  -- 45% of calories from carbs
    ROUND(total_calories * 0.25 / 9)::integer as fat_g;    -- 25% of calories from fat
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_meal_plan_recommendations(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_nutrition_goals(uuid, text, integer, integer, integer, text, text) TO authenticated;

-- Add comments to track this migration
COMMENT ON TABLE meal_plans IS 'Stores AI-generated personalized meal plans based on bloodwork analysis';
COMMENT ON TABLE nutrition_goals IS 'User nutrition goals and demographic data for personalized recommendations';
COMMENT ON TABLE daily_goal_logs IS 'Daily progress tracking against nutrition goals for streak and analytics';
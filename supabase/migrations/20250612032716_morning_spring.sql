/*
  # Nutrition Goals and Tracking System

  1. New Tables
    - `nutrition_goals`
      - User-specific nutrition targets
      - Customizable calorie, protein, carb, fat goals
      - User profile data for goal calculation
    
    - `daily_goal_logs`
      - Daily tracking of goal achievement
      - Streak calculation support
      - Progress history

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data

  3. Performance
    - Add indexes for efficient queries
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

-- Enable Row Level Security
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goal_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for nutrition_goals
CREATE POLICY "Users can view their own nutrition goals"
  ON nutrition_goals
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own nutrition goals"
  ON nutrition_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own nutrition goals"
  ON nutrition_goals
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own nutrition goals"
  ON nutrition_goals
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Create policies for daily_goal_logs
CREATE POLICY "Users can view their own goal logs"
  ON daily_goal_logs
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own goal logs"
  ON daily_goal_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own goal logs"
  ON daily_goal_logs
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS nutrition_goals_user_id_idx ON nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS daily_goal_logs_user_id_idx ON daily_goal_logs(user_id);
CREATE INDEX IF NOT EXISTS daily_goal_logs_date_idx ON daily_goal_logs(log_date);

-- Function to calculate recommended goals based on user profile
CREATE OR REPLACE FUNCTION calculate_recommended_goals(
  p_gender text,
  p_weight_kg integer,
  p_height_cm integer,
  p_age integer,
  p_activity_level text,
  p_goal_type text
)
RETURNS json AS $$
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
    WHEN 'lose' THEN calories_goal := ROUND(tdee - 500); -- 500 calorie deficit
    WHEN 'gain' THEN calories_goal := ROUND(tdee + 500); -- 500 calorie surplus
    ELSE calories_goal := ROUND(tdee); -- maintenance
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
$$ LANGUAGE plpgsql;

-- Function to update daily goal logs
CREATE OR REPLACE FUNCTION update_daily_goal_log(p_user_id uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_recommended_goals(text, integer, integer, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_goal_log(uuid, date) TO authenticated;
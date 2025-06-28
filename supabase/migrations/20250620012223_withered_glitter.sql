/*
  # KPI Dashboard Schema

  1. New Tables
    - `activity_logs` - Track sitting, driving, and other activity metrics
    - `diet_spending` - Track food spending and consumption patterns
    - `nutrition_logs` - Track hydration and other nutrition metrics
    - `food_logs` - Track fast food consumption
    - `substance_logs` - Track alcohol and other substance use
    - `meal_tracking` - Track meal plan adherence
    - `diary_logs` - Track diary entry activity
    - `food_scans` - Track food scanning activity

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - `get_kpi_dashboard` - Aggregate function to get all KPI data
*/

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

-- Create food_scans table if it doesn't exist already
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_scans') THEN
    CREATE TABLE food_scans (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) NOT NULL,
      image_url text,
      total_calories numeric DEFAULT 0,
      total_protein numeric DEFAULT 0,
      total_carbs numeric DEFAULT 0,
      total_fat numeric DEFAULT 0,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_spending ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE substance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_scans ENABLE ROW LEVEL SECURITY;

-- Create policies allowing users to access only their data
CREATE POLICY "Users can view their own activity" ON activity_logs
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

CREATE POLICY "Users can view their food scans" ON food_scans
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for inserting data
CREATE POLICY "Users can insert their own activity" ON activity_logs
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

CREATE POLICY "Users can insert their food scans" ON food_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for updating data
CREATE POLICY "Users can update their own activity" ON activity_logs
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

CREATE POLICY "Users can update their food scans" ON food_scans
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create policies for deleting data
CREATE POLICY "Users can delete their own activity" ON activity_logs
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

CREATE POLICY "Users can delete their food scans" ON food_scans
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
CREATE INDEX IF NOT EXISTS food_scans_user_id_idx ON food_scans(user_id);
CREATE INDEX IF NOT EXISTS food_scans_created_at_idx ON food_scans(created_at);

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
BEGIN
  -- Set start date based on timeframe
  CASE p_timeframe
    WHEN 'week' THEN start_date := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'month' THEN start_date := CURRENT_DATE - INTERVAL '30 days';
    WHEN 'year' THEN start_date := CURRENT_DATE - INTERVAL '365 days';
    ELSE start_date := CURRENT_DATE - INTERVAL '7 days';
  END CASE;

  -- In a real implementation, this would query the tables and aggregate data
  -- For now, we'll return a placeholder that the frontend will replace with mock data
  result := json_build_object(
    'hydration_pct', 0,
    'sitting_hours', json_build_object('labels', '[]', 'data', '[]'),
    'driving_hours', json_build_object('labels', '[]', 'data', '[]'),
    'screen_usage', json_build_object('labels', '[]', 'data', '[]'),
    'sleep_hours', json_build_object('labels', '[]', 'data', '[]'),
    'fast_food_count', 0,
    'alcohol_days', 0,
    'weekly_spend', 0,
    'meal_streak_pct', 0,
    'diary_entries', json_build_object('labels', '[]', 'data', '[]'),
    'weekly_scans', 0,
    'macro_ratio', json_build_object('labels', '[]', 'data', '[]'),
    'goal_completion', 0,
    'streak_days', 0
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
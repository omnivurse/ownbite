/*
  # Meal Plans Schema

  1. New Tables
    - `meal_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `target_nutrients` (text[])
      - `plan_data` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on meal_plans table
    - Add policies for authenticated users to manage their own meal plans

  3. Performance
    - Add indexes on user_id, created_at, and target_nutrients for faster queries
*/

-- Create meal_plans table for storing AI-generated meal plans
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
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own meal plans"
  ON meal_plans FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own meal plans"
  ON meal_plans FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own meal plans"
  ON meal_plans FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS meal_plans_user_id_idx ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS meal_plans_created_at_idx ON meal_plans(created_at);
CREATE INDEX IF NOT EXISTS meal_plans_target_nutrients_idx ON meal_plans USING GIN(target_nutrients);

-- Drop existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS get_meal_plan_recommendations(uuid);

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
  -- Get critical nutrient deficiencies
  SELECT ARRAY_AGG(nutrient_name) INTO critical_nutrients
  FROM user_nutrient_status
  WHERE user_id = p_user_id 
    AND status IN ('very_low', 'very_high');

  -- Get suboptimal nutrients
  SELECT ARRAY_AGG(nutrient_name) INTO suboptimal_nutrients
  FROM user_nutrient_status
  WHERE user_id = p_user_id 
    AND status IN ('low', 'high');

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_meal_plan_recommendations(uuid) TO authenticated;

-- Add comment to track this migration
COMMENT ON TABLE meal_plans IS 'Stores AI-generated personalized meal plans based on bloodwork analysis';
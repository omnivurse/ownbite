/*
  # Add Plans and Subscription System

  1. New Tables
    - `plans` - Defines available subscription plans
    - Add subscription fields to profiles table
    
  2. Security
    - Enable RLS on plans table
    - Allow public read access to plans
    - Only admins can modify plans
    
  3. Default Data
    - Insert free and premium plan options
*/

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add subscription fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES plans(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz;

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create policies for plans
CREATE POLICY "Anyone can view plans"
  ON plans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify plans"
  ON plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default plans
INSERT INTO plans (name, description, price_monthly, price_yearly, features)
VALUES 
  (
    'Free', 
    'Basic nutrition tracking and food scanning', 
    0, 
    0, 
    '[
      "AI Food Scanner",
      "Basic Food Diary",
      "Limited Recipe Access",
      "Basic Nutrition Tracking"
    ]'::jsonb
  ),
  (
    'Premium', 
    'Advanced nutrition analysis and personalized recommendations', 
    9.99, 
    99.99, 
    '[
      "Everything in Free",
      "Unlimited Bloodwork Analysis",
      "Personalized Meal Plans",
      "Advanced Nutrition Insights",
      "PDF Export of Reports",
      "Priority Support"
    ]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Create function to check if user has premium access
CREATE OR REPLACE FUNCTION has_premium_access(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_status text;
  end_date timestamptz;
BEGIN
  SELECT 
    profiles.subscription_status,
    profiles.subscription_end_date
  INTO 
    user_status,
    end_date
  FROM profiles
  WHERE profiles.user_id = has_premium_access.user_id;
  
  -- User has premium if:
  -- 1. They have 'premium' status AND
  -- 2. Either their subscription hasn't ended OR they have 'lifetime' access
  RETURN (
    user_status = 'premium' AND 
    (end_date IS NULL OR end_date > now() OR user_status = 'lifetime')
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION has_premium_access(uuid) TO authenticated;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS profiles_plan_id_idx ON profiles(plan_id);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles(subscription_status);

-- Add comment to track this migration
COMMENT ON TABLE plans IS 'Available subscription plans for OwnBite';
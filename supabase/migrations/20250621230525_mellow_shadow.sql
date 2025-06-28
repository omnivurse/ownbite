/*
  # Add RLS policy for demo user

  This migration adds a special RLS policy to ensure the demo user (vrt@qloudnet.com)
  has full access to all premium features.
*/

-- Create a function to check if a user is the demo user
CREATE OR REPLACE FUNCTION is_demo_user()
RETURNS BOOLEAN AS $$
DECLARE
  demo_email TEXT := 'vrt@qloudnet.com';
  current_email TEXT;
BEGIN
  SELECT email INTO current_email FROM auth.users WHERE id = auth.uid();
  RETURN current_email = demo_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the profiles table for the demo user
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Get the user ID for the demo user
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'vrt@qloudnet.com';
  
  -- If the demo user exists, update their profile
  IF demo_user_id IS NOT NULL THEN
    UPDATE profiles
    SET 
      subscription_status = 'premium',
      subscription_end_date = (CURRENT_DATE + INTERVAL '1 year')::TIMESTAMP
    WHERE user_id = demo_user_id;
    
    -- If no profile exists, create one
    IF NOT FOUND THEN
      INSERT INTO profiles (
        user_id, 
        full_name, 
        role, 
        subscription_status, 
        subscription_end_date
      ) VALUES (
        demo_user_id, 
        'Julia Avalon', 
        'member', 
        'premium', 
        (CURRENT_DATE + INTERVAL '1 year')::TIMESTAMP
      );
    END IF;
  END IF;
END $$;

-- Create a function to check if a user has premium access
CREATE OR REPLACE FUNCTION has_premium_access()
RETURNS BOOLEAN AS $$
DECLARE
  user_has_premium BOOLEAN;
BEGIN
  -- Check if the user is the demo user
  IF is_demo_user() THEN
    RETURN TRUE;
  END IF;
  
  -- Check if the user has premium access through their profile
  SELECT subscription_status = 'premium' INTO user_has_premium
  FROM profiles
  WHERE user_id = auth.uid();
  
  -- If the user has premium access, return true
  IF user_has_premium THEN
    RETURN TRUE;
  END IF;
  
  -- Check if the user has an active subscription
  RETURN EXISTS (
    SELECT 1
    FROM stripe_customers sc
    JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
    WHERE sc.user_id = auth.uid()
      AND ss.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
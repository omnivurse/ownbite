-- Update subscription status for all users
-- This is a simplified migration that doesn't rely on auth schema

-- Update all profiles to premium status directly
UPDATE profiles
SET 
  subscription_status = 'premium',
  subscription_end_date = (NOW() + INTERVAL '1 year');

-- Add a comment to document this migration
COMMENT ON TABLE profiles IS 'User profiles with subscription status set to premium';
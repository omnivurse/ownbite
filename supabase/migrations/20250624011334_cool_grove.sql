/*
  # Fix track_referral Function Conflict

  1. Problem
    - Multiple versions of track_referral function with different signatures
    - Causing "function name is not unique" error
    - Need to drop all versions and create a single clean version

  2. Solution
    - Drop ALL possible versions of the function with different parameter signatures
    - Create a single clean version with well-defined parameters
    - Grant proper permissions to both authenticated and anonymous users
    - Add clear documentation
*/

-- Drop all versions of track_referral function
DO $$ 
BEGIN
  -- Drop all possible variations of the function signature
  DROP FUNCTION IF EXISTS track_referral(text, uuid, text);
  DROP FUNCTION IF EXISTS track_referral(text, uuid);
  DROP FUNCTION IF EXISTS track_referral(text, uuid, text, text);
  DROP FUNCTION IF EXISTS track_referral(); 
  DROP FUNCTION IF EXISTS track_referral(uuid);
  DROP FUNCTION IF EXISTS track_referral(uuid, text);
  DROP FUNCTION IF EXISTS track_referral(uuid, text, text);
  DROP FUNCTION IF EXISTS track_referral(text);
  DROP FUNCTION IF EXISTS track_referral(p_referral_code text, p_referred_user_id uuid, p_source text);
  DROP FUNCTION IF EXISTS track_referral(p_referral_code text, p_referred_user_id uuid);
  DROP FUNCTION IF EXISTS track_referral(referral_code text, referred_user_id uuid, source text);
  DROP FUNCTION IF EXISTS track_referral(referral_code text, referred_user_id uuid);
  -- Add any other possible signatures to be thorough
EXCEPTION
  WHEN undefined_function THEN
    NULL; -- Ignore if function doesn't exist
END $$;

-- Create a single clean version of track_referral function
CREATE OR REPLACE FUNCTION track_referral(
  p_referral_code text,
  p_referred_user_id uuid,
  p_source text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  affiliate_id uuid;
  existing_referral uuid;
  new_referral_id uuid;
  affiliate_user_id uuid;
BEGIN
  -- Check if referral code exists
  SELECT id, user_id INTO affiliate_id, affiliate_user_id 
  FROM affiliates 
  WHERE referral_code = p_referral_code;
  
  IF affiliate_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid referral code'
    );
  END IF;
  
  -- Check if user has already been referred
  SELECT id INTO existing_referral 
  FROM referrals 
  WHERE referred_user_id = p_referred_user_id;
  
  IF existing_referral IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User has already been referred'
    );
  END IF;
  
  -- Create the referral
  INSERT INTO referrals (
    referred_user_id,
    affiliate_id,
    source,
    hashtag
  ) VALUES (
    p_referred_user_id,
    affiliate_id,
    p_source,
    '#iamhealthierwithownbite.me'
  )
  RETURNING id INTO new_referral_id;
  
  -- Award points to the affiliate if applicable
  IF affiliate_user_id IS NOT NULL THEN
    -- Check if award_points function exists before calling it
    IF EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'award_points' 
      AND pg_function_is_visible(oid)
    ) THEN
      PERFORM award_points(
        affiliate_user_id,
        'referral_signup',
        100,
        json_build_object('referral_id', new_referral_id)
      );
    END IF;
  END IF;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'referral_id', new_referral_id,
    'message', 'Referral tracked successfully'
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION track_referral(text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION track_referral(text, uuid, text) TO anon;

-- Add comment to track this migration
COMMENT ON FUNCTION track_referral IS 'Records new user referrals with affiliate tracking';
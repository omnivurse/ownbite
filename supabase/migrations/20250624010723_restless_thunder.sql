/*
  # Fix track_referral Function Conflict

  1. Problem
    - Multiple versions of track_referral function exist with different signatures
    - This causes PostgreSQL error: "function name track_referral is not unique"
    - Need to drop all versions and create a single clean implementation

  2. Solution
    - Drop all versions of track_referral function regardless of parameter signatures
    - Create a single clean version with clear parameter definitions
    - Grant proper permissions to authenticated users
*/

-- Drop all versions of track_referral function
DO $$ 
BEGIN
  -- Drop all functions named track_referral regardless of parameter types
  DROP FUNCTION IF EXISTS track_referral(text, uuid, text);
  DROP FUNCTION IF EXISTS track_referral(text, uuid);
  DROP FUNCTION IF EXISTS track_referral(text, uuid, text, text);
  DROP FUNCTION IF EXISTS track_referral(); 
  DROP FUNCTION IF EXISTS track_referral(uuid);
  DROP FUNCTION IF EXISTS track_referral(uuid, text);
  DROP FUNCTION IF EXISTS track_referral(uuid, text, text);
  DROP FUNCTION IF EXISTS track_referral(text);
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
BEGIN
  -- Check if referral code exists
  SELECT id INTO affiliate_id FROM affiliates WHERE referral_code = p_referral_code;
  
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
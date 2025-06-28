/*
  # Add Referral Code Validation Function

  1. New Functions
    - `validate_referral_code` - Checks if a referral code exists in the affiliates table
    - This allows the frontend to validate codes without needing to create a referral

  2. Security
    - Function is accessible to public users (not requiring authentication)
    - Only returns boolean result (valid/invalid) without exposing sensitive data
*/

-- Function to validate a referral code
CREATE OR REPLACE FUNCTION validate_referral_code(p_referral_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if referral code exists and affiliate is approved
  RETURN EXISTS (
    SELECT 1 
    FROM affiliates 
    WHERE referral_code = p_referral_code
    AND approved = true
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_referral_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_referral_code(text) TO anon;

-- Add comment to track this migration
COMMENT ON FUNCTION validate_referral_code IS 'Validates if a referral code exists and is from an approved affiliate';
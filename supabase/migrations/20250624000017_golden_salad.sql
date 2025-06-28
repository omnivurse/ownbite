-- Create referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  affiliate_id uuid REFERENCES affiliates(id),
  joined_at timestamp with time zone DEFAULT timezone('utc', now()),
  source text,
  hashtag text DEFAULT '#iamhealthierwithownbite.me'
);

-- Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view referrals they made" ON referrals;
  DROP POLICY IF EXISTS "System can insert referrals" ON referrals;
  DROP POLICY IF EXISTS "Admins can view all referrals" ON referrals;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies for referrals table
CREATE POLICY "Users can view referrals they made"
  ON referrals
  FOR SELECT
  TO public
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert referrals"
  ON referrals
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON referrals
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS referrals_affiliate_id_idx ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS referrals_referred_user_id_idx ON referrals(referred_user_id);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS track_referral(text, uuid, text);

-- Function to track a referral
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

-- Add comment to track this migration
COMMENT ON TABLE referrals IS 'Tracks new signups through affiliate links';
COMMENT ON FUNCTION track_referral IS 'Records new user referrals with affiliate tracking';
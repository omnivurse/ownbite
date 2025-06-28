/*
  # Affiliate System Schema

  1. New Tables
    - `affiliates` - Stores affiliate profiles for influencers and coaches
    - `referrals` - Tracks new signups through affiliate links
    - `affiliate_commissions` - Manages commission payments to affiliates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Special policies for admins to manage all affiliate data

  3. Functions
    - get_affiliate_dashboard - Returns affiliate stats and earnings
    - track_referral - Records new user referrals
    - generate_commission - Creates commission records for successful referrals
*/

-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  full_name text,
  bio text,
  social_links jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  affiliate_id uuid REFERENCES affiliates(id),
  joined_at timestamp with time zone DEFAULT timezone('utc', now()),
  source text,
  hashtag text DEFAULT '#iamhealthierwithownbite.me'
);

-- Create affiliate_commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id),
  referral_id uuid REFERENCES referrals(id),
  amount numeric(10,2),
  status text DEFAULT 'pending',
  generated_at timestamp with time zone DEFAULT timezone('utc', now()),
  paid_at timestamp with time zone
);

-- Enable Row Level Security
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Policies for affiliates table
CREATE POLICY "Users can view their own affiliate profile"
  ON affiliates
  FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own affiliate profile"
  ON affiliates
  FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own affiliate profile"
  ON affiliates
  FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Admins can view all affiliate profiles
CREATE POLICY "Admins can view all affiliate profiles"
  ON affiliates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all affiliate profiles
CREATE POLICY "Admins can update all affiliate profiles"
  ON affiliates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Policies for referrals table
CREATE POLICY "Users can view referrals they made"
  ON referrals
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates
      WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "System can insert referrals"
  ON referrals
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON referrals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Policies for affiliate_commissions table
CREATE POLICY "Affiliates can view their own commissions"
  ON affiliate_commissions
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates
      WHERE user_id = (select auth.uid())
    )
  );

-- Only admins can insert or update commissions
CREATE POLICY "Admins can manage commissions"
  ON affiliate_commissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS affiliates_user_id_idx ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS affiliates_referral_code_idx ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS referrals_affiliate_id_idx ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS referrals_referred_user_id_idx ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS affiliate_commissions_affiliate_id_idx ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS affiliate_commissions_status_idx ON affiliate_commissions(status);

-- Function to get affiliate dashboard data
CREATE OR REPLACE FUNCTION get_affiliate_dashboard(p_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  affiliate_id uuid;
  result json;
BEGIN
  -- Get the affiliate ID for this user
  SELECT id INTO affiliate_id FROM affiliates WHERE user_id = p_user_id;
  
  IF affiliate_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User is not an affiliate'
    );
  END IF;
  
  -- Build the dashboard data
  SELECT json_build_object(
    'success', true,
    'affiliate', (
      SELECT json_build_object(
        'id', a.id,
        'referral_code', a.referral_code,
        'full_name', a.full_name,
        'bio', a.bio,
        'social_links', a.social_links,
        'created_at', a.created_at
      )
      FROM affiliates a
      WHERE a.id = affiliate_id
    ),
    'stats', json_build_object(
      'total_referrals', (
        SELECT COUNT(*) 
        FROM referrals 
        WHERE affiliate_id = affiliate_id
      ),
      'total_earnings', (
        SELECT COALESCE(SUM(amount), 0)
        FROM affiliate_commissions
        WHERE affiliate_id = affiliate_id
      ),
      'pending_earnings', (
        SELECT COALESCE(SUM(amount), 0)
        FROM affiliate_commissions
        WHERE affiliate_id = affiliate_id
        AND status = 'pending'
      ),
      'paid_earnings', (
        SELECT COALESCE(SUM(amount), 0)
        FROM affiliate_commissions
        WHERE affiliate_id = affiliate_id
        AND status = 'paid'
      )
    ),
    'recent_referrals', (
      SELECT json_agg(
        json_build_object(
          'id', r.id,
          'joined_at', r.joined_at,
          'source', r.source,
          'hashtag', r.hashtag
        )
      )
      FROM referrals r
      WHERE r.affiliate_id = affiliate_id
      ORDER BY r.joined_at DESC
      LIMIT 10
    ),
    'recent_commissions', (
      SELECT json_agg(
        json_build_object(
          'id', c.id,
          'amount', c.amount,
          'status', c.status,
          'generated_at', c.generated_at,
          'paid_at', c.paid_at
        )
      )
      FROM affiliate_commissions c
      WHERE c.affiliate_id = affiliate_id
      ORDER BY c.generated_at DESC
      LIMIT 10
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to track a referral
CREATE OR REPLACE FUNCTION track_referral(
  p_referral_code text,
  p_referred_user_id uuid,
  p_source text DEFAULT NULL,
  p_hashtag text DEFAULT '#iamhealthierwithownbite.me'
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
    COALESCE(p_hashtag, '#iamhealthierwithownbite.me')
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

-- Function to generate a commission
CREATE OR REPLACE FUNCTION generate_commission(
  p_referral_id uuid,
  p_amount numeric,
  p_status text DEFAULT 'pending'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  affiliate_id uuid;
  commission_id uuid;
  is_admin boolean;
BEGIN
  -- Check if user is an admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = (select auth.uid())
    AND profiles.role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Only admins can generate commissions'
    );
  END IF;
  
  -- Get the affiliate ID for this referral
  SELECT affiliate_id INTO affiliate_id FROM referrals WHERE id = p_referral_id;
  
  IF affiliate_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid referral ID'
    );
  END IF;
  
  -- Create the commission
  INSERT INTO affiliate_commissions (
    affiliate_id,
    referral_id,
    amount,
    status
  ) VALUES (
    affiliate_id,
    p_referral_id,
    p_amount,
    p_status
  )
  RETURNING id INTO commission_id;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'commission_id', commission_id,
    'message', 'Commission generated successfully'
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_affiliate_dashboard(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION track_referral(text, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_commission(uuid, numeric, text) TO authenticated;

-- Add comments to track this migration
COMMENT ON TABLE affiliates IS 'Stores affiliate profiles for influencers and coaches';
COMMENT ON TABLE referrals IS 'Tracks new signups through affiliate links';
COMMENT ON TABLE affiliate_commissions IS 'Manages commission payments to affiliates';
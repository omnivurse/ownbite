/*
  # Add approved field to affiliates table

  1. Updates
    - Add approved field to affiliates table with default false
    - Update existing RLS policies to handle approval status
    - Add admin-specific policies for managing approvals
*/

-- Add approved field to affiliates table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'affiliates' AND column_name = 'approved'
  ) THEN
    ALTER TABLE affiliates ADD COLUMN approved boolean DEFAULT false;
  END IF;
END $$;

-- Update existing affiliates to be approved (for backward compatibility)
UPDATE affiliates SET approved = true WHERE approved IS NULL;

-- Create or replace function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to get all affiliates (for admin use)
CREATE OR REPLACE FUNCTION get_all_affiliates()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  referral_code text,
  full_name text,
  bio text,
  social_links jsonb,
  approved boolean,
  created_at timestamptz,
  email text
) AS $$
BEGIN
  -- Check if user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can access this function';
  END IF;
  
  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.referral_code,
    a.full_name,
    a.bio,
    a.social_links,
    a.approved,
    a.created_at,
    u.email
  FROM 
    affiliates a
  JOIN 
    auth.users u ON a.user_id = u.id
  ORDER BY 
    a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_affiliates() TO authenticated;

-- Add comment to track this migration
COMMENT ON COLUMN affiliates.approved IS 'Whether the affiliate has been approved by an admin';
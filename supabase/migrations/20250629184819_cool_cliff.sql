/*
  # Fix user rewards RPC function

  1. Functions
    - Create or replace get_user_rewards function to properly handle user_id
    - Create or replace update_user_points function to safely update points
    - Ensure all functions properly use auth.uid() for user identification
*/

-- Create or replace the get_user_rewards function
CREATE OR REPLACE FUNCTION get_user_rewards()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  points integer,
  lifetime_points integer,
  tier text,
  badges jsonb,
  last_updated timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user_rewards record exists
  IF NOT EXISTS (
    SELECT 1 FROM user_rewards ur WHERE ur.user_id = current_user_id
  ) THEN
    -- Create a new user_rewards record
    INSERT INTO user_rewards (user_id, points, lifetime_points, tier, badges)
    VALUES (current_user_id, 0, 0, 'Bronze', '[]'::jsonb);
  END IF;

  -- Return the user's rewards data
  RETURN QUERY
  SELECT ur.id, ur.user_id, ur.points, ur.lifetime_points, ur.tier, ur.badges, ur.last_updated, ur.created_at
  FROM user_rewards ur
  WHERE ur.user_id = current_user_id;
END;
$$;

-- Create or replace the update_user_points function
CREATE OR REPLACE FUNCTION update_user_points(p_user_id uuid, p_points_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  new_tier text;
  current_points integer;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify the user can only update their own points
  IF current_user_id != p_user_id THEN
    RAISE EXCEPTION 'Cannot update points for another user';
  END IF;

  -- Ensure user_rewards record exists
  INSERT INTO user_rewards (user_id, points, lifetime_points, tier, badges)
  VALUES (p_user_id, 0, 0, 'Bronze', '[]'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update points and lifetime points
  UPDATE user_rewards 
  SET 
    points = GREATEST(0, points + p_points_to_add),
    lifetime_points = CASE 
      WHEN p_points_to_add > 0 THEN lifetime_points + p_points_to_add 
      ELSE lifetime_points 
    END,
    last_updated = now()
  WHERE user_id = p_user_id
  RETURNING points INTO current_points;

  -- Calculate new tier based on lifetime points
  SELECT CASE
    WHEN (SELECT lifetime_points FROM user_rewards WHERE user_id = p_user_id) >= 10000 THEN 'Diamond'
    WHEN (SELECT lifetime_points FROM user_rewards WHERE user_id = p_user_id) >= 5000 THEN 'Platinum'
    WHEN (SELECT lifetime_points FROM user_rewards WHERE user_id = p_user_id) >= 2500 THEN 'Gold'
    WHEN (SELECT lifetime_points FROM user_rewards WHERE user_id = p_user_id) >= 1000 THEN 'Silver'
    ELSE 'Bronze'
  END INTO new_tier;

  -- Update tier if it changed
  UPDATE user_rewards 
  SET tier = new_tier
  WHERE user_id = p_user_id AND tier != new_tier;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_rewards() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_points(uuid, integer) TO authenticated;
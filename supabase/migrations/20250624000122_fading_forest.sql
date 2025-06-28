/*
  # Rewards System Schema

  1. New Tables
    - `user_rewards` - Tracks each user's points, tiers, and badges
    - `reward_events` - Logs each rewardable action

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Admin access for moderation and management

  3. Functions
    - `award_points` - Adds points to a user's account
    - `get_user_rewards` - Retrieves a user's rewards data
    - `calculate_tier` - Determines a user's tier based on lifetime points
*/

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  points integer DEFAULT 0,
  lifetime_points integer DEFAULT 0,
  tier text DEFAULT 'Bronze',
  badges jsonb DEFAULT '[]',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create reward_events table
CREATE TABLE IF NOT EXISTS reward_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  points_awarded integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  context jsonb DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user_rewards
CREATE POLICY "Users can view their own rewards"
  ON user_rewards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own rewards"
  ON user_rewards
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for reward_events
CREATE POLICY "Users can view their own reward events"
  ON reward_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reward events"
  ON reward_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin policies
CREATE POLICY "Admins can view all user rewards"
  ON user_rewards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all reward events"
  ON reward_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_rewards_user_id_idx ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS user_rewards_tier_idx ON user_rewards(tier);
CREATE INDEX IF NOT EXISTS reward_events_user_id_idx ON reward_events(user_id);
CREATE INDEX IF NOT EXISTS reward_events_event_type_idx ON reward_events(event_type);
CREATE INDEX IF NOT EXISTS reward_events_created_at_idx ON reward_events(created_at);

-- Function to calculate tier based on lifetime points
CREATE OR REPLACE FUNCTION calculate_tier(p_lifetime_points integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF p_lifetime_points >= 2000 THEN
    RETURN 'Platinum';
  ELSIF p_lifetime_points >= 1000 THEN
    RETURN 'Gold';
  ELSIF p_lifetime_points >= 500 THEN
    RETURN 'Silver';
  ELSE
    RETURN 'Bronze';
  END IF;
END;
$$;

-- Function to award points to a user
CREATE OR REPLACE FUNCTION award_points(
  p_user_id uuid,
  p_event_type text,
  p_points integer,
  p_context jsonb DEFAULT '{}'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_points integer;
  new_lifetime_points integer;
  old_tier text;
  new_tier text;
  tier_changed boolean;
  badge_earned jsonb;
BEGIN
  -- Insert the reward event
  INSERT INTO reward_events (
    user_id,
    event_type,
    points_awarded,
    context
  ) VALUES (
    p_user_id,
    p_event_type,
    p_points,
    p_context
  );
  
  -- Update or create user rewards record
  INSERT INTO user_rewards (
    user_id,
    points,
    lifetime_points,
    tier,
    last_updated
  ) VALUES (
    p_user_id,
    p_points,
    p_points,
    calculate_tier(p_points),
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    points = user_rewards.points + p_points,
    lifetime_points = user_rewards.lifetime_points + p_points,
    last_updated = now()
  RETURNING 
    points, 
    lifetime_points, 
    tier as old_tier
  INTO 
    new_points, 
    new_lifetime_points, 
    old_tier;
  
  -- Calculate new tier
  new_tier := calculate_tier(new_lifetime_points);
  tier_changed := old_tier <> new_tier;
  
  -- Update tier if changed
  IF tier_changed THEN
    UPDATE user_rewards
    SET tier = new_tier
    WHERE user_id = p_user_id;
    
    -- Add tier badge if tier changed
    badge_earned := json_build_object(
      'type', 'tier',
      'name', new_tier || ' Tier',
      'description', 'Reached ' || new_tier || ' tier status',
      'earned_at', now()
    );
    
    UPDATE user_rewards
    SET badges = badges || badge_earned
    WHERE user_id = p_user_id;
  END IF;
  
  -- Check for streak badges based on context
  IF p_event_type = 'streak' AND p_context->>'streak_days' IS NOT NULL THEN
    DECLARE
      streak_days integer := (p_context->>'streak_days')::integer;
    BEGIN
      IF streak_days IN (3, 7, 14, 30, 60, 90) THEN
        badge_earned := json_build_object(
          'type', 'streak',
          'name', streak_days || '-Day Streak',
          'description', 'Maintained a ' || streak_days || '-day streak',
          'earned_at', now()
        );
        
        UPDATE user_rewards
        SET badges = badges || badge_earned
        WHERE user_id = p_user_id;
      END IF;
    END;
  END IF;
  
  -- Return the updated points and tier information
  RETURN json_build_object(
    'success', true,
    'points_awarded', p_points,
    'new_points', new_points,
    'new_lifetime_points', new_lifetime_points,
    'tier', new_tier,
    'tier_changed', tier_changed
  );
END;
$$;

-- Function to get user rewards data
CREATE OR REPLACE FUNCTION get_user_rewards(p_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_data json;
  recent_events json;
  next_tier text;
  points_to_next_tier integer;
BEGIN
  -- Get user rewards data
  SELECT json_build_object(
    'id', ur.id,
    'points', ur.points,
    'lifetime_points', ur.lifetime_points,
    'tier', ur.tier,
    'badges', ur.badges,
    'last_updated', ur.last_updated,
    'created_at', ur.created_at
  ) INTO user_data
  FROM user_rewards ur
  WHERE ur.user_id = p_user_id;
  
  -- If no rewards data exists, create default
  IF user_data IS NULL THEN
    INSERT INTO user_rewards (user_id)
    VALUES (p_user_id)
    RETURNING json_build_object(
      'id', id,
      'points', points,
      'lifetime_points', lifetime_points,
      'tier', tier,
      'badges', badges,
      'last_updated', last_updated,
      'created_at', created_at
    ) INTO user_data;
  END IF;
  
  -- Get recent reward events
  SELECT json_agg(
    json_build_object(
      'id', re.id,
      'event_type', re.event_type,
      'points_awarded', re.points_awarded,
      'created_at', re.created_at,
      'context', re.context
    )
  ) INTO recent_events
  FROM reward_events re
  WHERE re.user_id = p_user_id
  ORDER BY re.created_at DESC
  LIMIT 10;
  
  -- Calculate next tier and points needed
  CASE (user_data->>'tier')
    WHEN 'Bronze' THEN
      next_tier := 'Silver';
      points_to_next_tier := 500 - (user_data->>'lifetime_points')::integer;
    WHEN 'Silver' THEN
      next_tier := 'Gold';
      points_to_next_tier := 1000 - (user_data->>'lifetime_points')::integer;
    WHEN 'Gold' THEN
      next_tier := 'Platinum';
      points_to_next_tier := 2000 - (user_data->>'lifetime_points')::integer;
    ELSE
      next_tier := 'Platinum';
      points_to_next_tier := 0;
  END CASE;
  
  -- Return combined data
  RETURN json_build_object(
    'user_rewards', user_data,
    'recent_events', COALESCE(recent_events, '[]'::json),
    'next_tier', next_tier,
    'points_to_next_tier', GREATEST(points_to_next_tier, 0)
  );
END;
$$;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_rewards_leaderboard(p_limit integer DEFAULT 10)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  leaderboard json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'user_id', ur.user_id,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'points', ur.points,
      'tier', ur.tier
    )
  ) INTO leaderboard
  FROM user_rewards ur
  JOIN profiles p ON ur.user_id = p.user_id
  ORDER BY ur.points DESC
  LIMIT p_limit;
  
  RETURN COALESCE(leaderboard, '[]'::json);
END;
$$;

-- Create triggers for automatic point awards
CREATE OR REPLACE FUNCTION reward_food_entry()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_points(
    NEW.user_id,
    'log_meal',
    10,
    json_build_object('meal_name', NEW.name)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reward_recipe_upload()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_points(
    NEW.user_id,
    'upload_recipe',
    25,
    json_build_object('recipe_name', NEW.title)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reward_referral()
RETURNS TRIGGER AS $$
DECLARE
  affiliate_user_id uuid;
BEGIN
  -- Get the user_id of the affiliate
  SELECT user_id INTO affiliate_user_id
  FROM affiliates
  WHERE id = NEW.affiliate_id;
  
  -- Award points to the affiliate
  IF affiliate_user_id IS NOT NULL THEN
    PERFORM award_points(
      affiliate_user_id,
      'referral_signup',
      100,
      json_build_object('referral_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER reward_food_entry_trigger
AFTER INSERT ON food_entries
FOR EACH ROW
EXECUTE FUNCTION reward_food_entry();

CREATE TRIGGER reward_recipe_upload_trigger
AFTER INSERT ON community_recipes
FOR EACH ROW
EXECUTE FUNCTION reward_recipe_upload();

CREATE TRIGGER reward_referral_trigger
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION reward_referral();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_tier(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION award_points(uuid, text, integer, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_rewards(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rewards_leaderboard(integer) TO authenticated;

-- Add comments to track this migration
COMMENT ON TABLE user_rewards IS 'Tracks each user''s cumulative points and redemption history';
COMMENT ON TABLE reward_events IS 'Logs each rewardable action';
COMMENT ON FUNCTION calculate_tier IS 'Determines a user''s tier based on lifetime points';
COMMENT ON FUNCTION award_points IS 'Adds points to a user''s account and updates tier';
COMMENT ON FUNCTION get_user_rewards IS 'Retrieves a user''s rewards data';
COMMENT ON FUNCTION get_rewards_leaderboard IS 'Gets the top users by points';
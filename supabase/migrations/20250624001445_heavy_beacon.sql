/*
  # Rewards Redemption & Marketplace System

  1. New Tables
    - `reward_items` - Defines available items in the rewards marketplace
    - `reward_redemptions` - Tracks user redemption history
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own redemptions
    - Admin policies for managing reward items
    
  3. Functions
    - `redeem_reward` - Process reward redemption and deduct points
    - `get_available_rewards` - Get rewards available to a user based on their tier
    - `get_user_redemptions` - Get a user's redemption history
*/

-- Create reward_items table
CREATE TABLE IF NOT EXISTS reward_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  points_cost integer NOT NULL,
  required_tier text DEFAULT 'Bronze',
  category text NOT NULL,
  is_digital boolean DEFAULT true,
  is_active boolean DEFAULT true,
  stock_quantity integer DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reward_redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_item_id uuid REFERENCES reward_items(id) NOT NULL,
  points_spent integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  redemption_code text,
  delivery_details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  fulfilled_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE reward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies for reward_items
CREATE POLICY "Anyone can view active reward items"
  ON reward_items
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage reward items"
  ON reward_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policies for reward_redemptions
CREATE POLICY "Users can view their own redemptions"
  ON reward_redemptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own redemptions"
  ON reward_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all redemptions"
  ON reward_redemptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update redemptions"
  ON reward_redemptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reward_items_points_cost_idx ON reward_items(points_cost);
CREATE INDEX IF NOT EXISTS reward_items_required_tier_idx ON reward_items(required_tier);
CREATE INDEX IF NOT EXISTS reward_items_category_idx ON reward_items(category);
CREATE INDEX IF NOT EXISTS reward_redemptions_user_id_idx ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS reward_redemptions_reward_item_id_idx ON reward_redemptions(reward_item_id);
CREATE INDEX IF NOT EXISTS reward_redemptions_status_idx ON reward_redemptions(status);

-- Function to get available rewards for a user
CREATE OR REPLACE FUNCTION get_available_rewards(p_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_tier text;
  user_points integer;
  available_rewards json;
  tier_rank integer;
BEGIN
  -- Get user's tier and points
  SELECT tier, points INTO user_tier, user_points
  FROM user_rewards
  WHERE user_id = p_user_id;
  
  -- If user has no rewards record, create one
  IF user_tier IS NULL THEN
    INSERT INTO user_rewards (user_id)
    VALUES (p_user_id)
    RETURNING tier, points INTO user_tier, user_points;
  END IF;
  
  -- Determine tier rank for filtering
  CASE user_tier
    WHEN 'Platinum' THEN tier_rank := 4;
    WHEN 'Gold' THEN tier_rank := 3;
    WHEN 'Silver' THEN tier_rank := 2;
    ELSE tier_rank := 1; -- Bronze
  END CASE;
  
  -- Get available rewards based on tier and active status
  SELECT json_agg(
    json_build_object(
      'id', ri.id,
      'name', ri.name,
      'description', ri.description,
      'image_url', ri.image_url,
      'points_cost', ri.points_cost,
      'required_tier', ri.required_tier,
      'category', ri.category,
      'is_digital', ri.is_digital,
      'stock_quantity', ri.stock_quantity,
      'can_afford', user_points >= ri.points_cost,
      'created_at', ri.created_at
    )
  ) INTO available_rewards
  FROM reward_items ri
  WHERE ri.is_active = true
  AND (
    (ri.required_tier = 'Bronze') OR
    (ri.required_tier = 'Silver' AND tier_rank >= 2) OR
    (ri.required_tier = 'Gold' AND tier_rank >= 3) OR
    (ri.required_tier = 'Platinum' AND tier_rank >= 4)
  )
  AND (ri.stock_quantity IS NULL OR ri.stock_quantity > 0)
  ORDER BY ri.points_cost ASC;
  
  -- Return the rewards
  RETURN json_build_object(
    'user_tier', user_tier,
    'user_points', user_points,
    'rewards', COALESCE(available_rewards, '[]'::json)
  );
END;
$$;

-- Function to redeem a reward
CREATE OR REPLACE FUNCTION redeem_reward(
  p_reward_item_id uuid,
  p_delivery_details jsonb DEFAULT '{}'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_id uuid;
  user_points integer;
  user_tier text;
  reward_name text;
  reward_points_cost integer;
  reward_required_tier text;
  reward_is_digital boolean;
  reward_stock integer;
  redemption_id uuid;
  redemption_code text;
  tier_rank integer;
  required_tier_rank integer;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Get user's points and tier
  SELECT points, tier INTO user_points, user_tier
  FROM user_rewards
  WHERE user_id = user_id;
  
  -- If user has no rewards record, create one
  IF user_points IS NULL THEN
    INSERT INTO user_rewards (user_id)
    VALUES (user_id)
    RETURNING points, tier INTO user_points, user_tier;
  END IF;
  
  -- Get reward details
  SELECT 
    name, 
    points_cost, 
    required_tier, 
    is_digital,
    stock_quantity
  INTO 
    reward_name, 
    reward_points_cost, 
    reward_required_tier, 
    reward_is_digital,
    reward_stock
  FROM reward_items
  WHERE id = p_reward_item_id AND is_active = true;
  
  -- Check if reward exists
  IF reward_name IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Reward not found or not active'
    );
  END IF;
  
  -- Check if reward is in stock
  IF reward_stock IS NOT NULL AND reward_stock <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'This reward is out of stock'
    );
  END IF;
  
  -- Check if user has enough points
  IF user_points < reward_points_cost THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not enough points to redeem this reward'
    );
  END IF;
  
  -- Determine tier ranks for comparison
  CASE user_tier
    WHEN 'Platinum' THEN tier_rank := 4;
    WHEN 'Gold' THEN tier_rank := 3;
    WHEN 'Silver' THEN tier_rank := 2;
    ELSE tier_rank := 1; -- Bronze
  END CASE;
  
  CASE reward_required_tier
    WHEN 'Platinum' THEN required_tier_rank := 4;
    WHEN 'Gold' THEN required_tier_rank := 3;
    WHEN 'Silver' THEN required_tier_rank := 2;
    ELSE required_tier_rank := 1; -- Bronze
  END CASE;
  
  -- Check if user meets tier requirement
  IF tier_rank < required_tier_rank THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Your tier is too low to redeem this reward'
    );
  END IF;
  
  -- Generate redemption code for digital rewards
  IF reward_is_digital THEN
    redemption_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 12));
  END IF;
  
  -- Create redemption record
  INSERT INTO reward_redemptions (
    user_id,
    reward_item_id,
    points_spent,
    redemption_code,
    delivery_details,
    status
  ) VALUES (
    user_id,
    p_reward_item_id,
    reward_points_cost,
    redemption_code,
    p_delivery_details,
    CASE WHEN reward_is_digital THEN 'fulfilled' ELSE 'pending' END
  )
  RETURNING id INTO redemption_id;
  
  -- Update fulfilled_at for digital rewards
  IF reward_is_digital THEN
    UPDATE reward_redemptions
    SET fulfilled_at = now()
    WHERE id = redemption_id;
  END IF;
  
  -- Deduct points from user
  UPDATE user_rewards
  SET points = points - reward_points_cost
  WHERE user_id = user_id;
  
  -- Update stock quantity if applicable
  IF reward_stock IS NOT NULL THEN
    UPDATE reward_items
    SET stock_quantity = stock_quantity - 1
    WHERE id = p_reward_item_id;
  END IF;
  
  -- Return success with redemption details
  RETURN json_build_object(
    'success', true,
    'redemption_id', redemption_id,
    'reward_name', reward_name,
    'points_spent', reward_points_cost,
    'redemption_code', redemption_code,
    'is_digital', reward_is_digital,
    'status', CASE WHEN reward_is_digital THEN 'fulfilled' ELSE 'pending' END,
    'message', CASE 
      WHEN reward_is_digital THEN 'Reward redeemed successfully! Use your redemption code to access your reward.'
      ELSE 'Reward redeemed successfully! We will process your order soon.'
    END
  );
END;
$$;

-- Function to get user redemption history
CREATE OR REPLACE FUNCTION get_user_redemptions(p_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  redemptions json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', rr.id,
      'reward_name', ri.name,
      'reward_description', ri.description,
      'reward_image_url', ri.image_url,
      'points_spent', rr.points_spent,
      'status', rr.status,
      'redemption_code', rr.redemption_code,
      'is_digital', ri.is_digital,
      'created_at', rr.created_at,
      'fulfilled_at', rr.fulfilled_at
    )
  ) INTO redemptions
  FROM reward_redemptions rr
  JOIN reward_items ri ON rr.reward_item_id = ri.id
  WHERE rr.user_id = p_user_id
  ORDER BY rr.created_at DESC;
  
  RETURN json_build_object(
    'redemptions', COALESCE(redemptions, '[]'::json)
  );
END;
$$;

-- Insert sample reward items
INSERT INTO reward_items (
  name,
  description,
  image_url,
  points_cost,
  required_tier,
  category,
  is_digital,
  is_active,
  stock_quantity
) VALUES
  (
    'Premium Recipe Collection',
    'Unlock a collection of 50 exclusive premium recipes curated by nutrition experts.',
    'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600',
    500,
    'Bronze',
    'Content',
    true,
    true,
    null
  ),
  (
    'Personalized Meal Plan',
    'Get a custom 14-day meal plan designed specifically for your nutritional needs.',
    'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600',
    1000,
    'Silver',
    'Service',
    true,
    true,
    null
  ),
  (
    'Nutrition Consultation',
    '30-minute one-on-one consultation with a certified nutritionist.',
    'https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600',
    2000,
    'Gold',
    'Service',
    false,
    true,
    10
  ),
  (
    'OwnBite Premium (1 Month)',
    'One month of OwnBite Premium subscription with all premium features.',
    'https://images.pexels.com/photos/5926389/pexels-photo-5926389.jpeg?auto=compress&cs=tinysrgb&w=600',
    1500,
    'Silver',
    'Subscription',
    true,
    true,
    null
  ),
  (
    'Exclusive Cooking Webinar',
    'Access to an exclusive cooking webinar with a celebrity chef.',
    'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg?auto=compress&cs=tinysrgb&w=600',
    800,
    'Bronze',
    'Event',
    true,
    true,
    50
  ),
  (
    'Kitchen Gadget Bundle',
    'A bundle of premium kitchen gadgets to help you prepare healthy meals.',
    'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg?auto=compress&cs=tinysrgb&w=600',
    3000,
    'Platinum',
    'Physical',
    false,
    true,
    5
  ),
  (
    'Custom Badge',
    'Design your own custom badge to display on your profile.',
    'https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&cs=tinysrgb&w=600',
    300,
    'Bronze',
    'Customization',
    true,
    true,
    null
  ),
  (
    'Profile Spotlight',
    'Get your profile featured on the OwnBite community homepage for a week.',
    'https://images.pexels.com/photos/3760607/pexels-photo-3760607.jpeg?auto=compress&cs=tinysrgb&w=600',
    1200,
    'Gold',
    'Feature',
    true,
    true,
    4
  )
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_available_rewards(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_reward(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_redemptions(uuid) TO authenticated;

-- Add comments to track this migration
COMMENT ON TABLE reward_items IS 'Available items in the rewards marketplace';
COMMENT ON TABLE reward_redemptions IS 'Tracks user redemption history';
COMMENT ON FUNCTION get_available_rewards IS 'Gets rewards available to a user based on their tier';
COMMENT ON FUNCTION redeem_reward IS 'Processes reward redemption and deducts points';
COMMENT ON FUNCTION get_user_redemptions IS 'Gets a user''s redemption history';
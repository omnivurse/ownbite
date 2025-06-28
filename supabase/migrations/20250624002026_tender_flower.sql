/*
  # Social Sharing & Hashtag Integration

  1. New Tables
    - `social_shares` - Tracks content shared to social media platforms
      - Stores share details, status, and hashtags used
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    
  3. Functions
    - `share_content` - Records social sharing activity and awards points
    - `get_share_history` - Retrieves user's sharing history
*/

-- Create social_shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('recipe', 'food_scan', 'progress', 'achievement', 'bloodwork')),
  content_id text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('facebook', 'instagram', 'tiktok', 'twitter', 'pinterest', 'linkedin')),
  share_url text,
  share_image_url text,
  share_text text NOT NULL,
  hashtags text[] DEFAULT ARRAY['#iamhealthierwithownbite.me'],
  share_status text NOT NULL CHECK (share_status IN ('pending', 'success', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for social_shares
CREATE POLICY "Users can view their own social shares"
  ON social_shares
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own social shares"
  ON social_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own social shares"
  ON social_shares
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own social shares"
  ON social_shares
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS social_shares_user_id_idx ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS social_shares_content_type_idx ON social_shares(content_type);
CREATE INDEX IF NOT EXISTS social_shares_provider_idx ON social_shares(provider);
CREATE INDEX IF NOT EXISTS social_shares_created_at_idx ON social_shares(created_at);

-- Function to share content and award points
CREATE OR REPLACE FUNCTION share_content(
  p_content_type text,
  p_content_id text,
  p_provider text,
  p_share_text text,
  p_share_url text DEFAULT NULL,
  p_share_image_url text DEFAULT NULL,
  p_hashtags text[] DEFAULT ARRAY['#iamhealthierwithownbite.me']
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_id uuid;
  share_id uuid;
  points_awarded integer;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Validate content type
  IF p_content_type NOT IN ('recipe', 'food_scan', 'progress', 'achievement', 'bloodwork') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid content type'
    );
  END IF;
  
  -- Validate provider
  IF p_provider NOT IN ('facebook', 'instagram', 'tiktok', 'twitter', 'pinterest', 'linkedin') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid provider'
    );
  END IF;
  
  -- Ensure the hashtag is included
  IF NOT (p_hashtags @> ARRAY['#iamhealthierwithownbite.me']) THEN
    p_hashtags := array_append(p_hashtags, '#iamhealthierwithownbite.me');
  END IF;
  
  -- Create the share record
  INSERT INTO social_shares (
    user_id,
    content_type,
    content_id,
    provider,
    share_url,
    share_image_url,
    share_text,
    hashtags,
    share_status
  ) VALUES (
    user_id,
    p_content_type,
    p_content_id,
    p_provider,
    p_share_url,
    p_share_image_url,
    p_share_text,
    p_hashtags,
    'success'
  )
  RETURNING id INTO share_id;
  
  -- Award points based on content type
  CASE p_content_type
    WHEN 'recipe' THEN points_awarded := 20;
    WHEN 'food_scan' THEN points_awarded := 15;
    WHEN 'progress' THEN points_awarded := 25;
    WHEN 'achievement' THEN points_awarded := 30;
    WHEN 'bloodwork' THEN points_awarded := 20;
    ELSE points_awarded := 10;
  END CASE;
  
  -- Award points for sharing
  PERFORM award_points(
    user_id,
    'share_content',
    points_awarded,
    json_build_object(
      'content_type', p_content_type,
      'provider', p_provider,
      'hashtags', p_hashtags
    )
  );
  
  -- Return success with share ID and points
  RETURN json_build_object(
    'success', true,
    'share_id', share_id,
    'points_awarded', points_awarded,
    'message', 'Content shared successfully'
  );
END;
$$;

-- Function to get user's share history
CREATE OR REPLACE FUNCTION get_share_history(
  p_user_id uuid DEFAULT auth.uid(),
  p_limit integer DEFAULT 20
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  shares json;
  stats json;
BEGIN
  -- Get share history
  SELECT json_agg(
    json_build_object(
      'id', ss.id,
      'content_type', ss.content_type,
      'content_id', ss.content_id,
      'provider', ss.provider,
      'share_url', ss.share_url,
      'share_image_url', ss.share_image_url,
      'share_text', ss.share_text,
      'hashtags', ss.hashtags,
      'share_status', ss.share_status,
      'created_at', ss.created_at
    )
  ) INTO shares
  FROM social_shares ss
  WHERE ss.user_id = p_user_id
  ORDER BY ss.created_at DESC
  LIMIT p_limit;
  
  -- Get sharing stats
  SELECT json_build_object(
    'total_shares', COUNT(*),
    'by_platform', json_object_agg(provider, count),
    'by_content_type', json_object_agg(content_type, count)
  ) INTO stats
  FROM (
    SELECT 
      provider, 
      COUNT(*) as count
    FROM social_shares
    WHERE user_id = p_user_id
    GROUP BY provider
  ) as platform_stats
  CROSS JOIN (
    SELECT 
      content_type, 
      COUNT(*) as count
    FROM social_shares
    WHERE user_id = p_user_id
    GROUP BY content_type
  ) as content_stats;
  
  -- Return combined data
  RETURN json_build_object(
    'shares', COALESCE(shares, '[]'::json),
    'stats', COALESCE(stats, '{}'::json)
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION share_content(text, text, text, text, text, text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_share_history(uuid, integer) TO authenticated;

-- Add comments to track this migration
COMMENT ON TABLE social_shares IS 'Tracks content shared to social media platforms';
COMMENT ON FUNCTION share_content IS 'Records social sharing activity and awards points';
COMMENT ON FUNCTION get_share_history IS 'Retrieves user''s sharing history';
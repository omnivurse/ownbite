/*
  # Community Recipes Social Platform

  1. New Tables
    - `community_recipes` - User-shared recipes with social features
    - `recipe_likes` - Track user likes on recipes
    - `recipe_comments` - Allow users to comment on recipes
    - `user_follows` - Social graph for following other users
    - `recipe_collections` - User-created collections of recipes (like playlists)
    
  2. Security
    - Enable RLS on all tables
    - Public recipes are viewable by all users
    - Private recipes only visible to the creator
    - Comments and likes only on public recipes
    
  3. Performance
    - Indexes for efficient social queries
    - Optimized for feed generation
*/

-- Create community_recipes table
CREATE TABLE IF NOT EXISTS community_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  ingredients text[] NOT NULL,
  instructions text[] NOT NULL,
  tags text[],
  image_url text,
  nutrition jsonb DEFAULT '{}',
  is_public boolean DEFAULT true,
  remix_of uuid REFERENCES community_recipes(id),
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipe_likes table
CREATE TABLE IF NOT EXISTS recipe_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES community_recipes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Create recipe_comments table
CREATE TABLE IF NOT EXISTS recipe_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES community_recipes(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create recipe_collections table
CREATE TABLE IF NOT EXISTS recipe_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collection_recipes junction table
CREATE TABLE IF NOT EXISTS collection_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES recipe_collections(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES community_recipes(id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, recipe_id)
);

-- Create grocery_lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create grocery_list_items table
CREATE TABLE IF NOT EXISTS grocery_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES grocery_lists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity text,
  category text,
  is_checked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE community_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;

-- Policies for community_recipes
CREATE POLICY "Users can view public recipes"
  ON community_recipes
  FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own recipes"
  ON community_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own recipes"
  ON community_recipes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own recipes"
  ON community_recipes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for recipe_likes
CREATE POLICY "Users can view likes on public recipes"
  ON recipe_likes
  FOR SELECT
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM community_recipes 
      WHERE is_public = true OR user_id = auth.uid()
    )
  );

CREATE POLICY "Users can like public recipes"
  ON recipe_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM community_recipes 
      WHERE is_public = true
    )
  );

CREATE POLICY "Users can remove their own likes"
  ON recipe_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for recipe_comments
CREATE POLICY "Users can view comments on public recipes"
  ON recipe_comments
  FOR SELECT
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM community_recipes 
      WHERE is_public = true OR user_id = auth.uid()
    )
  );

CREATE POLICY "Users can comment on public recipes"
  ON recipe_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM community_recipes 
      WHERE is_public = true
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON recipe_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON recipe_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for user_follows
CREATE POLICY "Users can view follows"
  ON user_follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows
  FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
  ON user_follows
  FOR DELETE
  TO authenticated
  USING (follower_id = auth.uid());

-- Policies for recipe_collections
CREATE POLICY "Users can view public collections"
  ON recipe_collections
  FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own collections"
  ON recipe_collections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collections"
  ON recipe_collections
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own collections"
  ON recipe_collections
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for collection_recipes
CREATE POLICY "Users can view recipes in public collections"
  ON collection_recipes
  FOR SELECT
  TO authenticated
  USING (
    collection_id IN (
      SELECT id FROM recipe_collections
      WHERE is_public = true OR user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add recipes to their collections"
  ON collection_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    collection_id IN (
      SELECT id FROM recipe_collections
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove recipes from their collections"
  ON collection_recipes
  FOR DELETE
  TO authenticated
  USING (
    collection_id IN (
      SELECT id FROM recipe_collections
      WHERE user_id = auth.uid()
    )
  );

-- Policies for grocery_lists
CREATE POLICY "Users can view their own grocery lists"
  ON grocery_lists
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR (is_public = true));

CREATE POLICY "Users can create their own grocery lists"
  ON grocery_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own grocery lists"
  ON grocery_lists
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own grocery lists"
  ON grocery_lists
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for grocery_list_items
CREATE POLICY "Users can view items in their grocery lists"
  ON grocery_list_items
  FOR SELECT
  TO authenticated
  USING (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = auth.uid() OR is_public = true
    )
  );

CREATE POLICY "Users can add items to their grocery lists"
  ON grocery_list_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their grocery lists"
  ON grocery_list_items
  FOR UPDATE
  TO authenticated
  USING (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their grocery lists"
  ON grocery_list_items
  FOR DELETE
  TO authenticated
  USING (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS community_recipes_user_id_idx ON community_recipes(user_id);
CREATE INDEX IF NOT EXISTS community_recipes_created_at_idx ON community_recipes(created_at);
CREATE INDEX IF NOT EXISTS community_recipes_tags_idx ON community_recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS recipe_likes_recipe_id_idx ON recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_likes_user_id_idx ON recipe_likes(user_id);
CREATE INDEX IF NOT EXISTS recipe_comments_recipe_id_idx ON recipe_comments(recipe_id);
CREATE INDEX IF NOT EXISTS user_follows_follower_id_idx ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS user_follows_following_id_idx ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS recipe_collections_user_id_idx ON recipe_collections(user_id);
CREATE INDEX IF NOT EXISTS collection_recipes_collection_id_idx ON collection_recipes(collection_id);
CREATE INDEX IF NOT EXISTS grocery_lists_user_id_idx ON grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS grocery_list_items_list_id_idx ON grocery_list_items(list_id);

-- Functions for social features
CREATE OR REPLACE FUNCTION increment_recipe_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_recipes
  SET like_count = like_count + 1
  WHERE id = NEW.recipe_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_recipe_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_recipes
  SET like_count = GREATEST(0, like_count - 1)
  WHERE id = OLD.recipe_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_recipe_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_recipes
  SET comment_count = comment_count + 1
  WHERE id = NEW.recipe_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_recipe_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_recipes
  SET comment_count = GREATEST(0, comment_count - 1)
  WHERE id = OLD.recipe_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER after_recipe_like_insert
AFTER INSERT ON recipe_likes
FOR EACH ROW
EXECUTE FUNCTION increment_recipe_like_count();

CREATE TRIGGER after_recipe_like_delete
AFTER DELETE ON recipe_likes
FOR EACH ROW
EXECUTE FUNCTION decrement_recipe_like_count();

CREATE TRIGGER after_recipe_comment_insert
AFTER INSERT ON recipe_comments
FOR EACH ROW
EXECUTE FUNCTION increment_recipe_comment_count();

CREATE TRIGGER after_recipe_comment_delete
AFTER DELETE ON recipe_comments
FOR EACH ROW
EXECUTE FUNCTION decrement_recipe_comment_count();

-- Function to get social feed for a user
CREATE OR REPLACE FUNCTION get_social_feed(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  image_url text,
  like_count integer,
  comment_count integer,
  created_at timestamptz,
  user_full_name text,
  user_avatar_url text,
  is_liked boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH followed_users AS (
    SELECT following_id FROM user_follows WHERE follower_id = p_user_id
  )
  SELECT 
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.image_url,
    r.like_count,
    r.comment_count,
    r.created_at,
    p.full_name AS user_full_name,
    p.avatar_url AS user_avatar_url,
    EXISTS (SELECT 1 FROM recipe_likes WHERE recipe_id = r.id AND user_id = p_user_id) AS is_liked
  FROM community_recipes r
  JOIN profiles p ON r.user_id = p.user_id
  WHERE 
    r.is_public = true AND
    (r.user_id IN (SELECT * FROM followed_users) OR r.user_id = p_user_id)
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get discover feed (trending and popular recipes)
CREATE OR REPLACE FUNCTION get_discover_feed(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  image_url text,
  like_count integer,
  comment_count integer,
  created_at timestamptz,
  user_full_name text,
  user_avatar_url text,
  is_liked boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.image_url,
    r.like_count,
    r.comment_count,
    r.created_at,
    p.full_name AS user_full_name,
    p.avatar_url AS user_avatar_url,
    EXISTS (SELECT 1 FROM recipe_likes WHERE recipe_id = r.id AND user_id = p_user_id) AS is_liked
  FROM community_recipes r
  JOIN profiles p ON r.user_id = p.user_id
  WHERE r.is_public = true
  ORDER BY (r.like_count + r.comment_count) DESC, r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_social_feed(uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_discover_feed(uuid, integer, integer) TO authenticated;

-- Add comments to track this migration
COMMENT ON TABLE community_recipes IS 'User-shared recipes with social features';
COMMENT ON TABLE recipe_likes IS 'Tracks user likes on community recipes';
COMMENT ON TABLE recipe_comments IS 'User comments on community recipes';
COMMENT ON TABLE user_follows IS 'Social graph for following other users';
COMMENT ON TABLE recipe_collections IS 'User-created collections of recipes';
COMMENT ON TABLE collection_recipes IS 'Junction table for recipes in collections';
COMMENT ON TABLE grocery_lists IS 'User-created shopping lists';
COMMENT ON TABLE grocery_list_items IS 'Items in user grocery lists';
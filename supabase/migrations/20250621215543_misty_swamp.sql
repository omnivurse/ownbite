/*
  # Social Media Integration Schema

  1. New Tables
    - `social_accounts` - Stores connected social media accounts
    - `social_shares` - Tracks content shared to social media

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Performance
    - Add indexes for efficient querying
*/

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('facebook', 'instagram', 'tiktok', 'twitter', 'pinterest')),
  provider_user_id text NOT NULL,
  username text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  profile_image_url text,
  is_connected boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create social_shares table
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('recipe', 'food_scan', 'progress', 'achievement')),
  content_id text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('facebook', 'instagram', 'tiktok', 'twitter', 'pinterest')),
  share_url text,
  share_image_url text,
  share_text text NOT NULL,
  share_status text NOT NULL CHECK (share_status IN ('pending', 'success', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for social_accounts
CREATE POLICY "Users can view their own social accounts"
  ON social_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own social accounts"
  ON social_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own social accounts"
  ON social_accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own social accounts"
  ON social_accounts
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

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
CREATE INDEX IF NOT EXISTS social_accounts_user_id_idx ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS social_accounts_provider_idx ON social_accounts(provider);
CREATE INDEX IF NOT EXISTS social_shares_user_id_idx ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS social_shares_content_type_idx ON social_shares(content_type);
CREATE INDEX IF NOT EXISTS social_shares_provider_idx ON social_shares(provider);

-- Add comment to track this migration
COMMENT ON TABLE social_accounts IS 'Stores connected social media accounts for sharing content';
COMMENT ON TABLE social_shares IS 'Tracks content shared to social media platforms';
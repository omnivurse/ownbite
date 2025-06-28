/*
  # Food Entries Schema

  1. New Tables
    - `food_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `calories` (numeric)
      - `protein` (numeric)
      - `carbs` (numeric)
      - `fat` (numeric)
      - `image_url` (text)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on food_entries table
    - Add policies for authenticated users to manage their own entries

  3. Performance
    - Add indexes on user_id and timestamp for faster queries
*/

-- Create food_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  calories numeric DEFAULT 0,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fat numeric DEFAULT 0,
  image_url text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can insert their own food entries" ON food_entries;
  DROP POLICY IF EXISTS "Users can view their own food entries" ON food_entries;
  DROP POLICY IF EXISTS "Users can update their own food entries" ON food_entries;
  DROP POLICY IF EXISTS "Users can delete their own food entries" ON food_entries;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Users can insert their own food entries"
  ON food_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own food entries"
  ON food_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own food entries"
  ON food_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food entries"
  ON food_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
DROP INDEX IF EXISTS food_entries_user_id_idx;
DROP INDEX IF EXISTS food_entries_timestamp_idx;

CREATE INDEX food_entries_user_id_idx ON food_entries(user_id);
CREATE INDEX food_entries_timestamp_idx ON food_entries(timestamp);
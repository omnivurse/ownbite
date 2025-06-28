/*
  # Food Scanning App Database Schema

  1. New Tables
    - `food_scans`
      - Stores the results of food image scans
      - Links to individual food items detected
      - Tracks total nutritional values
    
    - `food_items`
      - Individual food items detected in scans
      - Stores nutritional information and health insights
      - Links back to parent scan
    
    - `food_entries`
      - User's food diary entries
      - Can be created from scans or manual input
      - Tracks daily nutrition totals

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure users can only access their own records
*/

-- Create food_scans table
CREATE TABLE IF NOT EXISTS food_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  image_url text,
  total_calories numeric DEFAULT 0,
  total_protein numeric DEFAULT 0,
  total_carbs numeric DEFAULT 0,
  total_fat numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create food_items table
CREATE TABLE IF NOT EXISTS food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES food_scans ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  calories numeric DEFAULT 0,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fat numeric DEFAULT 0,
  health_benefits text[],
  health_risks text[],
  created_at timestamptz DEFAULT now()
);

-- Create food_entries table
CREATE TABLE IF NOT EXISTS food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  calories numeric DEFAULT 0,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fat numeric DEFAULT 0,
  image_url text,
  meal_type text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- Policies for food_scans
CREATE POLICY "Users can view their own scans"
  ON food_scans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans"
  ON food_scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans"
  ON food_scans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
  ON food_scans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for food_items
CREATE POLICY "Users can view items from their scans"
  ON food_items
  FOR SELECT
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items for their scans"
  ON food_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items from their scans"
  ON food_items
  FOR UPDATE
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their scans"
  ON food_items
  FOR DELETE
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = auth.uid()
    )
  );

-- Policies for food_entries
CREATE POLICY "Users can view their own entries"
  ON food_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
  ON food_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON food_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON food_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS food_scans_user_id_idx ON food_scans(user_id);
CREATE INDEX IF NOT EXISTS food_entries_user_id_idx ON food_entries(user_id);
CREATE INDEX IF NOT EXISTS food_entries_timestamp_idx ON food_entries(timestamp);
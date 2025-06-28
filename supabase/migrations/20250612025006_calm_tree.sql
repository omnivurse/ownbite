/*
  # Food Scanner Tables and Policies - Fixed Migration

  1. Tables
    - Ensure food_scans table exists with all required columns
    - Ensure food_items table exists with all required columns

  2. Security
    - Enable RLS on both tables
    - Create policies for authenticated users to manage their own data
    - Handle existing policies gracefully

  3. Performance
    - Add indexes for better query performance
*/

-- Ensure food_scans table exists with all required columns
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

-- Ensure food_items table exists with all required columns
CREATE TABLE IF NOT EXISTS food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES food_scans(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  calories numeric DEFAULT 0,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fat numeric DEFAULT 0,
  health_benefits text[],
  health_risks text[],
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for food_scans (handle all possible variations)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "food_scans_select" ON food_scans;
  DROP POLICY IF EXISTS "food_scans_insert" ON food_scans;
  DROP POLICY IF EXISTS "food_scans_update" ON food_scans;
  DROP POLICY IF EXISTS "food_scans_delete" ON food_scans;
  DROP POLICY IF EXISTS "Users can view their own scans" ON food_scans;
  DROP POLICY IF EXISTS "Users can create their own scans" ON food_scans;
  DROP POLICY IF EXISTS "Users can update their own scans" ON food_scans;
  DROP POLICY IF EXISTS "Users can delete their own scans" ON food_scans;
  DROP POLICY IF EXISTS "Users can view their own food scans" ON food_scans;
  DROP POLICY IF EXISTS "Users can insert their own food scans" ON food_scans;
  DROP POLICY IF EXISTS "Users can update their own food scans" ON food_scans;
  DROP POLICY IF EXISTS "Users can delete their own food scans" ON food_scans;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Drop ALL existing policies for food_items (handle all possible variations)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "food_items_select" ON food_items;
  DROP POLICY IF EXISTS "food_items_insert" ON food_items;
  DROP POLICY IF EXISTS "food_items_update" ON food_items;
  DROP POLICY IF EXISTS "food_items_delete" ON food_items;
  DROP POLICY IF EXISTS "Users can view items from their scans" ON food_items;
  DROP POLICY IF EXISTS "Users can create items for their scans" ON food_items;
  DROP POLICY IF EXISTS "Users can update items from their scans" ON food_items;
  DROP POLICY IF EXISTS "Users can delete items from their scans" ON food_items;
  DROP POLICY IF EXISTS "Users can view food items from their scans" ON food_items;
  DROP POLICY IF EXISTS "Users can insert food items to their scans" ON food_items;
  DROP POLICY IF EXISTS "Users can update food items from their scans" ON food_items;
  DROP POLICY IF EXISTS "Users can delete food items from their scans" ON food_items;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create optimized policies for food_scans
CREATE POLICY "food_scans_select"
  ON food_scans
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "food_scans_insert"
  ON food_scans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "food_scans_update"
  ON food_scans
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "food_scans_delete"
  ON food_scans
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Create optimized policies for food_items
CREATE POLICY "food_items_select"
  ON food_items
  FOR SELECT
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "food_items_insert"
  ON food_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "food_items_update"
  ON food_items
  FOR UPDATE
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "food_items_delete"
  ON food_items
  FOR DELETE
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  );

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS food_scans_user_id_idx ON food_scans(user_id);
CREATE INDEX IF NOT EXISTS food_scans_created_at_idx ON food_scans(created_at);
CREATE INDEX IF NOT EXISTS food_items_scan_id_idx ON food_items(scan_id);

-- Add comments to track this migration
COMMENT ON TABLE food_scans IS 'Stores food scan results with nutritional totals';
COMMENT ON TABLE food_items IS 'Individual food items detected in each scan';
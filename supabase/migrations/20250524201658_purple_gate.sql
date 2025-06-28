/*
  # Initial database schema for NutriScan app

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `dietary_preferences` (array of text)
      - `allergies` (array of text)
      - `health_goals` (array of text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `food_scans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `total_calories` (numeric)
      - `total_protein` (numeric)
      - `total_carbs` (numeric)
      - `total_fat` (numeric)
      - `created_at` (timestamp)

    - `food_items`
      - `id` (uuid, primary key)
      - `scan_id` (uuid, references food_scans)
      - `name` (text)
      - `calories` (numeric)
      - `protein` (numeric)
      - `carbs` (numeric)
      - `fat` (numeric)
      - `health_benefits` (array of text)
      - `health_risks` (array of text)

    - `recipes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `cuisine_type` (text)
      - `diet_type` (array of text)
      - `ingredients` (array of text)
      - `instructions` (array of text)
      - `prep_time` (integer)
      - `cook_time` (integer)
      - `servings` (integer)
      - `calories_per_serving` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text,
  avatar_url text,
  dietary_preferences text[],
  allergies text[],
  health_goals text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

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

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  cuisine_type text,
  diet_type text[],
  ingredients text[],
  instructions text[],
  prep_time integer DEFAULT 0,
  cook_time integer DEFAULT 0,
  servings integer DEFAULT 1,
  calories_per_serving numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for food_scans
CREATE POLICY "Users can view their own food scans"
  ON food_scans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food scans"
  ON food_scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food scans"
  ON food_scans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food scans"
  ON food_scans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for food_items
CREATE POLICY "Users can view food items from their scans"
  ON food_items
  FOR SELECT
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert food items to their scans"
  ON food_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update food items from their scans"
  ON food_items
  FOR UPDATE
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete food items from their scans"
  ON food_items
  FOR DELETE
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = auth.uid()
    )
  );

-- Create policies for recipes
CREATE POLICY "Anyone can view recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to create a profile after a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
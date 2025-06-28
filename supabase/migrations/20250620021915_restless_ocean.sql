/*
  # Reminders and Goals System

  1. New Tables
    - `reminders` - Stores user reminders and goals
      - Tracks title, description, due date
      - Supports different types (reminder, goal)
      - Includes priority levels and completion status

  2. Security
    - Enable RLS on reminders table
    - Add policies for authenticated users to manage their own reminders
    - Ensure users can only access their own records

  3. Performance
    - Add indexes for efficient querying
    - Optimize for user-based and status-based queries
*/

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  type text NOT NULL CHECK (type IN ('reminder', 'goal')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for reminders
CREATE POLICY "Users can view their own reminders"
  ON reminders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reminders"
  ON reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reminders"
  ON reminders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reminders"
  ON reminders
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON reminders(user_id);
CREATE INDEX IF NOT EXISTS reminders_is_completed_idx ON reminders(is_completed);
CREATE INDEX IF NOT EXISTS reminders_due_date_idx ON reminders(due_date);
CREATE INDEX IF NOT EXISTS reminders_type_idx ON reminders(type);

-- Add comment to track this migration
COMMENT ON TABLE reminders IS 'Stores user reminders and goals with due dates and completion status';
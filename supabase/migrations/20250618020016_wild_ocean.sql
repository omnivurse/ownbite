/*
  # Fix Security Definer View Issue

  1. Problem
    - The bloodwork_trends_summary view is currently defined with SECURITY DEFINER
    - This bypasses row-level security policies and is a security risk
    - The view should use SECURITY INVOKER instead to respect RLS policies

  2. Solution
    - Drop the existing view
    - Recreate it with SECURITY INVOKER (or without specifying security, which defaults to INVOKER)
    - Ensure the view still works correctly with RLS policies
*/

-- Drop the existing view
DROP VIEW IF EXISTS bloodwork_trends_summary;

-- Recreate the view with SECURITY INVOKER
CREATE OR REPLACE VIEW bloodwork_trends_summary WITH (security_invoker = true) AS
SELECT
  user_id,
  biomarker,
  date_trunc('month', taken_at) AS month,
  avg(value) AS avg_value,
  min(value) AS min_value,
  max(value) AS max_value,
  count(*) AS reading_count
FROM bloodwork_trends
GROUP BY user_id, biomarker, date_trunc('month', taken_at);

-- Add comment to track this migration
COMMENT ON VIEW bloodwork_trends_summary IS 'Monthly aggregated view of biomarker trends for charting';
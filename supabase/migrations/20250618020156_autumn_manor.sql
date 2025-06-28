/*
  # Fix Function Search Path Mutable Warnings

  1. Problem
    - Functions with mutable search paths can be a security risk
    - Current functions don't explicitly set search_path parameter
    - This could potentially lead to schema injection attacks

  2. Solution
    - Add search_path = 'public' to all function definitions
    - This ensures functions always use the public schema
    - Prevents potential privilege escalation

  3. Functions Fixed
    - make_user_admin
    - has_premium_access
    - sync_bloodwork_trends
    - get_biomarker_trend
    - increment_recipe_like_count
    - decrement_recipe_like_count
    - increment_recipe_comment_count
    - decrement_recipe_comment_count
    - get_social_feed
    - get_discover_feed
    - analyze_nutrient_status
    - calculate_recommended_goals
    - update_daily_goal_log
    - get_nutrient_recommendations
    - is_admin
    - check_rls_performance
    - handle_new_user
    - ensure_profile_exists
    - calculate_nutrition_goals
    - get_meal_plan_recommendations
*/

-- Fix make_user_admin function
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE profiles 
  SET role = 'admin' 
  WHERE user_id = (
    SELECT id FROM auth.users WHERE email = user_email
  );
END;
$$;

-- Fix has_premium_access function
CREATE OR REPLACE FUNCTION public.has_premium_access(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_status text;
  end_date timestamptz;
BEGIN
  SELECT 
    profiles.subscription_status,
    profiles.subscription_end_date
  INTO 
    user_status,
    end_date
  FROM profiles
  WHERE profiles.user_id = has_premium_access.user_id;
  
  -- User has premium if:
  -- 1. They have 'premium' status AND
  -- 2. Either their subscription hasn't ended OR they have 'lifetime' access
  RETURN (
    user_status = 'premium' AND 
    (end_date IS NULL OR end_date > now() OR user_status = 'lifetime')
  );
END;
$$;

-- Fix sync_bloodwork_trends function
CREATE OR REPLACE FUNCTION public.sync_bloodwork_trends()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert a new trend point when a nutrient status is added
  INSERT INTO bloodwork_trends (
    user_id,
    biomarker,
    value,
    unit,
    taken_at
  )
  VALUES (
    NEW.user_id,
    NEW.nutrient_name,
    NEW.current_value,
    NEW.unit,
    COALESCE(
      (SELECT uploaded_at::date FROM bloodwork_results WHERE id = NEW.bloodwork_id),
      CURRENT_DATE
    )
  );
  
  RETURN NEW;
END;
$$;

-- Fix get_biomarker_trend function
CREATE OR REPLACE FUNCTION public.get_biomarker_trend(
  p_user_id uuid,
  p_biomarker text,
  p_months int DEFAULT 6
)
RETURNS TABLE (
  current_value numeric,
  previous_value numeric,
  change_percent numeric,
  trend text,
  unit text,
  reading_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  start_date date;
BEGIN
  -- Calculate start date based on months parameter
  start_date := CURRENT_DATE - (p_months * INTERVAL '1 month');
  
  RETURN QUERY
  WITH recent_readings AS (
    SELECT
      value,
      unit,
      taken_at,
      ROW_NUMBER() OVER (ORDER BY taken_at DESC) as row_num
    FROM bloodwork_trends
    WHERE 
      user_id = p_user_id AND
      biomarker = p_biomarker AND
      taken_at >= start_date
    ORDER BY taken_at DESC
  )
  SELECT
    (SELECT value FROM recent_readings WHERE row_num = 1) as current_value,
    (SELECT value FROM recent_readings WHERE row_num = 2) as previous_value,
    CASE
      WHEN (SELECT value FROM recent_readings WHERE row_num = 2) IS NOT NULL AND
           (SELECT value FROM recent_readings WHERE row_num = 2) <> 0
      THEN
        (((SELECT value FROM recent_readings WHERE row_num = 1) - 
          (SELECT value FROM recent_readings WHERE row_num = 2)) / 
          (SELECT value FROM recent_readings WHERE row_num = 2)) * 100
      ELSE NULL
    END as change_percent,
    CASE
      WHEN (SELECT value FROM recent_readings WHERE row_num = 2) IS NULL THEN 'no_trend'
      WHEN ABS(((SELECT value FROM recent_readings WHERE row_num = 1) - 
                (SELECT value FROM recent_readings WHERE row_num = 2)) / 
                (SELECT value FROM recent_readings WHERE row_num = 2)) < 0.05 THEN 'stable'
      WHEN (SELECT value FROM recent_readings WHERE row_num = 1) > 
           (SELECT value FROM recent_readings WHERE row_num = 2) THEN 'increasing'
      ELSE 'decreasing'
    END as trend,
    (SELECT unit FROM recent_readings WHERE row_num = 1) as unit,
    (SELECT COUNT(*) FROM recent_readings) as reading_count;
END;
$$;

-- Fix increment_recipe_like_count function
CREATE OR REPLACE FUNCTION public.increment_recipe_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE community_recipes
  SET like_count = like_count + 1
  WHERE id = NEW.recipe_id;
  RETURN NEW;
END;
$$;

-- Fix decrement_recipe_like_count function
CREATE OR REPLACE FUNCTION public.decrement_recipe_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE community_recipes
  SET like_count = GREATEST(0, like_count - 1)
  WHERE id = OLD.recipe_id;
  RETURN OLD;
END;
$$;

-- Fix increment_recipe_comment_count function
CREATE OR REPLACE FUNCTION public.increment_recipe_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE community_recipes
  SET comment_count = comment_count + 1
  WHERE id = NEW.recipe_id;
  RETURN NEW;
END;
$$;

-- Fix decrement_recipe_comment_count function
CREATE OR REPLACE FUNCTION public.decrement_recipe_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE community_recipes
  SET comment_count = GREATEST(0, comment_count - 1)
  WHERE id = OLD.recipe_id;
  RETURN OLD;
END;
$$;

-- Fix get_social_feed function
CREATE OR REPLACE FUNCTION public.get_social_feed(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Fix get_discover_feed function
CREATE OR REPLACE FUNCTION public.get_discover_feed(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Fix analyze_nutrient_status function
CREATE OR REPLACE FUNCTION public.analyze_nutrient_status(
  p_user_id uuid,
  p_nutrient_name text,
  p_value numeric,
  p_unit text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  range_record nutrient_ranges%ROWTYPE;
  status_result text;
BEGIN
  -- Get the reference range for this nutrient
  SELECT * INTO range_record 
  FROM nutrient_ranges 
  WHERE nutrient_name = p_nutrient_name;
  
  IF NOT FOUND THEN
    RETURN 'unknown'; -- No reference range available
  END IF;
  
  -- Determine status based on value
  IF p_value < range_record.min_value * 0.7 THEN
    status_result := 'very_low';
  ELSIF p_value < range_record.min_value THEN
    status_result := 'low';
  ELSIF p_value > range_record.max_value * 1.3 THEN
    status_result := 'very_high';
  ELSIF p_value > range_record.max_value THEN
    status_result := 'high';
  ELSE
    status_result := 'optimal';
  END IF;
  
  RETURN status_result;
END;
$$;

-- Fix calculate_recommended_goals function
CREATE OR REPLACE FUNCTION public.calculate_recommended_goals(
  p_gender text,
  p_weight_kg integer,
  p_height_cm integer,
  p_age integer,
  p_activity_level text,
  p_goal_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  bmr numeric;
  tdee numeric;
  calories_goal integer;
  protein_goal integer;
  fat_goal integer;
  carbs_goal integer;
BEGIN
  -- Calculate BMR using Mifflin-St Jeor Equation
  IF p_gender = 'male' THEN
    bmr := 10 * p_weight_kg + 6.25 * p_height_cm - 5 * p_age + 5;
  ELSE
    bmr := 10 * p_weight_kg + 6.25 * p_height_cm - 5 * p_age - 161;
  END IF;

  -- Calculate TDEE based on activity level
  CASE p_activity_level
    WHEN 'sedentary' THEN tdee := bmr * 1.2;
    WHEN 'light' THEN tdee := bmr * 1.375;
    WHEN 'moderate' THEN tdee := bmr * 1.55;
    WHEN 'active' THEN tdee := bmr * 1.725;
    WHEN 'very_active' THEN tdee := bmr * 1.9;
    ELSE tdee := bmr * 1.55;
  END CASE;

  -- Adjust for goal type
  CASE p_goal_type
    WHEN 'lose' THEN calories_goal := ROUND(tdee - 500);
    WHEN 'gain' THEN calories_goal := ROUND(tdee + 500);
    ELSE calories_goal := ROUND(tdee);
  END CASE;

  -- Calculate macros (protein: 1.6g/kg, fat: 25% of calories, carbs: remainder)
  protein_goal := ROUND(p_weight_kg * 1.6);
  fat_goal := ROUND(calories_goal * 0.25 / 9);
  carbs_goal := ROUND((calories_goal - (protein_goal * 4) - (fat_goal * 9)) / 4);

  RETURN json_build_object(
    'calories_goal', calories_goal,
    'protein_goal_g', protein_goal,
    'fat_goal_g', fat_goal,
    'carbs_goal_g', carbs_goal
  );
END;
$$;

-- Fix update_daily_goal_log function
CREATE OR REPLACE FUNCTION public.update_daily_goal_log(p_user_id uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  goals_record nutrition_goals%ROWTYPE;
  daily_totals record;
  tolerance_percent numeric := 0.1; -- 10% tolerance
BEGIN
  -- Get user's nutrition goals
  SELECT * INTO goals_record FROM nutrition_goals WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN; -- No goals set, nothing to update
  END IF;

  -- Calculate daily totals from food_entries
  SELECT 
    COALESCE(SUM(calories), 0) as total_calories,
    COALESCE(SUM(protein), 0) as total_protein,
    COALESCE(SUM(carbs), 0) as total_carbs,
    COALESCE(SUM(fat), 0) as total_fat
  INTO daily_totals
  FROM food_entries 
  WHERE user_id = p_user_id 
    AND DATE(timestamp) = p_date;

  -- Insert or update daily goal log
  INSERT INTO daily_goal_logs (
    user_id,
    log_date,
    actual_calories,
    actual_protein_g,
    actual_fat_g,
    actual_carbs_g,
    met_calories_goal,
    met_protein_goal,
    met_fat_goal,
    met_carbs_goal,
    overall_goal_met
  ) VALUES (
    p_user_id,
    p_date,
    daily_totals.total_calories,
    daily_totals.total_protein,
    daily_totals.total_fat,
    daily_totals.total_carbs,
    daily_totals.total_calories BETWEEN (goals_record.calories_goal * (1 - tolerance_percent)) AND (goals_record.calories_goal * (1 + tolerance_percent)),
    daily_totals.total_protein >= (goals_record.protein_goal_g * (1 - tolerance_percent)),
    daily_totals.total_fat BETWEEN (goals_record.fat_goal_g * (1 - tolerance_percent)) AND (goals_record.fat_goal_g * (1 + tolerance_percent)),
    daily_totals.total_carbs BETWEEN (goals_record.carbs_goal_g * (1 - tolerance_percent)) AND (goals_record.carbs_goal_g * (1 + tolerance_percent)),
    (daily_totals.total_calories BETWEEN (goals_record.calories_goal * (1 - tolerance_percent)) AND (goals_record.calories_goal * (1 + tolerance_percent)))
    AND (daily_totals.total_protein >= (goals_record.protein_goal_g * (1 - tolerance_percent)))
    AND (daily_totals.total_fat BETWEEN (goals_record.fat_goal_g * (1 - tolerance_percent)) AND (goals_record.fat_goal_g * (1 + tolerance_percent)))
    AND (daily_totals.total_carbs BETWEEN (goals_record.carbs_goal_g * (1 - tolerance_percent)) AND (goals_record.carbs_goal_g * (1 + tolerance_percent)))
  )
  ON CONFLICT (user_id, log_date) 
  DO UPDATE SET
    actual_calories = EXCLUDED.actual_calories,
    actual_protein_g = EXCLUDED.actual_protein_g,
    actual_fat_g = EXCLUDED.actual_fat_g,
    actual_carbs_g = EXCLUDED.actual_carbs_g,
    met_calories_goal = EXCLUDED.met_calories_goal,
    met_protein_goal = EXCLUDED.met_protein_goal,
    met_fat_goal = EXCLUDED.met_fat_goal,
    met_carbs_goal = EXCLUDED.met_carbs_goal,
    overall_goal_met = EXCLUDED.overall_goal_met;
END;
$$;

-- Fix get_nutrient_recommendations function
CREATE OR REPLACE FUNCTION public.get_nutrient_recommendations(p_user_id uuid)
RETURNS TABLE(
  nutrient_name text,
  status text,
  recommended_foods text[],
  foods_to_avoid text[],
  explanation text,
  priority_level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uns.nutrient_name,
    uns.status,
    nr.recommended_foods,
    nr.foods_to_avoid,
    nr.explanation,
    nr.priority_level
  FROM user_nutrient_status uns
  JOIN nutrient_recommendations nr ON uns.nutrient_name = nr.nutrient_name 
    AND uns.status = nr.deficiency_level
  WHERE uns.user_id = p_user_id
    AND uns.status IN ('low', 'very_low', 'high', 'very_high')
  ORDER BY nr.priority_level, uns.nutrient_name;
END;
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(input_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  check_user_id uuid;
BEGIN
  -- Use provided user_id or fall back to current user
  check_user_id := COALESCE(input_user_id, auth.uid());
  
  -- Return true if user is admin
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = check_user_id 
    AND role = 'admin'
  );
END;
$$;

-- Fix check_rls_performance function
CREATE OR REPLACE FUNCTION public.check_rls_performance()
RETURNS TABLE(
  table_name text,
  policy_name text,
  policy_definition text,
  performance_optimized boolean,
  has_duplicates boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH policy_analysis AS (
    SELECT 
      schemaname::text || '.' || tablename::text as table_name,
      policyname::text as policy_name,
      definition::text as policy_definition,
      NOT (definition LIKE '%auth.uid()%' AND definition NOT LIKE '%(select auth.uid())%') as performance_optimized,
      tablename,
      cmd,
      roles
    FROM pg_policies 
    WHERE schemaname = 'public'
  ),
  duplicate_check AS (
    SELECT 
      tablename,
      cmd,
      roles,
      COUNT(*) > 1 as has_duplicates
    FROM policy_analysis
    GROUP BY tablename, cmd, roles
  )
  SELECT 
    pa.table_name,
    pa.policy_name,
    pa.policy_definition,
    pa.performance_optimized,
    COALESCE(dc.has_duplicates, false) as has_duplicates
  FROM policy_analysis pa
  LEFT JOIN duplicate_check dc ON pa.tablename = dc.tablename 
    AND pa.cmd = dc.cmd 
    AND pa.roles = dc.roles
  ORDER BY pa.table_name, pa.policy_name;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'member',
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Fix ensure_profile_exists function
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, created_at, updated_at)
  VALUES (user_id, 'member', now(), now())
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Fix calculate_nutrition_goals function
CREATE OR REPLACE FUNCTION public.calculate_nutrition_goals(
  p_user_id uuid,
  p_gender text DEFAULT 'male',
  p_weight_kg integer DEFAULT 70,
  p_height_cm integer DEFAULT 175,
  p_age integer DEFAULT 30,
  p_activity_level text DEFAULT 'moderate',
  p_goal_type text DEFAULT 'maintain'
)
RETURNS TABLE(
  calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  bmr numeric;
  activity_multiplier numeric;
  total_calories numeric;
  goal_multiplier numeric;
BEGIN
  -- Calculate BMR using Mifflin-St Jeor Equation
  IF p_gender = 'male' THEN
    bmr := 10 * p_weight_kg + 6.25 * p_height_cm - 5 * p_age + 5;
  ELSE
    bmr := 10 * p_weight_kg + 6.25 * p_height_cm - 5 * p_age - 161;
  END IF;

  -- Activity level multipliers
  activity_multiplier := CASE p_activity_level
    WHEN 'sedentary' THEN 1.2
    WHEN 'light' THEN 1.375
    WHEN 'moderate' THEN 1.55
    WHEN 'active' THEN 1.725
    WHEN 'very_active' THEN 1.9
    ELSE 1.55
  END;

  -- Goal type adjustments
  goal_multiplier := CASE p_goal_type
    WHEN 'lose' THEN 0.8  -- 20% deficit
    WHEN 'gain' THEN 1.2  -- 20% surplus
    ELSE 1.0  -- maintain
  END;

  total_calories := bmr * activity_multiplier * goal_multiplier;

  RETURN QUERY SELECT 
    ROUND(total_calories)::integer as calories,
    ROUND(p_weight_kg * 1.6)::integer as protein_g,  -- 1.6g per kg body weight
    ROUND(total_calories * 0.45 / 4)::integer as carbs_g,  -- 45% of calories from carbs
    ROUND(total_calories * 0.25 / 9)::integer as fat_g;    -- 25% of calories from fat
END;
$$;

-- Fix get_meal_plan_recommendations function
CREATE OR REPLACE FUNCTION public.get_meal_plan_recommendations(p_user_id uuid)
RETURNS TABLE(
  recommended_nutrients text[],
  priority_score integer,
  explanation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  critical_nutrients text[];
  suboptimal_nutrients text[];
BEGIN
  -- Get critical nutrient deficiencies
  SELECT ARRAY_AGG(nutrient_name) INTO critical_nutrients
  FROM user_nutrient_status
  WHERE user_id = p_user_id 
    AND status IN ('very_low', 'very_high');

  -- Get suboptimal nutrients
  SELECT ARRAY_AGG(nutrient_name) INTO suboptimal_nutrients
  FROM user_nutrient_status
  WHERE user_id = p_user_id 
    AND status IN ('low', 'high');

  -- Return recommendations based on priority
  IF critical_nutrients IS NOT NULL AND array_length(critical_nutrients, 1) > 0 THEN
    RETURN QUERY SELECT 
      critical_nutrients,
      1 as priority_score,
      'Critical nutrient deficiencies detected. Immediate dietary intervention recommended.' as explanation;
  ELSIF suboptimal_nutrients IS NOT NULL AND array_length(suboptimal_nutrients, 1) > 0 THEN
    RETURN QUERY SELECT 
      suboptimal_nutrients,
      2 as priority_score,
      'Suboptimal nutrient levels detected. Dietary optimization recommended.' as explanation;
  ELSE
    RETURN QUERY SELECT 
      ARRAY['Vitamin D', 'Iron', 'Vitamin B12']::text[],
      3 as priority_score,
      'Maintain optimal nutrition with a balanced diet rich in essential nutrients.' as explanation;
  END IF;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.make_user_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_premium_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_biomarker_trend(uuid, text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_nutrient_status(uuid, text, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_recommended_goals(text, integer, integer, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_daily_goal_log(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_nutrient_recommendations(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_nutrition_goals(uuid, text, integer, integer, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_meal_plan_recommendations(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_social_feed(uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_discover_feed(uuid, integer, integer) TO authenticated;

-- Add comment to track this migration
COMMENT ON SCHEMA public IS 'Fixed function search path mutable warnings by setting search_path = public for all functions';
-- Fix RLS performance issues by replacing auth.uid() with (select auth.uid())
-- This migration addresses the auth_rls_initplan warnings

-- Fix food_scans policies
DROP POLICY IF EXISTS "Users can view their food scans" ON food_scans;
DROP POLICY IF EXISTS "Users can insert their food scans" ON food_scans;
DROP POLICY IF EXISTS "Users can update their food scans" ON food_scans;
DROP POLICY IF EXISTS "Users can delete their food scans" ON food_scans;
DROP POLICY IF EXISTS "food_scans_select" ON food_scans;
DROP POLICY IF EXISTS "food_scans_insert" ON food_scans;
DROP POLICY IF EXISTS "food_scans_update" ON food_scans;
DROP POLICY IF EXISTS "food_scans_delete" ON food_scans;

CREATE POLICY "food_scans_select" ON food_scans
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "food_scans_insert" ON food_scans
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "food_scans_update" ON food_scans
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "food_scans_delete" ON food_scans
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Fix meal_plans policies
DROP POLICY IF EXISTS "Users can view their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can insert their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete their own meal plans" ON meal_plans;

CREATE POLICY "Users can view their own meal plans" ON meal_plans
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own meal plans" ON meal_plans
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own meal plans" ON meal_plans
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix plans policies
DROP POLICY IF EXISTS "Only admins can modify plans" ON plans;

CREATE POLICY "Only admins can modify plans" ON plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Fix bloodwork_trends policies
DROP POLICY IF EXISTS "Users can view their own bloodwork trends" ON bloodwork_trends;
DROP POLICY IF EXISTS "Users can insert their own bloodwork trends" ON bloodwork_trends;
DROP POLICY IF EXISTS "Users can update their own bloodwork trends" ON bloodwork_trends;
DROP POLICY IF EXISTS "Users can delete their own bloodwork trends" ON bloodwork_trends;

CREATE POLICY "Users can view their own bloodwork trends" ON bloodwork_trends
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own bloodwork trends" ON bloodwork_trends
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own bloodwork trends" ON bloodwork_trends
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own bloodwork trends" ON bloodwork_trends
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix stripe_customers policies
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data" ON stripe_customers
  FOR SELECT USING (user_id = (select auth.uid()) AND deleted_at IS NULL);

-- Fix stripe_subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data" ON stripe_subscriptions
  FOR SELECT USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Fix stripe_orders policies
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data" ON stripe_orders
  FOR SELECT USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Fix community_recipes policies
DROP POLICY IF EXISTS "Users can create their own recipes" ON community_recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON community_recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON community_recipes;
DROP POLICY IF EXISTS "Users can view public recipes" ON community_recipes;

CREATE POLICY "Users can create their own recipes" ON community_recipes
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own recipes" ON community_recipes
  FOR DELETE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own recipes" ON community_recipes
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view public recipes" ON community_recipes
  FOR SELECT USING (is_public = true OR user_id = (select auth.uid()));

-- Fix recipe_likes policies
DROP POLICY IF EXISTS "Users can remove their own likes" ON recipe_likes;
DROP POLICY IF EXISTS "Users can view likes on public recipes" ON recipe_likes;

CREATE POLICY "Users can remove their own likes" ON recipe_likes
  FOR DELETE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can view likes on public recipes" ON recipe_likes
  FOR SELECT USING (
    recipe_id IN (
      SELECT id FROM community_recipes 
      WHERE is_public = true OR user_id = (select auth.uid())
    )
  );

-- Fix recipe_comments policies
DROP POLICY IF EXISTS "Users can comment on public recipes" ON recipe_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON recipe_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON recipe_comments;
DROP POLICY IF EXISTS "Users can view comments on public recipes" ON recipe_comments;

CREATE POLICY "Users can comment on public recipes" ON recipe_comments
  FOR INSERT WITH CHECK (
    recipe_id IN (
      SELECT id FROM community_recipes 
      WHERE is_public = true
    ) AND user_id = (select auth.uid())
  );

CREATE POLICY "Users can delete their own comments" ON recipe_comments
  FOR DELETE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own comments" ON recipe_comments
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view comments on public recipes" ON recipe_comments
  FOR SELECT USING (
    recipe_id IN (
      SELECT id FROM community_recipes 
      WHERE is_public = true OR user_id = (select auth.uid())
    )
  );

-- Fix user_follows policies
DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;

CREATE POLICY "Users can follow others" ON user_follows
  FOR INSERT WITH CHECK (follower_id = (select auth.uid()));

CREATE POLICY "Users can unfollow" ON user_follows
  FOR DELETE USING (follower_id = (select auth.uid()));

-- Fix recipe_collections policies
DROP POLICY IF EXISTS "Users can create their own collections" ON recipe_collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON recipe_collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON recipe_collections;
DROP POLICY IF EXISTS "Users can view public collections" ON recipe_collections;

CREATE POLICY "Users can create their own collections" ON recipe_collections
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own collections" ON recipe_collections
  FOR DELETE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own collections" ON recipe_collections
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view public collections" ON recipe_collections
  FOR SELECT USING (is_public = true OR user_id = (select auth.uid()));

-- Fix collection_recipes policies
DROP POLICY IF EXISTS "Users can add recipes to their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Users can remove recipes from their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Users can view recipes in public collections" ON collection_recipes;

CREATE POLICY "Users can add recipes to their collections" ON collection_recipes
  FOR INSERT WITH CHECK (
    collection_id IN (
      SELECT id FROM recipe_collections
      WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can remove recipes from their collections" ON collection_recipes
  FOR DELETE USING (
    collection_id IN (
      SELECT id FROM recipe_collections
      WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can view recipes in public collections" ON collection_recipes
  FOR SELECT USING (
    collection_id IN (
      SELECT id FROM recipe_collections
      WHERE is_public = true OR user_id = (select auth.uid())
    )
  );

-- Fix grocery_lists policies
DROP POLICY IF EXISTS "Users can create their own grocery lists" ON grocery_lists;
DROP POLICY IF EXISTS "Users can delete their own grocery lists" ON grocery_lists;
DROP POLICY IF EXISTS "Users can update their own grocery lists" ON grocery_lists;
DROP POLICY IF EXISTS "Users can view their own grocery lists" ON grocery_lists;

CREATE POLICY "Users can create their own grocery lists" ON grocery_lists
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own grocery lists" ON grocery_lists
  FOR DELETE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own grocery lists" ON grocery_lists
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view their own grocery lists" ON grocery_lists
  FOR SELECT USING (user_id = (select auth.uid()) OR is_public = true);

-- Fix grocery_list_items policies
DROP POLICY IF EXISTS "Users can add items to their grocery lists" ON grocery_list_items;
DROP POLICY IF EXISTS "Users can delete items from their grocery lists" ON grocery_list_items;
DROP POLICY IF EXISTS "Users can update items in their grocery lists" ON grocery_list_items;
DROP POLICY IF EXISTS "Users can view items in their grocery lists" ON grocery_list_items;

CREATE POLICY "Users can add items to their grocery lists" ON grocery_list_items
  FOR INSERT WITH CHECK (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete items from their grocery lists" ON grocery_list_items
  FOR DELETE USING (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update items in their grocery lists" ON grocery_list_items
  FOR UPDATE USING (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can view items in their grocery lists" ON grocery_list_items
  FOR SELECT USING (
    list_id IN (
      SELECT id FROM grocery_lists
      WHERE user_id = (select auth.uid()) OR is_public = true
    )
  );

-- Fix activity_logs policies
DROP POLICY IF EXISTS "Users can view their own activity" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert their own activity" ON activity_logs;
DROP POLICY IF EXISTS "Users can update their own activity" ON activity_logs;
DROP POLICY IF EXISTS "Users can delete their own activity" ON activity_logs;

CREATE POLICY "Users can view their own activity" ON activity_logs
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own activity" ON activity_logs
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own activity" ON activity_logs
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own activity" ON activity_logs
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix diet_spending policies
DROP POLICY IF EXISTS "Users can view their own diet spending" ON diet_spending;
DROP POLICY IF EXISTS "Users can insert their own diet spending" ON diet_spending;
DROP POLICY IF EXISTS "Users can update their own diet spending" ON diet_spending;
DROP POLICY IF EXISTS "Users can delete their own diet spending" ON diet_spending;

CREATE POLICY "Users can view their own diet spending" ON diet_spending
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own diet spending" ON diet_spending
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own diet spending" ON diet_spending
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own diet spending" ON diet_spending
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix nutrition_logs policies
DROP POLICY IF EXISTS "Users can view their own nutrition" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can insert their own nutrition" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can update their own nutrition" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can delete their own nutrition" ON nutrition_logs;

CREATE POLICY "Users can view their own nutrition" ON nutrition_logs
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own nutrition" ON nutrition_logs
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own nutrition" ON nutrition_logs
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own nutrition" ON nutrition_logs
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix food_logs policies
DROP POLICY IF EXISTS "Users can view their own food logs" ON food_logs;
DROP POLICY IF EXISTS "Users can insert their own food logs" ON food_logs;
DROP POLICY IF EXISTS "Users can update their own food logs" ON food_logs;
DROP POLICY IF EXISTS "Users can delete their own food logs" ON food_logs;

CREATE POLICY "Users can view their own food logs" ON food_logs
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own food logs" ON food_logs
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own food logs" ON food_logs
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own food logs" ON food_logs
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix substance_logs policies
DROP POLICY IF EXISTS "Users can view their own substance logs" ON substance_logs;
DROP POLICY IF EXISTS "Users can insert their own substance logs" ON substance_logs;
DROP POLICY IF EXISTS "Users can update their own substance logs" ON substance_logs;
DROP POLICY IF EXISTS "Users can delete their own substance logs" ON substance_logs;

CREATE POLICY "Users can view their own substance logs" ON substance_logs
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own substance logs" ON substance_logs
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own substance logs" ON substance_logs
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own substance logs" ON substance_logs
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix meal_tracking policies
DROP POLICY IF EXISTS "Users can view their own meal tracking" ON meal_tracking;
DROP POLICY IF EXISTS "Users can insert their own meal tracking" ON meal_tracking;
DROP POLICY IF EXISTS "Users can update their own meal tracking" ON meal_tracking;
DROP POLICY IF EXISTS "Users can delete their own meal tracking" ON meal_tracking;

CREATE POLICY "Users can view their own meal tracking" ON meal_tracking
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own meal tracking" ON meal_tracking
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own meal tracking" ON meal_tracking
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own meal tracking" ON meal_tracking
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix diary_logs policies
DROP POLICY IF EXISTS "Users can view their own diary logs" ON diary_logs;
DROP POLICY IF EXISTS "Users can insert their own diary logs" ON diary_logs;
DROP POLICY IF EXISTS "Users can update their own diary logs" ON diary_logs;
DROP POLICY IF EXISTS "Users can delete their own diary logs" ON diary_logs;

CREATE POLICY "Users can view their own diary logs" ON diary_logs
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own diary logs" ON diary_logs
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own diary logs" ON diary_logs
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own diary logs" ON diary_logs
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix reminders policies
DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;

CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own reminders" ON reminders
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own reminders" ON reminders
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own reminders" ON reminders
  FOR DELETE USING (user_id = (select auth.uid()));

-- Add comment to track this migration
COMMENT ON SCHEMA public IS 'Fixed RLS performance issues by replacing auth.uid() with (select auth.uid()) in all policies';
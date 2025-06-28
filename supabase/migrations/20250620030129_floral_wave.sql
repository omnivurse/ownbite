-- Add missing foreign key indexes to improve database performance

-- Add index for collection_recipes.recipe_id
CREATE INDEX IF NOT EXISTS collection_recipes_recipe_id_idx ON collection_recipes(recipe_id);

-- Add index for community_recipes.remix_of
CREATE INDEX IF NOT EXISTS community_recipes_remix_of_idx ON community_recipes(remix_of);

-- Add index for meal_tracking.meal_plan_id
CREATE INDEX IF NOT EXISTS meal_tracking_meal_plan_id_idx ON meal_tracking(meal_plan_id);

-- Add index for recipe_comments.user_id
CREATE INDEX IF NOT EXISTS recipe_comments_user_id_idx ON recipe_comments(user_id);

-- Add index for user_nutrient_status.bloodwork_id
CREATE INDEX IF NOT EXISTS user_nutrient_status_bloodwork_id_idx ON user_nutrient_status(bloodwork_id);

-- Add comment to track this migration
COMMENT ON SCHEMA public IS 'Added missing foreign key indexes to improve query performance';
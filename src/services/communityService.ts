import { supabase } from '../lib/supabase';

export interface CommunityRecipe {
  id: string;
  user_id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  image_url: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  is_public: boolean;
  remix_of?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  user_full_name?: string;
  user_avatar_url?: string;
  is_liked?: boolean;
}

export interface RecipeComment {
  id: string;
  user_id: string;
  recipe_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_full_name?: string;
  user_avatar_url?: string;
}

export interface RecipeCollection {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  recipe_count?: number;
}

export interface GroceryList {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface GroceryItem {
  id: string;
  list_id: string;
  name: string;
  quantity: string;
  category: string;
  is_checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  avatar_url: string;
  recipe_count: number;
  follower_count: number;
  following_count: number;
  is_following?: boolean;
}

export const communityService = {
  /**
   * Get social feed (recipes from followed users)
   */
  async getSocialFeed(limit = 20, offset = 0): Promise<CommunityRecipe[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_social_feed', {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching social feed:', error);
      throw error;
    }
  },

  /**
   * Get discover feed (trending and popular recipes)
   */
  async getDiscoverFeed(limit = 20, offset = 0): Promise<CommunityRecipe[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_discover_feed', {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching discover feed:', error);
      throw error;
    }
  },

  /**
   * Get recipe details
   */
  async getRecipe(recipeId: string): Promise<CommunityRecipe> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get recipe details
      const { data: recipe, error } = await supabase
        .from('community_recipes')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('id', recipeId)
        .single();

      if (error) throw error;
      if (!recipe) throw new Error('Recipe not found');

      // Check if user has liked the recipe
      const { data: like } = await supabase
        .from('recipe_likes')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .maybeSingle();

      return {
        ...recipe,
        user_full_name: recipe.profiles?.full_name,
        user_avatar_url: recipe.profiles?.avatar_url,
        is_liked: !!like
      };
    } catch (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }
  },

  /**
   * Create a new recipe
   */
  async createRecipe(recipe: Omit<CommunityRecipe, 'id' | 'user_id' | 'like_count' | 'comment_count' | 'created_at' | 'updated_at'>): Promise<CommunityRecipe> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('community_recipes')
        .insert({
          ...recipe,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  /**
   * Update a recipe
   */
  async updateRecipe(recipeId: string, updates: Partial<CommunityRecipe>): Promise<CommunityRecipe> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Remove fields that shouldn't be updated directly
      const { id, user_id, like_count, comment_count, created_at, updated_at, ...validUpdates } = updates as any;

      const { data, error } = await supabase
        .from('community_recipes')
        .update({
          ...validUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipeId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  /**
   * Delete a recipe
   */
  async deleteRecipe(recipeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('community_recipes')
        .delete()
        .eq('id', recipeId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },

  /**
   * Like a recipe
   */
  async likeRecipe(recipeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('recipe_likes')
        .insert({
          user_id: user.id,
          recipe_id: recipeId
        });

      if (error && error.code !== '23505') throw error; // Ignore unique violation
    } catch (error) {
      console.error('Error liking recipe:', error);
      throw error;
    }
  },

  /**
   * Unlike a recipe
   */
  async unlikeRecipe(recipeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('recipe_likes')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking recipe:', error);
      throw error;
    }
  },

  /**
   * Get comments for a recipe
   */
  async getRecipeComments(recipeId: string): Promise<RecipeComment[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(comment => ({
        ...comment,
        user_full_name: comment.profiles?.full_name,
        user_avatar_url: comment.profiles?.avatar_url
      }));
    } catch (error) {
      console.error('Error fetching recipe comments:', error);
      throw error;
    }
  },

  /**
   * Add a comment to a recipe
   */
  async addComment(recipeId: string, content: string): Promise<RecipeComment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recipe_comments')
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('recipe_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  /**
   * Get user's recipes
   */
  async getUserRecipes(userId: string, limit = 20, offset = 0): Promise<CommunityRecipe[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('community_recipes')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      throw error;
    }
  },

  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (user.id === userId) throw new Error('Cannot follow yourself');

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error && error.code !== '23505') throw error; // Ignore unique violation
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  /**
   * Get user profile with social stats
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Get recipe count
      const { count: recipeCount, error: recipeError } = await supabase
        .from('community_recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (recipeError) throw recipeError;

      // Get follower count
      const { count: followerCount, error: followerError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (followerError) throw followerError;

      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followingError) throw followingError;

      // Check if current user is following this user
      const { data: isFollowing, error: followingCheckError } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (followingCheckError) throw followingCheckError;

      return {
        user_id: userId,
        full_name: profile?.full_name || 'Unknown User',
        avatar_url: profile?.avatar_url || '',
        recipe_count: recipeCount || 0,
        follower_count: followerCount || 0,
        following_count: followingCount || 0,
        is_following: !!isFollowing
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Get user's collections
   */
  async getUserCollections(limit = 20, offset = 0): Promise<RecipeCollection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recipe_collections')
        .select(`
          *,
          recipe_count:collection_recipes(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      return (data || []).map(collection => ({
        ...collection,
        recipe_count: collection.recipe_count?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error fetching user collections:', error);
      throw error;
    }
  },

  /**
   * Create a collection
   */
  async createCollection(name: string, description?: string, isPublic = true): Promise<RecipeCollection> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recipe_collections')
        .insert({
          user_id: user.id,
          name,
          description,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  },

  /**
   * Add recipe to collection
   */
  async addRecipeToCollection(collectionId: string, recipeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify collection belongs to user
      const { data: collection, error: collectionError } = await supabase
        .from('recipe_collections')
        .select('id')
        .eq('id', collectionId)
        .eq('user_id', user.id)
        .single();

      if (collectionError) throw collectionError;
      if (!collection) throw new Error('Collection not found or access denied');

      const { error } = await supabase
        .from('collection_recipes')
        .insert({
          collection_id: collectionId,
          recipe_id: recipeId
        });

      if (error && error.code !== '23505') throw error; // Ignore unique violation
    } catch (error) {
      console.error('Error adding recipe to collection:', error);
      throw error;
    }
  },

  /**
   * Remove recipe from collection
   */
  async removeRecipeFromCollection(collectionId: string, recipeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('collection_recipes')
        .delete()
        .eq('collection_id', collectionId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing recipe from collection:', error);
      throw error;
    }
  },

  /**
   * Get user's grocery lists
   */
  async getGroceryLists(): Promise<GroceryList[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('grocery_lists')
        .select(`
          *,
          item_count:grocery_list_items(count)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(list => ({
        ...list,
        item_count: list.item_count?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error fetching grocery lists:', error);
      throw error;
    }
  },

  /**
   * Create a grocery list
   */
  async createGroceryList(name: string, isPublic = false): Promise<GroceryList> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('grocery_lists')
        .insert({
          user_id: user.id,
          name,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating grocery list:', error);
      throw error;
    }
  },

  /**
   * Get grocery list items
   */
  async getGroceryListItems(listId: string): Promise<GroceryItem[]> {
    try {
      const { data, error } = await supabase
        .from('grocery_list_items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching grocery list items:', error);
      throw error;
    }
  },

  /**
   * Add item to grocery list
   */
  async addGroceryItem(listId: string, item: Omit<GroceryItem, 'id' | 'list_id' | 'created_at' | 'updated_at'>): Promise<GroceryItem> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('grocery_list_items')
        .insert({
          list_id: listId,
          ...item
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding grocery item:', error);
      throw error;
    }
  },

  /**
   * Update grocery item
   */
  async updateGroceryItem(itemId: string, updates: Partial<GroceryItem>): Promise<GroceryItem> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('grocery_list_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating grocery item:', error);
      throw error;
    }
  },

  /**
   * Delete grocery item
   */
  async deleteGroceryItem(itemId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('grocery_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grocery item:', error);
      throw error;
    }
  },

  /**
   * Create a grocery list from recipe ingredients
   */
  async createGroceryListFromRecipe(recipeId: string, listName?: string): Promise<GroceryList> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get recipe details
      const { data: recipe, error: recipeError } = await supabase
        .from('community_recipes')
        .select('title, ingredients')
        .eq('id', recipeId)
        .single();

      if (recipeError) throw recipeError;
      if (!recipe) throw new Error('Recipe not found');

      // Create grocery list
      const name = listName || `${recipe.title} Ingredients`;
      const { data: list, error: listError } = await supabase
        .from('grocery_lists')
        .insert({
          user_id: user.id,
          name,
          is_public: false
        })
        .select()
        .single();

      if (listError) throw listError;

      // Add ingredients as items
      const items = recipe.ingredients.map((ingredient: string) => ({
        list_id: list.id,
        name: ingredient,
        quantity: '',
        category: 'From Recipe',
        is_checked: false
      }));

      const { error: itemsError } = await supabase
        .from('grocery_list_items')
        .insert(items);

      if (itemsError) throw itemsError;

      return list;
    } catch (error) {
      console.error('Error creating grocery list from recipe:', error);
      throw error;
    }
  },

  /**
   * Remix a recipe (create a copy with attribution)
   */
  async remixRecipe(recipeId: string, changes: Partial<CommunityRecipe>): Promise<CommunityRecipe> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get original recipe
      const { data: originalRecipe, error: recipeError } = await supabase
        .from('community_recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (recipeError) throw recipeError;
      if (!originalRecipe) throw new Error('Recipe not found');

      // Create new recipe as a remix
      const { data: newRecipe, error: createError } = await supabase
        .from('community_recipes')
        .insert({
          user_id: user.id,
          title: changes.title || `${originalRecipe.title} (Remix)`,
          description: changes.description || originalRecipe.description,
          ingredients: changes.ingredients || originalRecipe.ingredients,
          instructions: changes.instructions || originalRecipe.instructions,
          tags: changes.tags || originalRecipe.tags,
          image_url: changes.image_url || originalRecipe.image_url,
          nutrition: changes.nutrition || originalRecipe.nutrition,
          is_public: changes.is_public !== undefined ? changes.is_public : true,
          remix_of: recipeId
        })
        .select()
        .single();

      if (createError) throw createError;
      return newRecipe;
    } catch (error) {
      console.error('Error remixing recipe:', error);
      throw error;
    }
  }
};
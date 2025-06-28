import { Recipe } from '../lib/supabase';

const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  summary: string;
  instructions: string;
  extendedIngredients: Array<{
    original: string;
    amount: number;
    unit: string;
    name: string;
  }>;
  cuisines: string[];
  diets: string[];
  readyInMinutes: number;
  servings: number;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  limit?: number;
  offset?: number;
}

export const recipeService = {
  /**
   * Search recipes using Spoonacular API
   */
  async searchRecipes({
    query = '',
    cuisine,
    diet,
    limit = 20,
    offset = 0
  }: RecipeSearchParams) {
    if (!SPOONACULAR_API_KEY) {
      throw new Error('Spoonacular API key is not configured. Please check your environment variables.');
    }

    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      number: limit.toString(),
      offset: offset.toString(),
      addRecipeInformation: 'true',
      addRecipeNutrition: 'true',
      instructionsRequired: 'true',
      fillIngredients: 'true'
    });

    if (query) params.append('query', query);
    if (cuisine) params.append('cuisine', cuisine);
    if (diet) params.append('diet', diet);

    try {
      const response = await fetch(`${SPOONACULAR_BASE_URL}/complexSearch?${params}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spoonacular API Error:', errorText);
        throw new Error('Failed to fetch recipes. Please try again later.');
      }

      const data = await response.json();
      return data.results.map(this.transformSpoonacularRecipe);
    } catch (error) {
      console.error('Recipe search error:', error);
      throw new Error('Failed to fetch recipes. Please check your connection and try again.');
    }
  },

  /**
   * Get recipe details by ID
   */
  async getRecipeById(id: string) {
    if (!SPOONACULAR_API_KEY) {
      throw new Error('Spoonacular API key is not configured. Please check your environment variables.');
    }

    try {
      const response = await fetch(
        `${SPOONACULAR_BASE_URL}/${id}/information?apiKey=${SPOONACULAR_API_KEY}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spoonacular API Error:', errorText);
        throw new Error('Failed to fetch recipe details. Please try again later.');
      }

      const recipe: SpoonacularRecipe = await response.json();
      return this.transformSpoonacularRecipe(recipe);
    } catch (error) {
      console.error('Recipe details error:', error);
      throw new Error('Failed to fetch recipe details. Please check your connection and try again.');
    }
  },

  /**
   * Get soup recipes
   */
  async getSoupRecipes(limit = 10) {
    return this.searchRecipes({
      query: 'soup',
      limit
    });
  },

  /**
   * Transform Spoonacular recipe to our format
   */
  transformSpoonacularRecipe(recipe: SpoonacularRecipe): Recipe {
    const calories = recipe.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0;
    const protein = recipe.nutrition?.nutrients.find(n => n.name === 'Protein')?.amount || 0;
    const carbs = recipe.nutrition?.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0;
    const fat = recipe.nutrition?.nutrients.find(n => n.name === 'Fat')?.amount || 0;

    return {
      id: recipe.id.toString(),
      title: recipe.title,
      description: recipe.summary.replace(/<[^>]+>/g, ''),
      instructions: recipe.instructions,
      ingredients: recipe.extendedIngredients.map(i => i.original),
      image_url: recipe.image,
      cuisine_type: recipe.cuisines[0] || 'Other',
      diet_type: recipe.diets,
      prep_time: Math.floor(recipe.readyInMinutes / 2),
      cook_time: Math.ceil(recipe.readyInMinutes / 2),
      servings: recipe.servings,
      calories_per_serving: Math.round(calories / recipe.servings),
      nutrition: {
        calories,
        protein,
        carbs,
        fat
      },
      created_at: new Date().toISOString()
    };
  }
};
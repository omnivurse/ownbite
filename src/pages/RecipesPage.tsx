import React, { useState, useEffect } from 'react';
import { Search, Filter, ChefHat, Clock, Users, X } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { recipeService } from '../services/recipeService';

interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string;
  ingredients: string[];
  image_url: string;
  cuisine_type: string;
  diet_type: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  calories_per_serving: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Diet types for filtering
const DIET_TYPES = [
  'All',
  'Vegetarian',
  'Vegan',
  'Gluten Free',
  'Ketogenic',
  'Paleo'
];

// Cuisine types for filtering
const CUISINE_TYPES = [
  'All',
  'Mediterranean',
  'Thai',
  'Italian',
  'Mexican',
  'Indian',
  'Chinese',
  'American'
];

const RecipesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [soupRecipes, setSoupRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    loadRecipes();
  }, [searchQuery, selectedDiet, selectedCuisine]);

  useEffect(() => {
    loadSoupRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const fetchedRecipes = await recipeService.searchRecipes({
        query: searchQuery,
        diet: selectedDiet !== 'All' ? selectedDiet : undefined,
        cuisine: selectedCuisine !== 'All' ? selectedCuisine : undefined
      });
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSoupRecipes = async () => {
    try {
      const soups = await recipeService.getSoupRecipes(3);
      setSoupRecipes(soups);
    } catch (error) {
      console.error('Error loading soup recipes:', error);
    }
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const handleRecipeClick = async (recipe: Recipe) => {
    try {
      const fullRecipe = await recipeService.getRecipeById(recipe.id);
      setSelectedRecipe(fullRecipe);
    } catch (error) {
      console.error('Error loading recipe details:', error);
    }
  };

  return (
    <PageContainer title="Recipe Explorer">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search for recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          {/* Filter button */}
          <div>
            <Button 
              variant="outline" 
              leftIcon={<Filter className="h-5 w-5" />}
              onClick={toggleFilters}
            >
              Filters
            </Button>
          </div>
          
          {/* Generate Recipe button */}
          <div>
            <Button 
              variant="primary"
              leftIcon={<ChefHat className="h-5 w-5" />}
            >
              Generate Recipe
            </Button>
          </div>
        </div>
        
        {/* Filters section */}
        {filtersOpen && (
          <div className="mt-4 p-4 bg-neutral-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Diet Type</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DIET_TYPES.map(diet => (
                    <button
                      key={diet}
                      onClick={() => setSelectedDiet(diet)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedDiet === diet
                          ? 'bg-primary-100 text-primary-800 border border-primary-300'
                          : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700">Cuisine</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CUISINE_TYPES.map(cuisine => (
                    <button
                      key={cuisine}
                      onClick={() => setSelectedCuisine(cuisine)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCuisine === cuisine
                          ? 'bg-secondary-100 text-secondary-800 border border-secondary-300'
                          : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Featured Category */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">Global Soups</h2>
          <button 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            onClick={() => setSearchQuery('soup')}
          >
            View All Soups
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {soupRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.id}
              recipe={recipe}
              featured
              onClick={() => handleRecipeClick(recipe)}
            />
          ))}
        </div>
      </div>
      
      {/* Recipe Grid */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">
          {isLoading ? (
            'Loading recipes...'
          ) : recipes.length === 0 ? (
            'No recipes found'
          ) : (
            `${recipes.length} Recipe${recipes.length !== 1 ? 's' : ''} Found`
          )}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <RecipeCard 
              key={recipe.id}
              recipe={recipe}
              onClick={() => handleRecipeClick(recipe)}
            />
          ))}
        </div>
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedRecipe.image_url} 
                alt={selectedRecipe.title}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">{selectedRecipe.title}</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedRecipe.diet_type.map((diet, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  >
                    {diet}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-neutral-600" />
                  <div className="text-sm text-neutral-600">Prep Time</div>
                  <div className="font-semibold">{selectedRecipe.prep_time} min</div>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-neutral-600" />
                  <div className="text-sm text-neutral-600">Cook Time</div>
                  <div className="font-semibold">{selectedRecipe.cook_time} min</div>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-neutral-600" />
                  <div className="text-sm text-neutral-600">Servings</div>
                  <div className="font-semibold">{selectedRecipe.servings}</div>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-sm text-neutral-600">Calories</div>
                  <div className="font-semibold">{selectedRecipe.calories_per_serving}/serving</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Nutrition Facts</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-sm text-neutral-600">Calories</div>
                    <div className="font-semibold">{selectedRecipe.nutrition.calories}</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-sm text-neutral-600">Protein</div>
                    <div className="font-semibold">{selectedRecipe.nutrition.protein}g</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-sm text-neutral-600">Carbs</div>
                    <div className="font-semibold">{selectedRecipe.nutrition.carbs}g</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-sm text-neutral-600">Fat</div>
                    <div className="font-semibold">{selectedRecipe.nutrition.fat}g</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc list-inside space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-neutral-700">{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <div 
                  className="prose prose-neutral max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

interface RecipeCardProps {
  recipe: Recipe;
  featured?: boolean;
  onClick?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  featured = false,
  onClick 
}) => {
  return (
    <Card hoverable className="h-full overflow-hidden">
      <div className="relative">
        <img 
          src={recipe.image_url} 
          alt={recipe.title} 
          className="w-full h-48 object-cover cursor-pointer"
          onClick={onClick}
        />
        {featured && (
          <div className="absolute top-2 right-2 bg-secondary-500 text-white px-2 py-1 text-xs font-bold rounded">
            Featured
          </div>
        )}
      </div>
      <CardBody>
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="text-lg font-medium text-neutral-900 line-clamp-1 cursor-pointer hover:text-primary-600"
            onClick={onClick}
          >
            {recipe.title}
          </h3>
          <span className="text-sm font-medium text-secondary-700">{recipe.calories_per_serving} cal</span>
        </div>
        
        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {recipe.cuisine_type}
          </span>
          {recipe.diet_type.map((diet, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {diet}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{recipe.prep_time + recipe.cook_time} min</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={onClick}
        >
          View Recipe
        </Button>
      </CardBody>
    </Card>
  );
};

export default RecipesPage;
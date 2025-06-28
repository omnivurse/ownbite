import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Upload, 
  Save,
  X,
  Info
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { communityService, CommunityRecipe } from '../services/communityService';

const CreateRecipePage: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const isEditing = !!recipeId;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(isEditing);

  useEffect(() => {
    if (isEditing && recipeId) {
      loadRecipe();
    }
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      setLoadingRecipe(true);
      setError(null);
      
      const recipe = await communityService.getRecipe(recipeId!);
      
      setTitle(recipe.title);
      setDescription(recipe.description || '');
      setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : ['']);
      setInstructions(recipe.instructions.length > 0 ? recipe.instructions : ['']);
      setTags(recipe.tags || []);
      setImageUrl(recipe.image_url || '');
      setIsPublic(recipe.is_public);
      setNutrition(recipe.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    } catch (err: any) {
      console.error('Error loading recipe:', err);
      setError(err.message || 'Failed to load recipe');
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients.length > 0 ? newIngredients : ['']);
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions.length > 0 ? newInstructions : ['']);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError('Recipe title is required');
      return;
    }
    
    if (ingredients.filter(i => i.trim()).length === 0) {
      setError('At least one ingredient is required');
      return;
    }
    
    if (instructions.filter(i => i.trim()).length === 0) {
      setError('At least one instruction is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const recipeData: Partial<CommunityRecipe> = {
        title,
        description,
        ingredients: ingredients.filter(i => i.trim()),
        instructions: instructions.filter(i => i.trim()),
        tags,
        image_url: imageUrl,
        is_public: isPublic,
        nutrition
      };
      
      if (isEditing && recipeId) {
        await communityService.updateRecipe(recipeId, recipeData);
        navigate(`/community/recipe/${recipeId}`);
      } else {
        const newRecipe = await communityService.createRecipe(recipeData as any);
        navigate(`/community/recipe/${newRecipe.id}`);
      }
    } catch (err: any) {
      console.error('Error saving recipe:', err);
      setError(err.message || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecipe) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-64 bg-neutral-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
              <div className="h-4 bg-neutral-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => navigate('/community')}
          >
            Back to Community
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 mb-6">
          {isEditing ? 'Edit Recipe' : 'Create Recipe'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                    Recipe Title*
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter recipe title"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                    placeholder="Describe your recipe"
                  />
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-1">
                    Image URL
                  </label>
                  <input
                    id="imageUrl"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter image URL"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Paste a URL to an image of your recipe
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <div 
                        key={tag} 
                        className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm flex items-center"
                      >
                        {tag}
                        <button 
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-primary-600 hover:text-primary-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-primary-500 text-white rounded-r-md hover:bg-primary-600"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Add tags like "vegan", "low-carb", "quick", etc.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <input
                      id="isPublic"
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-neutral-700">
                      Make this recipe public
                    </label>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 ml-6">
                    Public recipes will be visible to all users in the community
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Ingredients */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Ingredients*</h2>
                
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={`Ingredient ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="ml-2 p-2 text-neutral-500 hover:text-red-500"
                        disabled={ingredients.length === 1}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="mt-4 flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Ingredient
                </button>
              </CardBody>
            </Card>
            
            {/* Instructions */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Instructions*</h2>
                
                <div className="space-y-3">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-2 mt-2">
                        {index + 1}
                      </div>
                      <textarea
                        value={instruction}
                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                        placeholder={`Step ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveInstruction(index)}
                        className="ml-2 p-2 text-neutral-500 hover:text-red-500"
                        disabled={instructions.length === 1}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="mt-4 flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </button>
              </CardBody>
            </Card>
          </div>

          {/* Nutrition Information */}
          <Card className="mb-6">
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Nutrition Information</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="calories" className="block text-sm font-medium text-neutral-700 mb-1">
                    Calories
                  </label>
                  <input
                    id="calories"
                    type="number"
                    min="0"
                    value={nutrition.calories}
                    onChange={(e) => setNutrition({...nutrition, calories: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="protein" className="block text-sm font-medium text-neutral-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    id="protein"
                    type="number"
                    min="0"
                    value={nutrition.protein}
                    onChange={(e) => setNutrition({...nutrition, protein: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="carbs" className="block text-sm font-medium text-neutral-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    id="carbs"
                    type="number"
                    min="0"
                    value={nutrition.carbs}
                    onChange={(e) => setNutrition({...nutrition, carbs: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="fat" className="block text-sm font-medium text-neutral-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    id="fat"
                    type="number"
                    min="0"
                    value={nutrition.fat}
                    onChange={(e) => setNutrition({...nutrition, fat: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="mt-3 flex items-start text-xs text-neutral-500">
                <Info className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                <span>
                  Providing accurate nutrition information helps users with specific dietary needs.
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/community')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isEditing ? 'Update Recipe' : 'Publish Recipe'}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default CreateRecipePage;
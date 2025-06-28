import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  User, 
  ChevronLeft,
  Edit,
  Trash2,
  Copy,
  ShoppingCart,
  Send
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { communityService, CommunityRecipe, RecipeComment } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import SocialShareButton from '../components/social/SocialShareButton';

const RecipeDetailPage: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState<CommunityRecipe | null>(null);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (recipeId) {
      loadRecipe();
      loadComments();
    }
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await communityService.getRecipe(recipeId!);
      setRecipe(data);
    } catch (err: any) {
      console.error('Error loading recipe:', err);
      setError(err.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      if (!recipeId) return;
      
      const data = await communityService.getRecipeComments(recipeId);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleLike = async () => {
    if (!recipe) return;
    
    try {
      if (recipe.is_liked) {
        await communityService.unlikeRecipe(recipe.id);
        setRecipe({
          ...recipe,
          is_liked: false,
          like_count: recipe.like_count - 1
        });
      } else {
        await communityService.likeRecipe(recipe.id);
        setRecipe({
          ...recipe,
          is_liked: true,
          like_count: recipe.like_count + 1
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !recipeId) return;
    
    try {
      setSubmittingComment(true);
      await communityService.addComment(recipeId, newComment);
      setNewComment('');
      await loadComments();
      
      // Update comment count in recipe
      if (recipe) {
        setRecipe({
          ...recipe,
          comment_count: recipe.comment_count + 1
        });
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await communityService.deleteComment(commentId);
      await loadComments();
      
      // Update comment count in recipe
      if (recipe) {
        setRecipe({
          ...recipe,
          comment_count: recipe.comment_count - 1
        });
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!recipe) return;
    
    try {
      await communityService.deleteRecipe(recipe.id);
      navigate('/community');
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  };

  const handleRemixRecipe = async () => {
    if (!recipe) return;
    
    try {
      const remixedRecipe = await communityService.remixRecipe(recipe.id, {
        title: `${recipe.title} (Remix)`
      });
      navigate(`/community/edit/${remixedRecipe.id}`);
    } catch (err) {
      console.error('Error remixing recipe:', err);
    }
  };

  const handleCreateGroceryList = async () => {
    if (!recipe) return;
    
    try {
      const list = await communityService.createGroceryListFromRecipe(recipe.id);
      navigate(`/grocery/list/${list.id}`);
    } catch (err) {
      console.error('Error creating grocery list:', err);
    }
  };

  if (loading) {
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

  if (error || !recipe) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            {error || 'Recipe not found'}
          </h2>
          <Button 
            variant="primary"
            onClick={() => navigate('/community')}
          >
            Back to Community
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isOwner = user?.id === recipe.user_id;

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

        {/* Recipe Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {recipe.title}
            </h1>
            
            {isOwner && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit className="h-4 w-4" />}
                  onClick={() => navigate(`/community/edit/${recipe.id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setShowConfirmDelete(true)}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center mb-4">
            <Link to={`/community/profile/${recipe.user_id}`} className="flex items-center">
              <div className="h-8 w-8 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden mr-2">
                {recipe.user_avatar_url ? (
                  <img 
                    src={recipe.user_avatar_url} 
                    alt={recipe.user_full_name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-neutral-500" />
                )}
              </div>
              <span className="text-sm font-medium text-neutral-700 mr-4">
                {recipe.user_full_name || 'User'}
              </span>
            </Link>
            <span className="text-xs text-neutral-500">
              {new Date(recipe.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <p className="text-neutral-600 mb-4">
            {recipe.description}
          </p>
          
          {/* Recipe Image */}
          {recipe.image_url && (
            <div className="mb-6">
              <img 
                src={recipe.image_url} 
                alt={recipe.title} 
                className="w-full h-auto max-h-96 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant={recipe.is_liked ? 'primary' : 'outline'}
              leftIcon={<Heart className={`h-4 w-4 ${recipe.is_liked ? 'fill-white' : ''}`} />}
              onClick={handleLike}
            >
              {recipe.is_liked ? 'Liked' : 'Like'} ({recipe.like_count})
            </Button>
            
            <Button
              variant="outline"
              leftIcon={<Copy className="h-4 w-4" />}
              onClick={handleRemixRecipe}
            >
              Remix Recipe
            </Button>
            
            <Button
              variant="outline"
              leftIcon={<ShoppingCart className="h-4 w-4" />}
              onClick={handleCreateGroceryList}
            >
              Add to Grocery List
            </Button>
            
            <SocialShareButton
              contentType="recipe"
              contentId={recipe.id}
              contentName={recipe.title}
              imageUrl={recipe.image_url}
              variant="outline"
            />
            
            <Button
              variant="outline"
              leftIcon={<Bookmark className="h-4 w-4" />}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mt-2 mr-2"></span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
          
          {/* Instructions */}
          <div className="md:col-span-2">
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Nutrition Information */}
        {recipe.nutrition && (
          <Card className="mb-8">
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Nutrition Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-primary-50 rounded-lg">
                  <div className="text-sm text-neutral-600 mb-1">Calories</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {recipe.nutrition.calories || 0}
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-neutral-600 mb-1">Protein</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {recipe.nutrition.protein || 0}g
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-neutral-600 mb-1">Carbs</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {recipe.nutrition.carbs || 0}g
                  </div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-neutral-600 mb-1">Fat</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {recipe.nutrition.fat || 0}g
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Comments Section */}
        <Card>
          <CardBody>
            <h2 className="text-xl font-semibold mb-4">
              Comments ({recipe.comment_count})
            </h2>
            
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex space-x-3">
                <div className="h-10 w-10 bg-neutral-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                    disabled={submittingComment}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="absolute bottom-2 right-2 p-2 text-primary-600 hover:text-primary-700 disabled:text-neutral-400"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>
            
            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-6 bg-neutral-50 rounded-lg">
                <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-600">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="h-10 w-10 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                      {comment.user_avatar_url ? (
                        <img 
                          src={comment.user_avatar_url} 
                          alt={comment.user_full_name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-neutral-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <Link 
                            to={`/community/profile/${comment.user_id}`}
                            className="font-medium text-neutral-900 hover:text-primary-600"
                          >
                            {comment.user_full_name || 'User'}
                          </Link>
                          <span className="text-xs text-neutral-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-neutral-700">{comment.content}</p>
                      </div>
                      
                      {user?.id === comment.user_id && (
                        <div className="mt-1 text-right">
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-neutral-500 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Delete Recipe
            </h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to delete this recipe? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteRecipe}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default RecipeDetailPage;
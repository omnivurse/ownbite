import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, User, ChefHat, Share2 } from 'lucide-react';
import { CommunityRecipe } from '../../services/communityService';
import SocialShareButton from '../social/SocialShareButton';

interface RecipeCardProps {
  recipe: CommunityRecipe;
  onLike?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onLike }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform transform hover:scale-[1.02] hover:shadow-lg group h-full flex flex-col">
      <Link to={`/community/recipe/${recipe.id}`} className="block">
        <div className="relative h-48 bg-neutral-100">
          {recipe.image_url ? (
            <img 
              src={recipe.image_url} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ChefHat className="h-12 w-12 text-neutral-300" />
            </div>
          )}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="absolute top-2 left-2">
              <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                {recipe.tags[0]}
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/community/recipe/${recipe.id}`} className="block flex-1">
          <h3 className="font-semibold text-lg mb-1 hover:text-primary-600 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
            {recipe.description || 'No description provided'}
          </p>
        </Link>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
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
              <span className="text-sm font-medium text-neutral-700">
                {recipe.user_full_name || 'User'}
              </span>
            </Link>
            <span className="text-xs text-neutral-500">
              {new Date(recipe.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (onLike) onLike();
                }}
                className="flex items-center text-neutral-500 hover:text-red-500"
              >
                <Heart 
                  className={`h-4 w-4 mr-1 ${recipe.is_liked ? 'fill-red-500 text-red-500' : ''}`} 
                />
                <span className="text-xs">{recipe.like_count}</span>
              </button>
              <Link 
                to={`/community/recipe/${recipe.id}`}
                className="flex items-center text-neutral-500 hover:text-primary-500"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="text-xs">{recipe.comment_count}</span>
              </Link>
              <SocialShareButton
                contentType="recipe"
                contentId={recipe.id}
                contentName={recipe.title}
                imageUrl={recipe.image_url}
                variant="ghost"
                size="sm"
                className="text-neutral-500 hover:text-primary-500 p-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
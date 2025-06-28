import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Plus,
  User,
  ChefHat
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { communityService, CommunityRecipe } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/community/RecipeCard';

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('discover');
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, [activeTab]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (activeTab === 'feed') {
        data = await communityService.getSocialFeed();
      } else {
        data = await communityService.getDiscoverFeed();
      }
      
      setRecipes(data);
    } catch (err: any) {
      console.error('Error loading recipes:', err);
      setError(err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (recipeId: string) => {
    try {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      
      if (recipe.is_liked) {
        await communityService.unlikeRecipe(recipeId);
        setRecipes(recipes.map(r => 
          r.id === recipeId 
            ? { ...r, is_liked: false, like_count: r.like_count - 1 } 
            : r
        ));
      } else {
        await communityService.likeRecipe(recipeId);
        setRecipes(recipes.map(r => 
          r.id === recipeId 
            ? { ...r, is_liked: true, like_count: r.like_count + 1 } 
            : r
        ));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchQuery 
      ? recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesTag = selectedTag
      ? recipe.tags?.includes(selectedTag)
      : true;
      
    return matchesSearch && matchesTag;
  });

  // Extract all unique tags from recipes
  const allTags = Array.from(
    new Set(
      recipes.flatMap(recipe => recipe.tags || [])
    )
  ).sort();

  return (
    <PageContainer title="Community">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">OwnBite Community</h1>
            <p className="text-neutral-600">
              Discover, share, and remix healthy recipes from the community
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/community/create">
              <Button 
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Share Recipe
              </Button>
            </Link>
            <Link to="/community/profile">
              <Button 
                variant="outline"
                leftIcon={<User className="h-4 w-4" />}
              >
                My Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'discover'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('discover')}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Discover
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'feed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('feed')}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Following
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex-shrink-0">
            <select
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 h-48 rounded-t-lg w-full"></div>
                <div className="border border-t-0 border-neutral-200 rounded-b-lg p-4">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-neutral-200 rounded-full w-8"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadRecipes}>Try Again</Button>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            {activeTab === 'feed' ? (
              <>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Your feed is empty</h3>
                <p className="text-neutral-600 mb-4">Follow other users to see their recipes here</p>
                <Button 
                  variant="primary"
                  onClick={() => setActiveTab('discover')}
                >
                  Discover Users to Follow
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No recipes found</h3>
                <p className="text-neutral-600 mb-4">Try adjusting your search or filters</p>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                  }}
                >
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onLike={() => handleLike(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default CommunityPage;
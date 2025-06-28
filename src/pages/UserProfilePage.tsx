import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Grid, 
  Users, 
  Heart, 
  BookOpen,
  Edit,
  Plus,
  ChefHat
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { communityService, UserProfile, CommunityRecipe } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<'recipes' | 'collections' | 'followers' | 'following'>('recipes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isOwnProfile = !userId || userId === user?.id;
  const profileId = userId || user?.id;

  useEffect(() => {
    if (profileId) {
      loadProfile();
      loadRecipes();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await communityService.getUserProfile(profileId!);
      setProfile(data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      const data = await communityService.getUserRecipes(profileId!);
      setRecipes(data);
    } catch (err) {
      console.error('Error loading recipes:', err);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      if (profile.is_following) {
        await communityService.unfollowUser(profile.user_id);
        setProfile({
          ...profile,
          is_following: false,
          follower_count: profile.follower_count - 1
        });
      } else {
        await communityService.followUser(profile.user_id);
        setProfile({
          ...profile,
          is_following: true,
          follower_count: profile.follower_count + 1
        });
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-neutral-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-neutral-200 rounded"></div>
              <div className="h-20 bg-neutral-200 rounded"></div>
              <div className="h-20 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            {error || 'User not found'}
          </h2>
          <Link to="/community">
            <Button variant="primary">
              Back to Community
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="h-24 w-24 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-neutral-500" />
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-neutral-900 mb-1">
                  {profile.full_name}
                </h1>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">{profile.recipe_count}</div>
                    <div className="text-sm text-neutral-600">Recipes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">{profile.follower_count}</div>
                    <div className="text-sm text-neutral-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">{profile.following_count}</div>
                    <div className="text-sm text-neutral-600">Following</div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    leftIcon={<Edit className="h-4 w-4" />}
                    onClick={() => {/* Navigate to edit profile */}}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant={profile.is_following ? 'outline' : 'primary'}
                    leftIcon={<Users className="h-4 w-4" />}
                    onClick={handleFollow}
                  >
                    {profile.is_following ? 'Following' : 'Follow'}
                  </Button>
                )}
                
                {isOwnProfile && (
                  <Link to="/community/create">
                    <Button
                      variant="primary"
                      leftIcon={<Plus className="h-4 w-4" />}
                      className="w-full"
                    >
                      New Recipe
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'recipes'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('recipes')}
          >
            <Grid className="h-4 w-4 inline mr-2" />
            Recipes
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'collections'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('collections')}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Collections
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'followers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Followers
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'following'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('following')}
          >
            <Heart className="h-4 w-4 inline mr-2" />
            Following
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'recipes' && (
          <div>
            {recipes.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-lg">
                <ChefHat className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No Recipes Yet</h3>
                {isOwnProfile ? (
                  <>
                    <p className="text-neutral-600 mb-4">Share your first recipe with the community</p>
                    <Link to="/community/create">
                      <Button variant="primary">
                        Create Recipe
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-neutral-600">This user hasn't shared any recipes yet</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map(recipe => (
                  <Link 
                    key={recipe.id} 
                    to={`/community/recipe/${recipe.id}`}
                    className="block"
                  >
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <div className="h-48 bg-neutral-100">
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
                      </div>
                      <CardBody>
                        <h3 className="font-semibold text-lg mb-1">{recipe.title}</h3>
                        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                          {recipe.description || 'No description provided'}
                        </p>
                        <div className="flex justify-between text-sm text-neutral-500">
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {recipe.like_count}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {recipe.comment_count}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="text-center py-12 bg-neutral-50 rounded-lg">
            <BookOpen className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Collections Coming Soon</h3>
            <p className="text-neutral-600">
              Create and share collections of your favorite recipes
            </p>
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="text-center py-12 bg-neutral-50 rounded-lg">
            <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Followers Coming Soon</h3>
            <p className="text-neutral-600">
              See who's following {isOwnProfile ? 'you' : profile.full_name}
            </p>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="text-center py-12 bg-neutral-50 rounded-lg">
            <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Following Coming Soon</h3>
            <p className="text-neutral-600">
              See who {isOwnProfile ? 'you are' : profile.full_name + ' is'} following
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default UserProfilePage;
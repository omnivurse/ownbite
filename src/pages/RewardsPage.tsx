import React, { useState, useEffect } from 'react';
import { Award, Star, Trophy, Gift, Info, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rewardsService, RewardsData } from '../services/rewardsService';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import RewardsCard from '../components/rewards/RewardsCard';
import RewardsLeaderboard from '../components/rewards/RewardsLeaderboard';
import RewardsBadges from '../components/rewards/RewardsBadges';
import RewardsHistory from '../components/rewards/RewardsHistory';
import RewardsMarketplace from '../components/rewards/RewardsMarketplace';
import RewardsRedemptions from '../components/rewards/RewardsRedemptions';

const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'redemptions'>('overview');

  useEffect(() => {
    if (user) {
      loadRewardsData();
    }
  }, [user]);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rewardsService.getUserRewards();
      setRewardsData(data);
    } catch (err: any) {
      console.error('Error loading rewards data:', err);
      setError(err.message || 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'from-amber-500 to-amber-700';
      case 'Silver': return 'from-neutral-400 to-neutral-600';
      case 'Gold': return 'from-yellow-400 to-yellow-600';
      case 'Platinum': return 'from-blue-400 to-blue-600';
      default: return 'from-primary-500 to-primary-700';
    }
  };

  if (loading) {
    return (
      <PageContainer title="Rewards">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Rewards">
        <Card>
          <CardBody>
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="primary" 
              onClick={loadRewardsData}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  if (!rewardsData) {
    return (
      <PageContainer title="Rewards">
        <Card>
          <CardBody>
            <p className="text-neutral-600">No rewards data available</p>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  const { user_rewards, next_tier, points_to_next_tier } = rewardsData;

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Rewards & Achievements
          </h1>
          <p className="text-neutral-600">
            Earn points and badges for healthy behavior and redeem them for exclusive rewards
          </p>
        </div>

        {/* Tier Banner */}
        <div className={`bg-gradient-to-r ${getTierColor(user_rewards.tier)} text-white rounded-xl p-6 mb-6`}>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user_rewards.tier} Tier</h2>
                <p className="opacity-90">
                  {user_rewards.lifetime_points} lifetime points earned
                </p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              {user_rewards.tier !== 'Platinum' ? (
                <>
                  <p className="font-medium">
                    {points_to_next_tier} points to {next_tier}
                  </p>
                  <div className="mt-2 w-full md:w-48 bg-white bg-opacity-20 rounded-full h-2.5">
                    <div 
                      className="bg-white h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, Math.max(0, 100 - (points_to_next_tier / 
                          (next_tier === 'Silver' ? 500 : 
                           next_tier === 'Gold' ? 500 : 
                           next_tier === 'Platinum' ? 1000 : 0)) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </>
              ) : (
                <p className="font-medium">
                  Congratulations! You've reached the highest tier!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <Award className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'marketplace'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('marketplace')}
          >
            <ShoppingBag className="h-4 w-4 inline mr-2" />
            Marketplace
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'redemptions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('redemptions')}
          >
            <Gift className="h-4 w-4 inline mr-2" />
            My Redemptions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* How to Earn Points */}
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary-600" />
                  How to Earn Points
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-green-100 rounded-full mr-2">
                        <Star className="h-4 w-4 text-green-600" />
                      </div>
                      <h4 className="font-medium">Daily Activities</h4>
                    </div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Log a meal: +10 points</li>
                      <li>• Hit hydration goal: +15 points</li>
                      <li>• 3-day streak: +50 points</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-blue-100 rounded-full mr-2">
                        <Star className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-medium">Content Creation</h4>
                    </div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Upload a recipe: +25 points</li>
                      <li>• Share progress update: +20 points</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-purple-100 rounded-full mr-2">
                        <Star className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="font-medium">Community</h4>
                    </div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Share referral link: +30 points</li>
                      <li>• Refer new signup: +100 points</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-yellow-100 rounded-full mr-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                      </div>
                      <h4 className="font-medium">Account</h4>
                    </div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Complete profile: +40 points</li>
                      <li>• Upload bloodwork: +50 points</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RewardsHistory />
              </div>
              <div>
                <RewardsLeaderboard className="mb-6" />
              </div>
            </div>

            {/* Badges */}
            <RewardsBadges badges={user_rewards.badges || []} />
          </>
        )}

        {activeTab === 'marketplace' && (
          <RewardsMarketplace onRedeemSuccess={loadRewardsData} />
        )}

        {activeTab === 'redemptions' && (
          <RewardsRedemptions />
        )}
      </div>
    </PageContainer>
  );
};

export default RewardsPage;
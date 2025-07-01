import React, { useState, useEffect } from 'react';
import { Award, Star, TrendingUp, Clock, Gift, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { rewardsService, RewardsData } from '../../services/rewardsService';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface RewardsCardProps {
  className?: string;
  onViewDetails?: () => void;
}

// Maximum number of retries for operations
const MAX_RETRIES = 3;

// Retry delay in milliseconds (with exponential backoff)
const getRetryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

const RewardsCard: React.FC<RewardsCardProps> = ({ className = '', onViewDetails }) => {
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rewardsService.getUserRewards();
      setRewardsData(data);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Error loading rewards data:', err);
      setError(err.message || 'Failed to load rewards data');
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying rewards data load (attempt ${retryCount + 1}) after ${delay}ms`);
        
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadRewardsData(), delay);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'Bronze': return 'text-amber-700 bg-amber-100';
      case 'Silver': return 'text-neutral-700 bg-neutral-200';
      case 'Gold': return 'text-yellow-700 bg-yellow-100';
      case 'Platinum': return 'text-blue-700 bg-blue-100';
      default: return 'text-neutral-700 bg-neutral-100';
    }
  };

  const getProgressPercentage = () => {
    if (!rewardsData) return 0;
    
    const { user_rewards, points_to_next_tier } = rewardsData;
    const { tier, lifetime_points } = user_rewards;
    
    if (tier === 'Platinum') return 100;
    
    let tierThreshold = 0;
    let nextTierThreshold = 0;
    
    switch (tier) {
      case 'Bronze':
        tierThreshold = 0;
        nextTierThreshold = 500;
        break;
      case 'Silver':
        tierThreshold = 500;
        nextTierThreshold = 1000;
        break;
      case 'Gold':
        tierThreshold = 1000;
        nextTierThreshold = 2000;
        break;
      default:
        return 0;
    }
    
    const progress = lifetime_points - tierThreshold;
    const total = nextTierThreshold - tierThreshold;
    
    return Math.min(100, Math.max(0, (progress / total) * 100));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="flex items-start p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 mb-2">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadRewardsData} 
              >
                Retry
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Create default rewards data if none is available
  if (!rewardsData) {
    const defaultRewards: RewardsData = {
      user_rewards: {
        id: 'default',
        user_id: 'default',
        points: 0,
        lifetime_points: 0,
        tier: 'Bronze',
        badges: [],
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      recent_events: [],
      next_tier: 'Silver',
      points_to_next_tier: 500
    };
    
    return (
      <Card className={className}>
        <CardBody>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-primary-600" />
              Rewards
            </h2>
            <div className="flex space-x-2">
              <Link to="/rewards">
                <Button variant="outline" size="sm">Overview</Button>
              </Link>
              <Link to="/rewards?tab=marketplace">
                <Button variant="outline" size="sm" leftIcon={<Gift className="h-3 w-3 sm:h-4 sm:w-4" />}>Shop</Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getTierColor(defaultRewards.user_rewards.tier)}`}>
                {defaultRewards.user_rewards.tier} Tier
              </span>
              <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-primary-600">
                0 <span className="text-xs sm:text-sm text-neutral-500">points</span>
              </div>
            </div>
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="mb-3 sm:mb-4">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span>Progress to Silver</span>
              <span>500 points to go</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5 sm:h-2.5">
              <div 
                className="bg-primary-600 h-1.5 sm:h-2.5 rounded-full" 
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-3 sm:mt-4">
            <Link to="/rewards" className="flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                rightIcon={<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
              >
                View All
              </Button>
            </Link>
            <Link to="/rewards?tab=marketplace" className="flex-1">
              <Button 
                variant="primary" 
                size="sm" 
                className="w-full"
                leftIcon={<Gift className="h-3 w-3 sm:h-4 sm:w-4" />}
              >
                Redeem
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  const { user_rewards, recent_events, next_tier, points_to_next_tier } = rewardsData;

  return (
    <Card className={className}>
      <CardBody>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-primary-600" />
            Rewards
          </h2>
          <div className="flex space-x-2">
            <Link to="/rewards">
              <Button variant="outline" size="sm">Overview</Button>
            </Link>
            <Link to="/rewards?tab=marketplace">
              <Button variant="outline" size="sm" leftIcon={<Gift className="h-3 w-3 sm:h-4 sm:w-4" />}>Shop</Button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getTierColor(user_rewards.tier)}`}>
              {user_rewards.tier} Tier
            </span>
            <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-primary-600">
              {user_rewards.points} <span className="text-xs sm:text-sm text-neutral-500">points</span>
            </div>
          </div>
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Star className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          </div>
        </div>
        
        {/* Progress to Next Tier */}
        {user_rewards.tier !== 'Platinum' && (
          <div className="mb-3 sm:mb-4">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span>Progress to {next_tier}</span>
              <span>{points_to_next_tier} points to go</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5 sm:h-2.5">
              <div 
                className="bg-primary-600 h-1.5 sm:h-2.5 rounded-full" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Recent Activity */}
        <div>
          <h4 className="font-medium text-neutral-900 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1 text-neutral-500" />
            Recent Activity
          </h4>
          {recent_events.length > 0 ? (
            <div className="space-y-2">
              {recent_events.slice(0, 3).map(event => (
                <div key={event.id} className="flex justify-between items-center p-2 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-700">
                    {rewardsService.getEventTypeDisplay(event.event_type)}
                  </span>
                  <span className="text-sm font-medium text-primary-600">
                    +{event.points_awarded}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No recent activity</p>
          )}
        </div>
        
        {/* Badges */}
        {user_rewards.badges && user_rewards.badges.length > 0 && (
          <div>
            <h4 className="font-medium text-neutral-900 mb-2 flex items-center">
              <Award className="h-4 w-4 mr-1 text-neutral-500" />
              Recent Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {user_rewards.badges.slice(0, 3).map((badge, index) => (
                <div 
                  key={index} 
                  className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium"
                >
                  {badge.name}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* View All Button */}
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            rightIcon={<ChevronRight className="h-4 w-4" />}
            onClick={onViewDetails}
          >
            View All Rewards
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default RewardsCard;
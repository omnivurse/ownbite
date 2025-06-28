import React, { useState, useEffect } from 'react';
import { Award, Star, TrendingUp, Clock, Gift, ChevronRight } from 'lucide-react';
import { rewardsService, RewardsData } from '../../services/rewardsService';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface RewardsCardProps {
  className?: string;
  onViewDetails?: () => void;
}

const RewardsCard: React.FC<RewardsCardProps> = ({ className = '', onViewDetails }) => {
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRewardsData();
  }, []);

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
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-20 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardBody>
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadRewardsData} 
            className="mt-2"
          >
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!rewardsData) {
    return (
      <Card className={className}>
        <CardBody>
          <p className="text-neutral-500">No rewards data available</p>
        </CardBody>
      </Card>
    );
  }

  const { user_rewards, recent_events, next_tier, points_to_next_tier } = rewardsData;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary-600" />
            My Rewards
          </h3>
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Tier and Points */}
          <div className="flex justify-between items-center">
            <div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getTierColor(user_rewards.tier)}`}>
                {user_rewards.tier} Tier
              </span>
              <div className="mt-2 text-2xl font-bold text-primary-600">
                {user_rewards.points} <span className="text-sm text-neutral-500">points</span>
              </div>
            </div>
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Star className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          {/* Progress to Next Tier */}
          {user_rewards.tier !== 'Platinum' && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress to {next_tier}</span>
                <span>{points_to_next_tier} points to go</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
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
        </div>
      </CardBody>
    </Card>
  );
};

export default RewardsCard;
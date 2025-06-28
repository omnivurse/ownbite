import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Star, Trophy, ArrowRight, Gift, ShoppingBag } from 'lucide-react';
import { rewardsService, RewardsData } from '../../services/rewardsService';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';

interface RewardsPreviewProps {
  className?: string;
}

const RewardsPreview: React.FC<RewardsPreviewProps> = ({ className = '' }) => {
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
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary-600" />
            Rewards
          </h2>
          <div className="flex space-x-2">
            <Link to="/rewards">
              <Button variant="outline" size="sm">Overview</Button>
            </Link>
            <Link to="/rewards?tab=marketplace">
              <Button variant="outline" size="sm" leftIcon={<ShoppingBag className="h-4 w-4" />}>Shop</Button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
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
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to {next_tier}</span>
              <span>{points_to_next_tier} points to go</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ 
                  width: `${Math.min(100, Math.max(0, 100 - (points_to_next_tier / 
                    (next_tier === 'Silver' ? 500 : 
                     next_tier === 'Gold' ? 500 : 
                     next_tier === 'Platinum' ? 1000 : 0)) * 100))}%` 
                }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Recent Activity */}
        {recent_events && recent_events.length > 0 && (
          <div>
            <h3 className="font-medium text-neutral-900 mb-2">Recent Activity</h3>
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
          </div>
        )}
        
        <div className="flex space-x-2 mt-4">
          <Link to="/rewards" className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View All
            </Button>
          </Link>
          <Link to="/rewards?tab=marketplace" className="flex-1">
            <Button 
              variant="primary" 
              size="sm" 
              className="w-full"
              leftIcon={<Gift className="h-4 w-4" />}
            >
              Redeem
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default RewardsPreview;
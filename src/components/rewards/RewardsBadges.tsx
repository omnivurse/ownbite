import React from 'react';
import { Award, Calendar, Star, Zap, Target, Medal, Trophy, Heart } from 'lucide-react';
import { Badge } from '../../services/rewardsService';
import Card, { CardBody, CardHeader } from '../ui/Card';

interface RewardsBadgesProps {
  badges: Badge[];
  className?: string;
}

const RewardsBadges: React.FC<RewardsBadgesProps> = ({ 
  badges,
  className = ''
}) => {
  const getBadgeIcon = (badge: Badge) => {
    const { type, name } = badge;
    
    if (type === 'tier') {
      if (name.includes('Platinum')) return <Trophy className="h-6 w-6 text-blue-500" />;
      if (name.includes('Gold')) return <Medal className="h-6 w-6 text-yellow-500" />;
      if (name.includes('Silver')) return <Medal className="h-6 w-6 text-neutral-400" />;
      if (name.includes('Bronze')) return <Medal className="h-6 w-6 text-amber-700" />;
      return <Award className="h-6 w-6 text-primary-500" />;
    }
    
    if (type === 'streak') return <Calendar className="h-6 w-6 text-green-500" />;
    if (type === 'milestone') return <Target className="h-6 w-6 text-red-500" />;
    if (type === 'achievement') return <Star className="h-6 w-6 text-yellow-500" />;
    if (type === 'referral') return <Heart className="h-6 w-6 text-pink-500" />;
    
    return <Zap className="h-6 w-6 text-primary-500" />;
  };
  
  const getBadgeColor = (badge: Badge) => {
    const { type, name } = badge;
    
    if (type === 'tier') {
      if (name.includes('Platinum')) return 'bg-blue-100 border-blue-200';
      if (name.includes('Gold')) return 'bg-yellow-100 border-yellow-200';
      if (name.includes('Silver')) return 'bg-neutral-100 border-neutral-200';
      if (name.includes('Bronze')) return 'bg-amber-100 border-amber-200';
      return 'bg-primary-100 border-primary-200';
    }
    
    if (type === 'streak') return 'bg-green-100 border-green-200';
    if (type === 'milestone') return 'bg-red-100 border-red-200';
    if (type === 'achievement') return 'bg-yellow-100 border-yellow-200';
    if (type === 'referral') return 'bg-pink-100 border-pink-200';
    
    return 'bg-primary-100 border-primary-200';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary-600" />
          Earned Badges
        </h3>
      </CardHeader>
      <CardBody>
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">No badges earned yet</p>
            <p className="text-sm text-neutral-500 mt-2">
              Complete activities to earn badges and show off your achievements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border flex flex-col items-center text-center ${getBadgeColor(badge)}`}
              >
                <div className="p-3 bg-white rounded-full mb-3 shadow-sm">
                  {getBadgeIcon(badge)}
                </div>
                <h4 className="font-medium text-neutral-900 mb-1">{badge.name}</h4>
                <p className="text-xs text-neutral-600 mb-2">{badge.description}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RewardsBadges;
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, User, RefreshCw, Loader2 } from 'lucide-react';
import { rewardsService, LeaderboardEntry } from '../../services/rewardsService';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface RewardsLeaderboardProps {
  className?: string;
  limit?: number;
}

const RewardsLeaderboard: React.FC<RewardsLeaderboardProps> = ({ 
  className = '',
  limit = 10
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [limit]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rewardsService.getLeaderboard(limit);
      setLeaderboard(data);
    } catch (err: any) {
      console.error('Error loading leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-neutral-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-sm font-medium text-neutral-500">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-primary-600" />
            Leaderboard
          </h3>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-primary-600" />
            Leaderboard
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={loadLeaderboard}
          >
            Try Again
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-primary-600" />
            Leaderboard
          </h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">No leaderboard data available yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.user_id} 
                className="flex items-center p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className="h-8 w-8 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden ml-3">
                  {entry.avatar_url ? (
                    <img 
                      src={entry.avatar_url} 
                      alt={entry.full_name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-neutral-500" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-medium text-neutral-900 truncate">
                    {entry.full_name || 'Anonymous User'}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-primary-600 font-medium mr-3">
                    {entry.points} pts
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(entry.tier)}`}>
                    {entry.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RewardsLeaderboard;
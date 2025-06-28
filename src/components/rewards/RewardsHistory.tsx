import React, { useState, useEffect } from 'react';
import { Clock, Filter, Calendar, Download, RefreshCw, Loader2 } from 'lucide-react';
import { rewardsService, RewardEvent } from '../../services/rewardsService';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface RewardsHistoryProps {
  className?: string;
  limit?: number;
}

const RewardsHistory: React.FC<RewardsHistoryProps> = ({ 
  className = '',
  limit = 20
}) => {
  const [events, setEvents] = useState<RewardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadRewardsHistory();
  }, []);

  const loadRewardsHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rewardsService.getUserRewards();
      setEvents(data.recent_events || []);
    } catch (err: any) {
      console.error('Error loading rewards history:', err);
      setError(err.message || 'Failed to load rewards history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRewardsHistory();
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'log_meal': return 'bg-green-100 text-green-800';
      case 'upload_recipe': return 'bg-blue-100 text-blue-800';
      case 'share_progress': return 'bg-purple-100 text-purple-800';
      case 'streak': return 'bg-yellow-100 text-yellow-800';
      case 'referral_link': return 'bg-pink-100 text-pink-800';
      case 'referral_signup': return 'bg-red-100 text-red-800';
      case 'hydration_goal': return 'bg-cyan-100 text-cyan-800';
      case 'complete_profile': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const filteredEvents = filter 
    ? events.filter(event => event.event_type === filter)
    : events;

  const eventTypes = Array.from(new Set(events.map(event => event.event_type)));

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Rewards History
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
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Rewards History
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={loadRewardsHistory}
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
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Rewards History
          </h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              disabled={events.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">No rewards history available yet</p>
            <p className="text-sm text-neutral-500 mt-2">
              Complete activities to earn points and badges!
            </p>
          </div>
        ) : (
          <>
            {/* Filter */}
            {eventTypes.length > 1 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Filter className="h-4 w-4 text-neutral-500 mr-1" />
                  <span className="text-sm font-medium text-neutral-700">Filter by activity</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter(null)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      filter === null
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                    }`}
                  >
                    All
                  </button>
                  {eventTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        filter === type
                          ? getEventTypeColor(type)
                          : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                      }`}
                    >
                      {rewardsService.getEventTypeDisplay(type)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Events List */}
            <div className="space-y-3">
              {filteredEvents.slice(0, limit).map(event => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                        {rewardsService.getEventTypeDisplay(event.event_type)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-600 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                      {event.context && Object.keys(event.context).length > 0 && (
                        <div className="text-xs text-neutral-500 mt-1">
                          {Object.entries(event.context).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key.replace(/_/g, ' ')}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-primary-600">
                    +{event.points_awarded}
                  </div>
                </div>
              ))}
            </div>
            
            {events.length > limit && (
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Implement view more logic */}}
                >
                  View More
                </Button>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default RewardsHistory;
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Calendar, Download, RefreshCw, Loader2, Check, X, AlertTriangle } from 'lucide-react';
import { rewardsService, RewardRedemption } from '../../services/rewardsService';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface RewardsRedemptionsProps {
  className?: string;
  limit?: number;
}

const RewardsRedemptions: React.FC<RewardsRedemptionsProps> = ({ 
  className = '',
  limit = 20
}) => {
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState<RewardRedemption | null>(null);

  useEffect(() => {
    loadRedemptions();
  }, []);

  const loadRedemptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rewardsService.getUserRedemptions();
      setRedemptions(data.redemptions || []);
    } catch (err: any) {
      console.error('Error loading redemptions:', err);
      setError(err.message || 'Failed to load redemptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRedemptions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fulfilled': return <Check className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-primary-600" />
            My Redemptions
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
            <ShoppingBag className="h-5 w-5 mr-2 text-primary-600" />
            My Redemptions
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={loadRedemptions}
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
            <ShoppingBag className="h-5 w-5 mr-2 text-primary-600" />
            My Redemptions
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
              disabled={redemptions.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {/* Redemption Details Modal */}
        {selectedRedemption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-neutral-900">Redemption Details</h3>
                <button
                  onClick={() => setSelectedRedemption(null)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {selectedRedemption.reward_image_url && (
                <img 
                  src={selectedRedemption.reward_image_url} 
                  alt={selectedRedemption.reward_name} 
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              
              <h4 className="font-semibold text-lg mb-1">{selectedRedemption.reward_name}</h4>
              <p className="text-neutral-600 text-sm mb-4">{selectedRedemption.reward_description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Points Spent:</span>
                  <span className="font-medium text-primary-600">{selectedRedemption.points_spent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRedemption.status)}`}>
                    {selectedRedemption.status.charAt(0).toUpperCase() + selectedRedemption.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Redeemed On:</span>
                  <span className="text-neutral-800">{new Date(selectedRedemption.created_at).toLocaleDateString()}</span>
                </div>
                {selectedRedemption.fulfilled_at && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Fulfilled On:</span>
                    <span className="text-neutral-800">{new Date(selectedRedemption.fulfilled_at).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedRedemption.redemption_code && (
                  <div className="mt-4 p-4 bg-neutral-100 rounded-lg">
                    <p className="text-sm text-neutral-600 mb-1">Redemption Code:</p>
                    <p className="font-mono text-lg font-bold">{selectedRedemption.redemption_code}</p>
                  </div>
                )}
              </div>
              
              {selectedRedemption.status === 'pending' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2" />
                    <p className="text-sm text-yellow-700">
                      Your redemption is being processed. You will be notified when it's fulfilled.
                    </p>
                  </div>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setSelectedRedemption(null)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
        
        {redemptions.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">No redemptions yet</p>
            <p className="text-sm text-neutral-500 mt-2">
              Redeem your points for rewards in the marketplace!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {redemptions.slice(0, limit).map(redemption => (
              <div 
                key={redemption.id} 
                className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                onClick={() => setSelectedRedemption(redemption)}
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(redemption.status)}`}>
                      {getStatusIcon(redemption.status)}
                      <span className="ml-1 capitalize">{redemption.status}</span>
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{redemption.reward_name}</p>
                    <div className="text-sm text-neutral-600 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(redemption.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-primary-600">
                  {redemption.points_spent}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RewardsRedemptions;
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Filter, Gift, Tag, Award, Check, X, Loader2, Info, ShieldAlert } from 'lucide-react';
import { rewardsService, RewardItem } from '../../services/rewardsService';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface RewardsMarketplaceProps {
  className?: string;
  onRedeemSuccess?: () => void;
}

const RewardsMarketplace: React.FC<RewardsMarketplaceProps> = ({ 
  className = '',
  onRedeemSuccess
}) => {
  const [availableRewards, setAvailableRewards] = useState<{
    user_tier: string;
    user_points: number;
    rewards: RewardItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<{
    success: boolean;
    message: string;
    redemption_code?: string;
  } | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    loadAvailableRewards();
  }, []);

  const loadAvailableRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rewardsService.getAvailableRewards();
      setAvailableRewards(data);
    } catch (err: any) {
      console.error('Error loading available rewards:', err);
      setError(err.message || 'Failed to load available rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async () => {
    if (!selectedReward) return;
    
    try {
      setIsRedeeming(true);
      
      // For physical items, collect delivery details
      const details = selectedReward.is_digital ? {} : deliveryDetails;
      
      const result = await rewardsService.redeemReward(selectedReward.id, details);
      
      setRedemptionResult({
        success: result.success,
        message: result.message,
        redemption_code: result.redemption_code
      });
      
      if (result.success) {
        // Refresh available rewards to update points
        await loadAvailableRewards();
        
        // Notify parent component
        if (onRedeemSuccess) {
          onRedeemSuccess();
        }
      }
    } catch (err: any) {
      console.error('Error redeeming reward:', err);
      setRedemptionResult({
        success: false,
        message: err.message || 'Failed to redeem reward'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCloseRedemption = () => {
    setRedemptionResult(null);
    setSelectedReward(null);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Content': return 'text-blue-700 bg-blue-100';
      case 'Service': return 'text-purple-700 bg-purple-100';
      case 'Subscription': return 'text-green-700 bg-green-100';
      case 'Event': return 'text-orange-700 bg-orange-100';
      case 'Physical': return 'text-red-700 bg-red-100';
      case 'Customization': return 'text-indigo-700 bg-indigo-100';
      case 'Feature': return 'text-pink-700 bg-pink-100';
      default: return 'text-neutral-700 bg-neutral-100';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-primary-600" />
            Rewards Marketplace
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
            Rewards Marketplace
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={loadAvailableRewards}
          >
            Try Again
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!availableRewards) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-primary-600" />
            Rewards Marketplace
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-neutral-600">No rewards available</p>
        </CardBody>
      </Card>
    );
  }

  const { user_tier, user_points, rewards } = availableRewards;

  // Get unique categories
  const categories = Array.from(new Set(rewards.map(reward => reward.category)));

  // Filter rewards by category if selected
  const filteredRewards = selectedCategory
    ? rewards.filter(reward => reward.category === selectedCategory)
    : rewards;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-primary-600" />
            Rewards Marketplace
          </h3>
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(user_tier)} mr-2`}>
              {user_tier}
            </span>
            <span className="font-medium text-primary-600">
              {user_points} points
            </span>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {/* Redemption Modal */}
        {selectedReward && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              {redemptionResult ? (
                <div className="text-center">
                  {redemptionResult.success ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Redemption Successful!</h3>
                      <p className="text-green-700 mb-4">{redemptionResult.message}</p>
                      
                      {redemptionResult.redemption_code && (
                        <div className="mb-4 p-4 bg-neutral-100 rounded-lg">
                          <p className="text-sm text-neutral-600 mb-1">Your redemption code:</p>
                          <p className="font-mono text-lg font-bold">{redemptionResult.redemption_code}</p>
                        </div>
                      )}
                      
                      <Button
                        variant="primary"
                        onClick={handleCloseRedemption}
                        className="w-full"
                      >
                        Done
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-red-800 mb-2">Redemption Failed</h3>
                      <p className="text-red-700 mb-4">{redemptionResult.message}</p>
                      <Button
                        variant="outline"
                        onClick={handleCloseRedemption}
                        className="w-full"
                      >
                        Close
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-neutral-900">Redeem Reward</h3>
                    <button
                      onClick={() => setSelectedReward(null)}
                      className="text-neutral-500 hover:text-neutral-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {selectedReward.image_url && (
                      <div className="w-full sm:w-1/3">
                        <img 
                          src={selectedReward.image_url} 
                          alt={selectedReward.name} 
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{selectedReward.name}</h4>
                      <p className="text-neutral-600 text-sm mb-3">{selectedReward.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedReward.category)}`}>
                          {rewardsService.getCategoryDisplay(selectedReward.category)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(selectedReward.required_tier)}`}>
                          {selectedReward.required_tier}+
                        </span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                          {selectedReward.points_cost} points
                        </span>
                      </div>
                      
                      {selectedReward.stock_quantity !== null && (
                        <p className="text-sm text-neutral-600 mb-3">
                          {selectedReward.stock_quantity} remaining in stock
                        </p>
                      )}
                      
                      {!selectedReward.is_digital && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                          <div className="flex items-start">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                            <p className="text-sm text-blue-700">
                              This is a physical reward that will be shipped to you. Please provide your delivery details.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!selectedReward.is_digital && (
                    <div className="mb-4 space-y-3">
                      <h4 className="font-medium text-neutral-900">Delivery Details</h4>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={deliveryDetails.name}
                          onChange={(e) => setDeliveryDetails({...deliveryDetails, name: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={deliveryDetails.email}
                          onChange={(e) => setDeliveryDetails({...deliveryDetails, email: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Shipping Address
                        </label>
                        <textarea
                          value={deliveryDetails.address}
                          onChange={(e) => setDeliveryDetails({...deliveryDetails, address: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your shipping address"
                          rows={3}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={deliveryDetails.phone}
                          onChange={(e) => setDeliveryDetails({...deliveryDetails, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg mb-4">
                    <div>
                      <span className="text-sm text-neutral-600">Your points:</span>
                      <span className="ml-2 font-bold text-primary-600">{user_points}</span>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600">Cost:</span>
                      <span className="ml-2 font-bold text-primary-600">-{selectedReward.points_cost}</span>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600">Remaining:</span>
                      <span className="ml-2 font-bold text-primary-600">{user_points - selectedReward.points_cost}</span>
                    </div>
                  </div>
                  
                  {!selectedReward.can_afford && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <div className="flex items-start">
                        <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                        <p className="text-sm text-red-700">
                          You don't have enough points to redeem this reward. You need {selectedReward.points_cost - user_points} more points.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedReward(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleRedeemReward}
                      disabled={isRedeeming || !selectedReward.can_afford || (!selectedReward.is_digital && (!deliveryDetails.name || !deliveryDetails.email || !deliveryDetails.address || !deliveryDetails.phone))}
                      isLoading={isRedeeming}
                      className="flex-1"
                    >
                      {isRedeeming ? 'Redeeming...' : 'Redeem Reward'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Filter className="h-4 w-4 text-neutral-500 mr-1" />
              <span className="text-sm font-medium text-neutral-700">Filter by category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? getCategoryColor(category)
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  {rewardsService.getCategoryDisplay(category)}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Rewards Grid */}
        {filteredRewards.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">No rewards available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRewards.map(reward => (
              <div 
                key={reward.id} 
                className={`border rounded-lg overflow-hidden transition-all hover:shadow-md ${
                  !reward.can_afford ? 'opacity-75' : ''
                }`}
              >
                {reward.image_url && (
                  <div className="h-40 bg-neutral-100">
                    <img 
                      src={reward.image_url} 
                      alt={reward.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-neutral-900">{reward.name}</h4>
                    <span className="font-bold text-primary-600">{reward.points_cost}</span>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{reward.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(reward.category)}`}>
                      {rewardsService.getCategoryDisplay(reward.category)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(reward.required_tier)}`}>
                      {reward.required_tier}+
                    </span>
                    {reward.is_digital ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Digital
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        Physical
                      </span>
                    )}
                  </div>
                  
                  {reward.stock_quantity !== null && (
                    <p className="text-xs text-neutral-500 mb-3">
                      {reward.stock_quantity} remaining in stock
                    </p>
                  )}
                  
                  <Button
                    variant={reward.can_afford ? "primary" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedReward(reward)}
                    disabled={!reward.can_afford}
                  >
                    {reward.can_afford ? 'Redeem' : `Need ${reward.points_cost - user_points} more points`}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RewardsMarketplace;
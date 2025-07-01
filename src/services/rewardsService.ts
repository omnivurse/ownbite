import { supabase } from '../lib/supabase';

export interface UserRewards {
  id: string;
  user_id: string;
  points: number;
  lifetime_points: number;
  tier: string;
  badges: Badge[];
  last_updated: string;
  created_at: string;
}

export interface RewardEvent {
  id: string;
  user_id: string;
  event_type: string;
  points_awarded: number;
  created_at: string;
  context: any;
}

export interface RewardItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  points_cost: number;
  required_tier: string;
  category: string;
  is_digital: boolean;
  is_active: boolean;
  stock_quantity?: number;
  created_at: string;
  updated_at: string;
  can_afford?: boolean;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_item_id: string;
  reward_name?: string;
  reward_description?: string;
  reward_image_url?: string;
  points_spent: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  redemption_code?: string;
  delivery_details: any;
  created_at: string;
  fulfilled_at?: string;
}

export interface Badge {
  id?: string;
  name: string;
  description: string;
  type: 'achievement' | 'streak' | 'milestone' | 'tier' | 'referral';
  earned_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  points: number;
  tier: string;
  rank: number;
  full_name: string;
  avatar_url?: string;
}

export interface RewardsData {
  user_rewards: UserRewards;
  recent_events: RewardEvent[];
  next_tier: string;
  points_to_next_tier: number;
}

// Maximum number of retries for operations
const MAX_RETRIES = 3;

// Retry delay in milliseconds (with exponential backoff)
const getRetryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

export const rewardsService = {
  /**
   * Get user's current rewards data
   */
  async getUserRewards(retryCount = 0): Promise<RewardsData> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First check if user rewards record exists
      const { data: existingRewards, error: fetchError } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If no rewards record exists, create one
      if (!existingRewards) {
        const { data: newRewards, error: createError } = await supabase
          .from('user_rewards')
          .insert([{
            user_id: user.id,
            points: 0,
            lifetime_points: 0,
            tier: 'Bronze',
            badges: []
          }])
          .select()
          .single();

        if (createError) throw createError;
        
        // Get recent events
        const { data: events, error: eventsError } = await supabase
          .from('reward_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (eventsError) throw eventsError;
        
        return {
          user_rewards: newRewards,
          recent_events: events || [],
          next_tier: 'Silver',
          points_to_next_tier: 500
        };
      }

      // Get recent events
      const { data: events, error: eventsError } = await supabase
        .from('reward_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (eventsError) throw eventsError;
      
      // Calculate next tier and points needed
      let nextTier = 'Silver';
      let pointsToNextTier = 500;
      
      switch (existingRewards.tier) {
        case 'Bronze':
          nextTier = 'Silver';
          pointsToNextTier = 500 - existingRewards.lifetime_points;
          break;
        case 'Silver':
          nextTier = 'Gold';
          pointsToNextTier = 1000 - existingRewards.lifetime_points;
          break;
        case 'Gold':
          nextTier = 'Platinum';
          pointsToNextTier = 2000 - existingRewards.lifetime_points;
          break;
        case 'Platinum':
          nextTier = 'Platinum';
          pointsToNextTier = 0;
          break;
      }
      
      return {
        user_rewards: existingRewards,
        recent_events: events || [],
        next_tier: nextTier,
        points_to_next_tier: Math.max(0, pointsToNextTier)
      };
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get user rewards (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getUserRewards(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Create a default rewards object if all retries fail
              resolve({
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
              });
            }
          }, delay);
        });
      }
      
      // Create a default rewards object if all retries fail
      return {
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
    }
  },

  /**
   * Award points to user for completing an action
   */
  async awardPoints(eventType: string, points: number, context: any = {}, retryCount = 0): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Record the reward event
      const { error: eventError } = await supabase
        .from('reward_events')
        .insert([{
          user_id: user.id,
          event_type: eventType,
          points_awarded: points,
          context
        }]);

      if (eventError) throw eventError;

      // Update user's total points
      const { error: updateError } = await supabase
        .rpc('update_user_points', {
          p_user_id: user.id,
          p_points_to_add: points
        });

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error awarding points:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying award points (attempt ${retryCount + 1}) after ${delay}ms`);
        
        setTimeout(() => {
          this.awardPoints(eventType, points, context, retryCount + 1);
        }, delay);
        return;
      }
      
      throw error;
    }
  },

  /**
   * Get user's reward history
   */
  async getRewardHistory(retryCount = 0): Promise<RewardEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reward_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reward history:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get reward history (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getRewardHistory(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty array instead of throwing to prevent UI breakage
              resolve([]);
            }
          }, delay);
        });
      }
      
      return [];
    }
  },

  /**
   * Get available reward items
   */
  async getAvailableRewards(retryCount = 0): Promise<{
    user_tier: string;
    user_points: number;
    rewards: RewardItem[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's current tier and points
      const userRewards = await this.getUserRewards();
      const userTier = userRewards.user_rewards.tier;
      const userPoints = userRewards.user_rewards.points;

      // Get available reward items
      const { data, error } = await supabase
        .from('reward_items')
        .select('*')
        .eq('is_active', true)
        .order('points_cost', { ascending: true });

      if (error) throw error;

      // Filter rewards based on tier and add affordability flag
      const tierRanking = {
        'Bronze': 1,
        'Silver': 2,
        'Gold': 3,
        'Platinum': 4
      };

      const userTierRank = tierRanking[userTier as keyof typeof tierRanking] || 1;

      const availableRewards = (data || []).map(item => ({
        ...item,
        can_afford: userPoints >= item.points_cost && 
                    (tierRanking[item.required_tier as keyof typeof tierRanking] || 1) <= userTierRank
      }));

      return {
        user_tier: userTier,
        user_points: userPoints,
        rewards: availableRewards
      };
    } catch (error) {
      console.error('Error fetching available rewards:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get available rewards (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getAvailableRewards(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty object instead of throwing to prevent UI breakage
              resolve({
                user_tier: 'Bronze',
                user_points: 0,
                rewards: []
              });
            }
          }, delay);
        });
      }
      
      return {
        user_tier: 'Bronze',
        user_points: 0,
        rewards: []
      };
    }
  },

  /**
   * Redeem a reward item
   */
  async redeemReward(rewardItemId: string, deliveryDetails: any = {}, retryCount = 0): Promise<{
    success: boolean;
    message: string;
    redemption_code?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the reward item details
      const { data: rewardItem, error: itemError } = await supabase
        .from('reward_items')
        .select('*')
        .eq('id', rewardItemId)
        .single();

      if (itemError) throw itemError;
      if (!rewardItem) throw new Error('Reward item not found');

      // Check if user has enough points
      const userRewards = await this.getUserRewards();
      if (!userRewards || userRewards.user_rewards.points < rewardItem.points_cost) {
        throw new Error('Insufficient points');
      }

      // Create redemption record
      const { data: redemption, error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert([{
          user_id: user.id,
          reward_item_id: rewardItemId,
          points_spent: rewardItem.points_cost,
          delivery_details,
          status: 'pending'
        }])
        .select()
        .single();

      if (redemptionError) throw redemptionError;

      // Deduct points from user
      const { error: deductError } = await supabase
        .rpc('update_user_points', {
          p_user_id: user.id,
          p_points_to_add: -rewardItem.points_cost
        });

      if (deductError) throw deductError;

      // For digital items, generate a redemption code
      let redemptionCode;
      if (rewardItem.is_digital) {
        redemptionCode = this.generateRedemptionCode();
        
        // Update the redemption with the code
        const { error: updateError } = await supabase
          .from('reward_redemptions')
          .update({
            redemption_code: redemptionCode,
            status: 'fulfilled',
            fulfilled_at: new Date().toISOString()
          })
          .eq('id', redemption.id);
          
        if (updateError) throw updateError;
      }

      return {
        success: true,
        message: rewardItem.is_digital 
          ? 'Reward redeemed successfully! Here is your redemption code.' 
          : 'Reward redeemed successfully! We will process your order soon.',
        redemption_code: redemptionCode
      };
    } catch (error) {
      console.error('Error redeeming reward:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && !(error instanceof Error && error.message === 'Insufficient points')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying redeem reward (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.redeemReward(rewardItemId, deliveryDetails, retryCount + 1);
              resolve(result);
            } catch (retryError) {
              resolve({
                success: false,
                message: retryError instanceof Error ? retryError.message : 'Failed to redeem reward'
              });
            }
          }, delay);
        });
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to redeem reward'
      };
    }
  },

  /**
   * Generate a random redemption code
   */
  generateRedemptionCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  /**
   * Get user's redemption history
   */
  async getUserRedemptions(retryCount = 0): Promise<{
    redemptions: RewardRedemption[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          reward_items (
            name,
            description,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include reward item details
      const redemptions = (data || []).map(redemption => ({
        ...redemption,
        reward_name: redemption.reward_items?.name,
        reward_description: redemption.reward_items?.description,
        reward_image_url: redemption.reward_items?.image_url
      }));

      return { redemptions };
    } catch (error) {
      console.error('Error fetching redemption history:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get redemptions (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getUserRedemptions(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty array instead of throwing to prevent UI breakage
              resolve({ redemptions: [] });
            }
          }, delay);
        });
      }
      
      return { redemptions: [] };
    }
  },

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit: number = 10, retryCount = 0): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select(`
          user_id,
          points,
          tier,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return (data || []).map((item, index) => ({
        user_id: item.user_id,
        points: item.points,
        tier: item.tier,
        rank: index + 1,
        full_name: (item as any).profiles?.full_name || 'Anonymous',
        avatar_url: (item as any).profiles?.avatar_url
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get leaderboard (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getLeaderboard(limit, retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty array instead of throwing to prevent UI breakage
              resolve([]);
            }
          }, delay);
        });
      }
      
      return [];
    }
  },

  /**
   * Get display name for event type
   */
  getEventTypeDisplay(eventType: string): string {
    const displayNames: Record<string, string> = {
      'log_meal': 'Logged a meal',
      'upload_recipe': 'Shared a recipe',
      'share_progress': 'Shared progress',
      'streak': 'Maintained streak',
      'referral_link': 'Shared referral link',
      'referral_signup': 'Referred a friend',
      'hydration_goal': 'Met hydration goal',
      'complete_profile': 'Completed profile',
      'bloodwork_upload': 'Uploaded bloodwork',
      'scan_food': 'Scanned food'
    };
    
    return displayNames[eventType] || eventType.replace(/_/g, ' ');
  },

  /**
   * Get display name for reward category
   */
  getCategoryDisplay(category: string): string {
    const displayNames: Record<string, string> = {
      'Content': 'Premium Content',
      'Service': 'Service',
      'Subscription': 'Subscription',
      'Event': 'Event Access',
      'Physical': 'Physical Item',
      'Customization': 'Customization',
      'Feature': 'Premium Feature'
    };
    
    return displayNames[category] || category;
  }
};
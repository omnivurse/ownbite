import { supabase } from '../lib/supabase';

export interface UserRewards {
  id: string;
  user_id: string;
  points: number;
  lifetime_points: number;
  tier: string;
  badges: any[];
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
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_item_id: string;
  points_spent: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  redemption_code?: string;
  delivery_details: any;
  created_at: string;
  fulfilled_at?: string;
}

export const rewardsService = {
  /**
   * Get user's current rewards data
   */
  async getUserRewards(): Promise<UserRewards | null> {
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
        return newRewards;
      }

      return existingRewards;
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      return null;
    }
  },

  /**
   * Award points to user for completing an action
   */
  async awardPoints(eventType: string, points: number, context: any = {}): Promise<void> {
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
      throw error;
    }
  },

  /**
   * Get user's reward history
   */
  async getRewardHistory(): Promise<RewardEvent[]> {
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
      return [];
    }
  },

  /**
   * Get available reward items
   */
  async getRewardItems(): Promise<RewardItem[]> {
    try {
      const { data, error } = await supabase
        .from('reward_items')
        .select('*')
        .eq('is_active', true)
        .order('points_cost', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reward items:', error);
      return [];
    }
  },

  /**
   * Redeem a reward item
   */
  async redeemReward(rewardItemId: string, deliveryDetails: any = {}): Promise<RewardRedemption> {
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
      if (!userRewards || userRewards.points < rewardItem.points_cost) {
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

      return redemption;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  },

  /**
   * Get user's redemption history
   */
  async getRedemptionHistory(): Promise<RewardRedemption[]> {
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
      return data || [];
    } catch (error) {
      console.error('Error fetching redemption history:', error);
      return [];
    }
  },

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{
    user_id: string;
    points: number;
    tier: string;
    rank: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select(`
          user_id,
          points,
          tier,
          profiles!inner (
            full_name
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
        full_name: (item as any).profiles?.full_name || 'Anonymous'
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
};
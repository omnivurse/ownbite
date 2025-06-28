import { supabase } from '../lib/supabase';

export interface UserRewards {
  id: string;
  points: number;
  lifetime_points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  badges: Badge[];
  last_updated: string;
  created_at: string;
}

export interface Badge {
  type: string;
  name: string;
  description: string;
  earned_at: string;
}

export interface RewardEvent {
  id: string;
  event_type: string;
  points_awarded: number;
  created_at: string;
  context: any;
}

export interface RewardsData {
  user_rewards: UserRewards;
  recent_events: RewardEvent[];
  next_tier: string;
  points_to_next_tier: number;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
  tier: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  points_cost: number;
  required_tier: string;
  category: string;
  is_digital: boolean;
  stock_quantity: number | null;
  can_afford: boolean;
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  reward_name: string;
  reward_description: string;
  reward_image_url: string;
  points_spent: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  redemption_code: string | null;
  is_digital: boolean;
  created_at: string;
  fulfilled_at: string | null;
}

export interface RedemptionResult {
  success: boolean;
  redemption_id?: string;
  reward_name?: string;
  points_spent?: number;
  redemption_code?: string;
  is_digital?: boolean;
  status?: string;
  message: string;
}

export const rewardsService = {
  /**
   * Get user rewards data
   */
  async getUserRewards(): Promise<RewardsData> {
    try {
      const { data, error } = await supabase.rpc('get_user_rewards');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      throw error;
    }
  },

  /**
   * Award points to the user
   */
  async awardPoints(
    eventType: string,
    points: number,
    context: any = {}
  ): Promise<{ success: boolean; points_awarded: number; new_points: number; tier: string; tier_changed: boolean }> {
    try {
      const { data, error } = await supabase.rpc('award_points', {
        p_event_type: eventType,
        p_points: points,
        p_context: context
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  },

  /**
   * Get rewards leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase.rpc('get_rewards_leaderboard', {
        p_limit: limit
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  /**
   * Get event type display name
   */
  getEventTypeDisplay(eventType: string): string {
    const eventTypes: Record<string, string> = {
      'log_meal': 'Logged a meal',
      'upload_recipe': 'Uploaded a recipe',
      'share_progress': 'Shared progress',
      'streak': 'Maintained streak',
      'referral_link': 'Shared referral link',
      'referral_signup': 'Referred a new user',
      'hydration_goal': 'Hit hydration goal',
      'complete_profile': 'Completed profile',
      'bloodwork_upload': 'Uploaded bloodwork',
      'meal_plan': 'Created meal plan',
      'redeem_reward': 'Redeemed reward'
    };
    
    return eventTypes[eventType] || eventType;
  },

  /**
   * Manually trigger a reward event
   */
  async triggerRewardEvent(
    eventType: string,
    points: number,
    context: any = {}
  ): Promise<void> {
    try {
      await this.awardPoints(eventType, points, context);
    } catch (error) {
      console.error(`Error triggering ${eventType} reward:`, error);
      throw error;
    }
  },

  /**
   * Get available rewards for the user
   */
  async getAvailableRewards(): Promise<{
    user_tier: string;
    user_points: number;
    rewards: RewardItem[];
  }> {
    try {
      const { data, error } = await supabase.rpc('get_available_rewards');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching available rewards:', error);
      throw error;
    }
  },

  /**
   * Redeem a reward
   */
  async redeemReward(
    rewardItemId: string,
    deliveryDetails: any = {}
  ): Promise<RedemptionResult> {
    try {
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_reward_item_id: rewardItemId,
        p_delivery_details: deliveryDetails
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  },

  /**
   * Get user redemption history
   */
  async getUserRedemptions(): Promise<{
    redemptions: RewardRedemption[];
  }> {
    try {
      const { data, error } = await supabase.rpc('get_user_redemptions');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user redemptions:', error);
      throw error;
    }
  },

  /**
   * Get category display name
   */
  getCategoryDisplay(category: string): string {
    const categories: Record<string, string> = {
      'Content': 'Digital Content',
      'Service': 'Services',
      'Subscription': 'Subscriptions',
      'Event': 'Events',
      'Physical': 'Physical Items',
      'Customization': 'Customization',
      'Feature': 'Special Features'
    };
    
    return categories[category] || category;
  }
};
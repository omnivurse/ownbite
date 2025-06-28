import { supabase } from '../lib/supabase';

export interface SocialShare {
  id: string;
  content_type: 'recipe' | 'food_scan' | 'progress' | 'achievement' | 'bloodwork';
  content_id: string;
  provider: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest' | 'linkedin';
  share_url?: string;
  share_image_url?: string;
  share_text: string;
  hashtags: string[];
  share_status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export interface ShareRequest {
  content_type: 'recipe' | 'food_scan' | 'progress' | 'achievement' | 'bloodwork';
  content_id: string;
  provider: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest' | 'linkedin';
  share_text: string;
  share_url?: string;
  share_image_url?: string;
  hashtags?: string[];
}

export interface ShareResult {
  success: boolean;
  share_id?: string;
  points_awarded?: number;
  message: string;
}

export interface ShareHistory {
  shares: SocialShare[];
  stats: {
    total_shares: number;
    by_platform: Record<string, number>;
    by_content_type: Record<string, number>;
  };
}

export const socialSharingService = {
  /**
   * Share content to social media
   */
  async shareContent(request: ShareRequest): Promise<ShareResult> {
    try {
      // Ensure the main hashtag is included
      const hashtags = request.hashtags || [];
      if (!hashtags.includes('#iamhealthierwithownbite.me')) {
        hashtags.push('#iamhealthierwithownbite.me');
      }
      
      const { data, error } = await supabase.rpc('share_content', {
        p_content_type: request.content_type,
        p_content_id: request.content_id,
        p_provider: request.provider,
        p_share_text: request.share_text,
        p_share_url: request.share_url || null,
        p_share_image_url: request.share_image_url || null,
        p_hashtags: hashtags
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sharing content:', error);
      throw error;
    }
  },

  /**
   * Get user's share history
   */
  async getShareHistory(limit: number = 20): Promise<ShareHistory> {
    try {
      const { data, error } = await supabase.rpc('get_share_history', {
        p_limit: limit
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching share history:', error);
      throw error;
    }
  },

  /**
   * Generate share text for different content types
   */
  generateShareText(contentType: string, contentName: string): string {
    switch (contentType) {
      case 'recipe':
        return `I just made this delicious ${contentName} recipe with OwnBite! #iamhealthierwithownbite.me #HealthyEating`;
      case 'food_scan':
        return `I just scanned ${contentName} with OwnBite and learned about its nutritional value! #iamhealthierwithownbite.me #NutritionFacts`;
      case 'progress':
        return `I'm making great progress on my health journey with OwnBite! #iamhealthierwithownbite.me #HealthGoals`;
      case 'achievement':
        return `I just earned the ${contentName} achievement on OwnBite! #iamhealthierwithownbite.me #HealthyLifestyle`;
      case 'bloodwork':
        return `I'm tracking my health metrics with OwnBite's bloodwork analysis! #iamhealthierwithownbite.me #HealthData`;
      default:
        return `Check out OwnBite - the AI-powered nutrition app that's changing how I eat! #iamhealthierwithownbite.me`;
    }
  },

  /**
   * Get provider display name
   */
  getProviderDisplayName(provider: string): string {
    switch (provider) {
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'tiktok': return 'TikTok';
      case 'twitter': return 'Twitter';
      case 'pinterest': return 'Pinterest';
      case 'linkedin': return 'LinkedIn';
      default: return provider;
    }
  },

  /**
   * Get content type display name
   */
  getContentTypeDisplayName(contentType: string): string {
    switch (contentType) {
      case 'recipe': return 'Recipe';
      case 'food_scan': return 'Food Scan';
      case 'progress': return 'Progress Update';
      case 'achievement': return 'Achievement';
      case 'bloodwork': return 'Bloodwork Results';
      default: return contentType;
    }
  }
};
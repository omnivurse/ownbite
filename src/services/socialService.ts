import { supabase } from '../lib/supabase';
import { SocialAccount, SocialShare, SocialShareRequest, SocialConnectRequest } from '../types/social';

export const socialService = {
  /**
   * Get all connected social accounts for the current user
   */
  async getConnectedAccounts(): Promise<SocialAccount[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      throw error;
    }
  },

  /**
   * Connect a social media account
   */
  async connectAccount(request: SocialConnectRequest): Promise<SocialAccount> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call the edge function to handle OAuth token exchange
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-connect`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to connect social account');
      }

      const result = await response.json();
      return result.account;
    } catch (error) {
      console.error('Error connecting social account:', error);
      throw error;
    }
  },

  /**
   * Disconnect a social media account
   */
  async disconnectAccount(accountId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('social_accounts')
        .update({ is_connected: false })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting account:', error);
      throw error;
    }
  },

  /**
   * Share content to connected social media accounts
   */
  async shareContent(request: SocialShareRequest): Promise<SocialShare[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call the edge function to handle social sharing
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-share`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to share content');
      }

      const result = await response.json();
      return result.shares;
    } catch (error) {
      console.error('Error sharing content:', error);
      throw error;
    }
  },

  /**
   * Get share history for the current user
   */
  async getShareHistory(): Promise<SocialShare[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_shares')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching share history:', error);
      throw error;
    }
  },

  /**
   * Get the sharing URL with OwnBite branding
   */
  getShareUrl(contentType: string, contentId: string): string {
    const baseUrl = 'https://ownbite.me';
    
    switch (contentType) {
      case 'recipe':
        return `${baseUrl}/r/${contentId}`;
      case 'food_scan':
        return `${baseUrl}/s/${contentId}`;
      case 'progress':
        return `${baseUrl}/p/${contentId}`;
      case 'achievement':
        return `${baseUrl}/a/${contentId}`;
      default:
        return `${baseUrl}`;
    }
  },

  /**
   * Generate share text with OwnBite branding
   */
  generateShareText(contentType: string, contentName: string): string {
    switch (contentType) {
      case 'recipe':
        return `Check out this delicious ${contentName} recipe I found on OwnBite.me! #OwnBite #HealthyEating`;
      case 'food_scan':
        return `I just scanned ${contentName} with OwnBite.me! #OwnBite #NutritionMadeEasy`;
      case 'progress':
        return `I'm making great progress on my nutrition journey with OwnBite.me! #OwnBite #HealthGoals`;
      case 'achievement':
        return `I just earned the ${contentName} achievement on OwnBite.me! #OwnBite #HealthyLifestyle`;
      default:
        return `Check out OwnBite.me - the AI-powered nutrition app! #OwnBite`;
    }
  }
};
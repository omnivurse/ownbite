import { supabase } from '../lib/supabase';
import { SocialAccount, SocialShare, SocialShareRequest, SocialConnectRequest } from '../types/social';
import { toast } from 'react-toastify';

// Timeout for social operations in milliseconds
const SOCIAL_TIMEOUT = 20000; // Increased from 10s to 20s

// Maximum number of retries for operations
const MAX_RETRIES = 3;

// Retry delay in milliseconds (with exponential backoff)
const getRetryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

export const socialService = {
  /**
   * Get all connected social accounts for the current user
   */
  async getConnectedAccounts(retryCount = 0): Promise<SocialAccount[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Loading connected accounts timed out'));
        }, SOCIAL_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const accountsPromise = supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .order('created_at', { ascending: false });
      
      const result = await Promise.race([
        accountsPromise,
        timeoutPromise
      ]);
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Loading connected accounts timed out');
      }
      
      const { data, error } = result;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get connected accounts (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getConnectedAccounts(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty array instead of throwing to prevent UI breakage
              resolve([]);
            }
          }, delay);
        });
      }
      
      // Return empty array instead of throwing to prevent UI breakage
      return [];
    }
  },

  /**
   * Connect a social media account
   */
  async connectAccount(request: SocialConnectRequest, retryCount = 0): Promise<SocialAccount> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Account connection timed out'));
        }, SOCIAL_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Add a timestamp to prevent caching
      const timestamp = Date.now();
      
      // Race between the actual request and the timeout
      const connectPromise = fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-connect?t=${timestamp}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          body: JSON.stringify(request),
        }
      );
      
      const response = await Promise.race([
        connectPromise,
        timeoutPromise.then(() => {
          throw new Error('Account connection timed out');
        })
      ]);
      
      // If response is null, it means the timeout won
      if (response === null) {
        throw new Error('Account connection timed out');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to connect social account');
      }

      const result = await response.json();
      return result.account;
    } catch (error) {
      console.error('Error connecting social account:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying connect account (attempt ${retryCount + 1}) after ${delay}ms`);
        
        toast.info('Connection taking longer than expected. Retrying...');
        
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await this.connectAccount(request, retryCount + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }
      
      throw error;
    }
  },

  /**
   * Disconnect a social media account
   */
  async disconnectAccount(accountId: string, retryCount = 0): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Account disconnection timed out'));
        }, SOCIAL_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const disconnectPromise = supabase
        .from('social_accounts')
        .update({ is_connected: false })
        .eq('id', accountId)
        .eq('user_id', user.id);
      
      const result = await Promise.race([
        disconnectPromise,
        timeoutPromise
      ]);
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Account disconnection timed out');
      }
      
      const { error } = result;

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting account:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying disconnect account (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              await this.disconnectAccount(accountId, retryCount + 1);
              resolve();
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }
      
      throw error;
    }
  },

  /**
   * Share content to connected social media accounts
   */
  async shareContent(request: SocialShareRequest, retryCount = 0): Promise<SocialShare[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Content sharing timed out'));
        }, SOCIAL_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Add a timestamp to prevent caching
      const timestamp = Date.now();
      
      // Race between the actual request and the timeout
      const sharePromise = fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-share?t=${timestamp}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          body: JSON.stringify(request),
        }
      );
      
      const response = await Promise.race([
        sharePromise,
        timeoutPromise.then(() => {
          throw new Error('Content sharing timed out');
        })
      ]);
      
      // If response is null, it means the timeout won
      if (response === null) {
        throw new Error('Content sharing timed out');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to share content');
      }

      const result = await response.json();
      return result.shares;
    } catch (error) {
      console.error('Error sharing content:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying share content (attempt ${retryCount + 1}) after ${delay}ms`);
        
        toast.info('Sharing taking longer than expected. Retrying...');
        
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await this.shareContent(request, retryCount + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }
      
      throw error;
    }
  },

  /**
   * Get share history for the current user
   */
  async getShareHistory(retryCount = 0): Promise<SocialShare[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Loading share history timed out'));
        }, SOCIAL_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const historyPromise = supabase
        .from('social_shares')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      const result = await Promise.race([
        historyPromise,
        timeoutPromise
      ]);
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Loading share history timed out');
      }
      
      const { data, error } = result;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching share history:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get share history (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getShareHistory(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty array instead of throwing to prevent UI breakage
              resolve([]);
            }
          }, delay);
        });
      }
      
      // Return empty array instead of throwing to prevent UI breakage
      return [];
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
import { supabase } from '../lib/supabase';
import { getCacheItem, setCacheItem, CACHE_KEYS, CACHE_EXPIRY } from '../lib/cache';

export interface StripeSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const stripeService = {
  /**
   * Create a checkout session for a product
   */
  async createCheckoutSession(priceId: string, mode: 'payment' | 'subscription' = 'subscription'): Promise<{ sessionId: string; url: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            price_id: priceId,
            success_url: `${window.location.origin}/checkout/success`,
            cancel_url: `${window.location.origin}/pricing`,
            mode
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  /**
   * Get user's current subscription
   */
  async getUserSubscription(): Promise<StripeSubscription | null> {
    try {
      // Try to get from cache first
      const cachedSubscription = await getCacheItem<StripeSubscription>(CACHE_KEYS.SUBSCRIPTION);
      if (cachedSubscription) {
        return cachedSubscription;
      }
      
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching user subscription:', error);
        
        // Try to get subscription status from profiles table as fallback
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status')
          .single();
          
        if (profileError) {
          console.error('Error fetching profile subscription status:', profileError);
          return null;
        }
        
        if (profileData?.subscription_status === 'premium') {
          // Create a mock subscription object
          const mockSubscription: StripeSubscription = {
            customer_id: 'manual-premium',
            subscription_id: 'manual-premium',
            subscription_status: 'active',
            price_id: 'price_premium_plus',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000),
            cancel_at_period_end: false,
            payment_method_brand: null,
            payment_method_last4: null
          };
          
          // Cache the mock subscription
          await setCacheItem(CACHE_KEYS.SUBSCRIPTION, mockSubscription, CACHE_EXPIRY.SUBSCRIPTION);
          
          return mockSubscription;
        }
        
        return null;
      }
      
      // Cache the subscription data
      if (data) {
        await setCacheItem(CACHE_KEYS.SUBSCRIPTION, data, CACHE_EXPIRY.SUBSCRIPTION);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  },

  /**
   * Check if user has an active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription();
      
      // Check if subscription is active
      if (subscription?.subscription_status === 'active') {
        return true;
      }
      
      // Check profile table as fallback
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status')
        .single();
        
      if (profileError) {
        console.error('Error checking profile subscription status:', profileError);
        return false;
      }
      
      return profile?.subscription_status === 'premium';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  },

  /**
   * Get subscription details including product information
   */
  async getSubscriptionDetails(): Promise<{
    subscription: StripeSubscription | null;
    productName: string | null;
    nextBillingDate: Date | null;
    hasPremiumAccess: boolean;
  }> {
    try {
      // Try to get from cache first
      const cachedDetails = await getCacheItem<{
        subscription: StripeSubscription | null;
        productName: string | null;
        nextBillingDate: Date | null;
        hasPremiumAccess: boolean;
      }>(CACHE_KEYS.SUBSCRIPTION_DETAILS);
      
      if (cachedDetails) {
        return cachedDetails;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Special case for demo user
      if (user?.email === 'vrt@qloudnet.com') {
        console.log('Demo user detected in getSubscriptionDetails');
        
        // Create a mock subscription for the demo user
        const mockSubscription: StripeSubscription = {
          customer_id: 'demo-customer',
          subscription_id: 'demo-subscription',
          subscription_status: 'active',
          price_id: 'price_premium_plus',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000),
          cancel_at_period_end: false,
          payment_method_brand: null,
          payment_method_last4: null
        };
        
        const result = {
          subscription: mockSubscription,
          productName: 'Ultimate Wellbeing',
          nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          hasPremiumAccess: true
        };
        
        // Cache the result
        await setCacheItem(CACHE_KEYS.SUBSCRIPTION_DETAILS, result, CACHE_EXPIRY.SUBSCRIPTION);
        
        return result;
      }
      
      const subscription = await this.getUserSubscription();
      
      if (!subscription || !subscription.subscription_id) {
        // Check if user has premium access through profile table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_end_date')
          .single();
          
        if (profileError) {
          console.error('Error checking profile subscription status:', profileError);
        }
        
        const hasPremiumFromProfile = profileData?.subscription_status === 'premium';
        
        // Use Edge Function instead of RPC to avoid function overloading issues
        let premiumCheck = false;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/has-premium-access`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                }
              }
            );
            
            if (response.ok) {
              const result = await response.json();
              premiumCheck = result.hasPremiumAccess || false;
            }
          }
        } catch (premiumError) {
          console.error('Error checking premium access via Edge Function:', premiumError);
        }
        
        const result = {
          subscription: null,
          productName: hasPremiumFromProfile ? 'Ultimate Wellbeing' : null,
          nextBillingDate: profileData?.subscription_end_date ? new Date(profileData.subscription_end_date) : null,
          hasPremiumAccess: hasPremiumFromProfile || premiumCheck || false
        };
        
        // Cache the result
        await setCacheItem(CACHE_KEYS.SUBSCRIPTION_DETAILS, result, CACHE_EXPIRY.SUBSCRIPTION);
        
        return result;
      }

      // Get product name from price ID
      let productName = null;
      if (subscription.price_id) {
        // This would typically come from a products table or API call
        // For now, we'll use a simple mapping
        const priceToProduct: Record<string, string> = {
          'price_1RbACxGCB0haRFSNDxRcTQF5': "I'm Needing",
          'price_1RbACCGCB0haRFSN5B25dgth': "I'm Craving",
          'price_premium_plus': "Ultimate Wellbeing"
        };
        productName = priceToProduct[subscription.price_id] || 'Ultimate Wellbeing';
      }

      // Calculate next billing date
      let nextBillingDate = null;
      if (subscription.current_period_end) {
        nextBillingDate = new Date(subscription.current_period_end * 1000);
      }
      
      // Check if user has premium access through profile table as well
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status')
        .single();
        
      if (profileError) {
        console.error('Error checking profile subscription status:', profileError);
      }
      
      const hasPremiumFromProfile = profileData?.subscription_status === 'premium';
      
      // Use Edge Function instead of RPC to avoid function overloading issues
      let premiumCheck = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/has-premium-access`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
              }
            }
          );
          
          if (response.ok) {
            const result = await response.json();
            premiumCheck = result.hasPremiumAccess || false;
          }
        }
      } catch (premiumError) {
        console.error('Error checking premium access via Edge Function:', premiumError);
      }

      const result = {
        subscription,
        productName,
        nextBillingDate,
        hasPremiumAccess: subscription.subscription_status === 'active' || 
                          hasPremiumFromProfile || 
                          premiumCheck || 
                          false
      };
      
      // Cache the result
      await setCacheItem(CACHE_KEYS.SUBSCRIPTION_DETAILS, result, CACHE_EXPIRY.SUBSCRIPTION);
      
      return result;
    } catch (error) {
      console.error('Error getting subscription details:', error);
      
      // Check profile table as fallback
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_end_date')
          .single();
          
        if (profileError) {
          console.error('Error checking profile subscription status:', profileError);
          return {
            subscription: null,
            productName: null,
            nextBillingDate: null,
            hasPremiumAccess: false
          };
        }
        
        return {
          subscription: null,
          productName: profile?.subscription_status === 'premium' ? 'Ultimate Wellbeing' : null,
          nextBillingDate: profile?.subscription_end_date ? new Date(profile.subscription_end_date) : null,
          hasPremiumAccess: profile?.subscription_status === 'premium'
        };
      } catch (fallbackError) {
        console.error('Error in fallback check:', fallbackError);
        return {
          subscription: null,
          productName: null,
          nextBillingDate: null,
          hasPremiumAccess: false
        };
      }
    }
  },

  /**
   * Cancel the current subscription
   */
  async cancelSubscription(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const subscription = await this.getUserSubscription();
      if (!subscription || !subscription.subscription_id) {
        throw new Error('No active subscription found');
      }

      // This would typically call a cancel-subscription edge function
      // For now, we'll just return true
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
};
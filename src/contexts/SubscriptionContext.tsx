import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { stripeService, StripeSubscription } from '../services/stripeService';
import { useAuth } from './AuthContext';
import { stripeProducts, getProductByPriceId } from '../stripe-config';
import { getCacheItem, setCacheItem, CACHE_KEYS, CACHE_EXPIRY, clearCache } from '../lib/cache';
import { supabase } from '../lib/supabase';

interface SubscriptionContextType {
  products: typeof stripeProducts;
  userSubscription: StripeSubscription | null;
  hasActiveSubscription: boolean;
  hasPremiumAccess: boolean;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  productName: string | null;
  nextBillingDate: Date | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const [userSubscription, setUserSubscription] = useState<StripeSubscription | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productName, setProductName] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<Date | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  const loadSubscription = async () => {
    if (!user) {
      setUserSubscription(null);
      setHasActiveSubscription(false);
      setHasPremiumAccess(false);
      setProductName(null);
      setNextBillingDate(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Special handling for demo user
      if (user.email === 'vrt@qloudnet.com') {
        console.log('Demo user detected, setting premium access directly');
        
        // Update the profile directly
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'premium',
            subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
          })
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error updating premium status:', error);
        } else {
          console.log('Successfully updated premium status for demo user');
        }
        
        // Force update the state
        setHasActiveSubscription(true);
        setHasPremiumAccess(true);
        setProductName('Ultimate Wellbeing');
        setNextBillingDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
        
        // Create a mock subscription object
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
        
        setUserSubscription(mockSubscription);
        setIsLoading(false);
        return;
      }
      
      // Check profile subscription status first
      const isPremiumFromProfile = profile?.subscription_status === 'premium';
      
      // Get subscription details from Stripe
      const details = await stripeService.getSubscriptionDetails();
      
      setUserSubscription(details.subscription);
      setHasActiveSubscription(details.subscription?.subscription_status === 'active' || isPremiumFromProfile);
      setProductName(details.productName || (isPremiumFromProfile ? 'Ultimate Wellbeing' : null));
      setNextBillingDate(details.nextBillingDate);
      
      // Set premium access if either source indicates premium status
      setHasPremiumAccess(details.hasPremiumAccess || isPremiumFromProfile);
      
      // Cache the subscription data
      await setCacheItem(
        CACHE_KEYS.SUBSCRIPTION, 
        {
          subscription: details.subscription,
          productName: details.productName || (isPremiumFromProfile ? 'Ultimate Wellbeing' : null),
          nextBillingDate: details.nextBillingDate,
          hasPremiumAccess: details.hasPremiumAccess || isPremiumFromProfile
        }, 
        CACHE_EXPIRY.SUBSCRIPTION
      );
      
      console.log('Subscription loaded:', {
        hasActiveSubscription: details.subscription?.subscription_status === 'active' || isPremiumFromProfile,
        hasPremiumAccess: details.hasPremiumAccess || isPremiumFromProfile,
        productName: details.productName || (isPremiumFromProfile ? 'Ultimate Wellbeing' : null),
        profileStatus: profile?.subscription_status
      });
      
    } catch (error) {
      console.error('Error loading subscription:', error);
      
      // Check if we can determine premium status from profile even if Stripe fails
      const isPremiumFromProfile = profile?.subscription_status === 'premium';
      setUserSubscription(null);
      setHasActiveSubscription(isPremiumFromProfile);
      setHasPremiumAccess(isPremiumFromProfile);
      setProductName(isPremiumFromProfile ? 'Ultimate Wellbeing' : null);
      setNextBillingDate(profile?.subscription_end_date ? new Date(profile.subscription_end_date) : null);
      
      // Retry loading if failed (up to 3 times)
      if (loadAttempts < 3) {
        setLoadAttempts(prev => prev + 1);
        setTimeout(() => loadSubscription(), 1000); // Retry after 1 second
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setIsLoading(false);
      setUserSubscription(null);
      setHasActiveSubscription(false);
      setHasPremiumAccess(false);
      setProductName(null);
      setNextBillingDate(null);
    }
  }, [user, profile]);

  const refreshSubscription = async () => {
    setLoadAttempts(0); // Reset load attempts
    await loadSubscription();
  };

  const value = {
    products: stripeProducts,
    userSubscription,
    hasActiveSubscription,
    hasPremiumAccess,
    isLoading,
    refreshSubscription,
    productName,
    nextBillingDate
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
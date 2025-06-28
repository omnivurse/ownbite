import { supabase } from '../lib/supabase';

export interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  full_name: string;
  bio: string;
  social_links: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
  };
  created_at: string;
  approved: boolean;
}

export interface Referral {
  id: string;
  referred_user_id: string;
  affiliate_id: string;
  joined_at: string;
  source: string;
  hashtag: string;
}

export interface Commission {
  id: string;
  affiliate_id: string;
  referral_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  generated_at: string;
  paid_at: string | null;
}

export interface AffiliateDashboard {
  affiliate: Affiliate;
  stats: {
    total_referrals: number;
    total_earnings: number;
    pending_earnings: number;
    paid_earnings: number;
  };
  recent_referrals: Referral[];
  recent_commissions: Commission[];
}

export const affiliateService = {
  /**
   * Get the current user's affiliate profile
   */
  async getAffiliateProfile(): Promise<Affiliate | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching affiliate profile:', error);
      return null;
    }
  },

  /**
   * Create or update an affiliate profile
   */
  async upsertAffiliateProfile(profile: Partial<Affiliate>): Promise<Affiliate> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('affiliates')
          .update({
            ...profile,
            user_id: user.id
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Generate a unique referral code if not provided
        if (!profile.referral_code) {
          profile.referral_code = await this.generateUniqueReferralCode(profile.full_name || user.email || '');
        }

        // Create new profile
        const { data, error } = await supabase
          .from('affiliates')
          .insert({
            ...profile,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error upserting affiliate profile:', error);
      throw error;
    }
  },

  /**
   * Generate a unique referral code based on name
   */
  async generateUniqueReferralCode(name: string): Promise<string> {
    // Convert name to a code-friendly format
    let baseCode = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
      .substring(0, 8); // Limit length
    
    if (baseCode.length < 3) {
      baseCode = 'ref'; // Fallback for very short names
    }
    
    // Add random suffix
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    let referralCode = `${baseCode}${randomSuffix}`;
    
    // Check if code already exists
    let codeExists = true;
    let attempts = 0;
    
    while (codeExists && attempts < 5) {
      const { data } = await supabase
        .from('affiliates')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (!data) {
        codeExists = false;
      } else {
        // Try a different random suffix
        const newSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        referralCode = `${baseCode}${newSuffix}`;
        attempts++;
      }
    }
    
    return referralCode;
  },

  /**
   * Get affiliate dashboard data
   */
  async getAffiliateDashboard(): Promise<AffiliateDashboard | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_affiliate_dashboard');

      if (error) throw error;
      if (!data.success) {
        console.warn('User is not an affiliate:', data.message);
        return null;
      }

      return {
        affiliate: data.affiliate,
        stats: data.stats,
        recent_referrals: data.recent_referrals || [],
        recent_commissions: data.recent_commissions || []
      };
    } catch (error) {
      console.error('Error fetching affiliate dashboard:', error);
      return null;
    }
  },

  /**
   * Track a referral
   */
  async trackReferral(
    referralCode: string,
    source?: string
  ): Promise<{ success: boolean; message: string; referral_id?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call the track_referral function with the correct parameters
      const { data, error } = await supabase.rpc('track_referral', {
        p_referral_code: referralCode,
        p_referred_user_id: user.id,
        p_source: source || 'direct'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking referral:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to track referral'
      };
    }
  },

  /**
   * Check if a referral code is valid
   */
  async validateReferralCode(referralCode: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('validate_referral_code', {
          p_referral_code: referralCode
        });

      if (error) return false;
      return !!data;
    } catch (error) {
      console.error('Error validating referral code:', error);
      return false;
    }
  },

  /**
   * Get all referrals for the current affiliate
   */
  async getReferrals(): Promise<Referral[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!affiliate) return [];

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }
  },

  /**
   * Get all commissions for the current affiliate
   */
  async getCommissions(): Promise<Commission[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!affiliate) return [];

      const { data, error } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching commissions:', error);
      return [];
    }
  }
};
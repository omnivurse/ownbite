import { supabase } from '../lib/supabase';

export interface AdminAffiliate {
  id: string;
  user_id: string;
  referral_code: string;
  full_name: string;
  bio: string;
  social_links: Record<string, string>;
  approved: boolean;
  created_at: string;
  email: string;
}

export const adminService = {
  /**
   * Get all affiliates (admin only)
   */
  async getAllAffiliates(): Promise<AdminAffiliate[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_affiliates');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all affiliates:', error);
      throw error;
    }
  },
  
  /**
   * Approve an affiliate
   */
  async approveAffiliate(affiliateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ approved: true })
        .eq('id', affiliateId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error approving affiliate:', error);
      throw error;
    }
  },
  
  /**
   * Reject an affiliate
   */
  async rejectAffiliate(affiliateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ approved: false })
        .eq('id', affiliateId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting affiliate:', error);
      throw error;
    }
  },
  
  /**
   * Get affiliate details
   */
  async getAffiliateDetails(affiliateId: string): Promise<AdminAffiliate> {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select(`
          id,
          user_id,
          referral_code,
          full_name,
          bio,
          social_links,
          approved,
          created_at
        `)
        .eq('id', affiliateId)
        .single();
      
      if (error) throw error;
      
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', data.user_id)
        .single();
      
      if (userError) throw userError;
      
      return {
        ...data,
        email: userData?.email || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching affiliate details:', error);
      throw error;
    }
  },
  
  /**
   * Get affiliate statistics
   */
  async getAffiliateStats(affiliateId: string): Promise<{
    referralCount: number;
    conversionCount: number;
    totalEarnings: number;
  }> {
    try {
      // Get referral count
      const { count: referralCount, error: referralError } = await supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('affiliate_id', affiliateId);
      
      if (referralError) throw referralError;
      
      // Get conversion count (referrals that resulted in a commission)
      const { count: conversionCount, error: conversionError } = await supabase
        .from('affiliate_commissions')
        .select('id', { count: 'exact', head: true })
        .eq('affiliate_id', affiliateId);
      
      if (conversionError) throw conversionError;
      
      // Get total earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliate_commissions')
        .select('amount')
        .eq('affiliate_id', affiliateId);
      
      if (earningsError) throw earningsError;
      
      const totalEarnings = earningsData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      
      return {
        referralCount: referralCount || 0,
        conversionCount: conversionCount || 0,
        totalEarnings
      };
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
      throw error;
    }
  }
};
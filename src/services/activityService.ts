import { supabase } from '../lib/supabase';

export interface ActivityLog {
  id?: string;
  user_id?: string;
  date: string;
  sitting_hours: number;
  driving_hours: number;
  screen_time_hours: number;
  screen_time_breakdown: {
    social_media: number;
    work: number;
    entertainment: number;
    education: number;
  };
  sleep_hours: number;
  created_at?: string;
  updated_at?: string;
}

export interface NutritionLog {
  id?: string;
  user_id?: string;
  date: string;
  hydration_pct: number;
  created_at?: string;
}

export interface FoodLog {
  id?: string;
  user_id?: string;
  date: string;
  is_fast_food: boolean;
  created_at?: string;
}

export interface SubstanceLog {
  id?: string;
  user_id?: string;
  date: string;
  substance_type: string;
  amount: number;
  created_at?: string;
}

export interface DietSpending {
  id?: string;
  user_id?: string;
  date: string;
  amount: number;
  category: string;
  created_at?: string;
}

export const activityService = {
  /**
   * Save activity log
   */
  async saveActivityLog(log: ActivityLog): Promise<ActivityLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('activity_logs')
      .upsert({
        user_id: user.id,
        ...log,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get activity log for a specific date
   */
  async getActivityLog(date: string): Promise<ActivityLog | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Save nutrition log
   */
  async saveNutritionLog(log: NutritionLog): Promise<NutritionLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('nutrition_logs')
      .upsert({
        user_id: user.id,
        ...log
      }, { onConflict: 'user_id, date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Save food log
   */
  async saveFoodLog(log: FoodLog): Promise<FoodLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('food_logs')
      .upsert({
        user_id: user.id,
        ...log
      }, { onConflict: 'user_id, date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Save substance log
   */
  async saveSubstanceLog(log: SubstanceLog): Promise<SubstanceLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('substance_logs')
      .upsert({
        user_id: user.id,
        ...log
      }, { onConflict: 'user_id, date, substance_type' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Save diet spending
   */
  async saveDietSpending(spending: DietSpending): Promise<DietSpending> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('diet_spending')
      .upsert({
        user_id: user.id,
        ...spending
      }, { onConflict: 'user_id, date, category' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get weekly activity summary
   */
  async getWeeklySummary(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase.rpc('get_kpi_dashboard', {
        p_user_id: user.id,
        p_timeframe: 'week'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      throw error;
    }
  }
};
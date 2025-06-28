import { supabase } from '../lib/supabase';

export interface NutritionGoals {
  user_id: string;
  calories_goal: number;
  protein_goal_g: number;
  fat_goal_g: number;
  carbs_goal_g: number;
  gender?: 'male' | 'female' | 'other';
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal_type?: 'maintain' | 'lose' | 'gain';
  created_at: string;
  updated_at: string;
}

export interface DailyGoalLog {
  user_id: string;
  log_date: string;
  actual_calories: number;
  actual_protein_g: number;
  actual_fat_g: number;
  actual_carbs_g: number;
  met_calories_goal: boolean;
  met_protein_goal: boolean;
  met_fat_goal: boolean;
  met_carbs_goal: boolean;
  overall_goal_met: boolean;
  created_at: string;
}

export interface RecommendedGoals {
  calories_goal: number;
  protein_goal_g: number;
  fat_goal_g: number;
  carbs_goal_g: number;
}

export const nutritionGoalsService = {
  /**
   * Get user's nutrition goals
   */
  async getUserGoals(): Promise<NutritionGoals | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  /**
   * Create or update user's nutrition goals
   */
  async upsertGoals(goals: Partial<NutritionGoals>): Promise<NutritionGoals> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('nutrition_goals')
      .upsert({
        user_id: user.id,
        ...goals,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Calculate recommended goals based on user profile
   */
  async calculateRecommendedGoals(profile: {
    gender: 'male' | 'female' | 'other';
    weight_kg: number;
    height_cm: number;
    age: number;
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    goal_type: 'maintain' | 'lose' | 'gain';
  }): Promise<RecommendedGoals> {
    const { data, error } = await supabase.rpc('calculate_recommended_goals', {
      p_gender: profile.gender,
      p_weight_kg: profile.weight_kg,
      p_height_cm: profile.height_cm,
      p_age: profile.age,
      p_activity_level: profile.activity_level,
      p_goal_type: profile.goal_type
    });

    if (error) throw error;
    return data;
  },

  /**
   * Update daily goal log for a specific date
   */
  async updateDailyLog(date?: Date): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const logDate = date || new Date();
    const { error } = await supabase.rpc('update_daily_goal_log', {
      p_user_id: user.id,
      p_date: logDate.toISOString().split('T')[0]
    });

    if (error) throw error;
  },

  /**
   * Get daily goal logs for a date range
   */
  async getDailyLogs(startDate: Date, endDate: Date): Promise<DailyGoalLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('daily_goal_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .lte('log_date', endDate.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get current streak of consecutive days meeting goals
   */
  async getCurrentStreak(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('daily_goal_logs')
      .select('log_date, overall_goal_met')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(30);

    if (error) throw error;

    let streak = 0;
    for (const log of data || []) {
      if (log.overall_goal_met) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  /**
   * Get goal progress for today
   */
  async getTodayProgress(): Promise<{
    goals: NutritionGoals | null;
    actual: { calories: number; protein: number; carbs: number; fat: number };
    progress: { calories: number; protein: number; carbs: number; fat: number };
  }> {
    const goals = await this.getUserGoals();
    
    // Get today's totals from food entries
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: entries, error } = await supabase
      .from('food_entries')
      .select('calories, protein, carbs, fat')
      .eq('user_id', user.id)
      .gte('timestamp', today.toISOString())
      .lt('timestamp', tomorrow.toISOString());

    if (error) throw error;

    const actual = (entries || []).reduce(
      (totals, entry) => ({
        calories: totals.calories + (Number(entry.calories) || 0),
        protein: totals.protein + (Number(entry.protein) || 0),
        carbs: totals.carbs + (Number(entry.carbs) || 0),
        fat: totals.fat + (Number(entry.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const progress = goals ? {
      calories: Math.min((actual.calories / goals.calories_goal) * 100, 100),
      protein: Math.min((actual.protein / goals.protein_goal_g) * 100, 100),
      carbs: Math.min((actual.carbs / goals.carbs_goal_g) * 100, 100),
      fat: Math.min((actual.fat / goals.fat_goal_g) * 100, 100),
    } : { calories: 0, protein: 0, carbs: 0, fat: 0 };

    return { goals, actual, progress };
  }
};
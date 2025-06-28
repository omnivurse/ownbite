import { supabase } from '../lib/supabase';
import { nutritionGoalsService } from './nutritionGoalsService';
import { v4 as uuidv4 } from 'uuid';

export interface FoodEntry {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  timestamp: string;
}

export interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const diaryService = {
  /**
   * Get all food entries for a specific date
   */
  async getFoodEntries(date: Date): Promise<FoodEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .gte('timestamp', startOfDay.toISOString())
      .lte('timestamp', endOfDay.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Add a new food entry
   */
  async addFoodEntry(entry: Omit<FoodEntry, 'id' | 'user_id'>): Promise<FoodEntry> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const newEntry = {
      id: uuidv4(),
      user_id: user.data.user.id,
      ...entry
    };

    const { data, error } = await supabase
      .from('food_entries')
      .insert([newEntry])
      .select()
      .single();

    if (error) throw error;

    // Update daily goal log after adding entry
    try {
      await nutritionGoalsService.updateDailyLog(new Date(entry.timestamp));
    } catch (goalError) {
      console.warn('Failed to update daily goal log:', goalError);
      // Don't throw error here as the entry was successfully added
    }

    return data;
  },

  /**
   * Get daily summary for a specific date
   */
  async getDailySummary(date: Date): Promise<DailySummary> {
    const entries = await this.getFoodEntries(date);
    
    return entries.reduce((summary, entry) => ({
      calories: summary.calories + (Number(entry.calories) || 0),
      protein: summary.protein + (Number(entry.protein) || 0),
      carbs: summary.carbs + (Number(entry.carbs) || 0),
      fat: summary.fat + (Number(entry.fat) || 0)
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
  },

  /**
   * Delete a food entry
   */
  async deleteFoodEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('food_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update daily goal log after deleting entry
    try {
      await nutritionGoalsService.updateDailyLog(new Date());
    } catch (goalError) {
      console.warn('Failed to update daily goal log:', goalError);
    }
  }
};
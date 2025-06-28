import { supabase } from '../lib/supabase';

interface NutritionData {
  dailySummary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recentEntries?: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    timestamp: string;
  }>;
}

export const coachService = {
  /**
   * Get personalized nutrition advice from Gemini AI
   */
  async getNutritionAdvice(data: NutritionData): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nutricoach`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get nutrition advice');
    }

    const { advice } = await response.json();
    return advice;
  },

  /**
   * Get meal suggestions based on current nutrition data
   */
  async getMealSuggestions(data: NutritionData): Promise<string> {
    // Implementation coming soon
    throw new Error('Not implemented');
  },

  /**
   * Get personalized health tips
   */
  async getHealthTips(data: NutritionData): Promise<string> {
    // Implementation coming soon
    throw new Error('Not implemented');
  }
};
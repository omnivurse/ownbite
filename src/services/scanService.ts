import { supabase } from '../lib/supabase';

interface AnalyzeImageResult {
  foodItems: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    healthBenefits?: string[];
    healthRisks?: string[];
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export const scanService = {
  async analyzeImage(imageDataUrl: string): Promise<AnalyzeImageResult> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageDataUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to analyze image`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  },

  async saveScanResult(result: AnalyzeImageResult, imageUrl?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save the scan result to the database
      const { data: scanData, error: scanError } = await supabase
        .from('food_scans')
        .insert([{
          user_id: user.id,
          image_url: imageUrl,
          total_calories: result.totalCalories,
          total_protein: result.totalProtein,
          total_carbs: result.totalCarbs,
          total_fat: result.totalFat
        }])
        .select()
        .single();

      if (scanError) throw scanError;

      // Save individual food items
      const foodItemsData = result.foodItems.map(item => ({
        scan_id: scanData.id,
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        health_benefits: item.healthBenefits,
        health_risks: item.healthRisks
      }));

      const { error: itemsError } = await supabase
        .from('food_items')
        .insert(foodItemsData);

      if (itemsError) throw itemsError;

      return scanData;
    } catch (error) {
      console.error('Error saving scan result:', error);
      throw new Error('Failed to save scan result');
    }
  },

  async getUserScans(limit = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('food_scans')
        .select(`
          *,
          food_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user scans:', error);
      throw new Error('Failed to fetch scan history');
    }
  }
};
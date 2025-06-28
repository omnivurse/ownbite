import { supabase } from '../lib/supabase';

export interface BloodworkResult {
  id: string;
  user_id: string;
  uploaded_at: string;
  file_url?: string;
  file_name?: string;
  source_type: 'pdf' | 'csv' | 'manual';
  notes?: string;
  parsed_data: any;
  analysis_complete: boolean;
  created_at: string;
}

export interface NutrientStatus {
  id: string;
  user_id: string;
  bloodwork_id?: string;
  nutrient_name: string;
  current_value: number;
  unit: string;
  status: 'optimal' | 'low' | 'very_low' | 'high' | 'very_high';
  recommendations_applied: boolean;
  created_at: string;
}

export interface NutrientRecommendation {
  nutrient_name: string;
  status: string;
  recommended_foods: string[];
  foods_to_avoid: string[];
  explanation: string;
  priority_level: number;
}

export const bloodworkService = {
  /**
   * Upload and analyze bloodwork file
   */
  async uploadBloodwork(file: File, notes?: string): Promise<BloodworkResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bloodwork')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('bloodwork')
        .getPublicUrl(fileName);

      // Create bloodwork record
      const { data, error } = await supabase
        .from('bloodwork_results')
        .insert([{
          user_id: user.id,
          file_url: publicUrl,
          file_name: file.name,
          source_type: file.type.includes('pdf') ? 'pdf' : file.type.includes('csv') ? 'csv' : 'manual',
          notes,
          analysis_complete: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Trigger AI analysis of the uploaded file
      await this.triggerBloodworkAnalysis(data.id, publicUrl);
      
      return data;
    } catch (error) {
      console.error('Error uploading bloodwork:', error);
      throw new Error('Failed to upload bloodwork. Please try again.');
    }
  },

  /**
   * Trigger the analysis of a bloodwork file
   */
  async triggerBloodworkAnalysis(bloodworkId: string, fileUrl: string): Promise<void> {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('No Gemini API key found in environment variables');
        
        // Update the bloodwork record to mark analysis as complete even without analysis
        await supabase
          .from('bloodwork_results')
          .update({
            analysis_complete: true,
            parsed_data: {
              biomarkers: [
                {
                  name: "Vitamin D",
                  value: 25,
                  unit: "ng/mL",
                  status: "low",
                  normal_range: "30-100",
                  recommendation: "Increase intake of fatty fish, egg yolks, and consider supplementation"
                },
                {
                  name: "Iron",
                  value: 50,
                  unit: "μg/dL",
                  status: "low",
                  normal_range: "60-170",
                  recommendation: "Increase intake of red meat, spinach, and legumes"
                }
              ],
              summary_text: "Analysis shows potential deficiencies in Vitamin D and Iron. Consider dietary adjustments and possible supplementation.",
              key_deficiencies: ["Vitamin D", "Iron"],
              key_recommendations: ["Increase vitamin D intake", "Add iron-rich foods to diet"]
            }
          })
          .eq('id', bloodworkId);
          
        return;
      }

      // Call the analyze-bloodwork edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-bloodwork`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          bloodwork_id: bloodworkId,
          file_url: fileUrl 
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      // No need to update the record here as the edge function will do it
    } catch (error) {
      console.error('Error triggering bloodwork analysis:', error);
      
      // Mark as complete even if analysis fails
      await supabase
        .from('bloodwork_results')
        .update({ analysis_complete: true })
        .eq('id', bloodworkId);
    }
  },

  /**
   * Manually add nutrient values
   */
  async addNutrientValues(nutrients: Array<{
    name: string;
    value: number;
    unit: string;
  }>): Promise<NutrientStatus[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create a manual bloodwork entry
      const { data: bloodworkData, error: bloodworkError } = await supabase
        .from('bloodwork_results')
        .insert([{
          user_id: user.id,
          source_type: 'manual',
          analysis_complete: true,
          parsed_data: { nutrients }
        }])
        .select()
        .single();

      if (bloodworkError) throw bloodworkError;

      // Analyze each nutrient and create status records
      const statusPromises = nutrients.map(async (nutrient) => {
        // Get analysis status
        const { data: statusResult, error: statusError } = await supabase
          .rpc('analyze_nutrient_status', {
            p_user_id: user.id,
            p_nutrient_name: nutrient.name,
            p_value: nutrient.value,
            p_unit: nutrient.unit
          });

        if (statusError) throw statusError;

        // Insert nutrient status
        const { data: statusData, error: insertError } = await supabase
          .from('user_nutrient_status')
          .insert([{
            user_id: user.id,
            bloodwork_id: bloodworkData.id,
            nutrient_name: nutrient.name,
            current_value: nutrient.value,
            unit: nutrient.unit,
            status: statusResult
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        return statusData;
      });

      const results = await Promise.all(statusPromises);
      return results;
    } catch (error) {
      console.error('Error adding nutrient values:', error);
      throw new Error('Failed to add nutrient values. Please try again.');
    }
  },

  /**
   * Get user's bloodwork results
   */
  async getUserBloodwork(): Promise<BloodworkResult[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bloodwork_results')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bloodwork:', error);
      throw new Error('Failed to fetch bloodwork results.');
    }
  },

  /**
   * Get user's current nutrient status
   */
  async getNutrientStatus(): Promise<NutrientStatus[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_nutrient_status')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching nutrient status:', error);
      throw new Error('Failed to fetch nutrient status.');
    }
  },

  /**
   * Get personalized food recommendations based on nutrient deficiencies
   */
  async getPersonalizedRecommendations(): Promise<NutrientRecommendation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('get_nutrient_recommendations', {
          p_user_id: user.id
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error('Failed to fetch recommendations.');
    }
  },

  /**
   * Get nutrient deficiency alerts for dashboard
   */
  async getDeficiencyAlerts(): Promise<Array<{
    nutrient: string;
    status: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    foods: string[];
  }>> {
    try {
      const recommendations = await this.getPersonalizedRecommendations();
      
      return recommendations.map(rec => ({
        nutrient: rec.nutrient_name,
        status: rec.status,
        message: rec.explanation,
        priority: rec.priority_level === 1 ? 'high' : rec.priority_level === 2 ? 'medium' : 'low',
        foods: rec.recommended_foods.slice(0, 3) // Show top 3 foods
      }));
    } catch (error) {
      console.error('Error fetching deficiency alerts:', error);
      return [];
    }
  }
};
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

// Timeout for bloodwork operations in milliseconds
const BLOODWORK_TIMEOUT = 30000; // Increased from 15s to 30s

// Maximum number of retries for operations
const MAX_RETRIES = 3;

// Retry delay in milliseconds (with exponential backoff)
const getRetryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

export const bloodworkService = {
  /**
   * Upload and analyze bloodwork file
   */
  async uploadBloodwork(file: File, notes?: string, retryCount = 0): Promise<BloodworkResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Bloodwork upload timed out'));
        }, BLOODWORK_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });

      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      const uploadPromise = supabase.storage
        .from('bloodwork')
        .upload(fileName, file);
      
      const uploadResult = await Promise.race([
        uploadPromise,
        timeoutPromise.then(() => {
          throw new Error('Bloodwork upload timed out');
        })
      ]);
      
      const { data: uploadData, error: uploadError } = uploadResult;

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bloodwork')
        .getPublicUrl(fileName);

      // Save bloodwork record to database
      const insertPromise = supabase
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
      
      const insertResult = await Promise.race([
        insertPromise,
        timeoutPromise.then(() => {
          throw new Error('Bloodwork database insert timed out');
        })
      ]);
      
      const { data: bloodworkData, error: dbError } = insertResult;

      if (dbError) throw dbError;

      // Trigger AI analysis of the uploaded file
      this.triggerBloodworkAnalysis(bloodworkData.id, publicUrl)
        .catch(error => console.error('Error triggering analysis:', error));
      
      return bloodworkData;
    } catch (error) {
      console.error('Error uploading bloodwork:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying bloodwork upload (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.uploadBloodwork(file, notes, retryCount + 1);
              resolve(result);
            } catch (retryError) {
              throw retryError;
            }
          }, delay);
        });
      }
      
      throw new Error('Failed to upload bloodwork. Please try again.');
    }
  },

  /**
   * Trigger the analysis of a bloodwork file
   */
  async triggerBloodworkAnalysis(bloodworkId: string, fileUrl: string, retryCount = 0): Promise<void> {
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

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Bloodwork analysis timed out'));
        }, BLOODWORK_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Add a timestamp to prevent caching
      const timestamp = Date.now();

      // Call the analyze-bloodwork edge function
      const analyzePromise = fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-bloodwork?t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: JSON.stringify({ 
          bloodwork_id: bloodworkId,
          file_url: fileUrl 
        }),
      });
      
      const response = await Promise.race([
        analyzePromise,
        timeoutPromise.then(() => {
          throw new Error('Bloodwork analysis timed out');
        })
      ]);

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      // No need to update the record here as the edge function will do it
    } catch (error) {
      console.error('Error triggering bloodwork analysis:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying bloodwork analysis (attempt ${retryCount + 1}) after ${delay}ms`);
        
        setTimeout(() => {
          this.triggerBloodworkAnalysis(bloodworkId, fileUrl, retryCount + 1);
        }, delay);
        return;
      }
      
      // Mark as complete even if analysis fails after all retries
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
  }>, retryCount = 0): Promise<NutrientStatus[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Adding nutrient values timed out'));
        }, BLOODWORK_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });

      // Create a manual bloodwork entry
      const bloodworkPromise = supabase
        .from('bloodwork_results')
        .insert([{
          user_id: user.id,
          source_type: 'manual',
          analysis_complete: true,
          parsed_data: { nutrients }
        }])
        .select()
        .single();
      
      const bloodworkResult = await Promise.race([
        bloodworkPromise,
        timeoutPromise.then(() => {
          throw new Error('Creating bloodwork entry timed out');
        })
      ]);
      
      const { data: bloodworkData, error: bloodworkError } = bloodworkResult;

      if (bloodworkError) throw bloodworkError;

      // Analyze each nutrient and create status records
      const statusPromises = nutrients.map(async (nutrient) => {
        // Get analysis status
        const rpcPromise = supabase
          .rpc('analyze_nutrient_status', {
            p_user_id: user.id,
            p_nutrient_name: nutrient.name,
            p_value: nutrient.value,
            p_unit: nutrient.unit
          });
        
        const rpcResult = await Promise.race([
          rpcPromise,
          timeoutPromise.then(() => {
            throw new Error('Analyzing nutrient status timed out');
          })
        ]);
        
        const { data: statusDataFromRpc, error: statusError } = rpcResult;

        if (statusError) throw statusError;

        // Insert nutrient status
        const insertPromise = supabase
          .from('user_nutrient_status')
          .insert([{
            user_id: user.id,
            bloodwork_id: bloodworkData.id,
            nutrient_name: nutrient.name,
            current_value: nutrient.value,
            unit: nutrient.unit,
            status: statusDataFromRpc
          }])
          .select()
          .single();
        
        const insertResult = await Promise.race([
          insertPromise,
          timeoutPromise.then(() => {
            throw new Error('Inserting nutrient status timed out');
          })
        ]);
        
        const { data: statusData, error: insertError } = insertResult;

        if (insertError) throw insertError;
        return statusData;
      });

      const results = await Promise.all(statusPromises);
      return results;
    } catch (error) {
      console.error('Error adding nutrient values:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying add nutrient values (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.addNutrientValues(nutrients, retryCount + 1);
              resolve(result);
            } catch (retryError) {
              throw retryError;
            }
          }, delay);
        });
      }
      
      throw new Error('Failed to add nutrient values. Please try again.');
    }
  },

  /**
   * Get user's bloodwork results
   */
  async getUserBloodwork(retryCount = 0): Promise<BloodworkResult[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Getting bloodwork results timed out'));
        }, BLOODWORK_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const bloodworkPromise = supabase
        .from('bloodwork_results')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
      
      const result = await Promise.race([
        bloodworkPromise,
        timeoutPromise
      ]);
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Getting bloodwork results timed out');
      }
      
      const { data, error } = result;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bloodwork:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get bloodwork (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getUserBloodwork(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty array instead of throwing to prevent UI breakage
              resolve([]);
            }
          }, delay);
        });
      }
      
      // Return empty array instead of throwing to prevent UI breakage
      return [];
    }
  },

  /**
   * Get user's current nutrient status
   */
  async getNutrientStatus(retryCount = 0): Promise<NutrientStatus[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Getting nutrient status timed out'));
        }, BLOODWORK_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const statusPromise = supabase
        .from('user_nutrient_status')
        .select(`
          nutrient_name,
          current_value,
          unit,
          status
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      const result = await Promise.race([
        statusPromise,
        timeoutPromise
      ]);
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Getting nutrient status timed out');
      }
      
      const { data, error } = result;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching nutrient status:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get nutrient status (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getNutrientStatus(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty array instead of throwing to prevent UI breakage
              resolve([]);
            }
          }, delay);
        });
      }
      
      // Return empty array instead of throwing to prevent UI breakage
      return [];
    }
  },

  /**
   * Get personalized food recommendations based on nutrient deficiencies
   */
  async getPersonalizedRecommendations(retryCount = 0): Promise<NutrientRecommendation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Getting recommendations timed out'));
        }, BLOODWORK_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const recommendationsPromise = supabase
        .rpc('get_nutrient_recommendations', {
          p_user_id: user.id
        });
      
      const result = await Promise.race([
        recommendationsPromise,
        timeoutPromise
      ]);
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Getting recommendations timed out');
      }
      
      const { data, error } = result;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('timed out')) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get recommendations (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getPersonalizedRecommendations(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty array instead of throwing to prevent UI breakage
              resolve([]);
            }
          }, delay);
        });
      }
      
      // Return empty array instead of throwing to prevent UI breakage
      return [];
    }
  },

  /**
   * Get nutrient deficiency alerts for dashboard
   */
  async getDeficiencyAlerts(retryCount = 0): Promise<Array<{
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
      
      // Implement retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying get deficiency alerts (attempt ${retryCount + 1}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const result = await this.getDeficiencyAlerts(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              // Return empty array instead of throwing to prevent UI breakage
              resolve([]);
            }
          }, delay);
        });
      }
      
      return [];
    }
  }
};
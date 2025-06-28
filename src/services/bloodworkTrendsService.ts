import { supabase } from '../lib/supabase';

export interface BloodworkTrend {
  id: string;
  user_id: string;
  biomarker: string;
  value: number;
  unit: string;
  taken_at: string;
  created_at: string;
}

export interface TrendSummary {
  biomarker: string;
  current_value: number;
  previous_value?: number;
  change_percent?: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'no_trend';
  unit: string;
  status: 'optimal' | 'low' | 'very_low' | 'high' | 'very_high';
  alerts: string[];
  reading_count: number;
}

export interface NutrientRange {
  nutrient_name: string;
  min_value: number;
  max_value: number;
  optimal_min?: number;
  optimal_max?: number;
  unit: string;
}

export const bloodworkTrendsService = {
  /**
   * Get all trend data points for a specific biomarker
   */
  async getTrendData(biomarker: string, months: number = 12): Promise<BloodworkTrend[]> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const { data, error } = await supabase
        .from('bloodwork_trends')
        .select('*')
        .eq('biomarker', biomarker)
        .gte('taken_at', startDate.toISOString().split('T')[0])
        .order('taken_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trend data:', error);
      throw new Error('Failed to fetch trend data');
    }
  },

  /**
   * Get monthly summary data for a specific biomarker
   */
  async getMonthlySummary(biomarker: string, months: number = 12): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const { data, error } = await supabase
        .from('bloodwork_trends_summary')
        .select('*')
        .eq('biomarker', biomarker)
        .gte('month', startDate.toISOString().split('T')[0])
        .order('month', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      throw new Error('Failed to fetch monthly summary');
    }
  },

  /**
   * Get trend status for a specific biomarker
   */
  async getBiomarkerTrend(biomarker: string, months: number = 6): Promise<TrendSummary | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_biomarker_trend', {
          p_biomarker: biomarker,
          p_months: months
        });
      
      if (error) throw error;
      if (!data || !data.current_value) return null;
      
      // Get nutrient range for status determination
      const { data: rangeData, error: rangeError } = await supabase
        .from('nutrient_ranges')
        .select('*')
        .eq('nutrient_name', biomarker)
        .single();
      
      if (rangeError && rangeError.code !== 'PGRST116') throw rangeError;
      
      // Determine status based on range
      let status: 'optimal' | 'low' | 'very_low' | 'high' | 'very_high' = 'optimal';
      const alerts: string[] = [];
      
      if (rangeData) {
        if (data.current_value < rangeData.min_value * 0.7) {
          status = 'very_low';
          alerts.push('Critically low level');
        } else if (data.current_value < rangeData.min_value) {
          status = 'low';
          alerts.push('Below optimal range');
        } else if (data.current_value > rangeData.max_value * 1.3) {
          status = 'very_high';
          alerts.push('Critically high level');
        } else if (data.current_value > rangeData.max_value) {
          status = 'high';
          alerts.push('Above optimal range');
        }
      }
      
      // Add trend alerts
      if (data.change_percent && Math.abs(data.change_percent) > 25) {
        alerts.push(`${Math.abs(data.change_percent).toFixed(0)}% ${data.change_percent > 0 ? 'increase' : 'decrease'} since last reading`);
      }
      
      // Add consecutive reading alerts
      if (data.reading_count >= 3) {
        if (status === 'very_low' || status === 'low') {
          alerts.push(`Consistently ${status.replace('_', ' ')} for ${data.reading_count} readings`);
        } else if (status === 'very_high' || status === 'high') {
          alerts.push(`Consistently ${status.replace('_', ' ')} for ${data.reading_count} readings`);
        }
      }
      
      return {
        biomarker,
        current_value: data.current_value,
        previous_value: data.previous_value,
        change_percent: data.change_percent,
        trend: data.trend as 'increasing' | 'decreasing' | 'stable' | 'no_trend',
        unit: data.unit,
        status,
        alerts,
        reading_count: data.reading_count
      };
    } catch (error) {
      console.error('Error fetching biomarker trend:', error);
      throw new Error('Failed to fetch biomarker trend');
    }
  },

  /**
   * Get trends for all biomarkers
   */
  async getAllBiomarkerTrends(months: number = 6): Promise<TrendSummary[]> {
    try {
      // First get all distinct biomarkers for the user
      const { data: biomarkers, error: biomarkerError } = await supabase
        .from('bloodwork_trends')
        .select('biomarker')
        .order('biomarker')
        .limit(100);
      
      if (biomarkerError) throw biomarkerError;
      
      if (!biomarkers || biomarkers.length === 0) {
        return [];
      }
      
      // Get trend data for each biomarker
      const uniqueBiomarkers = [...new Set(biomarkers.map(b => b.biomarker))];
      const trendPromises = uniqueBiomarkers.map(biomarker => 
        this.getBiomarkerTrend(biomarker, months)
      );
      
      const trends = await Promise.all(trendPromises);
      
      // Filter out null results and sort by alert count
      return trends
        .filter((t): t is TrendSummary => t !== null)
        .sort((a, b) => b.alerts.length - a.alerts.length);
    } catch (error) {
      console.error('Error fetching all biomarker trends:', error);
      throw new Error('Failed to fetch biomarker trends');
    }
  },

  /**
   * Add a new trend data point
   */
  async addTrendDataPoint(biomarker: string, value: number, unit: string, takenAt?: Date): Promise<BloodworkTrend> {
    try {
      const { data, error } = await supabase
        .from('bloodwork_trends')
        .insert([{
          biomarker,
          value,
          unit,
          taken_at: takenAt ? takenAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding trend data point:', error);
      throw new Error('Failed to add trend data point');
    }
  },

  /**
   * Import trend data from bloodwork results
   */
  async importFromBloodwork(bloodworkId: string): Promise<number> {
    try {
      // Get nutrient status entries for this bloodwork
      const { data: nutrientData, error: nutrientError } = await supabase
        .from('user_nutrient_status')
        .select(`
          nutrient_name,
          current_value,
          unit,
          bloodwork_results(uploaded_at)
        `)
        .eq('bloodwork_id', bloodworkId);
      
      if (nutrientError) throw nutrientError;
      
      if (!nutrientData || nutrientData.length === 0) {
        return 0;
      }
      
      // Insert trend data points
      const insertPromises = nutrientData.map(entry => {
        const takenAt = entry.bloodwork_results?.uploaded_at 
          ? new Date(entry.bloodwork_results.uploaded_at) 
          : new Date();
        
        return this.addTrendDataPoint(
          entry.nutrient_name,
          entry.current_value,
          entry.unit,
          takenAt
        );
      });
      
      await Promise.all(insertPromises);
      return nutrientData.length;
    } catch (error) {
      console.error('Error importing from bloodwork:', error);
      throw new Error('Failed to import from bloodwork');
    }
  },

  /**
   * Get health alerts based on trends
   */
  async getHealthAlerts(): Promise<{
    alertCount: number;
    criticalCount: number;
    improvingCount: number;
    decreasingCount: number;
    alerts: Array<{
      biomarker: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }> {
    try {
      const trends = await this.getAllBiomarkerTrends();
      
      const alerts = trends.flatMap(trend => 
        trend.alerts.map(alert => ({
          biomarker: trend.biomarker,
          message: alert,
          severity: 
            trend.status === 'very_low' || trend.status === 'very_high' 
              ? 'high' as const
              : trend.status === 'low' || trend.status === 'high'
                ? 'medium' as const
                : 'low' as const
        }))
      );
      
      const criticalCount = trends.filter(t => 
        t.status === 'very_low' || t.status === 'very_high'
      ).length;
      
      const improvingCount = trends.filter(t => 
        (t.trend === 'increasing' && (t.status === 'low' || t.status === 'very_low')) ||
        (t.trend === 'decreasing' && (t.status === 'high' || t.status === 'very_high'))
      ).length;
      
      const decreasingCount = trends.filter(t => 
        (t.trend === 'decreasing' && (t.status === 'low' || t.status === 'very_low')) ||
        (t.trend === 'increasing' && (t.status === 'high' || t.status === 'very_high'))
      ).length;
      
      return {
        alertCount: alerts.length,
        criticalCount,
        improvingCount,
        decreasingCount,
        alerts
      };
    } catch (error) {
      console.error('Error getting health alerts:', error);
      return {
        alertCount: 0,
        criticalCount: 0,
        improvingCount: 0,
        decreasingCount: 0,
        alerts: []
      };
    }
  }
};
import React, { useState, useEffect } from 'react';
import { Brain, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface KPIAIInsightsProps {
  timeframe?: 'week' | 'month' | 'year';
  className?: string;
}

const KPIAIInsights: React.FC<KPIAIInsightsProps> = ({ 
  timeframe = 'week',
  className = '' 
}) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (user) {
      generateInsights();
    }
  }, [user, timeframe]);

  const generateInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get KPI data from the database
      const { data, error } = await supabase.rpc('get_kpi_dashboard', {
        p_user_id: user?.id,
        p_timeframe: timeframe
      });
      
      if (error) throw error;
      
      // In a real implementation, this would call an AI service
      // For now, we'll generate insights based on the data
      const aiInsights = generateMockAIInsights(data);
      setInsights(aiInsights);
    } catch (err: any) {
      console.error('Error generating AI insights:', err);
      setError(err.message || 'Failed to generate insights');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAIInsights = (data: any): string => {
    // Calculate averages
    const avgSitting = data.sitting_hours.data.reduce((a: number, b: number) => a + b, 0) / data.sitting_hours.data.length;
    const avgSleep = data.sleep_hours.data.reduce((a: number, b: number) => a + b, 0) / data.sleep_hours.data.length;
    const totalScreenTime = data.screen_usage.data.reduce((a: number, b: number) => a + b, 0);
    
    // Generate insights based on the data
    let insights = '';
    
    // Sitting time insights
    if (avgSitting > 8) {
      insights += `📊 Your average sitting time of ${avgSitting.toFixed(1)} hours per day is higher than recommended. Consider taking more movement breaks throughout the day to reduce sedentary time.\n\n`;
    } else if (avgSitting > 6) {
      insights += `📊 Your sitting time of ${avgSitting.toFixed(1)} hours per day is moderate. Try to incorporate more standing or walking breaks to further reduce sedentary time.\n\n`;
    } else {
      insights += `📊 Great job keeping your sitting time to ${avgSitting.toFixed(1)} hours per day! This is below average and beneficial for your health.\n\n`;
    }
    
    // Sleep insights
    if (avgSleep < 6) {
      insights += `😴 Your average sleep of ${avgSleep.toFixed(1)} hours is below the recommended 7-9 hours. Insufficient sleep can impact your nutrition choices and metabolism.\n\n`;
    } else if (avgSleep < 7) {
      insights += `😴 Your sleep duration of ${avgSleep.toFixed(1)} hours is slightly below recommendations. Aim for 7-9 hours for optimal health and recovery.\n\n`;
    } else {
      insights += `😴 Excellent sleep habits! Your average of ${avgSleep.toFixed(1)} hours is within the recommended range for optimal health.\n\n`;
    }
    
    // Screen time insights
    if (totalScreenTime > 10) {
      insights += `📱 Your total screen time of ${totalScreenTime} hours per day is high. Consider implementing screen-free periods, especially before bedtime.\n\n`;
    } else if (totalScreenTime > 8) {
      insights += `📱 Your screen time of ${totalScreenTime} hours per day is moderate. Try to balance screen use with other activities.\n\n`;
    } else {
      insights += `📱 Your screen time management is good at ${totalScreenTime} hours per day. Keep maintaining a healthy balance.\n\n`;
    }
    
    // Hydration insights
    if (data.hydration_pct < 70) {
      insights += `💧 Your hydration level is at ${data.hydration_pct}% of your goal. Try to increase your water intake throughout the day for better overall health.\n\n`;
    } else {
      insights += `💧 Good job staying hydrated at ${data.hydration_pct}% of your goal! Proper hydration supports metabolism and nutrient transport.\n\n`;
    }
    
    // Fast food and alcohol insights
    if (data.fast_food_count > 2) {
      insights += `🍔 You've had fast food ${data.fast_food_count} times this ${timeframe}. Consider preparing more meals at home to improve nutrition quality.\n\n`;
    }
    
    if (data.alcohol_days > 2) {
      insights += `🍷 You've consumed alcohol on ${data.alcohol_days} days this ${timeframe}. Moderate alcohol consumption is recommended for better health outcomes.\n\n`;
    }
    
    // Add a personalized recommendation
    insights += `🎯 **Personalized Recommendation**: Based on your data, focus on ${
      avgSitting > 8 ? 'reducing sitting time' : 
      avgSleep < 7 ? 'improving sleep quality' : 
      data.hydration_pct < 70 ? 'increasing hydration' : 
      'maintaining your good habits'
    } for the greatest health impact this week.`;
    
    return insights;
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    generateInsights();
  };

  return (
    <Card className={`bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-indigo-600" />
            AI Health Insights
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={loading}
            leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            className="bg-white"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            {retryCount < 3 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="mt-2"
              >
                Try Again
              </Button>
            ) : (
              <p className="mt-2 text-sm text-red-600">
                Multiple attempts failed. Please try again later.
              </p>
            )}
          </div>
        ) : insights ? (
          <div className="prose prose-indigo max-w-none">
            <div className="whitespace-pre-line text-indigo-800">
              {insights}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-indigo-700">Click "Refresh" to generate AI insights based on your health data.</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default KPIAIInsights;
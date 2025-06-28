import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Brain
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { useSubscription } from '../../contexts/SubscriptionContext';
import PremiumFeatureGate from '../subscription/PremiumFeatureGate';

interface LabTrendVisualizerProps {
  className?: string;
  limit?: number;
}

interface NutrientTrend {
  nutrient_name: string;
  current_value: number;
  unit: string;
  status: string;
  previous_value?: number;
  change_percent?: number;
  trend?: 'up' | 'down' | 'stable';
  alerts?: string[];
}

const LabTrendVisualizer: React.FC<LabTrendVisualizerProps> = ({ 
  className = '',
  limit = 4
}) => {
  const { user } = useAuth();
  const { hasPremiumAccess } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<NutrientTrend[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTrends();
    }
  }, [user]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      
      // Get the two most recent bloodwork results
      const { data: bloodworkData, error: bloodworkError } = await supabase
        .from('bloodwork_results')
        .select('id, uploaded_at')
        .eq('user_id', user?.id)
        .order('uploaded_at', { ascending: false })
        .limit(2);
      
      if (bloodworkError) throw bloodworkError;
      
      if (!bloodworkData || bloodworkData.length === 0) {
        setTrends([]);
        setLoading(false);
        return;
      }
      
      // We need at least 2 results to show trends
      if (bloodworkData.length < 2) {
        // Get nutrient status for the single result
        const { data: singleData, error: singleError } = await supabase
          .from('user_nutrient_status')
          .select(`
            nutrient_name,
            current_value,
            unit,
            status
          `)
          .eq('bloodwork_id', bloodworkData[0].id)
          .eq('user_id', user?.id)
          .order('status', { ascending: false }) // Show problematic nutrients first
          .limit(limit);
          
        if (singleError) throw singleError;
        
        const singleTrends = singleData?.map(item => ({
          nutrient_name: item.nutrient_name,
          current_value: item.current_value,
          unit: item.unit,
          status: item.status,
          trend: 'stable' as 'up' | 'down' | 'stable'
        })) || [];
        
        setTrends(singleTrends);
        
        // Count alerts
        const alertCount = singleTrends.filter(t => 
          t.status === 'very_low' || t.status === 'very_high' || t.status === 'low' || t.status === 'high'
        ).length;
        
        setAlertCount(alertCount);
        setLoading(false);
        return;
      }
      
      // Get nutrient status for the most recent result
      const { data: currentData, error: currentError } = await supabase
        .from('user_nutrient_status')
        .select(`
          nutrient_name,
          current_value,
          unit,
          status
        `)
        .eq('bloodwork_id', bloodworkData[0].id)
        .eq('user_id', user?.id);
        
      if (currentError) throw currentError;
      
      // Get nutrient status for the previous result
      const { data: previousData, error: previousError } = await supabase
        .from('user_nutrient_status')
        .select(`
          nutrient_name,
          current_value
        `)
        .eq('bloodwork_id', bloodworkData[1].id)
        .eq('user_id', user?.id);
        
      if (previousError) throw previousError;
      
      // Create a map of previous values for easy lookup
      const previousValues = new Map();
      previousData?.forEach(item => {
        previousValues.set(item.nutrient_name, item.current_value);
      });
      
      // Calculate trends
      const calculatedTrends = currentData?.map(item => {
        const previousValue = previousValues.get(item.nutrient_name);
        let changePercent;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        
        if (previousValue !== undefined) {
          changePercent = ((item.current_value - previousValue) / previousValue) * 100;
          
          if (Math.abs(changePercent) < 5) {
            trend = 'stable';
          } else if (changePercent > 0) {
            trend = 'up';
          } else {
            trend = 'down';
          }
        }
        
        // Generate alerts
        const alerts: string[] = [];
        
        if (item.status === 'very_low') {
          alerts.push('Critically low level');
        } else if (item.status === 'very_high') {
          alerts.push('Critically high level');
        }
        
        if (changePercent && Math.abs(changePercent) > 25) {
          alerts.push(`${Math.abs(changePercent).toFixed(0)}% ${changePercent > 0 ? 'increase' : 'decrease'}`);
        }
        
        return {
          nutrient_name: item.nutrient_name,
          current_value: item.current_value,
          unit: item.unit,
          status: item.status,
          previous_value: previousValue,
          change_percent: changePercent,
          trend,
          alerts
        };
      }) || [];
      
      // Sort by alert status (critical first) and limit
      const sortedTrends = calculatedTrends
        .sort((a, b) => {
          // First by alert count
          if ((b.alerts?.length || 0) !== (a.alerts?.length || 0)) {
            return (b.alerts?.length || 0) - (a.alerts?.length || 0);
          }
          
          // Then by status severity
          const statusOrder = { 'very_low': 4, 'very_high': 3, 'low': 2, 'high': 1, 'optimal': 0 };
          return (statusOrder[b.status as keyof typeof statusOrder] || 0) - 
                 (statusOrder[a.status as keyof typeof statusOrder] || 0);
        })
        .slice(0, limit);
      
      setTrends(sortedTrends);
      
      // Count total alerts
      const totalAlerts = sortedTrends.reduce((sum, trend) => sum + (trend.alerts?.length || 0), 0);
      setAlertCount(totalAlerts);
      
      // Generate AI insight
      if (hasPremiumAccess) {
        generateMockAiInsight(sortedTrends);
      }
      
    } catch (error) {
      console.error('Error loading lab trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAiInsight = (trends: NutrientTrend[]) => {
    // Count nutrients by status
    const statusCounts = {
      optimal: 0,
      improving: 0,
      declining: 0,
      critical: 0
    };
    
    trends.forEach(trend => {
      if (trend.status === 'optimal') {
        statusCounts.optimal++;
      } else if ((trend.trend === 'up' && (trend.status === 'low' || trend.status === 'very_low')) ||
                 (trend.trend === 'down' && (trend.status === 'high' || trend.status === 'very_high'))) {
        statusCounts.improving++;
      } else if ((trend.trend === 'down' && (trend.status === 'low' || trend.status === 'very_low')) ||
                 (trend.trend === 'up' && (trend.status === 'high' || trend.status === 'very_high'))) {
        statusCounts.declining++;
      }
      
      if (trend.status === 'very_low' || trend.status === 'very_high') {
        statusCounts.critical++;
      }
    });
    
    // Generate insight text
    let insight = '';
    
    if (statusCounts.critical > 0) {
      insight += `${statusCounts.critical} nutrients require immediate attention. `;
      
      if (statusCounts.improving > 0) {
        insight += `${statusCounts.improving} are showing improvement. `;
      }
      
      insight += 'Consider consulting with a healthcare provider.';
    } else if (statusCounts.declining > 0) {
      insight = `${statusCounts.declining} nutrients are trending in the wrong direction. `;
      
      if (statusCounts.optimal > 0) {
        insight += `${statusCounts.optimal} are at optimal levels. `;
      }
      
      insight += 'Focus on dietary adjustments to reverse these trends.';
    } else if (statusCounts.improving > 0) {
      insight = `Great progress! ${statusCounts.improving} nutrients are improving. `;
      
      if (statusCounts.optimal > 0) {
        insight += `${statusCounts.optimal} are already at optimal levels. `;
      }
      
      insight += 'Continue your current nutrition approach.';
    } else if (statusCounts.optimal > 0) {
      insight = `Excellent! ${statusCounts.optimal} nutrients are at optimal levels. Maintain your current nutrition habits.`;
    } else {
      insight = 'Not enough data to generate meaningful insights yet.';
    }
    
    setAiInsight(insight);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'low':
      case 'high':
        return <Activity className="h-5 w-5 text-yellow-500" />;
      case 'very_low':
      case 'very_high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable', changePercent?: number) => {
    if (!trend || !changePercent) return null;
    
    if (Math.abs(changePercent) < 5) {
      return <span className="text-neutral-500">→</span>;
    }
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <span className="text-neutral-500">→</span>;
    }
  };

  // Free version fallback content
  const freePlanFallback = (
    <Card className={className}>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary-600" />
            Lab Trend Visualizer
          </h2>
        </div>
        
        <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <Activity className="h-12 w-12 text-primary-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-primary-800 mb-2">
            Track Your Health Trends
          </h3>
          <p className="text-primary-700 mb-4 max-w-md mx-auto">
            Upgrade to Ultimate Wellbeing to visualize your bloodwork trends over time with AI-powered health insights.
          </p>
          <Link to="/pricing">
            <Button variant="primary">
              Upgrade to Ultimate Wellbeing
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <PremiumFeatureGate
      featureName="Lab Trend Visualizer"
      featureDescription="Track your nutrient levels over time with AI-powered health insights"
      fallback={freePlanFallback}
    >
      <Card className={className}>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary-600" />
              Lab Trend Visualizer
            </h2>
            <Link to="/bloodwork/trends">
              <Button variant="outline" size="sm">View Full Analysis</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-neutral-100 rounded-lg w-full"></div>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-100 rounded-lg w-full"></div>
                ))}
              </div>
            </div>
          ) : trends.length === 0 ? (
            <div className="text-center py-6">
              <Activity className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600 mb-4">No bloodwork data available yet</p>
              <Link to="/bloodwork">
                <Button variant="primary" size="sm">Upload Bloodwork</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* AI Insight */}
              {aiInsight && (
                <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
                  <Brain className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">AI Health Insight</p>
                    <p className="text-sm text-blue-700">{aiInsight}</p>
                  </div>
                </div>
              )}
              
              {/* Alert Count */}
              {alertCount > 0 && (
                <div className="p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">
                    {alertCount} health {alertCount === 1 ? 'alert' : 'alerts'} detected
                  </span>
                </div>
              )}
              
              {/* Nutrient Trends */}
              <div className="space-y-3">
                {trends.map(trend => (
                  <div 
                    key={trend.nutrient_name}
                    className={`p-3 border rounded-lg ${
                      trend.status === 'optimal' ? 'border-green-200 bg-green-50' :
                      trend.status === 'very_low' || trend.status === 'very_high' ? 'border-red-200 bg-red-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {getStatusIcon(trend.status)}
                        <h3 className="ml-2 font-medium">{trend.nutrient_name}</h3>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {trend.current_value} {trend.unit}
                        </span>
                        
                        {trend.previous_value !== undefined && (
                          <div className="flex items-center">
                            {getTrendIcon(trend.trend, trend.change_percent)}
                            <span className="text-xs ml-1">
                              {trend.change_percent && trend.change_percent > 0 ? '+' : ''}
                              {trend.change_percent?.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {trend.alerts && trend.alerts.length > 0 && (
                      <div className="mt-2 text-xs">
                        {trend.alerts.map((alert, idx) => (
                          <div key={idx} className="flex items-center text-red-700">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {alert}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <Link to="/bloodwork/trends">
                  <Button 
                    variant="outline"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View Full Trend Analysis
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </PremiumFeatureGate>
  );
};

export default LabTrendVisualizer;
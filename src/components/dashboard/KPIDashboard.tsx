import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Droplets, 
  Utensils, 
  Clock, 
  Smartphone, 
  Car, 
  Moon, 
  Coffee, 
  Wine, 
  DollarSign,
  Camera,
  PieChart,
  TrendingUp,
  Award,
  Plus,
  Download,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';
import PremiumFeatureGate from '../subscription/PremiumFeatureGate';
import KPIExportTools from './KPIExportTools';
import KPIAIInsights from './KPIAIInsights';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getCacheItem, setCacheItem, clearCache, CACHE_KEYS, CACHE_EXPIRY } from '../../lib/cache';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KPIData {
  hydration_pct: number;
  sitting_hours: {
    labels: string[];
    data: number[];
  };
  driving_hours: {
    labels: string[];
    data: number[];
  };
  screen_usage: {
    labels: string[];
    data: number[];
  };
  sleep_hours: {
    labels: string[];
    data: number[];
  };
  fast_food_count: number;
  alcohol_days: number;
  weekly_spend: number;
  meal_streak_pct: number;
  diary_entries: {
    labels: string[];
    data: number[];
  };
  weekly_scans: number;
  macro_ratio: {
    labels: string[];
    data: number[];
  };
  goal_completion: number;
  streak_days: number;
}

const KPIDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPremiumAccess, refreshSubscription } = useSubscription();
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [retryCount, setRetryCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Force refresh subscription status when component mounts
  useEffect(() => {
    refreshSubscription();
  }, []);

  useEffect(() => {
    if (user) {
      loadKPIData();
    }
  }, [user, timeframe, retryCount]);

  const loadKPIData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear cache first to ensure fresh data
      await clearCache();
      
      // Try to fetch from the database first
      const { data, error } = await supabase.rpc('get_kpi_dashboard', {
        p_user_id: user?.id,
        p_timeframe: timeframe
      });
      
      if (error) {
        console.error('Error fetching KPI data:', error);
        // Fall back to mock data
        const mockData = generateMockData();
        setKpiData(mockData);
        
        // Cache the mock data
        await setCacheItem(CACHE_KEYS.KPI_DASHBOARD, mockData, CACHE_EXPIRY.KPI_DASHBOARD);
      } else if (data) {
        setKpiData(data);
        
        // Cache the data
        await setCacheItem(CACHE_KEYS.KPI_DASHBOARD, data, CACHE_EXPIRY.KPI_DASHBOARD);
      } else {
        // If no data returned, use mock data
        const mockData = generateMockData();
        setKpiData(mockData);
        
        // Cache the mock data
        await setCacheItem(CACHE_KEYS.KPI_DASHBOARD, mockData, CACHE_EXPIRY.KPI_DASHBOARD);
      }
    } catch (err: any) {
      console.error('Error loading KPI data:', err);
      setError(err.message || 'Failed to load dashboard data');
      // Fall back to mock data
      const mockData = generateMockData();
      setKpiData(mockData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockData = (): KPIData => {
    // Generate days for the past week
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    return {
      hydration_pct: Math.floor(Math.random() * 41) + 60, // 60-100%
      sitting_hours: {
        labels: days,
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 6) + 4) // 4-10 hours
      },
      driving_hours: {
        labels: days,
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 3) + 0.5) // 0.5-3.5 hours
      },
      screen_usage: {
        labels: ['Social Media', 'Work', 'Entertainment', 'Education'],
        data: [
          Math.floor(Math.random() * 3) + 1, // 1-4 hours
          Math.floor(Math.random() * 4) + 4, // 4-8 hours
          Math.floor(Math.random() * 3) + 1, // 1-4 hours
          Math.floor(Math.random() * 2) + 0.5 // 0.5-2.5 hours
        ]
      },
      sleep_hours: {
        labels: days,
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 3) + 5) // 5-8 hours
      },
      fast_food_count: Math.floor(Math.random() * 5), // 0-4 meals
      alcohol_days: Math.floor(Math.random() * 4), // 0-3 days
      weekly_spend: Math.floor(Math.random() * 101) + 50, // $50-150
      meal_streak_pct: Math.floor(Math.random() * 41) + 60, // 60-100%
      diary_entries: {
        labels: days,
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 4) + 1) // 1-4 entries
      },
      weekly_scans: Math.floor(Math.random() * 11) + 5, // 5-15 scans
      macro_ratio: {
        labels: ['Protein', 'Carbs', 'Fat'],
        data: [
          Math.floor(Math.random() * 11) + 20, // 20-30%
          Math.floor(Math.random() * 16) + 40, // 40-55%
          Math.floor(Math.random() * 11) + 15  // 15-25%
        ]
      },
      goal_completion: Math.floor(Math.random() * 31) + 70, // 70-100%
      streak_days: Math.floor(Math.random() * 11) + 1 // 1-11 days
    };
  };

  const getProgressColor = (value: number): string => {
    if (value < 50) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    if (value < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getProgressTextColor = (value: number): string => {
    if (value < 50) return 'text-red-600';
    if (value < 70) return 'text-yellow-600';
    if (value < 90) return 'text-blue-600';
    return 'text-green-600';
  };

  // Premium+ feature gate content
  const premiumPlusFallback = (
    <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <Activity className="h-16 w-16 text-blue-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-blue-900 mb-3">
        Health & Lifestyle Dashboard
      </h3>
      <p className="text-blue-700 mb-6 max-w-lg mx-auto">
        Upgrade to Ultimate Wellbeing to access our comprehensive health and lifestyle tracking dashboard. 
        Monitor your sleep, screen time, hydration, and more with AI-powered insights.
      </p>
      <Button 
        variant="primary"
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => window.location.href = '/pricing'}
      >
        Upgrade to Ultimate Wellbeing
      </Button>
    </div>
  );

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadKPIData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <Button variant="primary" onClick={handleRetry}>Retry Loading</Button>
      </div>
    );
  }

  return (
    <PremiumFeatureGate
      featureName="Health & Lifestyle Dashboard"
      featureDescription="Track your daily habits, sleep patterns, and lifestyle metrics with our comprehensive KPI dashboard."
      fallback={premiumPlusFallback}
    >
      <div className="space-y-6">
        {/* Header with Timeframe Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Health & Lifestyle Dashboard</h2>
            <p className="text-neutral-600">Track your daily habits and nutrition metrics</p>
          </div>
          
          <div className="flex gap-3">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setTimeframe('week')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  timeframe === 'week'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                } border border-neutral-300`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-4 py-2 text-sm font-medium ${
                  timeframe === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                } border-t border-b border-neutral-300`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeframe('year')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  timeframe === 'year'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                } border border-neutral-300`}
              >
                Year
              </button>
            </div>
            
            <Link to="/activity-logger">
              <Button 
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Log Activity
              </Button>
            </Link>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              leftIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {!kpiData ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">No dashboard data available.</p>
            <Button
              variant="primary"
              onClick={handleRetry}
              className="mt-4"
            >
              Retry Loading
            </Button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 mb-1">Goal Completion</h3>
                      <div className="text-3xl font-bold text-green-600">{kpiData.goal_completion}%</div>
                      <p className="text-sm text-green-700">Overall health goals met</p>
                    </div>
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-green-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${kpiData.goal_completion}%` }}
                    ></div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-1">Streak</h3>
                      <div className="text-3xl font-bold text-blue-600">{kpiData.streak_days} days</div>
                      <p className="text-sm text-blue-700">Consecutive days on track</p>
                    </div>
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 h-2 rounded-full ${
                          i < kpiData.streak_days % 7 ? 'bg-blue-600' : 'bg-blue-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 mb-1">Weekly Activity</h3>
                      <div className="text-3xl font-bold text-purple-600">{kpiData.weekly_scans}</div>
                      <p className="text-sm text-purple-700">Food scans this week</p>
                    </div>
                    <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-purple-700 font-medium">
                      {kpiData.weekly_scans > 10 ? 'Very Active' : 
                      kpiData.weekly_scans > 7 ? 'Active' : 
                      kpiData.weekly_scans > 4 ? 'Moderate' : 'Low Activity'}
                    </span>
                    <span className="ml-auto text-purple-600">
                      {kpiData.weekly_scans > 7 ? '👍 Great!' : 'Try for more!'}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* AI Insights */}
            <KPIAIInsights timeframe={timeframe} />

            {/* Detailed KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Hydration */}
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                      <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                      Hydration
                    </h3>
                    <span className={`text-lg font-bold ${getProgressTextColor(kpiData.hydration_pct)}`}>
                      {kpiData.hydration_pct}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-4">
                    <div 
                      className={`${getProgressColor(kpiData.hydration_pct)} h-2.5 rounded-full`} 
                      style={{ width: `${kpiData.hydration_pct}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {kpiData.hydration_pct >= 90 ? 'Excellent hydration levels!' : 
                    kpiData.hydration_pct >= 70 ? 'Good hydration, keep it up!' : 
                    'Try to drink more water throughout the day.'}
                  </p>
                </CardBody>
              </Card>

              {/* Sitting Time */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <Clock className="h-5 w-5 mr-2 text-orange-500" />
                    Sitting Time
                  </h3>
                  <div className="h-48">
                    <Line 
                      data={{
                        labels: kpiData.sitting_hours.labels,
                        datasets: [{
                          label: 'Hours Sitting',
                          data: kpiData.sitting_hours.data,
                          borderColor: 'rgb(249, 115, 22)',
                          backgroundColor: 'rgba(249, 115, 22, 0.1)',
                          fill: true,
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Hours'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    Average: {(kpiData.sitting_hours.data.reduce((a, b) => a + b, 0) / 7).toFixed(1)} hours/day
                  </p>
                </CardBody>
              </Card>

              {/* Driving Time */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <Car className="h-5 w-5 mr-2 text-neutral-500" />
                    Driving Time
                  </h3>
                  <div className="h-48">
                    <Line 
                      data={{
                        labels: kpiData.driving_hours.labels,
                        datasets: [{
                          label: 'Hours Driving',
                          data: kpiData.driving_hours.data,
                          borderColor: 'rgb(100, 116, 139)',
                          backgroundColor: 'rgba(100, 116, 139, 0.1)',
                          fill: true,
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Hours'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    Average: {(kpiData.driving_hours.data.reduce((a, b) => a + b, 0) / 7).toFixed(1)} hours/day
                  </p>
                </CardBody>
              </Card>

              {/* Screen Time */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <Smartphone className="h-5 w-5 mr-2 text-purple-500" />
                    Screen Time
                  </h3>
                  <div className="h-48">
                    <Bar 
                      data={{
                        labels: kpiData.screen_usage.labels,
                        datasets: [{
                          label: 'Hours',
                          data: kpiData.screen_usage.data,
                          backgroundColor: [
                            'rgba(168, 85, 247, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(249, 115, 22, 0.7)',
                            'rgba(16, 185, 129, 0.7)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Hours'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    Total: {kpiData.screen_usage.data.reduce((a, b) => a + b, 0)} hours/day
                  </p>
                </CardBody>
              </Card>

              {/* Sleep Patterns */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <Moon className="h-5 w-5 mr-2 text-indigo-500" />
                    Sleep Patterns
                  </h3>
                  <div className="h-48">
                    <Line 
                      data={{
                        labels: kpiData.sleep_hours.labels,
                        datasets: [{
                          label: 'Hours of Sleep',
                          data: kpiData.sleep_hours.data,
                          borderColor: 'rgb(99, 102, 241)',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          fill: true,
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: false,
                            min: 4,
                            max: 10,
                            title: {
                              display: true,
                              text: 'Hours'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    Average: {(kpiData.sleep_hours.data.reduce((a, b) => a + b, 0) / 7).toFixed(1)} hours/night
                  </p>
                </CardBody>
              </Card>

              {/* Fast Food Frequency */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <Utensils className="h-5 w-5 mr-2 text-yellow-500" />
                    Fast Food Frequency
                  </h3>
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-yellow-500 mb-2">{kpiData.fast_food_count}</div>
                      <p className="text-neutral-600">meals this week</p>
                      <div className="mt-4 text-sm">
                        {kpiData.fast_food_count <= 1 ? (
                          <span className="text-green-600">Great job limiting fast food!</span>
                        ) : kpiData.fast_food_count <= 3 ? (
                          <span className="text-yellow-600">Moderate fast food consumption</span>
                        ) : (
                          <span className="text-red-600">Try to reduce fast food intake</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Alcohol Use */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <Wine className="h-5 w-5 mr-2 text-red-500" />
                    Alcohol Consumption
                  </h3>
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-red-500 mb-2">{kpiData.alcohol_days}</div>
                      <p className="text-neutral-600">days with alcohol this week</p>
                      <div className="mt-4 text-sm">
                        {kpiData.alcohol_days <= 1 ? (
                          <span className="text-green-600">Low alcohol consumption</span>
                        ) : kpiData.alcohol_days <= 3 ? (
                          <span className="text-yellow-600">Moderate alcohol consumption</span>
                        ) : (
                          <span className="text-red-600">Consider reducing alcohol intake</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Food Spend */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                    Food Spending
                  </h3>
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-500 mb-2">${kpiData.weekly_spend}</div>
                      <p className="text-neutral-600">spent on food this week</p>
                      <div className="mt-4 text-sm">
                        {kpiData.weekly_spend < 75 ? (
                          <span className="text-green-600">Budget-friendly food choices</span>
                        ) : kpiData.weekly_spend < 125 ? (
                          <span className="text-blue-600">Moderate food spending</span>
                        ) : (
                          <span className="text-yellow-600">Higher than average food costs</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Meal Plan Adherence */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <Utensils className="h-5 w-5 mr-2 text-primary-500" />
                    Meal Plan Adherence
                  </h3>
                  <div className="flex items-center justify-center h-48">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="stroke-current text-neutral-200"
                          fill="none"
                          strokeWidth="3"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`stroke-current ${getProgressTextColor(kpiData.meal_streak_pct)}`}
                          fill="none"
                          strokeWidth="3"
                          strokeDasharray={`${kpiData.meal_streak_pct}, 100`}
                          strokeLinecap="round"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.5" className="text-3xl font-bold" textAnchor="middle" fill="currentColor">
                          {kpiData.meal_streak_pct}%
                        </text>
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 text-center mt-2">
                    {kpiData.meal_streak_pct >= 90 ? 'Excellent plan adherence!' : 
                    kpiData.meal_streak_pct >= 70 ? 'Good plan adherence' : 
                    'Try to stick to your meal plan more consistently'}
                  </p>
                </CardBody>
              </Card>

              {/* Diary Activity */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Diary Activity
                  </h3>
                  <div className="h-48">
                    <Bar 
                      data={{
                        labels: kpiData.diary_entries.labels,
                        datasets: [{
                          label: 'Entries',
                          data: kpiData.diary_entries.data,
                          backgroundColor: 'rgba(59, 130, 246, 0.7)',
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    Total: {kpiData.diary_entries.data.reduce((a, b) => a + b, 0)} entries this week
                  </p>
                </CardBody>
              </Card>

              {/* Macronutrient Balance */}
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <PieChart className="h-5 w-5 mr-2 text-primary-500" />
                    Macronutrient Balance
                  </h3>
                  <div className="h-48">
                    <Doughnut 
                      data={{
                        labels: kpiData.macro_ratio.labels,
                        datasets: [{
                          data: kpiData.macro_ratio.data,
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.7)', // Protein - blue
                            'rgba(168, 85, 247, 0.7)', // Carbs - purple
                            'rgba(251, 191, 36, 0.7)'  // Fat - yellow
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw as number;
                                return `${label}: ${value}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-neutral-600 mt-2">
                    <span>Protein: {kpiData.macro_ratio.data[0]}%</span>
                    <span>Carbs: {kpiData.macro_ratio.data[1]}%</span>
                    <span>Fat: {kpiData.macro_ratio.data[2]}%</span>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Export Tools */}
            <KPIExportTools className="mb-6" />
          </>
        )}
      </div>
    </PremiumFeatureGate>
  );
};

export default KPIDashboard;
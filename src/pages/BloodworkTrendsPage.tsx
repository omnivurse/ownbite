import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Brain, 
  AlertTriangle, 
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Upload
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import NutrientTrendChart from '../components/bloodwork/NutrientTrendChart';
import BloodworkTrendChart from '../components/bloodwork/BloodworkTrendChart';
import BloodworkTrendImporter from '../components/bloodwork/BloodworkTrendImporter';
import PremiumFeatureGate from '../components/subscription/PremiumFeatureGate';
import { bloodworkTrendsService, type TrendSummary } from '../services/bloodworkTrendsService';
import { saveAs } from 'file-saver';

const BloodworkTrendsPage: React.FC = () => {
  const { user } = useAuth();
  const { hasPremiumAccess } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendSummaries, setTrendSummaries] = useState<TrendSummary[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null);
  const [filteredTrends, setFilteredTrends] = useState<TrendSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImporter, setShowImporter] = useState(false);

  useEffect(() => {
    if (user) {
      loadBloodworkTrends();
    }
  }, [user, selectedTimeframe]);

  useEffect(() => {
    // Filter trends based on search query and selected biomarker
    let filtered = trendSummaries;
    
    if (searchQuery) {
      filtered = filtered.filter(trend => 
        trend.biomarker.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedBiomarker) {
      filtered = filtered.filter(trend => trend.biomarker === selectedBiomarker);
    }
    
    setFilteredTrends(filtered);
  }, [trendSummaries, searchQuery, selectedBiomarker]);

  const loadBloodworkTrends = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get months based on selected timeframe
      let months = 6;
      switch (selectedTimeframe) {
        case '3m': months = 3; break;
        case '6m': months = 6; break;
        case '1y': months = 12; break;
        case 'all': months = 120; break; // 10 years should be enough for "all"
      }
      
      // Get all biomarker trends
      const trends = await bloodworkTrendsService.getAllBiomarkerTrends(months);
      setTrendSummaries(trends);
      
      // Count total alerts
      const totalAlerts = trends.reduce((sum, trend) => sum + trend.alerts.length, 0);
      setAlertCount(totalAlerts);
      
      // Generate AI summary if premium user
      if (hasPremiumAccess && trends.length > 0) {
        generateAiSummary(trends);
      }
      
    } catch (err: any) {
      console.error('Error loading bloodwork trends:', err);
      setError(err.message || 'Failed to load bloodwork trends');
    } finally {
      setLoading(false);
    }
  };

  const generateAiSummary = async (trends: TrendSummary[]) => {
    try {
      setSummaryLoading(true);
      
      // In a real implementation, this would call an edge function
      // that uses GPT to generate a summary of the trends
      // For now, we'll simulate it with a timeout
      
      setTimeout(() => {
        const summary = generateMockSummary(trends);
        setAiSummary(summary);
        setSummaryLoading(false);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error generating AI summary:', err);
      setSummaryLoading(false);
    }
  };

  const generateMockSummary = (trends: TrendSummary[]): string => {
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
      } else if ((trend.trend === 'increasing' && (trend.status === 'low' || trend.status === 'very_low')) ||
                 (trend.trend === 'decreasing' && (trend.status === 'high' || trend.status === 'very_high'))) {
        statusCounts.improving++;
      } else if ((trend.trend === 'decreasing' && (trend.status === 'low' || trend.status === 'very_low')) ||
                 (trend.trend === 'increasing' && (trend.status === 'high' || trend.status === 'very_high'))) {
        statusCounts.declining++;
      }
      
      if (trend.status === 'very_low' || trend.status === 'very_high') {
        statusCounts.critical++;
      }
    });
    
    // Generate critical biomarker list
    const criticalBiomarkers = trends
      .filter(t => t.status === 'very_low' || t.status === 'very_high')
      .map(t => t.biomarker)
      .slice(0, 3);
    
    // Generate improving biomarker list
    const improvingBiomarkers = trends
      .filter(t => 
        (t.trend === 'increasing' && (t.status === 'low' || t.status === 'very_low')) ||
        (t.trend === 'decreasing' && (t.status === 'high' || t.status === 'very_high'))
      )
      .map(t => t.biomarker)
      .slice(0, 3);
    
    // Generate summary text
    let summary = `Based on your bloodwork history over the selected time period, `;
    
    if (statusCounts.critical > 0) {
      summary += `there are ${statusCounts.critical} biomarkers requiring immediate attention`;
      if (criticalBiomarkers.length > 0) {
        summary += ` (${criticalBiomarkers.join(', ')})`;
      }
      summary += `. `;
    } else {
      summary += `there are no critical deficiencies detected. `;
    }
    
    summary += `${statusCounts.optimal} biomarkers are at optimal levels, `;
    summary += `${statusCounts.improving} are showing improvement`;
    
    if (improvingBiomarkers.length > 0) {
      summary += ` (notably ${improvingBiomarkers.join(', ')})`;
    }
    
    summary += `, and ${statusCounts.declining} are trending downward. `;
    
    // Add recommendations
    if (statusCounts.critical > 0) {
      summary += `\n\nPriority recommendation: Focus on addressing the critical deficiencies through dietary changes and possibly supplementation under medical supervision.`;
    } else if (statusCounts.declining > 0) {
      summary += `\n\nPriority recommendation: Monitor the declining biomarkers and consider dietary adjustments to prevent them from reaching deficient levels.`;
    } else {
      summary += `\n\nPriority recommendation: Maintain your current nutrition habits as they appear to be supporting good biomarker levels.`;
    }
    
    return summary;
  };

  const exportTrendsData = () => {
    try {
      // Prepare CSV data
      let csvContent = "Biomarker,Date,Value,Unit,Status\n";
      
      trendSummaries.forEach(trend => {
        csvContent += `"${trend.biomarker}","${new Date().toISOString().split('T')[0]}",${trend.current_value},"${trend.unit}","${trend.status}"\n`;
        if (trend.previous_value) {
          // Add a row for previous value with estimated date (3 months ago)
          const prevDate = new Date();
          prevDate.setMonth(prevDate.getMonth() - 3);
          csvContent += `"${trend.biomarker}","${prevDate.toISOString().split('T')[0]}",${trend.previous_value},"${trend.unit}","unknown"\n`;
        }
      });
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `bloodwork-trends-${new Date().toISOString().split('T')[0]}.csv`);
      
    } catch (err) {
      console.error('Error exporting trends data:', err);
      setError('Failed to export trends data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600';
      case 'low': return 'text-yellow-600';
      case 'very_low': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'very_high': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <span className="text-neutral-500">→</span>;
    }
  };

  const handleImportComplete = (count: number) => {
    setShowImporter(false);
    setSuccess(`Successfully imported ${count} data points`);
    loadBloodworkTrends();
  };

  const [success, setSuccess] = useState<string | null>(null);

  const freePlanFallback = (
    <div className="text-center py-12">
      <Activity className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-neutral-900 mb-2">
        Bloodwork Trend Analysis
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">
        Upgrade to Premium to track your nutrient levels over time, receive AI-powered health insights, and get personalized recommendations.
      </p>
      <Button
        variant="primary"
        onClick={() => window.location.href = '/pricing'}
      >
        Upgrade to Premium
      </Button>
    </div>
  );

  return (
    <PageContainer title="Bloodwork Trends">
      <PremiumFeatureGate
        featureName="Lab Trend Visualizer"
        featureDescription="Track your nutrient levels over time with AI-powered health insights"
        fallback={freePlanFallback}
      >
        <div className="space-y-6">
          {/* Header with Timeframe Selector */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Lab Trend Visualizer</h1>
              <p className="text-neutral-600">
                Track your nutrient levels over time with AI-powered health insights
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setSelectedTimeframe('3m')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    selectedTimeframe === '3m'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  } border border-neutral-300`}
                >
                  3 Months
                </button>
                <button
                  onClick={() => setSelectedTimeframe('6m')}
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedTimeframe === '6m'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  } border-t border-b border-neutral-300`}
                >
                  6 Months
                </button>
                <button
                  onClick={() => setSelectedTimeframe('1y')}
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedTimeframe === '1y'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  } border-t border-b border-neutral-300`}
                >
                  1 Year
                </button>
                <button
                  onClick={() => setSelectedTimeframe('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    selectedTimeframe === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  } border border-neutral-300`}
                >
                  All Time
                </button>
              </div>
              
              <Button
                variant="outline"
                onClick={exportTrendsData}
                leftIcon={<Download className="h-4 w-4" />}
                disabled={trendSummaries.length === 0}
              >
                Export CSV
              </Button>
              
              <Button
                variant="primary"
                onClick={() => setShowImporter(true)}
                leftIcon={<Upload className="h-4 w-4" />}
              >
                Import Data
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
              <button 
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-700 hover:text-green-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Importer Modal */}
          {showImporter && (
            <BloodworkTrendImporter 
              onImportComplete={handleImportComplete}
            />
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <Card>
              <CardBody>
                <p className="text-red-500">{error}</p>
              </CardBody>
            </Card>
          ) : trendSummaries.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No Bloodwork Trend Data Available
                </h3>
                <p className="text-neutral-600 mb-6">
                  Import data from your bloodwork results or add manual entries to start tracking your biomarker trends over time.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowImporter(true)}
                  leftIcon={<Upload className="h-4 w-4" />}
                >
                  Import Data
                </Button>
              </CardBody>
            </Card>
          ) : (
            <>
              {/* AI Summary Card */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-blue-900 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-blue-700" />
                      AI Health Intelligence
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAiSummary(trendSummaries)}
                      leftIcon={summaryLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      className="bg-white"
                    >
                      Refresh
                    </Button>
                  </div>
                  
                  {summaryLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                      <div className="h-4 bg-blue-200 rounded w-full"></div>
                      <div className="h-4 bg-blue-200 rounded w-5/6"></div>
                      <div className="h-4 bg-blue-200 rounded w-2/3"></div>
                    </div>
                  ) : aiSummary ? (
                    <div className="text-blue-800 whitespace-pre-line">
                      {aiSummary}
                    </div>
                  ) : (
                    <p className="text-blue-800">
                      Click "Refresh" to generate an AI analysis of your bloodwork trends.
                    </p>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-blue-700 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Analysis period: {
                          selectedTimeframe === '3m' ? 'Last 3 months' :
                          selectedTimeframe === '6m' ? 'Last 6 months' :
                          selectedTimeframe === '1y' ? 'Last year' :
                          'All time'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center text-blue-700 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span>{alertCount} alerts detected</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search biomarkers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-neutral-300 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <select
                  value={selectedBiomarker || ''}
                  onChange={(e) => setSelectedBiomarker(e.target.value || null)}
                  className="block w-full md:w-auto rounded-md border border-neutral-300 py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Biomarkers</option>
                  {trendSummaries.map(trend => (
                    <option key={trend.biomarker} value={trend.biomarker}>
                      {trend.biomarker}
                    </option>
                  ))}
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBiomarker(null);
                  }}
                  disabled={!searchQuery && !selectedBiomarker}
                >
                  Clear Filters
                </Button>
              </div>
              
              {/* Alert Summary */}
              {alertCount > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardBody>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                      Health Alerts ({alertCount})
                    </h3>
                    
                    <div className="space-y-3">
                      {trendSummaries
                        .filter(trend => trend.alerts.length > 0)
                        .map(trend => (
                          <div key={trend.biomarker} className="p-3 bg-white rounded-lg border border-yellow-200">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-yellow-900">{trend.biomarker}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                trend.status === 'very_low' || trend.status === 'very_high'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {trend.status.replace('_', ' ')}
                              </span>
                            </div>
                            <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                              {trend.alerts.map((alert, idx) => (
                                <li key={idx}>{alert}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                  </CardBody>
                </Card>
              )}
              
              {/* Biomarker Trends */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-neutral-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary-600" />
                  Biomarker Trends
                </h3>
                
                {filteredTrends.length === 0 ? (
                  <div className="text-center py-8 bg-neutral-50 rounded-lg border border-neutral-200">
                    <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600">No matching biomarkers found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTrends.map(trend => {
                      // Create mock data for the chart
                      // In a real implementation, this would come from the actual trend data
                      const mockData = [];
                      
                      // Add previous value if available
                      if (trend.previous_value) {
                        const prevDate = new Date();
                        prevDate.setMonth(prevDate.getMonth() - 3);
                        mockData.push({
                          date: prevDate.toISOString(),
                          value: trend.previous_value,
                          status: 'unknown'
                        });
                      }
                      
                      // Add current value
                      mockData.push({
                        date: new Date().toISOString(),
                        value: trend.current_value,
                        status: trend.status
                      });
                      
                      return (
                        <BloodworkTrendChart
                          key={trend.biomarker}
                          biomarker={trend.biomarker}
                          data={mockData}
                          unit={trend.unit}
                          optimalRange={{
                            min: trend.current_value * 0.8, // Mock range
                            max: trend.current_value * 1.2  // Mock range
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </PremiumFeatureGate>
    </PageContainer>
  );
};

export default BloodworkTrendsPage;
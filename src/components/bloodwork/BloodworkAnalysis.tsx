import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import MealPlanGenerator from './MealPlanGenerator';

interface NutrientStatus {
  id: string;
  nutrient_name: string;
  current_value: number;
  unit: string;
  status: 'optimal' | 'low' | 'very_low' | 'high' | 'very_high';
  recommendations_applied: boolean;
}

interface NutrientRange {
  nutrient_name: string;
  unit: string;
  min_value: number;
  max_value: number;
  optimal_min?: number;
  optimal_max?: number;
  description: string;
  category: string;
}

interface NutrientRecommendation {
  nutrient_name: string;
  deficiency_level: string;
  recommended_foods: string[];
  foods_to_avoid: string[];
  explanation: string;
  priority_level: number;
}

interface BloodworkAnalysisProps {
  bloodworkId: string;
  className?: string;
}

const BloodworkAnalysis: React.FC<BloodworkAnalysisProps> = ({ bloodworkId, className = '' }) => {
  const { user } = useAuth();
  const [nutrientStatus, setNutrientStatus] = useState<NutrientStatus[]>([]);
  const [nutrientRanges, setNutrientRanges] = useState<NutrientRange[]>([]);
  const [recommendations, setRecommendations] = useState<NutrientRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisData();
  }, [bloodworkId]);

  const loadAnalysisData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load nutrient status for this bloodwork
      const { data: statusData, error: statusError } = await supabase
        .from('user_nutrient_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('bloodwork_id', bloodworkId);

      if (statusError) throw statusError;

      // Load nutrient ranges
      const { data: rangesData, error: rangesError } = await supabase
        .from('nutrient_ranges')
        .select('*');

      if (rangesError) throw rangesError;

      // Load recommendations for deficient nutrients
      const deficientNutrients = statusData?.filter(n => n.status === 'low' || n.status === 'very_low') || [];
      const nutrientNames = deficientNutrients.map(n => n.nutrient_name);

      let recommendationsData: NutrientRecommendation[] = [];
      if (nutrientNames.length > 0) {
        const { data: recData, error: recError } = await supabase
          .from('nutrient_recommendations')
          .select('*')
          .in('nutrient_name', nutrientNames);

        if (recError) throw recError;
        recommendationsData = recData || [];
      }

      setNutrientStatus(statusData || []);
      setNutrientRanges(rangesData || []);
      setRecommendations(recommendationsData);

    } catch (err: any) {
      console.error('Error loading analysis data:', err);
      setError(err.message || 'Failed to load analysis data');
      
      // If no data is available, create mock data for demonstration
      if (nutrientStatus.length === 0) {
        setNutrientStatus([
          {
            id: '1',
            nutrient_name: 'Vitamin D',
            current_value: 25,
            unit: 'ng/mL',
            status: 'low',
            recommendations_applied: false
          },
          {
            id: '2',
            nutrient_name: 'Iron',
            current_value: 50,
            unit: 'μg/dL',
            status: 'low',
            recommendations_applied: false
          }
        ]);
        
        setNutrientRanges([
          {
            nutrient_name: 'Vitamin D',
            unit: 'ng/mL',
            min_value: 30,
            max_value: 100,
            optimal_min: 40,
            optimal_max: 80,
            description: 'Essential for bone health and immune function',
            category: 'vitamin'
          },
          {
            nutrient_name: 'Iron',
            unit: 'μg/dL',
            min_value: 60,
            max_value: 170,
            optimal_min: 80,
            optimal_max: 150,
            description: 'Essential for oxygen transport and energy production',
            category: 'mineral'
          }
        ]);
        
        setRecommendations([
          {
            nutrient_name: 'Vitamin D',
            deficiency_level: 'low',
            recommended_foods: ['fatty fish', 'egg yolks', 'fortified milk', 'mushrooms'],
            foods_to_avoid: [],
            explanation: 'Increase sun exposure and consume vitamin D rich foods',
            priority_level: 1
          },
          {
            nutrient_name: 'Iron',
            deficiency_level: 'low',
            recommended_foods: ['lean red meat', 'spinach', 'lentils', 'tofu', 'dark chocolate'],
            foods_to_avoid: ['tea with meals', 'coffee with meals'],
            explanation: 'Combine with vitamin C for better absorption',
            priority_level: 1
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'low':
        return <TrendingDown className="h-5 w-5 text-yellow-500" />;
      case 'very_low':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'very_high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'low':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'very_low':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'very_high':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-neutral-700 bg-neutral-50 border-neutral-200';
    }
  };

  const getNutrientRange = (nutrientName: string) => {
    return nutrientRanges.find(range => range.nutrient_name === nutrientName);
  };

  const getRecommendationsForNutrient = (nutrientName: string, status: string) => {
    return recommendations.filter(rec => 
      rec.nutrient_name === nutrientName && 
      rec.deficiency_level === status
    );
  };

  const deficientNutrients = nutrientStatus.filter(n => n.status === 'low' || n.status === 'very_low');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analysis Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold text-neutral-900">Bloodwork Analysis Results</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {nutrientStatus.filter(n => n.status === 'optimal').length}
              </div>
              <div className="text-sm text-green-700">Optimal Levels</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {nutrientStatus.filter(n => n.status === 'low' || n.status === 'very_low').length}
              </div>
              <div className="text-sm text-yellow-700">Below Optimal</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {nutrientStatus.filter(n => n.status === 'high' || n.status === 'very_high').length}
              </div>
              <div className="text-sm text-red-700">Above Optimal</div>
            </div>
          </div>

          {/* Nutrient Status List */}
          <div className="space-y-3">
            {nutrientStatus.map((nutrient) => {
              const range = getNutrientRange(nutrient.nutrient_name);
              const recs = getRecommendationsForNutrient(nutrient.nutrient_name, nutrient.status);

              return (
                <div
                  key={nutrient.id}
                  className={`p-4 border rounded-lg ${getStatusColor(nutrient.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(nutrient.status)}
                      <div>
                        <h4 className="font-medium">{nutrient.nutrient_name}</h4>
                        <p className="text-sm opacity-75">
                          {range?.description || 'Essential nutrient'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {nutrient.current_value} {nutrient.unit}
                      </div>
                      <div className="text-sm opacity-75 capitalize">
                        {nutrient.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  {range && (
                    <div className="mb-3">
                      <div className="text-sm opacity-75 mb-1">
                        Normal Range: {range.min_value} - {range.max_value} {range.unit}
                        {range.optimal_min && range.optimal_max && (
                          <span className="ml-2">
                            (Optimal: {range.optimal_min} - {range.optimal_max})
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-current opacity-60"
                          style={{
                            width: `${Math.min(100, Math.max(0, 
                              ((nutrient.current_value - range.min_value) / 
                               (range.max_value - range.min_value)) * 100
                            ))}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {recs.length > 0 && (
                    <div className="space-y-2">
                      {recs.map((rec, index) => (
                        <div key={index} className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-sm font-medium mb-2">{rec.explanation}</p>
                          {rec.recommended_foods.length > 0 && (
                            <div className="mb-2">
                              <span className="text-sm font-medium">Recommended foods: </span>
                              <span className="text-sm">{rec.recommended_foods.join(', ')}</span>
                            </div>
                          )}
                          {rec.foods_to_avoid && rec.foods_to_avoid.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Avoid: </span>
                              <span className="text-sm">{rec.foods_to_avoid.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Meal Plan Generator */}
      {deficientNutrients.length > 0 && (
        <MealPlanGenerator
          bloodworkData={{ bloodwork_id: bloodworkId }}
          nutrientDeficiencies={deficientNutrients.map(n => n.nutrient_name)}
        />
      )}

      {/* Action Items */}
      {deficientNutrients.length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold text-neutral-900">Priority Action Items</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {deficientNutrients
                .sort((a, b) => a.status === 'very_low' ? -1 : 1)
                .slice(0, 3)
                .map((nutrient) => {
                  const recs = getRecommendationsForNutrient(nutrient.nutrient_name, nutrient.status);
                  const topRec = recs.find(r => r.priority_level === 1) || recs[0];

                  return (
                    <div key={nutrient.id} className="p-4 border border-neutral-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-neutral-900">
                          Address {nutrient.nutrient_name} Deficiency
                        </h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          nutrient.status === 'very_low' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {nutrient.status === 'very_low' ? 'High Priority' : 'Medium Priority'}
                        </span>
                      </div>
                      {topRec && (
                        <div>
                          <p className="text-sm text-neutral-600 mb-2">{topRec.explanation}</p>
                          <p className="text-sm">
                            <span className="font-medium">Focus on: </span>
                            {topRec.recommended_foods.slice(0, 3).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default BloodworkAnalysis;
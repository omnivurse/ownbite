import React, { useState, useEffect } from 'react';
import { ChefHat, Loader2, Download, Share, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import PremiumFeatureGate from '../subscription/PremiumFeatureGate';

interface MealPlanGeneratorProps {
  bloodworkData?: any;
  nutrientDeficiencies?: string[];
  className?: string;
}

interface MealPlan {
  id: string;
  title: string;
  description: string;
  target_nutrients: string[];
  plan_data: {
    days: Array<{
      day: string;
      meals: Array<{
        type: string;
        name: string;
        ingredients: string[];
        nutrition: {
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
        benefits: string[];
      }>;
      daily_totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    }>;
    shopping_list: string[];
    tips: string[];
  };
  is_active: boolean;
  created_at: string;
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ 
  bloodworkData, 
  nutrientDeficiencies = [],
  className = '' 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [existingPlans, setExistingPlans] = useState<MealPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExistingPlans();
  }, [user]);

  const loadExistingPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setExistingPlans(data || []);
      
      // Set the most recent active plan
      const activePlan = data?.find(plan => plan.is_active);
      if (activePlan) {
        setMealPlan(activePlan);
      }
    } catch (err: any) {
      console.error('Error loading meal plans:', err);
    }
  };

  const generateMealPlan = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Call the meal plan generation edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-meal-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          bloodwork_data: bloodworkData,
          nutrient_deficiencies: nutrientDeficiencies,
          preferences: {
            dietary_restrictions: [], // Could be loaded from user profile
            allergies: [],
            cuisine_preferences: []
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const result = await response.json();

      // Save the meal plan to the database
      const { data: savedPlan, error: saveError } = await supabase
        .from('meal_plans')
        .insert([{
          user_id: user.id,
          title: result.title,
          description: result.description,
          target_nutrients: result.target_nutrients,
          plan_data: result.plan_data,
          is_active: true
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      // Deactivate other plans
      await supabase
        .from('meal_plans')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('id', savedPlan.id);

      setMealPlan(savedPlan);
      await loadExistingPlans();

    } catch (err: any) {
      console.error('Error generating meal plan:', err);
      setError(err.message || 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  const downloadMealPlan = () => {
    if (!mealPlan) return;

    const content = generateMealPlanText(mealPlan);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-plan-${mealPlan.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMealPlanText = (plan: MealPlan): string => {
    let content = `${plan.title}\n`;
    content += `${plan.description}\n\n`;
    content += `Target Nutrients: ${plan.target_nutrients.join(', ')}\n\n`;

    plan.plan_data.days.forEach(day => {
      content += `=== ${day.day} ===\n`;
      day.meals.forEach(meal => {
        content += `\n${meal.type}: ${meal.name}\n`;
        content += `Ingredients: ${meal.ingredients.join(', ')}\n`;
        content += `Calories: ${meal.nutrition.calories} | Protein: ${meal.nutrition.protein}g | Carbs: ${meal.nutrition.carbs}g | Fat: ${meal.nutrition.fat}g\n`;
        if (meal.benefits.length > 0) {
          content += `Benefits: ${meal.benefits.join(', ')}\n`;
        }
      });
      content += `\nDaily Totals: ${day.daily_totals.calories} calories, ${day.daily_totals.protein}g protein, ${day.daily_totals.carbs}g carbs, ${day.daily_totals.fat}g fat\n\n`;
    });

    if (plan.plan_data.shopping_list.length > 0) {
      content += `\n=== Shopping List ===\n`;
      plan.plan_data.shopping_list.forEach(item => {
        content += `• ${item}\n`;
      });
    }

    if (plan.plan_data.tips.length > 0) {
      content += `\n=== Tips ===\n`;
      plan.plan_data.tips.forEach(tip => {
        content += `• ${tip}\n`;
      });
    }

    return content;
  };

  // Free version fallback content
  const freePlanFallback = (
    <div className="text-center py-8">
      <ChefHat className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-neutral-900 mb-2">
        Personalized Meal Plans
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">
        Upgrade to Premium to get AI-generated meal plans based on your bloodwork results and nutritional needs.
      </p>
      <Button
        variant="primary"
        onClick={() => window.location.href = '/pricing'}
      >
        View Premium Plans
      </Button>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <PremiumFeatureGate
        featureName="AI Meal Plan Generator"
        featureDescription="Get personalized 7-day meal plans based on your bloodwork analysis and nutritional needs."
        fallback={freePlanFallback}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-neutral-900">
                  AI Meal Plan Generator
                </h3>
              </div>
              <Button
                onClick={generateMealPlan}
                disabled={loading}
                leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              >
                {loading ? 'Generating...' : 'Generate New Plan'}
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <p className="text-neutral-600">
                Get a personalized 7-day meal plan based on your bloodwork analysis and nutritional needs.
              </p>

              {nutrientDeficiencies.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Targeting Deficiencies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {nutrientDeficiencies.map((nutrient, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                      >
                        {nutrient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {mealPlan && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900">{mealPlan.title}</h4>
                  <p className="text-neutral-600">{mealPlan.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadMealPlan}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Share className="h-4 w-4" />}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Target Nutrients */}
                <div>
                  <h5 className="font-medium text-neutral-900 mb-2">Target Nutrients:</h5>
                  <div className="flex flex-wrap gap-2">
                    {mealPlan.target_nutrients.map((nutrient, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                      >
                        {nutrient}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Daily Meal Plans */}
                <div className="space-y-4">
                  <h5 className="font-medium text-neutral-900">7-Day Meal Plan:</h5>
                  <div className="grid gap-4">
                    {mealPlan.plan_data.days.slice(0, 3).map((day, index) => (
                      <div key={index} className="border border-neutral-200 rounded-lg p-4">
                        <h6 className="font-medium text-neutral-900 mb-3">{day.day}</h6>
                        <div className="space-y-2">
                          {day.meals.map((meal, mealIndex) => (
                            <div key={mealIndex} className="flex justify-between items-start">
                              <div>
                                <span className="font-medium text-sm text-neutral-700">
                                  {meal.type}:
                                </span>
                                <span className="ml-2 text-sm text-neutral-600">
                                  {meal.name}
                                </span>
                              </div>
                              <span className="text-sm text-neutral-500">
                                {meal.nutrition.calories} cal
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-neutral-100">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-neutral-700">Daily Total:</span>
                            <span className="text-neutral-600">
                              {day.daily_totals.calories} cal | 
                              {day.daily_totals.protein}g protein | 
                              {day.daily_totals.carbs}g carbs | 
                              {day.daily_totals.fat}g fat
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {mealPlan.plan_data.days.length > 3 && (
                    <p className="text-sm text-neutral-500 text-center">
                      + {mealPlan.plan_data.days.length - 3} more days (download for full plan)
                    </p>
                  )}
                </div>

                {/* Shopping List Preview */}
                {mealPlan.plan_data.shopping_list.length > 0 && (
                  <div>
                    <h5 className="font-medium text-neutral-900 mb-2">Shopping List Preview:</h5>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-1 text-sm text-neutral-600">
                        {mealPlan.plan_data.shopping_list.slice(0, 8).map((item, index) => (
                          <div key={index}>• {item}</div>
                        ))}
                      </div>
                      {mealPlan.plan_data.shopping_list.length > 8 && (
                        <p className="text-xs text-neutral-500 mt-2">
                          + {mealPlan.plan_data.shopping_list.length - 8} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Previous Plans */}
        {existingPlans.length > 0 && (
          <Card>
            <CardHeader>
              <h4 className="text-lg font-semibold text-neutral-900">Previous Meal Plans</h4>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {existingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      plan.is_active 
                        ? 'border-primary-200 bg-primary-50' 
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                    onClick={() => setMealPlan(plan)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-neutral-900">{plan.title}</h5>
                        <p className="text-sm text-neutral-600">{plan.description}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Created: {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {plan.is_active && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </PremiumFeatureGate>
    </div>
  );
};

export default MealPlanGenerator;
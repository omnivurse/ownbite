import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ChefHat, Calendar, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface MealPlanAccessProps {
  userId: string;
}

interface MealPlan {
  id: string;
  title: string;
  description: string;
  target_nutrients: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  plan_data: {
    days: Array<{
      day: string;
      meals: Array<{
        type: string;
        name: string;
      }>;
    }>;
  };
}

const MealPlanAccess: React.FC<MealPlanAccessProps> = ({ userId }) => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasPremiumAccess } = useSubscription();

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(2);

        if (error) throw error;
        setPlans(data || []);
      } catch (err: any) {
        console.error('Error fetching meal plans:', err);
        setError(err.message || 'Failed to load meal plans');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchPlans();
    }
  }, [userId]);

  const regeneratePlan = async () => {
    try {
      setRegenerating(true);
      
      // Get user's nutrient deficiencies
      const { data: nutrientData, error: nutrientError } = await supabase
        .from('user_nutrient_status')
        .select('nutrient_name')
        .eq('user_id', userId)
        .in('status', ['low', 'very_low'])
        .order('created_at', { ascending: false });
      
      if (nutrientError) throw nutrientError;
      
      const targetNutrients = nutrientData?.map(item => item.nutrient_name) || ['Vitamin D', 'Iron', 'Vitamin B12'];
      
      // Call the edge function to generate a meal plan
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-meal-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          nutrient_deficiencies: targetNutrients,
          preferences: {
            dietary_restrictions: [],
            allergies: [],
            cuisine_preferences: []
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }
      
      // Refresh the plans list
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(2);
        
      if (error) throw error;
      setPlans(data || []);
      
    } catch (err: any) {
      console.error('Error regenerating meal plan:', err);
      setError(err.message || 'Failed to regenerate meal plan');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                  <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="h-10 bg-neutral-200 rounded w-1/3"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Premium feature gate
  if (!hasPremiumAccess) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <ChefHat className="h-5 w-5 mr-2 text-primary-600" />
              Meal Plans
            </h2>
          </div>
          
          <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <ChefHat className="h-12 w-12 text-primary-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-primary-800 mb-2">
              Personalized Meal Plans
            </h3>
            <p className="text-primary-700 mb-4 max-w-md mx-auto">
              Upgrade to Premium to get AI-generated meal plans based on your bloodwork results and nutritional needs.
            </p>
            <Link to="/pricing">
              <Button variant="primary">
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <ChefHat className="h-5 w-5 mr-2 text-primary-600" />
            Meal Plans
          </h2>
          <Link to="/meal-plans">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {plans.length === 0 ? (
          <div className="text-center py-6">
            <ChefHat className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 mb-4">No meal plans generated yet</p>
            <Button 
              variant="primary" 
              onClick={regeneratePlan}
              disabled={regenerating}
              leftIcon={regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {regenerating ? 'Generating...' : 'Generate Meal Plan'}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {plans.map((plan) => (
                <div key={plan.id} className={`border rounded-lg p-4 hover:bg-neutral-50 transition-colors ${
                  plan.is_active ? 'border-primary-300 bg-primary-50' : 'border-neutral-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-neutral-500 mr-2" />
                      <span className="text-sm text-neutral-600">
                        {new Date(plan.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {plan.is_active && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-medium mb-1">{plan.title}</h3>
                  
                  <p className="text-sm text-neutral-600 mb-2">
                    {plan.description || 'Personalized meal plan based on your nutritional needs'}
                  </p>
                  
                  {plan.target_nutrients && plan.target_nutrients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {plan.target_nutrients.slice(0, 3).map((nutrient, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                          {nutrient}
                        </span>
                      ))}
                      {plan.target_nutrients.length > 3 && (
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs">
                          +{plan.target_nutrients.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {plan.plan_data?.days && (
                    <div className="text-sm text-neutral-600 mb-3">
                      <p className="font-medium">Sample meals:</p>
                      <ul className="mt-1 space-y-1">
                        {plan.plan_data.days[0]?.meals.slice(0, 2).map((meal, idx) => (
                          <li key={idx}>• {meal.type}: {meal.name}</li>
                        ))}
                        {plan.plan_data.days[0]?.meals.length > 2 && (
                          <li>• ...and {plan.plan_data.days[0].meals.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <Link to={`/meal-plans/${plan.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-1"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      View Full Plan
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            
            <Button 
              variant="primary" 
              onClick={regeneratePlan}
              disabled={regenerating}
              leftIcon={regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              className="w-full"
            >
              {regenerating ? 'Generating...' : 'Generate New Plan'}
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default MealPlanAccess;
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Award, Target } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';

interface NutritionSummaryProps {
  userId: string;
}

interface NutritionData {
  calories_today: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  streak_days: number;
  goals_met_today: boolean;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({ userId }) => {
  const [summary, setSummary] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fetch today's food entries
        const { data: entries, error: entriesError } = await supabase
          .from('food_entries')
          .select('calories, protein, carbs, fat')
          .eq('user_id', userId)
          .gte('timestamp', today.toISOString());
        
        if (entriesError) throw entriesError;
        
        // Calculate totals from entries
        const totals = entries?.reduce((acc, entry) => ({
          calories: acc.calories + (Number(entry.calories) || 0),
          protein: acc.protein + (Number(entry.protein) || 0),
          carbs: acc.carbs + (Number(entry.carbs) || 0),
          fat: acc.fat + (Number(entry.fat) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 }) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        // Fetch streak from daily_goal_logs
        const { data: streakData, error: streakError } = await supabase
          .from('daily_goal_logs')
          .select('log_date, overall_goal_met')
          .eq('user_id', userId)
          .order('log_date', { ascending: false })
          .limit(30);
        
        if (streakError) throw streakError;
        
        // Calculate streak
        let streak = 0;
        if (streakData && streakData.length > 0) {
          for (const log of streakData) {
            if (log.overall_goal_met) {
              streak++;
            } else {
              break;
            }
          }
        }
        
        // Check if goals were met today
        const { data: todayLog, error: todayLogError } = await supabase
          .from('daily_goal_logs')
          .select('overall_goal_met')
          .eq('user_id', userId)
          .eq('log_date', today.toISOString().split('T')[0])
          .single();
        
        const goalsMet = todayLog?.overall_goal_met || false;
        
        setSummary({
          calories_today: Math.round(totals.calories),
          protein_g: Math.round(totals.protein),
          carbs_g: Math.round(totals.carbs),
          fat_g: Math.round(totals.fat),
          streak_days: streak,
          goals_met_today: goalsMet
        });
      } catch (err: any) {
        console.error('Error fetching nutrition summary:', err);
        setError(err.message || 'Failed to load nutrition data');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchSummary();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-red-500">Error loading nutrition data: {error}</p>
        </CardBody>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardBody>
          <h2 className="text-xl font-semibold mb-4">📊 Nutrition Summary</h2>
          <p className="text-neutral-600">No nutrition data available yet. Start tracking your meals to see your summary.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary-600" />
            Nutrition Summary
          </h2>
          {summary.goals_met_today && (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <Award className="h-4 w-4 mr-1" />
              Goals Met Today!
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{summary.calories_today}</div>
            <div className="text-sm text-neutral-600">Calories</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.protein_g}g</div>
            <div className="text-sm text-neutral-600">Protein</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{summary.carbs_g}g</div>
            <div className="text-sm text-neutral-600">Carbs</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{summary.fat_g}g</div>
            <div className="text-sm text-neutral-600">Fat</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-neutral-500">
            Updated today
          </div>
          <div className="flex items-center text-primary-600 font-medium">
            <TrendingUp className="h-4 w-4 mr-1" />
            Streak: {summary.streak_days} days
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default NutritionSummary;
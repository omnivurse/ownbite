import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Car, 
  Smartphone, 
  Moon, 
  Droplets, 
  Utensils, 
  Wine, 
  DollarSign,
  Save,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { activityService } from '../services/activityService';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import PremiumFeatureGate from '../components/subscription/PremiumFeatureGate';

const ActivityLoggerPage: React.FC = () => {
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Activity log states
  const [sittingHours, setSittingHours] = useState<number>(6);
  const [drivingHours, setDrivingHours] = useState<number>(1);
  const [screenTimeHours, setScreenTimeHours] = useState<number>(4);
  const [sleepHours, setSleepHours] = useState<number>(7);
  
  // Screen time breakdown
  const [socialMediaHours, setSocialMediaHours] = useState<number>(1);
  const [workHours, setWorkHours] = useState<number>(2);
  const [entertainmentHours, setEntertainmentHours] = useState<number>(0.5);
  const [educationHours, setEducationHours] = useState<number>(0.5);
  
  // Nutrition log states
  const [hydrationPct, setHydrationPct] = useState<number>(70);
  const [fastFood, setFastFood] = useState<boolean>(false);
  
  // Substance log states
  const [alcoholAmount, setAlcoholAmount] = useState<number>(0);
  
  // Diet spending states
  const [spendingAmount, setSpendingAmount] = useState<number>(0);
  const [spendingCategory, setSpendingCategory] = useState<string>('groceries');

  useEffect(() => {
    if (user) {
      loadExistingData();
    }
  }, [user, date]);

  const loadExistingData = async () => {
    try {
      // Load activity log
      const activityLog = await activityService.getActivityLog(date);
      
      if (activityLog) {
        setSittingHours(activityLog.sitting_hours || 6);
        setDrivingHours(activityLog.driving_hours || 1);
        setScreenTimeHours(activityLog.screen_time_hours || 4);
        setSleepHours(activityLog.sleep_hours || 7);
        
        // Parse screen time breakdown
        if (activityLog.screen_time_breakdown) {
          const breakdown = activityLog.screen_time_breakdown;
          setSocialMediaHours(breakdown.social_media || 1);
          setWorkHours(breakdown.work || 2);
          setEntertainmentHours(breakdown.entertainment || 0.5);
          setEducationHours(breakdown.education || 0.5);
        }
      }
      
      // Other data loading would go here using the service
      
    } catch (error) {
      console.error('Error loading existing data:', error);
      // Not showing error to user as this is just loading existing data
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to save data');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Calculate total screen time
      const totalScreenTime = socialMediaHours + workHours + entertainmentHours + educationHours;
      
      // Create screen time breakdown object
      const screenTimeBreakdown = {
        social_media: socialMediaHours,
        work: workHours,
        entertainment: entertainmentHours,
        education: educationHours
      };
      
      // Save activity log using service
      await activityService.saveActivityLog({
        date,
        sitting_hours: sittingHours,
        driving_hours: drivingHours,
        screen_time_hours: totalScreenTime,
        screen_time_breakdown: screenTimeBreakdown,
        sleep_hours: sleepHours
      });
      
      // Save nutrition log
      await activityService.saveNutritionLog({
        date,
        hydration_pct: hydrationPct
      });
      
      // Save food log
      await activityService.saveFoodLog({
        date,
        is_fast_food: fastFood
      });
      
      // Save substance log (only if alcohol amount > 0)
      if (alcoholAmount > 0) {
        await activityService.saveSubstanceLog({
          date,
          substance_type: 'alcohol',
          amount: alcoholAmount
        });
      }
      
      // Save diet spending (only if amount > 0)
      if (spendingAmount > 0) {
        await activityService.saveDietSpending({
          date,
          amount: spendingAmount,
          category: spendingCategory
        });
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving activity data:', err);
      setError(err.message || 'Failed to save data');
    } finally {
      setLoading(false);
    }
  };

  // Premium+ feature gate content
  const premiumPlusFallback = (
    <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-blue-900 mb-3">
        Activity & Lifestyle Tracking
      </h3>
      <p className="text-blue-700 mb-6 max-w-lg mx-auto">
        Upgrade to Premium+ to track your daily activities, sleep patterns, screen time, and more.
        Get personalized insights to improve your lifestyle habits.
      </p>
      <Button 
        variant="primary"
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => navigate('/pricing')}
      >
        Upgrade to Premium+
      </Button>
    </div>
  );

  return (
    <PageContainer title="Activity Logger">
      <PremiumFeatureGate
        featureName="Activity & Lifestyle Tracking"
        featureDescription="Track your daily activities, sleep patterns, screen time, and more."
        fallback={premiumPlusFallback}
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-900">Daily Activity Logger</h1>
            <p className="text-neutral-600 mt-1">
              Track your daily activities and habits to get personalized insights
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">Your activity data has been saved successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Date Selector */}
            <Card className="mb-6">
              <CardBody>
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-neutral-500" />
                  <label htmlFor="date" className="font-medium text-neutral-700">Select Date:</label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Activity Tracking */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    Activity Tracking
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="sitting-hours" className="block text-sm font-medium text-neutral-700 mb-1">
                        Sitting Hours
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="sitting-hours"
                          min="0"
                          max="16"
                          step="0.5"
                          value={sittingHours}
                          onChange={(e) => setSittingHours(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-3 w-12 text-center">{sittingHours}h</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="driving-hours" className="block text-sm font-medium text-neutral-700 mb-1">
                        Driving Hours
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="driving-hours"
                          min="0"
                          max="10"
                          step="0.5"
                          value={drivingHours}
                          onChange={(e) => setDrivingHours(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-3 w-12 text-center">{drivingHours}h</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="sleep-hours" className="block text-sm font-medium text-neutral-700 mb-1">
                        Sleep Hours
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="sleep-hours"
                          min="0"
                          max="12"
                          step="0.5"
                          value={sleepHours}
                          onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-3 w-12 text-center">{sleepHours}h</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Screen Time */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                    <Smartphone className="h-5 w-5 mr-2 text-purple-600" />
                    Screen Time
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="social-media" className="block text-sm font-medium text-neutral-700 mb-1">
                        Social Media
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="social-media"
                          min="0"
                          max="8"
                          step="0.5"
                          value={socialMediaHours}
                          onChange={(e) => setSocialMediaHours(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-3 w-12 text-center">{socialMediaHours}h</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="work-screen" className="block text-sm font-medium text-neutral-700 mb-1">
                        Work
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="work-screen"
                          min="0"
                          max="12"
                          step="0.5"
                          value={workHours}
                          onChange={(e) => setWorkHours(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-3 w-12 text-center">{workHours}h</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="entertainment" className="block text-sm font-medium text-neutral-700 mb-1">
                        Entertainment
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="entertainment"
                          min="0"
                          max="8"
                          step="0.5"
                          value={entertainmentHours}
                          onChange={(e) => setEntertainmentHours(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-3 w-12 text-center">{entertainmentHours}h</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="education" className="block text-sm font-medium text-neutral-700 mb-1">
                        Education
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="education"
                          min="0"
                          max="8"
                          step="0.5"
                          value={educationHours}
                          onChange={(e) => setEducationHours(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-3 w-12 text-center">{educationHours}h</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-neutral-700">Total Screen Time:</span>
                        <span className="font-bold text-purple-600">
                          {(socialMediaHours + workHours + entertainmentHours + educationHours).toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Nutrition & Hydration */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-blue-600" />
                    Hydration & Nutrition
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="hydration" className="block text-sm font-medium text-neutral-700 mb-1">
                        Hydration Level (% of daily goal)
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="hydration"
                          min="0"
                          max="100"
                          step="5"
                          value={hydrationPct}
                          onChange={(e) => setHydrationPct(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-3 w-12 text-center">{hydrationPct}%</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="fast-food"
                        checked={fastFood}
                        onChange={(e) => setFastFood(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label htmlFor="fast-food" className="ml-2 block text-sm text-neutral-700">
                        Consumed fast food today
                      </label>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Substances & Spending */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                    <Wine className="h-5 w-5 mr-2 text-red-600" />
                    Substances & Spending
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="alcohol" className="block text-sm font-medium text-neutral-700 mb-1">
                        Alcohol Drinks
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="alcohol"
                          min="0"
                          max="10"
                          step="1"
                          value={alcoholAmount}
                          onChange={(e) => setAlcoholAmount(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-3 w-12 text-center">{alcoholAmount}</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="spending" className="block text-sm font-medium text-neutral-700 mb-1">
                        Food Spending ($)
                      </label>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                        <input
                          type="number"
                          id="spending"
                          min="0"
                          step="0.01"
                          value={spendingAmount}
                          onChange={(e) => setSpendingAmount(parseFloat(e.target.value))}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
                        Spending Category
                      </label>
                      <select
                        id="category"
                        value={spendingCategory}
                        onChange={(e) => setSpendingCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="groceries">Groceries</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="takeout">Takeout</option>
                        <option value="delivery">Delivery</option>
                        <option value="supplements">Supplements</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={loading}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Activity Data
              </Button>
            </div>
          </form>
        </div>
      </PremiumFeatureGate>
    </PageContainer>
  );
};

export default ActivityLoggerPage;
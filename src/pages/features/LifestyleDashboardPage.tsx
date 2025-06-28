import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutGrid, 
  Activity, 
  Clock, 
  Smartphone, 
  Moon, 
  Droplets, 
  CheckCircle, 
  ArrowRight,
  Brain,
  BarChart,
  Calendar,
  Target
} from 'lucide-react';
import PageContainer from '../../components/Layout/PageContainer';
import Card, { CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const LifestyleDashboardPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 py-12">
          <div className="inline-flex p-4 bg-blue-100 rounded-full mb-6">
            <LayoutGrid className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-6">
            Health & Lifestyle Dashboard
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Track your daily habits, sleep patterns, and lifestyle metrics with our comprehensive KPI dashboard.
            Get AI-powered insights to improve your overall health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<LayoutGrid className="h-5 w-5" />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Lifestyle Dashboard
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant="outline"
                size="lg"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="absolute -right-1 -top-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Track Your Habits</h3>
              <p className="text-neutral-600">
                Log your daily activities including sleep, screen time, sitting time, hydration, and more through our simple activity logger.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <BarChart className="h-8 w-8 text-blue-600" />
                <div className="absolute -right-1 -top-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Visualize Patterns</h3>
              <p className="text-neutral-600">
                See your lifestyle data transformed into intuitive charts and visualizations that reveal patterns and trends over time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Brain className="h-8 w-8 text-blue-600" />
                <div className="absolute -right-1 -top-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Get AI Insights</h3>
              <p className="text-neutral-600">
                Receive personalized AI-powered insights and recommendations to improve your lifestyle habits and overall health.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Activity Tracking
                    </h3>
                    <p className="text-neutral-600">
                      Monitor sitting time, driving time, and physical activity to understand your movement patterns and identify opportunities for improvement.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Screen Time Analysis
                    </h3>
                    <p className="text-neutral-600">
                      Track your screen usage across different categories (work, social media, entertainment, education) and get insights on digital wellness.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Moon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Sleep Pattern Monitoring
                    </h3>
                    <p className="text-neutral-600">
                      Track your sleep duration and visualize patterns over time to optimize your rest and recovery for better health and energy.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      AI Health Insights
                    </h3>
                    <p className="text-neutral-600">
                      Receive personalized recommendations and insights based on your lifestyle data, helping you make targeted improvements for better health.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            Dashboard Preview
          </h2>
          
          <Card className="border-blue-200">
            <CardBody className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-900">Goal Completion</h3>
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                  <p className="text-sm text-green-700">Overall health goals met</p>
                  <div className="mt-4 w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">Streak</h3>
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">5 days</div>
                  <p className="text-sm text-blue-700">Consecutive days on track</p>
                  <div className="mt-4 flex space-x-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <div 
                        key={day} 
                        className={`flex-1 h-2 rounded-full ${
                          day <= 5 ? 'bg-blue-600' : 'bg-blue-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-purple-900">Weekly Activity</h3>
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
                  <p className="text-sm text-purple-700">Food scans this week</p>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-purple-700 font-medium">Active</span>
                    <span className="ml-auto text-purple-600">👍 Great!</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <Clock className="h-5 w-5 mr-2 text-orange-500" />
                    Sitting Time
                  </h3>
                  <div className="h-48 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <p className="text-neutral-500">Chart visualization of sitting hours</p>
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    Average: 6.5 hours/day
                  </p>
                </div>
                
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center mb-4">
                    <Smartphone className="h-5 w-5 mr-2 text-purple-500" />
                    Screen Time
                  </h3>
                  <div className="h-48 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <p className="text-neutral-500">Chart visualization of screen usage</p>
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    Total: 12 hours/day
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-indigo-600" />
                    AI Health Insights
                  </h3>
                </div>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-indigo-800">
                    Based on your data, here are some insights and recommendations:
                  </p>
                  <ul className="text-indigo-800">
                    <li>Your average sitting time of 6.5 hours per day is moderate. Try to incorporate more standing or walking breaks.</li>
                    <li>Your sleep duration of 7.2 hours is within the recommended range for optimal health.</li>
                    <li>Your screen time is high at 12 hours per day. Consider implementing screen-free periods, especially before bedtime.</li>
                    <li>Your hydration level is at 75% of your goal. Try to increase your water intake throughout the day.</li>
                  </ul>
                  <p className="text-indigo-800 font-medium">
                    Personalized Recommendation: Focus on reducing screen time for the greatest health impact this week.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-neutral-600 mb-4">
                  This is just a preview. Your personalized dashboard will include more metrics and insights tailored to your specific lifestyle patterns.
                </p>
                <Link to="/login">
                  <Button
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Get Your Dashboard
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Benefits */}
        <div className="mb-20 bg-blue-50 py-16 px-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            Benefits of Lifestyle Tracking
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Awareness & Insight</h3>
                <p className="text-neutral-600">
                  Gain a clear understanding of your daily habits and patterns, revealing opportunities for improvement you might not have noticed.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Holistic Health View</h3>
                <p className="text-neutral-600">
                  See how different aspects of your lifestyle interact and impact your overall health, nutrition, and wellbeing.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Personalized Recommendations</h3>
                <p className="text-neutral-600">
                  Receive AI-generated suggestions tailored to your specific lifestyle patterns and health goals.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Progress Tracking</h3>
                <p className="text-neutral-600">
                  Monitor improvements in your lifestyle habits over time and celebrate your progress with streak tracking and goal completion metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            User Experiences
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">JD</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Jennifer D.</h4>
                    <p className="text-sm text-neutral-500">Reduced screen time</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "I had no idea I was spending 7+ hours on my phone daily until I started tracking. The dashboard helped me set realistic goals to reduce screen time, and I'm sleeping better as a result."
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">MT</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Mark T.</h4>
                    <p className="text-sm text-neutral-500">Improved sleep habits</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "The sleep pattern visualization showed me how inconsistent my sleep schedule was. After following the AI recommendations, my sleep quality improved dramatically within weeks."
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">KL</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Karen L.</h4>
                    <p className="text-sm text-neutral-500">Reduced sitting time</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "As someone with a desk job, I was shocked to see I was sitting 10+ hours daily. The dashboard's reminders helped me incorporate movement breaks, and my back pain has decreased significantly."
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-12 mb-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Transform Your Lifestyle Habits</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Start tracking your lifestyle metrics today and get personalized insights to improve your overall health and wellbeing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-neutral-100 border-0 px-8 py-4 text-lg font-semibold"
                leftIcon={<LayoutGrid className="h-5 w-5" />}
              >
                Start Tracking Today
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
              >
                View Premium+ Plans
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  How is my lifestyle data used?
                </h3>
                <p className="text-neutral-600">
                  Your lifestyle data is used solely to provide you with personalized insights and recommendations. We never share your personal data with third parties without your explicit consent.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Can I export my lifestyle data?
                </h3>
                <p className="text-neutral-600">
                  Yes! Premium+ users can export their lifestyle data in CSV format for personal analysis or to share with healthcare providers.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  How often should I log my activities?
                </h3>
                <p className="text-neutral-600">
                  For the most accurate insights, we recommend logging your activities daily. However, you can log as frequently as works for your schedule.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Can I connect wearable devices?
                </h3>
                <p className="text-neutral-600">
                  We're currently developing integrations with popular wearable devices and health apps. This feature will be available to Premium+ users in the near future.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Join OwnBite Premium+ and unlock our comprehensive Health & Lifestyle Dashboard to transform your daily habits.
          </p>
          <Link to="/login">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default LifestyleDashboardPage;
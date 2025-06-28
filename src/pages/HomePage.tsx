import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scan, 
  ChefHat, 
  ShoppingCart, 
  MessageCircle, 
  FileText, 
  Activity,
  TestTube,
  Target,
  TrendingUp,
  Brain,
  Heart,
  Shield,
  Zap,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  LayoutGrid
} from 'lucide-react';
import Button from '../components/ui/Button';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';

const HomePage: React.FC = () => {
  return (
    <PageContainer className="bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="py-16 sm:py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-600 rounded-full shadow-lg">
              <Scan className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl md:text-7xl mb-6">
            <span className="block">What Are You Eating?</span>
            <span className="block text-[#4E5BA6] font-handwritten text-4xl sm:text-5xl md:text-6xl mt-4">
              Bite smarter, one calorie at a time.
            </span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-neutral-600 leading-relaxed">
            The world's most advanced AI-powered nutrition platform. Scan your meals, analyze your bloodwork, 
            get personalized meal plans, track your lifestyle habits, and transform your health with science-backed recommendations.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Scan className="h-5 w-5" />}
                className="bg-[#4A6541] hover:bg-[#3c5335] text-white px-8 py-4 text-lg"
              >
                Start Scanning Food
              </Button>
            </Link>
            <Link to="/onboarding">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<TestTube className="h-5 w-5" />}
                className="px-8 py-4 text-lg"
              >
                Upload Bloodwork
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* New Features Highlight */}
      <div className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">New Features</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Discover our latest innovations to help you achieve your health goals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link to="/features/lifestyle-dashboard">
            <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardBody className="p-6 text-center">
                <div className="bg-primary-100 p-4 rounded-full inline-flex mx-auto mb-4">
                  <LayoutGrid className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Health & Lifestyle Dashboard</h3>
                <p className="text-neutral-600 mb-4">
                  Track your daily habits, sleep patterns, and lifestyle metrics with our comprehensive KPI dashboard.
                </p>
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  Learn More
                </span>
              </CardBody>
            </Card>
          </Link>
          
          <Link to="/features/bloodwork-analysis">
            <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardBody className="p-6 text-center">
                <div className="bg-blue-100 p-4 rounded-full inline-flex mx-auto mb-4">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Bloodwork Trend Analysis</h3>
                <p className="text-neutral-600 mb-4">
                  Track your nutrient levels over time with AI-powered insights and personalized recommendations.
                </p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Learn More
                </span>
              </CardBody>
            </Card>
          </Link>
          
          <Link to="/features/community-recipes">
            <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardBody className="p-6 text-center">
                <div className="bg-purple-100 p-4 rounded-full inline-flex mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Community Recipe Sharing</h3>
                <p className="text-neutral-600 mb-4">
                  Share your favorite healthy recipes, get inspired by others, and build your collection.
                </p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Learn More
                </span>
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Trusted by Health-Conscious Users</h2>
          <p className="text-xl text-neutral-600">Join thousands making smarter nutrition choices</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
            <div className="text-neutral-600">Foods Scanned</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
            <div className="text-neutral-600">Meal Plans Generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">5K+</div>
            <div className="text-neutral-600">Bloodwork Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
            <div className="text-neutral-600">User Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">Complete Nutrition Intelligence</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            From AI food scanning to bloodwork analysis, OwnBite provides everything you need for optimal nutrition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* AI Food Scanner */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <div className="p-6 bg-primary-100 rounded-2xl">
                <Scan className="h-12 w-12 text-primary-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                <Link to="/features/food-scanner" className="hover:text-primary-600 transition-colors">
                  AI Food Scanner
                </Link>
              </h3>
              <p className="text-neutral-600 mb-4">
                Take a photo of any meal and get instant nutritional analysis. Our advanced AI identifies 
                ingredients, calculates macros, and provides health insights in seconds.
              </p>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Instant macro breakdown</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Health benefits & risks</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Ingredient identification</li>
              </ul>
            </div>
          </div>

          {/* Bloodwork Analysis */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <div className="p-6 bg-red-100 rounded-2xl">
                <TestTube className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                <Link to="/features/bloodwork-analysis" className="hover:text-red-600 transition-colors">
                  Bloodwork Analysis
                </Link>
              </h3>
              <p className="text-neutral-600 mb-4">
                Upload your lab results and get AI-powered analysis of nutrient deficiencies, 
                optimal ranges, and personalized food recommendations.
              </p>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Nutrient deficiency detection</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Personalized recommendations</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Progress tracking</li>
              </ul>
            </div>
          </div>

          {/* AI Meal Plans */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <div className="p-6 bg-purple-100 rounded-2xl">
                <ChefHat className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                <Link to="/features/meal-plans" className="hover:text-purple-600 transition-colors">
                  AI Meal Plans
                </Link>
              </h3>
              <p className="text-neutral-600 mb-4">
                Get personalized 7-day meal plans based on your bloodwork analysis, dietary preferences, 
                and nutrition goals. Complete with shopping lists and prep instructions.
              </p>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Bloodwork-based planning</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Shopping lists included</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Dietary restrictions support</li>
              </ul>
            </div>
          </div>

          {/* Health & Lifestyle Dashboard */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <div className="p-6 bg-blue-100 rounded-2xl">
                <LayoutGrid className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                <Link to="/features/lifestyle-dashboard" className="hover:text-blue-600 transition-colors">
                  Health & Lifestyle Dashboard
                </Link>
              </h3>
              <p className="text-neutral-600 mb-4">
                Track your daily habits, sleep patterns, and lifestyle metrics with our comprehensive KPI dashboard.
                Get AI-powered insights to improve your overall health.
              </p>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Hydration & sleep tracking</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Screen time & activity monitoring</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Personalized lifestyle insights</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<MessageCircle className="h-8 w-8 text-primary-600" />}
            title="AI Nutrition Coach"
            description="Get personalized advice and answers to your nutrition questions from our AI coach."
            link="/coach"
          />
          <FeatureCard 
            icon={<FileText className="h-8 w-8 text-primary-600" />}
            title="Food Diary"
            description="Track your daily nutrition intake with smart logging and progress analytics."
            link="/diary"
          />
          <FeatureCard 
            icon={<Target className="h-8 w-8 text-primary-600" />}
            title="Goal Tracking"
            description="Set and monitor nutrition goals with streak tracking and achievement rewards."
            link="/diary"
          />
          <FeatureCard 
            icon={<TrendingUp className="h-8 w-8 text-primary-600" />}
            title="Progress Analytics"
            description="Visualize your nutrition trends and health improvements over time."
            link="/diary"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-neutral-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">How OwnBite Works</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Transform your nutrition in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-primary-600 rounded-full">
                <Scan className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">1. Scan & Upload</h3>
            <p className="text-neutral-600">
              Take photos of your meals and upload your bloodwork results. Our AI analyzes everything instantly.
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-primary-600 rounded-full">
                <Brain className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">2. AI Analysis</h3>
            <p className="text-neutral-600">
              Get personalized insights, nutrient deficiency alerts, and science-backed recommendations.
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-primary-600 rounded-full">
                <Heart className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">3. Transform Health</h3>
            <p className="text-neutral-600">
              Follow your personalized meal plans and track your progress toward optimal health.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">Why Choose OwnBite?</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            The most comprehensive nutrition platform backed by science and powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard 
            icon={<Shield className="h-8 w-8 text-blue-600" />}
            title="Science-Backed"
            description="All recommendations based on peer-reviewed research and clinical nutrition guidelines."
          />
          <BenefitCard 
            icon={<Zap className="h-8 w-8 text-yellow-600" />}
            title="Instant Results"
            description="Get immediate nutritional analysis and recommendations in seconds, not days."
          />
          <BenefitCard 
            icon={<Users className="h-8 w-8 text-green-600" />}
            title="Expert Approved"
            description="Developed with registered dietitians and nutrition professionals."
          />
          <BenefitCard 
            icon={<Award className="h-8 w-8 text-purple-600" />}
            title="Proven Results"
            description="Users report 40% improvement in nutrition goals within 30 days."
          />
          <BenefitCard 
            icon={<Activity className="h-8 w-8 text-red-600" />}
            title="Comprehensive Tracking"
            description="Monitor everything from macros to micronutrients and biomarkers."
          />
          <BenefitCard 
            icon={<Star className="h-8 w-8 text-orange-600" />}
            title="Personalized Experience"
            description="Every recommendation tailored to your unique biology and goals."
          />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">What Our Users Say</h2>
          <p className="text-xl text-neutral-600">Real results from real people</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="OwnBite helped me identify vitamin D deficiency through my bloodwork analysis. The personalized meal plan increased my levels by 60% in just 3 months!"
            author="Sarah M."
            role="Wellness Enthusiast"
          />
          <TestimonialCard 
            quote="The AI food scanner is incredibly accurate. I've learned so much about hidden sugars and nutrients in my daily meals. Game changer!"
            author="Mike R."
            role="Fitness Coach"
          />
          <TestimonialCard 
            quote="As a busy professional, the meal planning feature saves me hours each week. The grocery integration makes healthy eating effortless."
            author="Dr. Lisa K."
            role="Healthcare Professional"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Nutrition?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of users who have already improved their health with OwnBite's AI-powered nutrition platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding">
              <Button
                size="lg"
                className="bg-secondary-500 text-white hover:bg-secondary-600 border-0 px-8 py-4 text-lg font-semibold"
                leftIcon={<Scan className="h-5 w-5" />}
              >
                Start Free Today
              </Button>
            </Link>
            <Link to="/onboarding">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg"
                leftIcon={<TestTube className="h-5 w-5" />}
              >
                Upload Bloodwork
              </Button>
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-75">No credit card required • Free forever plan available</p>
        </div>
      </div>
    </PageContainer>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, link }) => {
  return (
    <Link to={link}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
        <CardBody className="text-center p-6">
          <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">{title}</h3>
          <p className="text-neutral-600 mb-4">{description}</p>
          <div className="flex items-center justify-center text-primary-600 group-hover:text-primary-700">
            <span className="text-sm font-medium mr-1">Learn More</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="h-full">
      <CardBody className="text-center p-6">
        <div className="flex justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">{title}</h3>
        <p className="text-neutral-600">{description}</p>
      </CardBody>
    </Card>
  );
};

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role }) => {
  return (
    <Card className="h-full">
      <CardBody className="p-6">
        <div className="flex justify-center mb-4">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>
        <blockquote className="text-neutral-700 mb-4 italic">"{quote}"</blockquote>
        <div className="text-center">
          <div className="font-semibold text-neutral-900">{author}</div>
          <div className="text-sm text-neutral-500">{role}</div>
        </div>
      </CardBody>
    </Card>
  );
};

export default HomePage;
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TestTube, 
  FileText, 
  Brain, 
  ChefHat, 
  CheckCircle, 
  ArrowRight,
  Activity,
  TrendingUp,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import PageContainer from '../../components/Layout/PageContainer';
import Card, { CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const BloodworkAnalysisPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 py-12">
          <div className="inline-flex p-4 bg-red-100 rounded-full mb-6">
            <TestTube className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-6">
            Bloodwork Analysis
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Upload your lab results and get AI-powered analysis of nutrient deficiencies, 
            with personalized food recommendations to address your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<TestTube className="h-5 w-5" />}
              >
                Try Bloodwork Analysis
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
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <FileText className="h-8 w-8 text-red-600" />
                <div className="absolute -right-1 -top-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Upload Your Labs</h3>
              <p className="text-neutral-600">
                Simply upload your blood test results in PDF format or take a photo. Our system works with lab results from any provider.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Brain className="h-8 w-8 text-red-600" />
                <div className="absolute -right-1 -top-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">AI Analysis</h3>
              <p className="text-neutral-600">
                Our advanced AI analyzes your results, identifying nutrient deficiencies, imbalances, and areas for improvement based on optimal ranges.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <ChefHat className="h-8 w-8 text-red-600" />
                <div className="absolute -right-1 -top-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Personalized Recommendations</h3>
              <p className="text-neutral-600">
                Receive personalized food recommendations and meal plans specifically designed to address your unique nutritional needs.
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
                  <div className="p-3 bg-red-100 rounded-lg mr-4">
                    <Activity className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Comprehensive Analysis
                    </h3>
                    <p className="text-neutral-600">
                      Our AI analyzes over 40 biomarkers including vitamins, minerals, hormones, and metabolic markers to provide a complete picture of your nutritional health.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-red-100 rounded-lg mr-4">
                    <TrendingUp className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Trend Analysis
                    </h3>
                    <p className="text-neutral-600">
                      Track changes in your biomarkers over time with our trend visualization tools. See how your nutrition interventions impact your health metrics.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-red-100 rounded-lg mr-4">
                    <ChefHat className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Personalized Meal Plans
                    </h3>
                    <p className="text-neutral-600">
                      Receive AI-generated meal plans specifically designed to address your nutrient deficiencies and health goals, complete with recipes and shopping lists.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-red-100 rounded-lg mr-4">
                    <Target className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Targeted Recommendations
                    </h3>
                    <p className="text-neutral-600">
                      Get specific food recommendations for each nutrient deficiency, with explanations of why these foods will help improve your levels.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20 bg-red-50 py-16 px-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            Benefits of Bloodwork Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Personalized Nutrition</h3>
                <p className="text-neutral-600">
                  Move beyond generic nutrition advice to a truly personalized approach based on your unique biochemistry and nutritional needs.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Identify Hidden Deficiencies</h3>
                <p className="text-neutral-600">
                  Discover nutrient deficiencies that might be affecting your energy, mood, immune function, and overall health before they cause symptoms.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Targeted Interventions</h3>
                <p className="text-neutral-600">
                  Focus your nutrition efforts where they matter most, addressing specific deficiencies rather than taking unnecessary supplements.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Track Progress</h3>
                <p className="text-neutral-600">
                  Monitor improvements in your biomarkers over time, seeing concrete evidence of how your dietary changes are improving your health.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            Success Stories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 font-bold">MR</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Michael R.</h4>
                    <p className="text-sm text-neutral-500">Discovered Vitamin D deficiency</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "The bloodwork analysis revealed my severe Vitamin D deficiency that my doctor hadn't emphasized. Following the dietary recommendations for 3 months improved my levels by 60%!"
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 font-bold">SJ</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Sarah J.</h4>
                    <p className="text-sm text-neutral-500">Addressed iron deficiency</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "I'd been feeling tired for months. The analysis showed low iron levels and gave me specific foods to include. The meal plans made it easy to incorporate these foods daily."
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 font-bold">TK</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Tom K.</h4>
                    <p className="text-sm text-neutral-500">Optimized multiple nutrients</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "I upload my labs quarterly now. The trend analysis shows how my nutrition has improved across multiple markers. It's motivating to see the direct impact of my diet changes."
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-12 mb-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Unlock Your Nutritional Health</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Stop guessing about your nutrition needs. Get personalized, science-based recommendations with our AI bloodwork analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-neutral-100 border-0 px-8 py-4 text-lg font-semibold"
                leftIcon={<TestTube className="h-5 w-5" />}
              >
                Upload Your Labs
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 text-lg"
              >
                View Pricing Plans
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
                  What types of lab results can I upload?
                </h3>
                <p className="text-neutral-600">
                  Our system works with standard blood test results from any lab or healthcare provider. You can upload PDFs, images of printed results, or manually enter values.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Is my health data secure?
                </h3>
                <p className="text-neutral-600">
                  Absolutely. We use bank-level encryption to protect your data, and we never share your personal health information with third parties without your explicit consent.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Does this replace medical advice?
                </h3>
                <p className="text-neutral-600">
                  No. Our analysis provides nutritional insights and recommendations, but it's not a substitute for professional medical advice. Always consult with healthcare providers for medical concerns.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  How often should I upload new results?
                </h3>
                <p className="text-neutral-600">
                  For optimal tracking, we recommend uploading new bloodwork every 3-6 months. This allows you to monitor changes and adjust your nutrition plan accordingly.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Take Control of Your Nutritional Health
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Join OwnBite today and discover how our AI-powered bloodwork analysis can transform your approach to nutrition.
          </p>
          <Link to="/login">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default BloodworkAnalysisPage;
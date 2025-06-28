import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scan, 
  Camera, 
  FileText, 
  Zap, 
  Brain, 
  CheckCircle, 
  ArrowRight,
  Smartphone,
  BarChart
} from 'lucide-react';
import PageContainer from '../../components/Layout/PageContainer';
import Card, { CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const FoodScannerPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 py-12">
          <div className="inline-flex p-4 bg-primary-100 rounded-full mb-6">
            <Scan className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-6">
            AI Food Scanner
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Take a photo of any meal and get instant nutritional analysis. Our advanced AI identifies 
            ingredients, calculates macros, and provides health insights in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Scan className="h-5 w-5" />}
              >
                Try Food Scanner
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
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="h-8 w-8 text-primary-600" />
                <div className="absolute -right-1 -top-1 bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Take a Photo</h3>
              <p className="text-neutral-600">
                Simply snap a picture of your meal using your smartphone camera. Our app works with any food - home-cooked, restaurant meals, or packaged items.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-primary-600" />
                <div className="absolute -right-1 -top-1 bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">AI Analysis</h3>
              <p className="text-neutral-600">
                Our advanced AI instantly identifies ingredients, portion sizes, and calculates detailed nutritional information with remarkable accuracy.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-primary-600" />
                <div className="absolute -right-1 -top-1 bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Get Results</h3>
              <p className="text-neutral-600">
                View comprehensive nutrition data including calories, macros, and micronutrients. Save to your food diary and track your nutrition goals.
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
                  <div className="p-3 bg-primary-100 rounded-lg mr-4">
                    <Zap className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Instant Analysis
                    </h3>
                    <p className="text-neutral-600">
                      Get nutritional information in seconds, no manual logging required. Our AI processes your food photos instantly for immediate results.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-primary-100 rounded-lg mr-4">
                    <Brain className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Advanced AI Recognition
                    </h3>
                    <p className="text-neutral-600">
                      Our AI can identify multiple food items in a single image, recognize cooking methods, and estimate portion sizes with high accuracy.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-primary-100 rounded-lg mr-4">
                    <BarChart className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Comprehensive Nutrition Data
                    </h3>
                    <p className="text-neutral-600">
                      Get detailed information on calories, macronutrients (protein, carbs, fat), and insights on the health benefits and risks of your food choices.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-primary-100 rounded-lg mr-4">
                    <Smartphone className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Works Anywhere
                    </h3>
                    <p className="text-neutral-600">
                      Use the scanner at home, restaurants, or on the go. Works with all types of meals including home-cooked, restaurant, and packaged foods.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20 bg-primary-50 py-16 px-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            Benefits of Using AI Food Scanner
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Save Time</h3>
                <p className="text-neutral-600">
                  No more manual food logging or searching through databases. Get accurate nutrition information in seconds with just a photo.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Improve Accuracy</h3>
                <p className="text-neutral-600">
                  Our AI provides more accurate nutrition estimates than manual logging, helping you track your diet with greater precision.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Make Better Choices</h3>
                <p className="text-neutral-600">
                  Understand the nutritional impact of your meals instantly, helping you make more informed food choices aligned with your health goals.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Track Consistently</h3>
                <p className="text-neutral-600">
                  The ease of scanning makes it more likely you'll track consistently, leading to better awareness and healthier habits over time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            What Our Users Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-bold">JM</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Jessica M.</h4>
                    <p className="text-sm text-neutral-500">Fitness Enthusiast</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "The AI food scanner has completely changed how I track my nutrition. It's so quick and accurate that I actually stick with it, unlike other apps I've tried."
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-bold">DT</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">David T.</h4>
                    <p className="text-sm text-neutral-500">Busy Professional</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "As someone who eats out often, this scanner is a game-changer. I can quickly scan restaurant meals and get nutrition info that would otherwise be a complete mystery."
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-bold">LK</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Lisa K.</h4>
                    <p className="text-sm text-neutral-500">Nutrition Coach</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "I recommend OwnBite to all my clients. The AI scanner makes nutrition tracking accessible and sustainable, which is key for long-term success."
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-12 mb-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Nutrition?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of users who have already improved their health with OwnBite's AI-powered food scanner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-neutral-100 border-0 px-8 py-4 text-lg font-semibold"
                leftIcon={<Scan className="h-5 w-5" />}
              >
                Start Scanning Today
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg"
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
                  How accurate is the AI food scanner?
                </h3>
                <p className="text-neutral-600">
                  Our AI food scanner achieves over 90% accuracy for most common foods and meals. The technology continues to improve with each scan, learning from millions of food images.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Does it work with all types of food?
                </h3>
                <p className="text-neutral-600">
                  Yes! The scanner works with home-cooked meals, restaurant food, packaged items, and even mixed plates. It can identify multiple food items in a single image.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Can I use it offline?
                </h3>
                <p className="text-neutral-600">
                  The scanner requires an internet connection to process images through our AI. However, your saved food entries can be viewed offline once they're added to your diary.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Is there a limit to how many scans I can do?
                </h3>
                <p className="text-neutral-600">
                  Free accounts can perform up to 10 scans per week. Premium subscribers get unlimited scans and additional features like detailed nutrient breakdowns and health insights.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Start Your Nutrition Journey Today
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Join OwnBite and discover how easy nutrition tracking can be with our AI-powered food scanner.
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

export default FoodScannerPage;
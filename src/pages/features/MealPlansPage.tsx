import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChefHat, 
  Utensils, 
  ShoppingCart, 
  Brain, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  Zap,
  Sparkles,
  FileText
} from 'lucide-react';
import PageContainer from '../../components/Layout/PageContainer';
import Card, { CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const MealPlansPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 py-12">
          <div className="inline-flex p-4 bg-purple-100 rounded-full mb-6">
            <ChefHat className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-6">
            AI-Generated Meal Plans
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Get personalized 7-day meal plans tailored to your bloodwork results, 
            dietary preferences, and health goals, complete with shopping lists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<ChefHat className="h-5 w-5" />}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Try Meal Plans
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
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Brain className="h-8 w-8 text-purple-600" />
                <div className="absolute -right-1 -top-1 bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">AI Analysis</h3>
              <p className="text-neutral-600">
                Our AI analyzes your bloodwork results, dietary preferences, and health goals to identify your unique nutritional needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <ChefHat className="h-8 w-8 text-purple-600" />
                <div className="absolute -right-1 -top-1 bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Plan Generation</h3>
              <p className="text-neutral-600">
                The system creates a personalized 7-day meal plan with recipes specifically chosen to address your nutrient needs and preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
                <div className="absolute -right-1 -top-1 bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Easy Implementation</h3>
              <p className="text-neutral-600">
                Get a complete shopping list, meal prep instructions, and simple recipes to make following your plan effortless and enjoyable.
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
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Nutrient-Targeted Recipes
                    </h3>
                    <p className="text-neutral-600">
                      Each meal is specifically chosen to address your nutrient deficiencies and health goals, ensuring you get exactly what your body needs.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Complete 7-Day Plans
                    </h3>
                    <p className="text-neutral-600">
                      Get a full week of breakfast, lunch, dinner, and snacks, all balanced to meet your calorie and macro targets while addressing micronutrient needs.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Automated Shopping Lists
                    </h3>
                    <p className="text-neutral-600">
                      Save time with automatically generated shopping lists organized by grocery department, making your trip to the store quick and efficient.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Preference Customization
                    </h3>
                    <p className="text-neutral-600">
                      Tailor your meal plans to accommodate dietary restrictions, allergies, and food preferences while still meeting your nutritional needs.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Sample Meal Plan */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            Sample Meal Plan
          </h2>
          
          <Card className="border-purple-200">
            <CardBody className="p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4 text-center">
                Iron & Vitamin D Boosting Plan
              </h3>
              <p className="text-center text-neutral-600 mb-8">
                Example of a meal plan designed for someone with iron and vitamin D deficiencies
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Day 1 Sample
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-bold text-neutral-900 mb-1">Breakfast</h5>
                      <p className="text-neutral-700">Spinach and mushroom omelet with fortified orange juice</p>
                      <div className="mt-2 text-sm text-purple-700">
                        <span className="font-medium">Benefits:</span> Iron from spinach, Vitamin D from eggs and fortified juice
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-bold text-neutral-900 mb-1">Lunch</h5>
                      <p className="text-neutral-700">Grilled salmon salad with mixed greens and citrus vinaigrette</p>
                      <div className="mt-2 text-sm text-purple-700">
                        <span className="font-medium">Benefits:</span> Vitamin D from salmon, iron absorption enhanced by vitamin C in citrus
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-bold text-neutral-900 mb-1">Dinner</h5>
                      <p className="text-neutral-700">Beef and lentil stew with dark leafy greens</p>
                      <div className="mt-2 text-sm text-purple-700">
                        <span className="font-medium">Benefits:</span> Heme iron from beef, non-heme iron from lentils and greens
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-bold text-neutral-900 mb-1">Snack</h5>
                      <p className="text-neutral-700">Trail mix with pumpkin seeds, dried apricots, and dark chocolate</p>
                      <div className="mt-2 text-sm text-purple-700">
                        <span className="font-medium">Benefits:</span> Iron from seeds and dried fruit, mood-boosting compounds
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Shopping List Excerpt
                  </h4>
                  
                  <div className="p-6 bg-purple-50 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-bold text-neutral-900 mb-2">Produce</h5>
                        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                          <li>Spinach (2 bunches)</li>
                          <li>Mushrooms (8 oz package)</li>
                          <li>Mixed greens (1 bag)</li>
                          <li>Lemons (2)</li>
                          <li>Carrots (1 bunch)</li>
                          <li>Onions (2 medium)</li>
                          <li>Garlic (1 head)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-bold text-neutral-900 mb-2">Protein</h5>
                        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                          <li>Eggs (1 dozen, pasture-raised)</li>
                          <li>Salmon fillets (2, wild-caught)</li>
                          <li>Grass-fed beef (1 lb)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-bold text-neutral-900 mb-2">Pantry</h5>
                        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                          <li>Lentils (1 bag, dry)</li>
                          <li>Fortified orange juice (1 carton)</li>
                          <li>Pumpkin seeds (4 oz)</li>
                          <li>Dried apricots (6 oz)</li>
                          <li>Dark chocolate (70%+ cacao, 3 oz)</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-purple-700 text-center">
                      Full plan includes 7 days of meals and complete shopping list
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-neutral-600 mb-4">
                  This is just a sample. Your personalized plan will be tailored to your specific nutrient needs, preferences, and dietary restrictions.
                </p>
                <Link to="/login">
                  <Button
                    variant="primary"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Get Your Personalized Plan
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Benefits */}
        <div className="mb-20 bg-purple-50 py-16 px-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            Benefits of AI Meal Plans
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Targeted Nutrition</h3>
                <p className="text-neutral-600">
                  Address specific nutrient deficiencies with meals scientifically designed to improve your bloodwork results and overall health.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Save Time and Effort</h3>
                <p className="text-neutral-600">
                  Eliminate meal planning stress with ready-made plans that include shopping lists and simple recipes tailored to your needs.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Discover New Foods</h3>
                <p className="text-neutral-600">
                  Expand your culinary horizons with new nutrient-dense foods and recipes that you might not have tried otherwise.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Measurable Results</h3>
                <p className="text-neutral-600">
                  See real improvements in your bloodwork results over time as you follow your personalized nutrition plan.
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
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold">AK</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Alex K.</h4>
                    <p className="text-sm text-neutral-500">Iron deficiency</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "The meal plan made addressing my iron deficiency so much easier. I didn't have to research which foods to eat - it was all laid out for me with delicious recipes."
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold">RM</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Rachel M.</h4>
                    <p className="text-sm text-neutral-500">Multiple deficiencies</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "As someone with multiple vitamin deficiencies, I was overwhelmed trying to address them all. The meal plan integrated everything I needed into delicious meals I actually enjoyed."
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold">JP</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">James P.</h4>
                    <p className="text-sm text-neutral-500">Vitamin B12 deficiency</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "The shopping lists and meal prep instructions saved me so much time. After 2 months on the plan, my B12 levels improved significantly according to my follow-up bloodwork."
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-12 mb-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready for Your Personalized Meal Plan?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Take the guesswork out of nutrition with AI-generated meal plans based on your unique needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-neutral-100 border-0 px-8 py-4 text-lg font-semibold"
                leftIcon={<ChefHat className="h-5 w-5" />}
              >
                Get Your Meal Plan
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg"
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
                  How personalized are the meal plans?
                </h3>
                <p className="text-neutral-600">
                  Our meal plans are highly personalized based on your bloodwork results, dietary preferences, allergies, cooking skill level, and time constraints. No two plans are exactly alike.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Can I customize the meal plans?
                </h3>
                <p className="text-neutral-600">
                  Yes! You can specify dietary restrictions, food preferences, and even cooking equipment limitations. The AI will generate plans that work within your parameters while still addressing your nutrient needs.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  How often are new meal plans generated?
                </h3>
                <p className="text-neutral-600">
                  Premium users can generate new meal plans weekly. We recommend updating your plan after new bloodwork results or when your health goals change.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Are the recipes easy to make?
                </h3>
                <p className="text-neutral-600">
                  Yes! Our recipes are designed to be practical and accessible for everyday cooking. You can specify your cooking skill level and time constraints, and the AI will adjust accordingly.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Nutrition Made Simple
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Join OwnBite today and let our AI create the perfect meal plan for your unique nutritional needs.
          </p>
          <Link to="/login">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default MealPlansPage;
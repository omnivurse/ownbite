import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ChefHat, 
  Heart, 
  MessageSquare, 
  Share2, 
  CheckCircle, 
  ArrowRight,
  Bookmark,
  Utensils,
  Search,
  Tag
} from 'lucide-react';
import PageContainer from '../../components/Layout/PageContainer';
import Card, { CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const CommunityRecipesPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 py-12">
          <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
            <Users className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-6">
            Community Recipe Sharing
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Share your favorite healthy recipes, get inspired by others, and build your collection.
            Connect with a community of health-conscious food enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<ChefHat className="h-5 w-5" />}
                className="bg-green-600 hover:bg-green-700"
              >
                Join the Community
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
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <ChefHat className="h-8 w-8 text-green-600" />
                <div className="absolute -right-1 -top-1 bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Share Your Recipes</h3>
              <p className="text-neutral-600">
                Create and share your favorite healthy recipes with detailed ingredients, instructions, and nutritional information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Heart className="h-8 w-8 text-green-600" />
                <div className="absolute -right-1 -top-1 bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Discover & Engage</h3>
              <p className="text-neutral-600">
                Explore recipes from other users, like your favorites, leave comments, and follow creators whose recipes you enjoy.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Bookmark className="h-8 w-8 text-green-600" />
                <div className="absolute -right-1 -top-1 bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Build Collections</h3>
              <p className="text-neutral-600">
                Save recipes to personalized collections, create shopping lists, and easily access your favorite recipes anytime.
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
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <Utensils className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Nutrition-Focused Recipes
                    </h3>
                    <p className="text-neutral-600">
                      All recipes include detailed nutritional information, making it easy to find meals that align with your health goals and dietary needs.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Advanced Search & Filtering
                    </h3>
                    <p className="text-neutral-600">
                      Find exactly what you're looking for with powerful search and filtering options by cuisine, diet type, ingredients, and nutritional content.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Social Interaction
                    </h3>
                    <p className="text-neutral-600">
                      Connect with like-minded individuals through comments, likes, and follows. Build a network of health-conscious food enthusiasts.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <Tag className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Recipe Remixing
                    </h3>
                    <p className="text-neutral-600">
                      Put your own spin on community recipes by remixing them with your modifications while still giving credit to the original creator.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Recipe Preview */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            Community Recipe Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden">
              <div className="h-48 bg-neutral-100">
                <img 
                  src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Quinoa Power Bowl" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardBody className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">Quinoa Power Bowl</h3>
                  <span className="text-sm font-medium text-green-700">320 cal</span>
                </div>
                
                <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                  A nutrient-packed bowl with quinoa, roasted vegetables, and a tahini dressing. High in protein and fiber.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Vegetarian
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    High Protein
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>124</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>18</span>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-neutral-100">
                <img 
                  src="https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Salmon with Sweet Potato" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardBody className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">Salmon with Sweet Potato</h3>
                  <span className="text-sm font-medium text-green-700">450 cal</span>
                </div>
                
                <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                  Omega-3 rich salmon with roasted sweet potatoes and steamed broccoli. Perfect for vitamin D and iron deficiencies.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    High Omega-3
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Vitamin D
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>89</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>12</span>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-neutral-100">
                <img 
                  src="https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Greek Yogurt Parfait" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardBody className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">Greek Yogurt Parfait</h3>
                  <span className="text-sm font-medium text-green-700">280 cal</span>
                </div>
                
                <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                  Protein-rich Greek yogurt layered with berries, honey, and homemade granola. Great for breakfast or a healthy snack.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    High Protein
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Antioxidants
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>156</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>24</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/login">
              <Button
                variant="primary"
                className="bg-green-600 hover:bg-green-700"
              >
                Explore More Recipes
              </Button>
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20 bg-green-50 py-16 px-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            Benefits of Community Recipe Sharing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Discover New Healthy Recipes</h3>
                <p className="text-neutral-600">
                  Expand your culinary horizons with a constant stream of new, health-focused recipes from a diverse community of food enthusiasts.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Share Your Creations</h3>
                <p className="text-neutral-600">
                  Contribute your own recipes and get feedback from a community that shares your interest in nutritious, delicious food.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Find Recipes for Your Needs</h3>
                <p className="text-neutral-600">
                  Easily find recipes that address specific nutrient deficiencies, dietary restrictions, or health goals with our advanced search and filtering.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Connect with Like-Minded People</h3>
                <p className="text-neutral-600">
                  Build connections with others who share your passion for healthy eating and nutrition-focused cooking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            Community Voices
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold">EL</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Emma L.</h4>
                    <p className="text-sm text-neutral-500">Home cook & nutrition enthusiast</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "I've found so many creative ways to incorporate more vegetables into my family's meals thanks to the community recipes. My kids don't even realize they're eating healthier!"
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold">RJ</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Ryan J.</h4>
                    <p className="text-sm text-neutral-500">Fitness coach</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "The recipe community has been a game-changer for my clients. I can easily find and share high-protein recipes that taste great and help them reach their fitness goals."
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold">NS</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">Nina S.</h4>
                    <p className="text-sm text-neutral-500">Recipe creator</p>
                  </div>
                </div>
                <p className="text-neutral-600 italic">
                  "I love sharing my nutrient-dense recipes and getting feedback from the community. It's so rewarding to see others enjoying my creations and making them part of their healthy lifestyle."
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-12 mb-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Recipe Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Connect with thousands of health-conscious food enthusiasts, share your creations, and discover delicious, nutritious recipes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-neutral-100 border-0 px-8 py-4 text-lg font-semibold"
                leftIcon={<Users className="h-5 w-5" />}
              >
                Join the Community
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg"
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
                  Can I share any type of recipe?
                </h3>
                <p className="text-neutral-600">
                  We encourage recipes that focus on nutritious, whole foods. While there's room for all types of recipes, our community particularly values those that contribute to health and wellness.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  How is nutritional information calculated?
                </h3>
                <p className="text-neutral-600">
                  Our system automatically calculates nutritional information based on the ingredients and quantities you provide. You can also manually adjust these values if needed.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Can I create private recipes?
                </h3>
                <p className="text-neutral-600">
                  Yes! You can choose to make your recipes public or private. Private recipes are only visible to you and can be used for personal meal planning.
                </p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  What is recipe remixing?
                </h3>
                <p className="text-neutral-600">
                  Remixing allows you to create your own version of someone else's recipe while giving them credit. It's a great way to adapt recipes to your specific needs while acknowledging the original creator.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Share recipes, discover new favorites, and connect with others who are passionate about healthy, delicious food.
          </p>
          <Link to="/login">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="bg-green-600 hover:bg-green-700"
            >
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default CommunityRecipesPage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, CreditCard, LayoutGrid, Activity, Brain } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card, { CardBody } from '../ui/Card';
import { stripeProducts } from '../../stripe-config';
import { stripeService } from '../../services/stripeService';
import CheckoutButton from './CheckoutButton';

interface PricingPlansProps {
  className?: string;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadUserSubscription();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserSubscription = async () => {
    try {
      setIsLoading(true);
      const subscription = await stripeService.getUserSubscription();
      setUserSubscription(subscription);
    } catch (error) {
      console.error('Error loading user subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="h-64 bg-neutral-200 rounded"></div>
            <div className="h-64 bg-neutral-200 rounded"></div>
            <div className="h-64 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Add Premium+ plan
  const allPlans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Basic nutrition tracking and food scanning',
      price: 0,
      features: [
        'AI Food Scanner',
        'Basic Food Diary',
        'Limited Recipe Access',
        'Community Recipe Sharing',
        'Basic Nutrition Tracking'
      ],
      notIncluded: [
        'Bloodwork Analysis',
        'Personalized Meal Plans',
        'Advanced Nutrition Insights',
        'Health & Lifestyle Dashboard'
      ]
    },
    {
      id: stripeProducts[1].id,
      name: "I'm Craving",
      description: stripeProducts[1].description,
      price: stripeProducts[1].price,
      priceId: stripeProducts[1].priceId,
      features: [
        'Everything in Free',
        'Basic Bloodwork Analysis',
        'Basic Meal Recommendations',
        'Community Recipe Sharing',
        'Standard Support'
      ],
      notIncluded: [
        'Advanced Nutrition Insights',
        'Unlimited Bloodwork Analysis',
        'Health & Lifestyle Dashboard',
        'Priority Support'
      ]
    },
    {
      id: stripeProducts[0].id,
      name: "I'm Needing",
      description: stripeProducts[0].description,
      price: stripeProducts[0].price,
      priceId: stripeProducts[0].priceId,
      features: [
        'Everything in Free',
        'Unlimited Bloodwork Analysis',
        'Personalized Meal Plans',
        'Advanced Nutrition Insights',
        'Bloodwork Trend Analysis',
        'Priority Support'
      ],
      notIncluded: [
        'Health & Lifestyle Dashboard'
      ]
    },
    {
      id: stripeProducts[2].id,
      name: "Ultimate Wellbeing",
      description: stripeProducts[2].description,
      price: stripeProducts[2].price,
      priceId: stripeProducts[2].priceId,
      features: [
        'Everything in Premium',
        'Health & Lifestyle Dashboard',
        'Sleep & Activity Tracking',
        'Screen Time Analysis',
        'Hydration Monitoring',
        'AI Lifestyle Insights',
        'VIP Support'
      ],
      notIncluded: []
    }
  ];

  return (
    <div className={className}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">Simple, Transparent Pricing</h2>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          Choose the plan that fits your nutrition goals. Upgrade or downgrade anytime.
        </p>
        
        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex rounded-md p-1 bg-neutral-100">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                billingCycle === 'monthly'
                  ? 'bg-white shadow-sm text-primary-700'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                billingCycle === 'yearly'
                  ? 'bg-white shadow-sm text-primary-700'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly <span className="text-green-600 text-xs">Save 17%</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Free Plan */}
        <Card className="overflow-hidden">
          <CardBody className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-neutral-900">{allPlans[0].name}</h3>
              <p className="text-neutral-600">{allPlans[0].description}</p>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold">
                Free
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {allPlans[0].features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{feature}</span>
                </div>
              ))}
              {allPlans[0].notIncluded.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-400">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              Current Plan
            </Button>
          </CardBody>
        </Card>

        {/* I'm Craving Plan */}
        <Card className="overflow-hidden">
          <CardBody className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-neutral-900">{allPlans[1].name}</h3>
              <p className="text-neutral-600">{allPlans[1].description}</p>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold">
                ${allPlans[1].price}
                <span className="text-sm font-normal text-neutral-500">
                  /month
                </span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {allPlans[1].features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{feature}</span>
                </div>
              ))}
              {allPlans[1].notIncluded.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-400">{feature}</span>
                </div>
              ))}
            </div>
            
            {user ? (
              userSubscription?.price_id === allPlans[1].priceId ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <CheckoutButton
                  priceId={allPlans[1].priceId}
                  mode="subscription"
                  className="w-full"
                  variant="outline"
                >
                  Select Plan
                </CheckoutButton>
              )
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/login'}
              >
                Sign Up
              </Button>
            )}
          </CardBody>
        </Card>

        {/* I'm Needing Plan */}
        <Card className="overflow-hidden border-primary-500 ring-2 ring-primary-200">
          <div className="bg-primary-500 text-white text-center py-2 text-sm font-medium">
            RECOMMENDED
          </div>
          <CardBody className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-neutral-900">{allPlans[2].name}</h3>
              <p className="text-neutral-600">{allPlans[2].description}</p>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold">
                ${allPlans[2].price}
                <span className="text-sm font-normal text-neutral-500">
                  /month
                </span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {allPlans[2].features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{feature}</span>
                </div>
              ))}
              {allPlans[2].notIncluded.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-400">{feature}</span>
                </div>
              ))}
            </div>
            
            {user ? (
              userSubscription?.price_id === allPlans[2].priceId ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <CheckoutButton
                  priceId={allPlans[2].priceId}
                  mode="subscription"
                  className="w-full"
                >
                  Upgrade Now
                </CheckoutButton>
              )
            ) : (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => window.location.href = '/login'}
              >
                Sign Up
              </Button>
            )}
          </CardBody>
        </Card>

        {/* Ultimate Wellbeing Plan */}
        <Card className="overflow-hidden border-blue-500 ring-2 ring-blue-200">
          <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
            NEW
          </div>
          <CardBody className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-neutral-900">{allPlans[3].name}</h3>
              <p className="text-neutral-600">{allPlans[3].description}</p>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold">
                ${allPlans[3].price}
                <span className="text-sm font-normal text-neutral-500">
                  /month
                </span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {allPlans[3].features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{feature}</span>
                </div>
              ))}
            </div>
            
            {user ? (
              userSubscription?.price_id === allPlans[3].priceId ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <CheckoutButton
                  priceId={allPlans[3].priceId}
                  mode="subscription"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Get Ultimate Wellbeing
                </CheckoutButton>
              )
            ) : (
              <Button
                variant="primary"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/login'}
              >
                Sign Up
              </Button>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PricingPlans;
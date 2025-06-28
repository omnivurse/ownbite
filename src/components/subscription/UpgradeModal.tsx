import React, { useState } from 'react';
import { X, Check, CreditCard, Calendar, Shield, Zap } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Button from '../ui/Button';
import Card, { CardBody } from '../ui/Card';
import { stripeProducts } from '../../stripe-config';
import CheckoutButton from './CheckoutButton';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose,
  featureName
}) => {
  const { products, userSubscription } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(stripeProducts[0].priceId);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Find premium plan
  const premiumPlan = stripeProducts[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-6 rounded-t-xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Upgrade to OwnBite Ultimate Wellbeing
            </h2>
            <p className="text-primary-100">
              {featureName 
                ? `Unlock ${featureName} and all premium features`
                : 'Unlock advanced nutrition insights and personalized recommendations'}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Upgrade Successful!</h3>
                <p className="text-green-600">
                  Thank you for upgrading to OwnBite Ultimate Wellbeing. Enjoy all the premium features!
                </p>
              </div>
            ) : (
              <>
                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-8">
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

                {/* Plan Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {stripeProducts.map(plan => (
                    <Card 
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        selectedPlanId === plan.priceId 
                          ? 'border-primary-500 ring-2 ring-primary-200' 
                          : 'hover:border-neutral-300'
                      }`}
                      onClick={() => setSelectedPlanId(plan.priceId)}
                    >
                      <CardBody>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                            <p className="text-neutral-600 text-sm">{plan.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border ${
                            selectedPlanId === plan.priceId 
                              ? 'bg-primary-500 border-primary-500' 
                              : 'border-neutral-300'
                          }`}>
                            {selectedPlanId === plan.priceId && (
                              <Check className="h-5 w-5 text-white" />
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-2xl font-bold">
                            ${plan.price}
                            <span className="text-sm font-normal text-neutral-500">
                              /month
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                {/* Benefits */}
                <div className="bg-neutral-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-3 text-neutral-900">Premium Benefits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Personalized Meal Plans</h5>
                        <p className="text-sm text-neutral-600">AI-generated plans based on your bloodwork</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Advanced Analytics</h5>
                        <p className="text-sm text-neutral-600">Detailed insights and trend analysis</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  <CheckoutButton
                    priceId={selectedPlanId}
                    mode="subscription"
                    className="w-full"
                  >
                    Upgrade Now
                  </CheckoutButton>
                  <p className="text-xs text-neutral-500 text-center">
                    By upgrading, you agree to our Terms of Service and Privacy Policy.
                    You can cancel your subscription at any time.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
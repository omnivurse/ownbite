import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { stripeService } from '../services/stripeService';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

const CheckoutSuccessPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadSubscription = async () => {
      try {
        setLoading(true);
        const details = await stripeService.getSubscriptionDetails();
        setSubscription(details);
      } catch (error) {
        console.error('Error loading subscription details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user, navigate]);

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto py-12">
        <Card className="border-green-200 bg-green-50">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-green-800 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-lg text-green-700 mb-8">
              Thank you for your purchase. Your subscription has been activated.
            </p>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-green-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-green-200 rounded w-1/2 mx-auto"></div>
              </div>
            ) : subscription?.subscription ? (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Subscription Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-neutral-500">Plan</p>
                    <p className="font-medium text-neutral-900">{subscription.productName || 'Premium'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-neutral-500">Status</p>
                    <p className="font-medium text-neutral-900 capitalize">{subscription.subscription.subscription_status}</p>
                  </div>
                  
                  {subscription.nextBillingDate && (
                    <div>
                      <p className="text-sm text-neutral-500">Next Billing Date</p>
                      <p className="font-medium text-neutral-900">{subscription.nextBillingDate.toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {subscription.subscription.payment_method_last4 && (
                    <div>
                      <p className="text-sm text-neutral-500">Payment Method</p>
                      <p className="font-medium text-neutral-900 capitalize">
                        {subscription.subscription.payment_method_brand} •••• {subscription.subscription.payment_method_last4}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <p className="text-neutral-600">
                  Your subscription details will be available shortly.
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <Link to="/dashboard">
                <Button 
                  variant="primary" 
                  className="w-full md:w-auto"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Go to Dashboard
                </Button>
              </Link>
              
              <p className="text-sm text-green-600">
                You can manage your subscription from your account settings.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CheckoutSuccessPage;
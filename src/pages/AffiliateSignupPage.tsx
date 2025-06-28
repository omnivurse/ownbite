import React from 'react';
import PageContainer from '../components/Layout/PageContainer';
import AffiliateSignupForm from '../components/affiliate/AffiliateSignupForm';

const AffiliateSignupPage: React.FC = () => {
  return (
    <PageContainer title="Become an Affiliate">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Become an OwnBite Affiliate</h1>
          <p className="text-neutral-600">
            Join our affiliate program and earn commissions by referring new users to OwnBite.
            Share your unique referral link with your audience and get rewarded for every new premium subscription.
          </p>
        </div>
        
        <AffiliateSignupForm />
        
        <div className="mt-8 bg-neutral-50 p-6 rounded-lg border border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-700 font-bold text-lg">1</span>
              </div>
              <h3 className="font-medium text-neutral-800 mb-1">Sign Up</h3>
              <p className="text-sm text-neutral-600">
                Create your affiliate account and get your unique referral link
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-700 font-bold text-lg">2</span>
              </div>
              <h3 className="font-medium text-neutral-800 mb-1">Share</h3>
              <p className="text-sm text-neutral-600">
                Share your link on social media, your blog, or with your audience
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-700 font-bold text-lg">3</span>
              </div>
              <h3 className="font-medium text-neutral-800 mb-1">Earn</h3>
              <p className="text-sm text-neutral-600">
                Earn commissions when your referrals upgrade to premium plans
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Commission Structure</h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-1">
              <li>20% commission on the first payment of each referred user</li>
              <li>10% recurring commission on all future payments</li>
              <li>Minimum payout threshold: $50</li>
              <li>Payments processed monthly via PayPal or bank transfer</li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AffiliateSignupPage;
import React from 'react';
import { Shield, Check, Zap, Brain, TestTube, FileText, LayoutGrid, Activity } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import PricingPlans from '../components/subscription/PricingPlans';
import Card, { CardBody } from '../components/ui/Card';

const PricingPage: React.FC = () => {
  const faqs = [
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your current billing period.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, including Visa, Mastercard, American Express, and Discover. We also support Apple Pay and Google Pay.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption and security practices to protect your payment information. We never store your full credit card details on our servers.'
    },
    {
      question: 'Can I switch between monthly and yearly billing?',
      answer: `Yes, you can switch between monthly and yearly billing at any time. If you switch to yearly, you'll be charged the yearly rate immediately. If you switch to monthly, the change will take effect at the end of your current billing period.`
    },
    {
      question: 'Do you offer a free trial of Premium features?',
      answer: 'We occasionally offer free trials for new users. Check our homepage or sign up for our newsletter to be notified of any promotions.'
    },
    {
      question: 'What happens to my data if I downgrade to the free plan?',
      answer: 'Your data will be preserved, but you will lose access to premium features and any premium-only data. You can always upgrade again to regain access.'
    }
  ];

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Choose the Right Plan for Your Nutrition Journey</h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Whether you're just starting out or looking for advanced nutrition insights,
            we have a plan that fits your needs.
          </p>
        </div>

        {/* Pricing Plans */}
        <PricingPlans className="mb-16" />

        {/* Feature Comparison */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="py-4 px-6 text-left font-semibold text-neutral-900">Feature</th>
                  <th className="py-4 px-6 text-center font-semibold text-neutral-900">Free</th>
                  <th className="py-4 px-6 text-center font-semibold text-neutral-900">I'm Craving</th>
                  <th className="py-4 px-6 text-center font-semibold text-primary-900 bg-primary-50">I'm Needing</th>
                  <th className="py-4 px-6 text-center font-semibold text-blue-900 bg-blue-50">Ultimate Wellbeing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-4 px-6 text-neutral-800">AI Food Scanner</td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-primary-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Basic Food Diary</td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-primary-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Community Recipe Sharing</td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-primary-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Recipe Access</td>
                  <td className="py-4 px-6 text-center">Limited</td>
                  <td className="py-4 px-6 text-center">Full Access</td>
                  <td className="py-4 px-6 text-center bg-primary-50">Full Access</td>
                  <td className="py-4 px-6 text-center bg-blue-50">Full Access</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Bloodwork Analysis</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">Basic (1/month)</td>
                  <td className="py-4 px-6 text-center bg-primary-50">Unlimited</td>
                  <td className="py-4 px-6 text-center bg-blue-50">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Personalized Meal Plans</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">Basic</td>
                  <td className="py-4 px-6 text-center bg-primary-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Advanced Nutrition Insights</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center bg-primary-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Bloodwork Trend Analysis</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center bg-primary-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Health & Lifestyle Dashboard</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center bg-primary-50">—</td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Sleep & Activity Tracking</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center bg-primary-50">—</td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">PDF Export of Reports</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center bg-primary-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-neutral-800">Priority Support</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">Standard</td>
                  <td className="py-4 px-6 text-center bg-primary-50">Priority</td>
                  <td className="py-4 px-6 text-center bg-blue-50">VIP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Premium Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Premium Features in Detail
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <TestTube className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Unlimited Bloodwork Analysis
                    </h3>
                    <p className="text-neutral-600">
                      Upload your lab results anytime and get AI-powered analysis of nutrient deficiencies, 
                      with personalized food recommendations to address your specific needs.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Personalized Meal Plans
                    </h3>
                    <p className="text-neutral-600">
                      Get AI-generated 7-day meal plans tailored to your bloodwork results, 
                      dietary preferences, and health goals, complete with shopping lists.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Advanced Nutrition Insights
                    </h3>
                    <p className="text-neutral-600">
                      Unlock detailed analytics, trend tracking, and personalized recommendations 
                      to optimize your nutrition based on your unique biology.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-amber-100 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      PDF Export & Reports
                    </h3>
                    <p className="text-neutral-600">
                      Download professional PDF reports of your bloodwork analysis, meal plans, 
                      and nutrition insights to share with healthcare providers.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Ultimate Wellbeing Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Ultimate Wellbeing Exclusive Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <LayoutGrid className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Health & Lifestyle Dashboard
                    </h3>
                    <p className="text-blue-700">
                      Track your daily habits, sleep patterns, and lifestyle metrics with our comprehensive KPI dashboard.
                      Monitor hydration, screen time, sitting time, and more.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardBody className="p-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      AI Lifestyle Insights
                    </h3>
                    <p className="text-blue-700">
                      Receive personalized recommendations based on your lifestyle patterns and habits.
                      Get actionable advice to improve sleep quality, reduce screen time, and optimize daily routines.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-neutral-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-8 text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white rounded-full">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            30-Day Money-Back Guarantee
          </h2>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            We're confident you'll love OwnBite Premium. If you're not completely satisfied within 
            the first 30 days, we'll refund your subscription — no questions asked.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default PricingPage;
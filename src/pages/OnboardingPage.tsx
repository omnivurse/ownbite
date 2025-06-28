import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Scan, TestTube, User, Mail, Target, Utensils } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import { affiliateService } from '../services/affiliateService';

interface OnboardingData {
  fullName: string;
  email: string;
  password: string;
  dietaryPreferences: string[];
  healthGoals: string[];
  primaryGoal: 'scan' | 'bloodwork' | '';
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, profile, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    email: '',
    password: '',
    dietaryPreferences: [],
    healthGoals: [],
    primaryGoal: ''
  });

  const totalSteps = 4;

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 
    'Low Carb', 'Gluten Free', 'Dairy Free', 'No Restrictions'
  ];

  const healthGoalOptions = [
    'Weight Loss', 'Weight Gain', 'Muscle Building', 'Better Energy',
    'Improved Digestion', 'Heart Health', 'Better Sleep', 'General Wellness'
  ];

  // Store referral code if present in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referralCode = params.get('ref');
    
    if (referralCode) {
      localStorage.setItem('pendingReferralCode', referralCode);
      localStorage.setItem('referralSource', document.referrer || 'direct');
    }
  }, [location]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleDietaryPreference = (preference: string) => {
    setFormData(prev => {
      if (prev.dietaryPreferences.includes(preference)) {
        return {
          ...prev,
          dietaryPreferences: prev.dietaryPreferences.filter(p => p !== preference)
        };
      } else {
        return {
          ...prev,
          dietaryPreferences: [...prev.dietaryPreferences, preference]
        };
      }
    });
  };

  const toggleHealthGoal = (goal: string) => {
    setFormData(prev => {
      if (prev.healthGoals.includes(goal)) {
        return {
          ...prev,
          healthGoals: prev.healthGoals.filter(g => g !== goal)
        };
      } else {
        return {
          ...prev,
          healthGoals: [...prev.healthGoals, goal]
        };
      }
    });
  };

  const setPrimaryGoal = (goal: 'scan' | 'bloodwork') => {
    setFormData({ ...formData, primaryGoal: goal });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create user account
      await signUp(formData.email, formData.password, formData.fullName);
      
      // Process any pending referral
      const pendingReferralCode = localStorage.getItem('pendingReferralCode');
      const referralSource = localStorage.getItem('referralSource');
      
      if (pendingReferralCode) {
        try {
          await affiliateService.trackReferral(
            pendingReferralCode,
            referralSource || 'direct'
          );
          // Clear the pending referral after processing
          localStorage.removeItem('pendingReferralCode');
          localStorage.removeItem('referralSource');
        } catch (refError) {
          console.error('Error processing referral:', refError);
          // Continue with navigation even if referral processing fails
        }
      }
      
      // Redirect based on primary goal
      if (formData.primaryGoal === 'scan') {
        navigate('/scan');
      } else if (formData.primaryGoal === 'bloodwork') {
        navigate('/bloodwork');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'An error occurred during signup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim() !== '' && formData.email.trim() !== '' && formData.password.length >= 8;
      case 2:
        return formData.dietaryPreferences.length > 0;
      case 3:
        return formData.healthGoals.length > 0;
      case 4:
        return formData.primaryGoal !== '';
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Create Your Account</h2>
            <p className="text-neutral-600 mb-6">
              Let's start by setting up your OwnBite account. This will help us personalize your nutrition journey.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Create a secure password"
                  required
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Must be at least 8 characters long
                </p>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Dietary Preferences</h2>
            <p className="text-neutral-600 mb-6">
              Select any dietary preferences or restrictions you follow. This helps us personalize your food recommendations.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dietaryOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietaryPreference(option)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    formData.dietaryPreferences.includes(option)
                      ? 'bg-primary-100 border-primary-500 text-primary-800'
                      : 'border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                      formData.dietaryPreferences.includes(option) ? 'bg-primary-500' : 'border border-neutral-400'
                    }`}>
                      {formData.dietaryPreferences.includes(option) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Health Goals</h2>
            <p className="text-neutral-600 mb-6">
              What are you looking to achieve with better nutrition? Select all that apply.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {healthGoalOptions.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleHealthGoal(goal)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    formData.healthGoals.includes(goal)
                      ? 'bg-primary-100 border-primary-500 text-primary-800'
                      : 'border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                      formData.healthGoals.includes(goal) ? 'bg-primary-500' : 'border border-neutral-400'
                    }`}>
                      {formData.healthGoals.includes(goal) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{goal}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Get Started</h2>
            <p className="text-neutral-600 mb-6">
              What would you like to do first? Choose one option to begin your nutrition journey.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setPrimaryGoal('scan')}
                className={`p-6 rounded-lg border text-left transition-colors ${
                  formData.primaryGoal === 'scan'
                    ? 'bg-primary-100 border-primary-500'
                    : 'border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-full mb-4 ${
                    formData.primaryGoal === 'scan' ? 'bg-primary-500' : 'bg-neutral-100'
                  }`}>
                    <Scan className={`h-8 w-8 ${
                      formData.primaryGoal === 'scan' ? 'text-white' : 'text-neutral-600'
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Scan Your First Meal</h3>
                  <p className="text-neutral-600 text-sm">
                    Take a photo of your food and get instant nutritional analysis with our AI scanner.
                  </p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setPrimaryGoal('bloodwork')}
                className={`p-6 rounded-lg border text-left transition-colors ${
                  formData.primaryGoal === 'bloodwork'
                    ? 'bg-primary-100 border-primary-500'
                    : 'border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-full mb-4 ${
                    formData.primaryGoal === 'bloodwork' ? 'bg-primary-500' : 'bg-neutral-100'
                  }`}>
                    <TestTube className={`h-8 w-8 ${
                      formData.primaryGoal === 'bloodwork' ? 'text-white' : 'text-neutral-600'
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Upload Bloodwork</h3>
                  <p className="text-neutral-600 text-sm">
                    Get personalized nutrition recommendations based on your lab results.
                  </p>
                </div>
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardBody className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step < currentStep 
                      ? 'bg-primary-500 text-white' 
                      : step === currentStep 
                        ? 'bg-primary-100 border-2 border-primary-500 text-primary-800' 
                        : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {step < currentStep ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{step}</span>
                    )}
                  </div>
                  <span className="text-xs mt-1 text-neutral-500">
                    {step === 1 && 'Account'}
                    {step === 2 && 'Diet'}
                    {step === 3 && 'Goals'}
                    {step === 4 && 'Start'}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-neutral-200 h-2 rounded-full">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[320px]">
            {renderStepContent()}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                isLoading={isSubmitting}
              >
                Complete & Get Started
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OnboardingPage;
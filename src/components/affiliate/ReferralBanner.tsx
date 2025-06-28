import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, X } from 'lucide-react';
import { affiliateService } from '../../services/affiliateService';
import Button from '../ui/Button';

const ReferralBanner: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isProcessed, setIsProcessed] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Extract referral code from URL query parameters
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    
    if (ref) {
      // Check if the referral code is valid
      const validateCode = async () => {
        const isValid = await affiliateService.validateReferralCode(ref);
        if (isValid) {
          setReferralCode(ref);
          
          // Check if we've already processed this referral
          const processedRefs = localStorage.getItem('processedReferrals');
          const processedArray = processedRefs ? JSON.parse(processedRefs) : [];
          
          if (!processedArray.includes(ref)) {
            setIsProcessed(false);
          } else {
            setIsProcessed(true);
          }
        }
      };
      
      validateCode();
    }
  }, [location]);

  const handleAccept = async () => {
    if (!referralCode) return;
    
    try {
      // Store the referral code in localStorage to process after login/signup
      localStorage.setItem('pendingReferralCode', referralCode);
      localStorage.setItem('referralSource', document.referrer || 'direct');
      
      // Mark as processed in UI
      setIsProcessed(true);
      
      // Add to processed referrals in localStorage
      const processedRefs = localStorage.getItem('processedReferrals');
      const processedArray = processedRefs ? JSON.parse(processedRefs) : [];
      if (!processedArray.includes(referralCode)) {
        processedArray.push(referralCode);
        localStorage.setItem('processedReferrals', JSON.stringify(processedArray));
      }
      
      // Show success message
      alert('Referral accepted! You will be credited to the affiliate after you sign up or log in.');
    } catch (error) {
      console.error('Error processing referral:', error);
      // Continue with navigation even if referral processing fails
    } finally {
      // Hide the banner
      setIsVisible(false);
    }
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  // Don't show the banner if there's no valid referral code or it's already been processed
  if (!referralCode || !isVisible || isProcessed) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-primary-50 border border-primary-200 rounded-lg shadow-lg z-50 p-4">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-700"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex items-center mb-3">
        <div className="p-2 bg-primary-100 rounded-full mr-3">
          <Users className="h-5 w-5 text-primary-600" />
        </div>
        <h3 className="font-medium text-primary-900">You were referred!</h3>
      </div>
      
      <p className="text-sm text-primary-700 mb-4">
        Someone shared OwnBite with you. By accepting this referral, you'll help support them while enjoying all our great features.
      </p>
      
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDismiss}
        >
          Dismiss
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAccept}
        >
          Accept Referral
        </Button>
      </div>
    </div>
  );
};

export default ReferralBanner;
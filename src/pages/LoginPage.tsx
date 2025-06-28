import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Store referral code in localStorage if present in URL
    const params = new URLSearchParams(location.search);
    const referralCode = params.get('ref');
    
    if (referralCode) {
      localStorage.setItem('pendingReferralCode', referralCode);
      localStorage.setItem('referralSource', document.referrer || 'direct');
    }
  }, [location]);
  
  return <LoginForm />;
};

export default LoginPage;
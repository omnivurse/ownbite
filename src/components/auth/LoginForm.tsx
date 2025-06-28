import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Scan, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card, { CardBody } from '../ui/Card';
import { clearCache, forceClearAllStorage } from '../../lib/cache';
import { affiliateService } from '../../services/affiliateService';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [clearingCache, setClearingCache] = useState(false);

  const { signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Reset error when switching modes or changing inputs
  useEffect(() => {
    setError(null);
  }, [isSignUp, email, password, fullName]);

  // Clear cache on component mount
  useEffect(() => {
    const purgeCache = async () => {
      setClearingCache(true);
      try {
        await clearCache();
        console.log('Cache cleared on login page load');
      } catch (err) {
        console.error('Error purging cache:', err);
      } finally {
        setClearingCache(false);
      }
    };
    
    purgeCache();
  }, []);

  // Store referral code if present in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referralCode = params.get('ref');
    
    if (referralCode) {
      localStorage.setItem('pendingReferralCode', referralCode);
      localStorage.setItem('referralSource', document.referrer || 'direct');
    }
  }, [location]);

  const getErrorMessage = (error: any): string => {
    if (error?.message?.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error?.message?.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (error?.message?.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (error?.message?.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (error?.message?.includes('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    if (error?.message?.includes('Signup not allowed')) {
      return 'Account registration is currently disabled. Please contact support.';
    }
    return error?.message || 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        setSuccess('Account created successfully! You can now sign in.');
        // Clear form after successful signup
        setEmail('');
        setPassword('');
        setFullName('');
        // Switch to sign in mode
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess(null);
        }, 3000);
      } else {
        setLoginAttempts(prev => prev + 1);
        await signIn(email, password);
        
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
        
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(getErrorMessage(err));
      
      // If multiple login attempts fail, suggest clearing cache
      if (loginAttempts >= 2 && !isSignUp) {
        setError((prev) => `${prev || ''} You may try clearing your browser cache or reloading the page.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccess(null);
    // Clear form when switching modes
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await forceClearAllStorage();
      setSuccess('Cache cleared successfully. Please try logging in again.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error clearing cache:', err);
      setError('Failed to clear cache. Please try reloading the page.');
    } finally {
      setClearingCache(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary-600 rounded-full">
              <Scan className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome to OwnBite</h1>
          <p className="text-neutral-600 mt-2">
            {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your full name"
                    required={isSignUp}
                  />
                </div>
              )}

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
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                    Password
                  </label>
                  {!isSignUp && (
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-neutral-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                  {error}
                  {loginAttempts >= 2 && !isSignUp && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleClearCache}
                        className="text-red-600 underline hover:text-red-800"
                        disabled={clearingCache}
                      >
                        {clearingCache ? 'Clearing cache...' : 'Clear browser cache'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading || authLoading || clearingCache}
                disabled={isLoading || authLoading || clearingCache}
              >
                {isLoading || authLoading || clearingCache ? (
                  <span className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {clearingCache ? 'Clearing Cache...' : isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleModeSwitch}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link 
                to="/onboarding" 
                className="text-secondary-500 hover:text-secondary-600 text-sm font-medium"
              >
                Or continue with our guided setup
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
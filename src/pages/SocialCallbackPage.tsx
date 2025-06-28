import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { useSocial } from '../contexts/SocialContext';
import PageContainer from '../components/Layout/PageContainer';
import Button from '../components/ui/Button';

const SocialCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connectAccount } = useSocial();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse the URL parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        
        // Check for errors in the callback
        if (error) {
          setStatus('error');
          setErrorMessage(`Authorization error: ${error}`);
          return;
        }
        
        // Validate the state parameter to prevent CSRF attacks
        const savedState = localStorage.getItem('social_auth_state');
        if (!state || state !== savedState) {
          setStatus('error');
          setErrorMessage('Invalid state parameter. Authentication failed.');
          return;
        }
        
        // Check if we have the code
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received');
          return;
        }
        
        // Get the provider from localStorage
        const provider = localStorage.getItem('social_auth_provider');
        if (!provider) {
          setStatus('error');
          setErrorMessage('Unknown social provider');
          return;
        }
        
        // Connect the account
        const redirectUri = `${window.location.origin}/social-callback`;
        await connectAccount(provider, code, redirectUri);
        
        // Clear the localStorage items
        localStorage.removeItem('social_auth_state');
        localStorage.removeItem('social_auth_provider');
        
        setStatus('success');
        
        // Close the window if it's a popup
        if (window.opener) {
          window.opener.postMessage({ type: 'SOCIAL_AUTH_SUCCESS', provider }, window.location.origin);
          window.close();
        }
      } catch (error) {
        console.error('Error handling social callback:', error);
        setStatus('error');
        setErrorMessage('Failed to connect account. Please try again.');
      }
    };
    
    handleCallback();
  }, [location, connectAccount, navigate]);
  
  return (
    <PageContainer>
      <div className="max-w-md mx-auto mt-12 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Connecting your account...</h2>
            <p className="text-neutral-600">Please wait while we complete the connection process.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Account Connected!</h2>
            <p className="text-green-600 mb-6">
              Your social account has been successfully connected to OwnBite.
            </p>
            {!window.opener && (
              <Button
                variant="primary"
                onClick={() => navigate('/profile')}
              >
                Return to Profile
              </Button>
            )}
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Connection Failed</h2>
            <p className="text-red-600 mb-6">
              {errorMessage || 'There was an error connecting your social account. Please try again.'}
            </p>
            {!window.opener && (
              <Button
                variant="primary"
                onClick={() => navigate('/profile')}
              >
                Return to Profile
              </Button>
            )}
          </div>
        )}
        
        {window.opener && (
          <p className="text-sm text-neutral-500 mt-4">
            This window will close automatically...
          </p>
        )}
      </div>
    </PageContainer>
  );
};

export default SocialCallbackPage;
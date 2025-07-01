import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, X, RefreshCw, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { 
  FacebookLoginButton, 
  InstagramLoginButton, 
  TwitterLoginButton, 
  TikTokLoginButton, 
  PinterestLoginButton 
} from 'react-social-login-buttons';
import { useSocial } from '../../contexts/SocialContext';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

interface SocialConnectPanelProps {
  className?: string;
}

const SocialConnectPanel: React.FC<SocialConnectPanelProps> = ({ className = '' }) => {
  const { connectedAccounts, disconnectAccount, isLoading, refreshAccounts } = useSocial();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    // Auto-retry if no accounts loaded and not currently loading
    if (!isLoading && connectedAccounts.length === 0 && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Auto-retrying account load (attempt ${retryCount + 1})`);
        refreshAccounts();
        setRetryCount(prev => prev + 1);
      }, 2000 * Math.pow(2, retryCount)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
  }, [connectedAccounts, isLoading, retryCount]);
  
  const handleConnect = (provider: string) => {
    try {
      // Generate a random state for security
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('social_auth_state', state);
      
      // Set the redirect URI to the callback page
      const redirectUri = `${window.location.origin}/social-callback`;
      
      // Store the provider for the callback
      localStorage.setItem('social_auth_provider', provider);
      
      // Construct the OAuth URL based on the provider
      let authUrl = '';
      
      switch (provider) {
        case 'facebook':
          authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${import.meta.env.VITE_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=public_profile,email,publish_to_groups`;
          break;
        case 'instagram':
          authUrl = `https://api.instagram.com/oauth/authorize?client_id=${import.meta.env.VITE_INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`;
          break;
        case 'twitter':
          authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${import.meta.env.VITE_TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20tweet.write%20users.read&response_type=code&state=${state}`;
          break;
        case 'tiktok':
          authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${import.meta.env.VITE_TIKTOK_CLIENT_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user.info.basic,video.publish&response_type=code&state=${state}`;
          break;
        case 'pinterest':
          authUrl = `https://www.pinterest.com/oauth/?client_id=${import.meta.env.VITE_PINTEREST_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=boards:read,pins:read,pins:write&state=${state}`;
          break;
        default:
          console.error('Unknown provider:', provider);
          setError(`Unknown provider: ${provider}`);
          return;
      }
      
      // Open the auth URL in a popup window
      const width = 600;
      const height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        `Connect to ${provider}`,
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        toast.error('Popup blocked! Please allow popups for this site.');
        setError('Popup blocked. Please allow popups for this site and try again.');
        return;
      }
      
      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'SOCIAL_AUTH_SUCCESS') {
          console.log('Received success message from popup');
          refreshAccounts();
          window.removeEventListener('message', messageHandler);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Set a timeout to check if the popup is still open
      const checkPopupInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupInterval);
          window.removeEventListener('message', messageHandler);
          refreshAccounts(); // Refresh anyway in case the popup closed after success
        }
      }, 1000);
      
    } catch (err) {
      console.error(`Error initiating ${provider} connection:`, err);
      setError(`Failed to connect to ${provider}. Please try again.`);
    }
  };
  
  const handleDisconnect = async (accountId: string, provider: string) => {
    if (window.confirm(`Are you sure you want to disconnect your ${provider} account?`)) {
      try {
        await disconnectAccount(accountId);
      } catch (error) {
        console.error(`Error disconnecting ${provider}:`, error);
        setError(`Failed to disconnect ${provider}. Please try again.`);
      }
    }
  };
  
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      case 'tiktok':
        return <span className="text-black font-bold text-lg">TT</span>;
      case 'pinterest':
        return <span className="text-red-600 font-bold">P</span>;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };
  
  const handleRetry = () => {
    setError(null);
    refreshAccounts();
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Connected Social Accounts</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAccounts}
              disabled={isLoading}
              leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-3" />
                <p className="text-neutral-600">Loading connected accounts...</p>
              </div>
            </div>
          ) : (
            <>
              {connectedAccounts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-neutral-600 mb-4">No social accounts connected yet</p>
                  <Button
                    variant="primary"
                    onClick={() => setShowConnectModal(true)}
                  >
                    Connect Accounts
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedAccounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-neutral-100 rounded-full mr-3">
                          {getProviderIcon(account.provider)}
                        </div>
                        <div>
                          <h3 className="font-medium capitalize">{account.provider}</h3>
                          <p className="text-sm text-neutral-500">@{account.username}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(account.id, account.provider)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ))}
                  
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowConnectModal(true)}
                      className="w-full"
                    >
                      Connect More Accounts
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
      
      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Connect Social Accounts</h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <FacebookLoginButton onClick={() => handleConnect('facebook')}>
                Connect with Facebook
              </FacebookLoginButton>
              
              <InstagramLoginButton onClick={() => handleConnect('instagram')}>
                Connect with Instagram
              </InstagramLoginButton>
              
              <TwitterLoginButton onClick={() => handleConnect('twitter')}>
                Connect with Twitter
              </TwitterLoginButton>
              
              <TikTokLoginButton onClick={() => handleConnect('tiktok')}>
                Connect with TikTok
              </TikTokLoginButton>
              
              <PinterestLoginButton onClick={() => handleConnect('pinterest')}>
                Connect with Pinterest
              </PinterestLoginButton>
            </div>
            
            <p className="text-sm text-neutral-500 mt-4">
              By connecting your social accounts, you'll be able to share your recipes, food scans, and progress directly to your social media profiles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialConnectPanel;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { socialService, SocialAccount, SocialShare, SocialShareRequest } from '../services/socialService';
import { toast } from 'react-toastify';

interface SocialContextType {
  connectedAccounts: SocialAccount[];
  shareHistory: SocialShare[];
  isLoading: boolean;
  isSharing: boolean;
  connectAccount: (provider: string, code: string, redirectUri: string) => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
  shareContent: (request: SocialShareRequest) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

interface SocialProviderProps {
  children: ReactNode;
}

// Timeout for social operations in milliseconds
const SOCIAL_TIMEOUT = 10000; // 10 seconds

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [shareHistory, setShareHistory] = useState<SocialShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    if (user) {
      loadConnectedAccounts();
      loadShareHistory();
    } else {
      setConnectedAccounts([]);
      setShareHistory([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadConnectedAccounts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Loading connected accounts timed out'));
        }, SOCIAL_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const accountsPromise = socialService.getConnectedAccounts();
      
      const accounts = await Promise.race([
        accountsPromise,
        timeoutPromise
      ]);
      
      // If accounts is null, it means the timeout won
      if (accounts === null) {
        throw new Error('Loading connected accounts timed out');
      }
      
      setConnectedAccounts(accounts);
      setLoadAttempts(0); // Reset attempts on success
    } catch (error) {
      console.error('Error loading connected accounts:', error);
      
      // Show error toast but don't block the UI
      toast.error('Failed to load connected social accounts');
      
      // Retry loading if failed (up to 3 times)
      if (loadAttempts < 3) {
        setLoadAttempts(prev => prev + 1);
        setTimeout(() => loadConnectedAccounts(), 2000); // Retry after 2 seconds
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadShareHistory = async () => {
    if (!user) return;
    
    try {
      const history = await socialService.getShareHistory();
      setShareHistory(history);
    } catch (error) {
      console.error('Error loading share history:', error);
      // Don't show toast for this as it's less critical
    }
  };

  const connectAccount = async (provider: string, code: string, redirectUri: string) => {
    try {
      setIsLoading(true);
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Account connection timed out'));
        }, SOCIAL_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const connectPromise = socialService.connectAccount({
        provider: provider as any,
        code,
        redirectUri
      });
      
      const result = await Promise.race([
        connectPromise,
        timeoutPromise
      ]);
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Account connection timed out');
      }
      
      await loadConnectedAccounts();
      toast.success(`Connected to ${provider} successfully!`);
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
      
      // Show error toast
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error(`Connection to ${provider} timed out. Please try again.`);
      } else {
        toast.error(`Failed to connect to ${provider}`);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      setIsLoading(true);
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Account disconnection timed out'));
        }, SOCIAL_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const disconnectPromise = socialService.disconnectAccount(accountId);
      
      const result = await Promise.race([
        disconnectPromise,
        timeoutPromise
      ]);
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Account disconnection timed out');
      }
      
      await loadConnectedAccounts();
      toast.success('Disconnected account successfully');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      
      // Show error toast
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error('Account disconnection timed out. Please try again.');
      } else {
        toast.error('Failed to disconnect account');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const shareContent = async (request: SocialShareRequest) => {
    try {
      setIsSharing(true);
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Content sharing timed out'));
        }, SOCIAL_TIMEOUT);
        
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      // Race between the actual request and the timeout
      const sharePromise = socialService.shareContent(request);
      
      const result = await Promise.race([
        sharePromise,
        timeoutPromise
      ]);
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Content sharing timed out');
      }
      
      await loadShareHistory();
      toast.success('Content shared successfully!');
    } catch (error) {
      console.error('Error sharing content:', error);
      
      // Show error toast
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error('Content sharing timed out. Please try again.');
      } else {
        toast.error('Failed to share content');
      }
      
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  const refreshAccounts = async () => {
    setLoadAttempts(0); // Reset attempts
    await loadConnectedAccounts();
  };

  const value = {
    connectedAccounts,
    shareHistory,
    isLoading,
    isSharing,
    connectAccount,
    disconnectAccount,
    shareContent,
    refreshAccounts
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
};
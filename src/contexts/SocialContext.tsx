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

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [shareHistory, setShareHistory] = useState<SocialShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

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
    try {
      setIsLoading(true);
      const accounts = await socialService.getConnectedAccounts();
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
      toast.error('Failed to load connected social accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadShareHistory = async () => {
    try {
      const history = await socialService.getShareHistory();
      setShareHistory(history);
    } catch (error) {
      console.error('Error loading share history:', error);
    }
  };

  const connectAccount = async (provider: string, code: string, redirectUri: string) => {
    try {
      setIsLoading(true);
      await socialService.connectAccount({
        provider: provider as any,
        code,
        redirectUri
      });
      await loadConnectedAccounts();
      toast.success(`Connected to ${provider} successfully!`);
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
      toast.error(`Failed to connect to ${provider}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      setIsLoading(true);
      await socialService.disconnectAccount(accountId);
      await loadConnectedAccounts();
      toast.success('Disconnected account successfully');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error('Failed to disconnect account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const shareContent = async (request: SocialShareRequest) => {
    try {
      setIsSharing(true);
      await socialService.shareContent(request);
      await loadShareHistory();
      toast.success('Content shared successfully!');
    } catch (error) {
      console.error('Error sharing content:', error);
      toast.error('Failed to share content');
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  const refreshAccounts = async () => {
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
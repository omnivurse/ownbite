import React, { ReactNode, useState, useEffect } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import UpgradeModal from './UpgradeModal';
import { Loader2 } from 'lucide-react';

interface PremiumFeatureGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  featureName: string;
  featureDescription?: string;
}

/**
 * Component that gates premium features behind a subscription check
 * If user has premium access, renders children
 * If not, shows upgrade modal or fallback content
 */
const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  children,
  fallback,
  featureName,
  featureDescription
}) => {
  const { hasActiveSubscription, hasPremiumAccess, isLoading, refreshSubscription } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadingState, setLoadingState] = useState(true);

  // Force refresh subscription status when component mounts
  useEffect(() => {
    refreshSubscription();
  }, []);

  // Add a slight delay to prevent flickering
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setLoadingState(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // If still loading subscription status, show loading state
  if (isLoading || loadingState) {
    return (
      <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-center">
        <div className="animate-pulse flex space-x-4 justify-center">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <div className="flex-1 space-y-2 max-w-md">
            <div className="h-4 bg-neutral-300 rounded"></div>
            <div className="h-4 bg-neutral-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // If user has premium access, render children
  if (hasActiveSubscription || hasPremiumAccess) {
    return <>{children}</>;
  }

  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise, render upgrade prompt
  return (
    <>
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          ✨ Premium Feature: {featureName}
        </h3>
        <p className="text-blue-700 mb-4">
          {featureDescription || 'Upgrade to OwnBite Ultimate Wellbeing to access this feature and more!'}
        </p>
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Upgrade to Ultimate Wellbeing
        </button>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        featureName={featureName}
      />
    </>
  );
};

export default PremiumFeatureGate;
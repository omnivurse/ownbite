import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  showFallback?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  showFallback = false 
}) => {
  // Add timeout fallback for lazy loading components
  const [showTimeoutMessage, setShowTimeoutMessage] = React.useState(false);
  
  React.useEffect(() => {
    if (showFallback) {
      const timer = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 10000); // Show fallback after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showFallback]);
  
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">{message}</p>
        {showTimeoutMessage && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
            <p className="text-yellow-800 text-sm">
              Taking longer than expected. Please check your internet connection or try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
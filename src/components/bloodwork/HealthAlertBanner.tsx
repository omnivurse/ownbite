import React from 'react';
import { AlertTriangle, Brain, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

interface HealthAlertBannerProps {
  alertCount: number;
  criticalCount: number;
  improvingCount: number;
  decreasingCount: number;
  className?: string;
}

const HealthAlertBanner: React.FC<HealthAlertBannerProps> = ({
  alertCount,
  criticalCount,
  improvingCount,
  decreasingCount,
  className = ''
}) => {
  if (alertCount === 0) return null;

  const getBannerColor = () => {
    if (criticalCount > 0) return 'bg-red-50 border-red-200';
    if (decreasingCount > improvingCount) return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getIcon = () => {
    if (criticalCount > 0) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (decreasingCount > improvingCount) return <TrendingDown className="h-5 w-5 text-yellow-600" />;
    return <Brain className="h-5 w-5 text-blue-600" />;
  };

  const getMessage = () => {
    if (criticalCount > 0) {
      return `${criticalCount} nutrient${criticalCount > 1 ? 's' : ''} at critical levels`;
    }
    
    if (decreasingCount > improvingCount) {
      return `${decreasingCount} nutrient${decreasingCount > 1 ? 's' : ''} trending downward`;
    }
    
    if (improvingCount > 0) {
      return `${improvingCount} nutrient${improvingCount > 1 ? 's' : ''} improving`;
    }
    
    return `${alertCount} health alert${alertCount > 1 ? 's' : ''} detected`;
  };

  return (
    <div className={`p-4 ${getBannerColor()} rounded-lg flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        {getIcon()}
        <div className="ml-3">
          <p className="font-medium text-neutral-900">{getMessage()}</p>
          <p className="text-sm text-neutral-600">
            View your detailed lab trend analysis for personalized insights
          </p>
        </div>
      </div>
      <Link to="/bloodwork/trends">
        <Button variant="primary" size="sm">
          View Analysis
        </Button>
      </Link>
    </div>
  );
};

export default HealthAlertBanner;
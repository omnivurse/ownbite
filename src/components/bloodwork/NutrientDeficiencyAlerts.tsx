import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Apple, X } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { bloodworkService } from '../../services/bloodworkService';

interface DeficiencyAlert {
  nutrient: string;
  status: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  foods: string[];
}

interface NutrientDeficiencyAlertsProps {
  className?: string;
}

const NutrientDeficiencyAlerts: React.FC<NutrientDeficiencyAlertsProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<DeficiencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const deficiencyAlerts = await bloodworkService.getDeficiencyAlerts();
      setAlerts(deficiencyAlerts);
    } catch (error) {
      console.error('Error loading deficiency alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (nutrient: string) => {
    setDismissedAlerts(prev => new Set([...prev, nutrient]));
  };

  const getAlertIcon = (status: string, priority: string) => {
    if (status === 'very_low' || status === 'very_high') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (status === 'low' || status === 'high') {
      return priority === 'high' 
        ? <TrendingDown className="h-5 w-5 text-orange-500" />
        : <TrendingUp className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getAlertColor = (status: string, priority: string) => {
    if (status === 'very_low' || status === 'very_high') {
      return 'border-red-200 bg-red-50';
    }
    if (status === 'low' || status === 'high') {
      return priority === 'high' 
        ? 'border-orange-200 bg-orange-50'
        : 'border-yellow-200 bg-yellow-50';
    }
    return 'border-green-200 bg-green-50';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'very_low': return 'Critically Low';
      case 'low': return 'Below Optimal';
      case 'high': return 'Above Optimal';
      case 'very_high': return 'Critically High';
      default: return 'Optimal';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.nutrient));

  if (loading) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-3 bg-neutral-200 rounded w-full"></div>
            <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-neutral-900">All Good!</h3>
            <p className="text-neutral-600 text-sm">
              No nutrient deficiencies detected. Upload bloodwork to get personalized recommendations.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAlerts.map((alert) => (
        <Card key={alert.nutrient} className={`border ${getAlertColor(alert.status, alert.priority)}`}>
          <CardBody className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getAlertIcon(alert.status, alert.priority)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-neutral-900">{alert.nutrient}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      alert.status === 'very_low' || alert.status === 'very_high' 
                        ? 'bg-red-100 text-red-800'
                        : alert.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusText(alert.status)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{alert.message}</p>
                  
                  {alert.foods.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Apple className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-neutral-700">Try: </span>
                      <div className="flex flex-wrap gap-1">
                        {alert.foods.map((food, index) => (
                          <span
                            key={index}
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => dismissAlert(alert.nutrient)}
                className="p-1 hover:bg-neutral-200 rounded-full ml-2"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
          </CardBody>
        </Card>
      ))}
      
      {dismissedAlerts.size > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDismissedAlerts(new Set())}
          >
            Show Dismissed Alerts ({dismissedAlerts.size})
          </Button>
        </div>
      )}
    </div>
  );
};

export default NutrientDeficiencyAlerts;
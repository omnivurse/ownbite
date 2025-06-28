import React, { useState, useEffect } from 'react';
import { MessageCircle, X, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardBody } from '../ui/Card';
import { coachService } from '../../services/coachService';

interface NutriCoachAssistantProps {
  dailySummary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recentEntries?: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    timestamp: string;
  }>;
}

const NutriCoachAssistant: React.FC<NutriCoachAssistantProps> = ({ 
  dailySummary,
  recentEntries 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const advice = await coachService.getNutritionAdvice({
        dailySummary,
        recentEntries
      });
      setAdvice(advice);
    } catch (error) {
      console.error('Error getting nutrition advice:', error);
      setError('Unable to get nutrition advice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !advice && !isLoading) {
      generateInsights();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        leftIcon={<MessageCircle className="h-5 w-5" />}
        onClick={() => setIsOpen(!isOpen)}
      >
        Ask NutriCoach
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">NutriCoach Insights</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse h-4 bg-neutral-100 rounded w-3/4"></div>
                <div className="animate-pulse h-4 bg-neutral-100 rounded w-full"></div>
                <div className="animate-pulse h-4 bg-neutral-100 rounded w-2/3"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-sm">
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={generateInsights}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-neutral-600 whitespace-pre-line">
                  {advice}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  onClick={generateInsights}
                >
                  Get New Advice
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default NutriCoachAssistant;
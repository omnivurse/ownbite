import React, { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { coachService } from '../services/coachService';
import { diaryService } from '../services/diaryService';

const CoachPage: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    loadDailySummary();
  }, []);

  const loadDailySummary = async () => {
    try {
      const summary = await diaryService.getDailySummary(new Date());
      setDailySummary(summary);
    } catch (error) {
      console.error('Error loading daily summary:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const advice = await coachService.getNutritionAdvice({
        dailySummary,
        query: userMessage
      });
      setMessages(prev => [...prev, { role: 'assistant', content: advice }]);
    } catch (error) {
      console.error('Error getting advice:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="AI Nutrition Coach">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <MessageCircle className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Your Personal NutriCoach</h2>
                <p className="text-neutral-600">Ask me anything about nutrition, your diet, or healthy eating habits!</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Today's Nutrition</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-primary-600">{dailySummary.calories}</div>
                  <div className="text-xs text-neutral-500">Calories</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">{dailySummary.protein}g</div>
                  <div className="text-xs text-neutral-500">Protein</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">{dailySummary.carbs}g</div>
                  <div className="text-xs text-neutral-500">Carbs</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">{dailySummary.fat}g</div>
                  <div className="text-xs text-neutral-500">Fat</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'assistant'
                        ? 'bg-neutral-100 text-neutral-800'
                        : 'bg-primary-600 text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-neutral-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your nutrition question..."
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CoachPage;
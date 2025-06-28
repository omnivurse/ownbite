import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import NutriCoachAssistant from '../components/diary/NutriCoachAssistant';
import { diaryService, type FoodEntry, type DailySummary } from '../services/diaryService';

const DiaryPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [selectedDate]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const [fetchedEntries, summary] = await Promise.all([
        diaryService.getFoodEntries(selectedDate),
        diaryService.getDailySummary(selectedDate)
      ]);
      setEntries(fetchedEntries);
      setDailySummary(summary);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await diaryService.deleteFoodEntry(id);
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <PageContainer title="Food Diary">
      <div className="space-y-6">
        {/* Header with Date and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-neutral-500" />
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                className="border-none bg-transparent text-neutral-900 focus:ring-0"
              />
            </div>
            <NutriCoachAssistant 
              dailySummary={dailySummary}
              recentEntries={entries}
            />
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Food
          </Button>
        </div>

        {/* Daily Summary */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Daily Summary</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{dailySummary.calories}</div>
                <div className="text-sm text-neutral-500">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dailySummary.protein}g</div>
                <div className="text-sm text-neutral-500">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{dailySummary.carbs}g</div>
                <div className="text-sm text-neutral-500">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{dailySummary.fat}g</div>
                <div className="text-sm text-neutral-500">Fat</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Food Entries */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-neutral-500">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">No entries for this day</div>
          ) : (
            entries.map(entry => (
              <Card key={entry.id} hoverable className="overflow-hidden">
                <div className="flex">
                  {entry.image_url && (
                    <div className="w-24 h-24">
                      <img
                        src={entry.image_url}
                        alt={entry.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardBody className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-neutral-900">{entry.name}</h4>
                        <p className="text-sm text-neutral-500">
                          {new Date(entry.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-primary-600 font-medium">{entry.calories} cal</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          leftIcon={<Trash2 className="h-4 w-4 text-neutral-500" />}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex space-x-4 text-sm text-neutral-600">
                      <span>Protein: {entry.protein}g</span>
                      <span>Carbs: {entry.carbs}g</span>
                      <span>Fat: {entry.fat}g</span>
                    </div>
                  </CardBody>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default DiaryPage;
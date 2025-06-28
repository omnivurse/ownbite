import React, { useState } from 'react';
import { Camera, History, TrendingUp } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import FoodScanner from '../components/FoodScanner';
import { scanService } from '../services/scanService';

const ScanPage: React.FC = () => {
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleScanComplete = async (results: any) => {
    try {
      // Save the scan result to database
      await scanService.saveScanResult(results);
      
      // Refresh recent scans
      loadRecentScans();
    } catch (error) {
      console.error('Error saving scan result:', error);
    }
  };

  const loadRecentScans = async () => {
    try {
      const scans = await scanService.getUserScans(5);
      setRecentScans(scans);
    } catch (error) {
      console.error('Error loading recent scans:', error);
    }
  };

  React.useEffect(() => {
    loadRecentScans();
  }, []);

  return (
    <PageContainer title="AI Food Scanner">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            📸 Scan Your Food
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Take a photo of your meal and get instant nutritional analysis powered by AI. 
            Our advanced computer vision identifies ingredients and provides detailed macro breakdowns.
          </p>
        </div>

        {/* Main Scanner */}
        <FoodScanner onScanComplete={handleScanComplete} />

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Recent Scans
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? 'Hide' : 'Show All'}
                </Button>
              </div>

              {showHistory && (
                <div className="space-y-4">
                  {recentScans.map((scan, index) => (
                    <div
                      key={scan.id || index}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                    >
                      <div className="flex items-center space-x-4">
                        {scan.image_url && (
                          <img
                            src={scan.image_url}
                            alt="Scanned food"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <div className="font-medium text-neutral-900">
                            {scan.food_items?.length || 0} items detected
                          </div>
                          <div className="text-sm text-neutral-500">
                            {new Date(scan.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-primary-600">
                          {scan.total_calories} cal
                        </div>
                        <div className="text-sm text-neutral-500">
                          P: {scan.total_protein}g • C: {scan.total_carbs}g • F: {scan.total_fat}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Scanning Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">Good Lighting</h4>
                    <p className="text-sm text-neutral-600">Ensure your food is well-lit and clearly visible</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">Close-up Shot</h4>
                    <p className="text-sm text-neutral-600">Get close enough to see individual ingredients</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">Steady Camera</h4>
                    <p className="text-sm text-neutral-600">Keep your device steady for a clear, sharp image</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">Multiple Angles</h4>
                    <p className="text-sm text-neutral-600">Try different angles if the first scan isn't accurate</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ScanPage;
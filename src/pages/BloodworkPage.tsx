import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Eye, Calendar, Download, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import BloodworkUpload from '../components/bloodwork/BloodworkUpload';
import BloodworkAnalysis from '../components/bloodwork/BloodworkAnalysis';
import LabTrendVisualizer from '../components/bloodwork/LabTrendVisualizer';
import HealthAlertBanner from '../components/bloodwork/HealthAlertBanner';
import { bloodworkTrendsService } from '../services/bloodworkTrendsService';

interface BloodworkResult {
  id: string;
  user_id: string;
  uploaded_at: string;
  file_name: string;
  source_type: string;
  analysis_complete: boolean;
  parsed_data: any;
}

const BloodworkPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bloodworkResults, setBloodworkResults] = useState<BloodworkResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [healthAlerts, setHealthAlerts] = useState<{
    alertCount: number;
    criticalCount: number;
    improvingCount: number;
    decreasingCount: number;
  }>({
    alertCount: 0,
    criticalCount: 0,
    improvingCount: 0,
    decreasingCount: 0
  });

  useEffect(() => {
    if (user) {
      loadBloodworkResults();
      loadHealthAlerts();
    }

    // Check if we should show a specific result
    const resultId = searchParams.get('id');
    if (resultId) {
      setSelectedResult(resultId);
    }
  }, [user, searchParams]);

  const loadBloodworkResults = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bloodwork_results')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setBloodworkResults(data || []);
    } catch (error) {
      console.error('Error loading bloodwork results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHealthAlerts = async () => {
    try {
      const alerts = await bloodworkTrendsService.getHealthAlerts();
      setHealthAlerts({
        alertCount: alerts.alertCount,
        criticalCount: alerts.criticalCount,
        improvingCount: alerts.improvingCount,
        decreasingCount: alerts.decreasingCount
      });
    } catch (error) {
      console.error('Error loading health alerts:', error);
    }
  };

  const handleUploadComplete = (result: BloodworkResult) => {
    setBloodworkResults(prev => [result, ...prev]);
    setShowUpload(false);
    setSelectedResult(result.id);
  };

  const handleViewResult = (resultId: string) => {
    setSelectedResult(resultId);
    navigate(`/bloodwork?id=${resultId}`);
  };

  const downloadReport = async (result: BloodworkResult) => {
    // This would generate and download a PDF report
    console.log('Downloading report for:', result.id);
  };

  if (loading) {
    return (
      <PageContainer title="Bloodwork Analysis">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Bloodwork Analysis">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Bloodwork Analysis</h1>
            <p className="text-neutral-600 mt-1">
              Upload your lab results to get personalized nutrition recommendations
            </p>
          </div>
          <Button
            onClick={() => setShowUpload(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Upload New Results
          </Button>
        </div>

        {/* Health Alerts Banner */}
        {healthAlerts.alertCount > 0 && (
          <HealthAlertBanner 
            alertCount={healthAlerts.alertCount}
            criticalCount={healthAlerts.criticalCount}
            improvingCount={healthAlerts.improvingCount}
            decreasingCount={healthAlerts.decreasingCount}
          />
        )}

        {/* Lab Trend Visualizer */}
        {bloodworkResults.length > 0 && !selectedResult && (
          <LabTrendVisualizer />
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Upload Bloodwork</h2>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    ×
                  </button>
                </div>
                <BloodworkUpload onUploadComplete={handleUploadComplete} />
              </div>
            </div>
          </div>
        )}

        {selectedResult ? (
          /* Analysis View */
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedResult(null);
                  navigate('/bloodwork');
                }}
              >
                ← Back to Results
              </Button>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Analysis Results
                </h2>
                <p className="text-neutral-600">
                  {bloodworkResults.find(r => r.id === selectedResult)?.file_name}
                </p>
              </div>
            </div>
            <BloodworkAnalysis bloodworkId={selectedResult} />
          </div>
        ) : (
          /* Results List */
          <div className="space-y-6">
            {bloodworkResults.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    No Bloodwork Results Yet
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Upload your first lab results to get started with personalized nutrition analysis.
                  </p>
                  <Button
                    onClick={() => setShowUpload(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Upload Your First Results
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bloodworkResults.map((result) => (
                  <Card key={result.id} hoverable>
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-primary-100 rounded-lg">
                            <FileText className="h-6 w-6 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-neutral-900">
                              {result.file_name || 'Bloodwork Results'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-neutral-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(result.uploaded_at).toLocaleDateString()}
                              </div>
                              <span className="capitalize">{result.source_type}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result.analysis_complete
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {result.analysis_complete ? 'Analyzed' : 'Processing'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(result)}
                            leftIcon={<Download className="h-4 w-4" />}
                          >
                            Download
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleViewResult(result.id)}
                            leftIcon={<Eye className="h-4 w-4" />}
                            disabled={!result.analysis_complete}
                          >
                            View Analysis
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default BloodworkPage;
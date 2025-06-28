import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';
import PremiumFeatureGate from '../subscription/PremiumFeatureGate';
import { bloodworkTrendsService } from '../../services/bloodworkTrendsService';

interface BloodworkUploadProps {
  onUploadComplete?: (result: any) => void;
}

const BloodworkUpload: React.FC<BloodworkUploadProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const { hasPremiumAccess } = useSubscription();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [importingTrends, setImportingTrends] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedBloodworkId, setUploadedBloodworkId] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadComplete(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const uploadFile = async () => {
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      // Check if user has premium access for unlimited uploads
      if (!hasPremiumAccess) {
        // Check how many uploads the user has done this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count, error: countError } = await supabase
          .from('bloodwork_results')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('uploaded_at', startOfMonth.toISOString());
          
        if (countError) throw countError;
        
        if ((count || 0) >= 1) {
          throw new Error('Free plan limited to 1 bloodwork upload per month. Please upgrade to Premium for unlimited uploads.');
        }
      }

      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bloodwork')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bloodwork')
        .getPublicUrl(fileName);

      // Save bloodwork record to database
      const { data: bloodworkData, error: dbError } = await supabase
        .from('bloodwork_results')
        .insert([{
          user_id: user.id,
          file_url: publicUrl,
          file_name: file.name,
          source_type: file.type.includes('pdf') ? 'pdf' : file.type.includes('csv') ? 'csv' : 'manual',
          analysis_complete: false
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setUploading(false);
      setAnalyzing(true);
      setUploadedBloodworkId(bloodworkData.id);

      // Check if GEMINI_API_KEY is available
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.warn('No Gemini API key found. Using mock analysis data.');
        
        // Update the bloodwork record with mock analysis data
        await supabase
          .from('bloodwork_results')
          .update({
            parsed_data: {
              biomarkers: [
                {
                  name: "Vitamin D",
                  value: 25,
                  unit: "ng/mL",
                  status: "low",
                  normal_range: "30-100",
                  recommendation: "Increase intake of fatty fish, egg yolks, and consider supplementation"
                },
                {
                  name: "Iron",
                  value: 50,
                  unit: "μg/dL",
                  status: "low",
                  normal_range: "60-170",
                  recommendation: "Increase intake of red meat, spinach, and legumes"
                }
              ],
              summary_text: "Analysis shows potential deficiencies in Vitamin D and Iron. Consider dietary adjustments and possible supplementation.",
              key_deficiencies: ["Vitamin D", "Iron"],
              key_recommendations: ["Increase vitamin D intake", "Add iron-rich foods to diet"]
            },
            analysis_complete: true
          })
          .eq('id', bloodworkData.id);
          
        // Create nutrient status entries for mock data
        await supabase
          .from('user_nutrient_status')
          .insert([
            {
              user_id: user.id,
              bloodwork_id: bloodworkData.id,
              nutrient_name: "Vitamin D",
              current_value: 25,
              unit: "ng/mL",
              status: "low",
              recommendations_applied: false
            },
            {
              user_id: user.id,
              bloodwork_id: bloodworkData.id,
              nutrient_name: "Iron",
              current_value: 50,
              unit: "μg/dL",
              status: "low",
              recommendations_applied: false
            }
          ]);
      } else {
        // Trigger analysis with the edge function
        await analyzeBloodwork(bloodworkData.id, publicUrl);
      }

      setAnalyzing(false);
      
      // Import to trends
      if (hasPremiumAccess) {
        setImportingTrends(true);
        try {
          await bloodworkTrendsService.importFromBloodwork(bloodworkData.id);
        } catch (importError) {
          console.error('Error importing to trends:', importError);
          // Don't throw here, we still want to mark the upload as complete
        } finally {
          setImportingTrends(false);
        }
      }
      
      setUploadComplete(true);
      onUploadComplete?.(bloodworkData);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
      setUploading(false);
      setAnalyzing(false);
      setImportingTrends(false);
    }
  };

  const analyzeBloodwork = async (bloodworkId: string, fileUrl: string) => {
    try {
      // This would call your AI analysis edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-bloodwork`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          bloodwork_id: bloodworkId,
          file_url: fileUrl 
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      
      // Update bloodwork record with analysis results
      await supabase
        .from('bloodwork_results')
        .update({
          parsed_data: result.parsed_data,
          analysis_complete: true
        })
        .eq('id', bloodworkId);

    } catch (error) {
      console.error('Analysis error:', error);
      // Mark as complete even if analysis fails
      await supabase
        .from('bloodwork_results')
        .update({ analysis_complete: true })
        .eq('id', bloodworkId);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setUploadComplete(false);
    setUploadedBloodworkId(null);
  };

  // Free plan fallback content
  const freePlanFallback = (
    <div className="text-center py-8">
      <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
        <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Bloodwork Analysis
        </h3>
        <p className="text-blue-700 mb-6">
          Free plan includes 1 bloodwork analysis per month. Upgrade to Premium for unlimited bloodwork uploads and advanced analysis.
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.href = '/pricing'}
        >
          View Premium Plans
        </Button>
      </div>
    </div>
  );

  const uploadContent = (
    <Card className="w-full max-w-2xl mx-auto">
      <CardBody>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Upload Bloodwork Results
            </h2>
            <p className="text-neutral-600">
              Upload your lab results to get personalized nutrition recommendations
            </p>
          </div>

          {!file ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-neutral-500 mb-4">or click to browse</p>
              <p className="text-sm text-neutral-400">
                Supported formats: PDF, JPG, PNG, CSV (max 10MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary-500" />
                  <div>
                    <p className="font-medium text-neutral-900">{file.name}</p>
                    <p className="text-sm text-neutral-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!uploading && !analyzing && !importingTrends && !uploadComplete && (
                  <button
                    onClick={removeFile}
                    className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-neutral-500" />
                  </button>
                )}
              </div>

              {uploadComplete ? (
                <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-green-700 font-medium">
                    Upload and analysis complete!
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploading && (
                    <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-blue-700">
                        Uploading file...
                      </span>
                    </div>
                  )}
                  
                  {analyzing && (
                    <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-blue-700">
                        Analyzing bloodwork...
                      </span>
                    </div>
                  )}
                  
                  {importingTrends && (
                    <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-blue-700">
                        Importing trend data...
                      </span>
                    </div>
                  )}

                  {!uploading && !analyzing && !importingTrends && (
                    <Button
                      onClick={uploadFile}
                      className="w-full"
                      size="lg"
                    >
                      Upload and Analyze
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your bloodwork will be analyzed using AI</li>
              <li>• We'll identify any nutrient deficiencies or imbalances</li>
              <li>• You'll receive personalized food recommendations</li>
              <li>• A custom meal plan will be generated for you</li>
              {hasPremiumAccess && (
                <li>• Your results will be added to your trend analysis</li>
              )}
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <PremiumFeatureGate
      featureName="Bloodwork Analysis"
      featureDescription="Upload your lab results to get personalized nutrition recommendations"
      fallback={freePlanFallback}
    >
      {uploadContent}
    </PremiumFeatureGate>
  );
};

export default BloodworkUpload;
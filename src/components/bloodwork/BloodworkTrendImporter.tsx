import React, { useState } from 'react';
import { FileText, Upload, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { bloodworkTrendsService } from '../../services/bloodworkTrendsService';

interface BloodworkTrendImporterProps {
  onImportComplete?: (count: number) => void;
  className?: string;
}

const BloodworkTrendImporter: React.FC<BloodworkTrendImporterProps> = ({
  onImportComplete,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedBloodworkId, setSelectedBloodworkId] = useState<string | null>(null);
  const [bloodworkOptions, setBloodworkOptions] = useState<Array<{id: string, name: string, date: string}>>([]);

  React.useEffect(() => {
    loadBloodworkOptions();
  }, []);

  const loadBloodworkOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('bloodwork_results')
        .select('id, file_name, uploaded_at')
        .order('uploaded_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setBloodworkOptions(data?.map(item => ({
        id: item.id,
        name: item.file_name || `Bloodwork (${new Date(item.uploaded_at).toLocaleDateString()})`,
        date: new Date(item.uploaded_at).toLocaleDateString()
      })) || []);
    } catch (err: any) {
      console.error('Error loading bloodwork options:', err);
      setError('Failed to load bloodwork options');
    }
  };

  const handleImport = async () => {
    if (!selectedBloodworkId) {
      setError('Please select a bloodwork result to import');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const count = await bloodworkTrendsService.importFromBloodwork(selectedBloodworkId);
      
      setSuccess(`Successfully imported ${count} data points`);
      onImportComplete?.(count);
    } catch (err: any) {
      console.error('Error importing bloodwork trends:', err);
      setError(err.message || 'Failed to import bloodwork trends');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async () => {
    // This would open a modal for manual entry
    // For now, we'll just show a message
    setError('Manual entry feature coming soon');
  };

  return (
    <Card className={className}>
      <CardBody>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary-600" />
          Import Bloodwork Trends
        </h3>
        
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Select Bloodwork Result
            </label>
            <select
              value={selectedBloodworkId || ''}
              onChange={(e) => setSelectedBloodworkId(e.target.value || null)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a bloodwork result</option>
              {bloodworkOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name} ({option.date})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={loading || !selectedBloodworkId}
              leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              className="flex-1"
            >
              {loading ? 'Importing...' : 'Import Selected'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleManualEntry}
              disabled={loading}
              className="flex-1"
            >
              Manual Entry
            </Button>
          </div>
          
          <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Select a bloodwork result to import its data points</li>
              <li>Each nutrient will be added as a trend data point</li>
              <li>View trends over time in the charts below</li>
              <li>Get AI-powered insights based on your trends</li>
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default BloodworkTrendImporter;
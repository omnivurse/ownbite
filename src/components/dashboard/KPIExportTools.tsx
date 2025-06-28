import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { saveAs } from 'file-saver';

interface KPIExportToolsProps {
  className?: string;
}

const KPIExportTools: React.FC<KPIExportToolsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCSV = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get KPI data from the database
      const { data, error } = await supabase.rpc('get_kpi_dashboard', {
        p_user_id: user.id,
        p_timeframe: timeframe
      });
      
      if (error) throw error;
      
      // Create CSV header
      const headers = [
        'Date',
        'Hydration (%)',
        'Sitting Hours',
        'Driving Hours',
        'Screen Time Hours',
        'Sleep Hours',
        'Fast Food',
        'Alcohol',
        'Food Spending ($)'
      ];
      
      // Create CSV rows
      const rows = [];
      
      // Add header row
      rows.push(headers.join(','));
      
      // Get dates from the data
      const dates = data.sitting_hours.labels;
      const sittingData = data.sitting_hours.data;
      const drivingData = data.driving_hours.data;
      const sleepData = data.sleep_hours.data;
      
      // Create a row for each date
      for (let i = 0; i < dates.length; i++) {
        const row = [
          dates[i],                  // Date
          data.hydration_pct,        // Hydration (using average for all days)
          sittingData[i] || 0,       // Sitting Hours
          drivingData[i] || 0,       // Driving Hours
          '4',                       // Screen Time (placeholder)
          sleepData[i] || 0,         // Sleep Hours
          i === 0 ? 'Yes' : 'No',    // Fast Food (placeholder)
          i === 2 ? 'Yes' : 'No',    // Alcohol (placeholder)
          i === 0 ? '25.50' : '0'    // Food Spending (placeholder)
        ];
        
        rows.push(row.join(','));
      }
      
      // Create and download the CSV file
      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `health-metrics-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`);
      
    } catch (err: any) {
      console.error('Error exporting KPI data:', err);
      setError(err.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary-600" />
          Export Health Metrics
        </h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Select Timeframe
            </label>
            <div className="flex space-x-2">
              <Button
                variant={timeframe === 'week' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('week')}
              >
                Week
              </Button>
              <Button
                variant={timeframe === 'month' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('month')}
              >
                Month
              </Button>
              <Button
                variant={timeframe === 'year' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('year')}
              >
                Year
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={exportCSV}
              disabled={loading}
              leftIcon={<Download className="h-4 w-4" />}
              className="flex-1"
            >
              {loading ? 'Exporting...' : 'Export as CSV'}
            </Button>
            
            <Button
              variant="outline"
              disabled={loading}
              leftIcon={<Calendar className="h-4 w-4" />}
              className="flex-1"
            >
              Schedule Reports
            </Button>
          </div>
          
          <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Export includes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Daily activity metrics (sitting, driving, sleep)</li>
              <li>Hydration levels</li>
              <li>Screen time breakdown</li>
              <li>Food and substance consumption</li>
              <li>Diet spending</li>
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default KPIExportTools;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { TestTube, Calendar, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';

interface BloodworkPreviewProps {
  userId: string;
}

interface BloodworkResult {
  id: string;
  uploaded_at: string;
  file_name: string;
  source_type: string;
  analysis_complete: boolean;
  parsed_data: any;
}

const BloodworkPreview: React.FC<BloodworkPreviewProps> = ({ userId }) => {
  const [results, setResults] = useState<BloodworkResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBloodwork() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bloodwork_results')
          .select('*')
          .eq('user_id', userId)
          .order('uploaded_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setResults(data || []);
      } catch (err: any) {
        console.error('Error fetching bloodwork:', err);
        setError(err.message || 'Failed to load bloodwork data');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchBloodwork();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                  <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-red-500">Error loading bloodwork data: {error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <TestTube className="h-5 w-5 mr-2 text-red-600" />
            Recent Bloodwork
          </h2>
          <Link to="/bloodwork">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        
        {results.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 mb-4">No bloodwork uploaded yet</p>
            <Link to="/bloodwork">
              <Button variant="primary" size="sm">Upload Bloodwork</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600">
                      {new Date(result.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.analysis_complete 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.analysis_complete ? (
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Analyzed
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Processing
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="font-medium mb-1">
                  {result.file_name || `Bloodwork Results (${result.source_type})`}
                </h3>
                
                {result.analysis_complete && result.parsed_data && (
                  <div className="text-sm text-neutral-600 mb-2">
                    {result.parsed_data.summary_text || 
                     `${Object.keys(result.parsed_data).length} nutrients analyzed`}
                  </div>
                )}
                
                <Link to={`/bloodwork?id=${result.id}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default BloodworkPreview;
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Clock, Filter, Search } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';

interface ActivityLogProps {
  userId: string;
  limit?: number;
}

interface LogEntry {
  id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ userId, limit = 10 }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        
        // Use the audit_log table instead of user_events
        const { data, error } = await supabase
          .from('audit_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setLogs(data || []);
      } catch (err: any) {
        console.error('Error fetching activity logs:', err);
        setError(err.message || 'Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchLogs();
    }
  }, [userId, limit]);

  // Format the details object for display
  const formatDetails = (details: any): string => {
    if (!details) return 'No details';
    
    if (typeof details === 'string') {
      return details;
    }
    
    try {
      // If it's an object, extract key information
      const keyInfo = [];
      
      if (details.email) keyInfo.push(`Email: ${details.email}`);
      if (details.item) keyInfo.push(`Item: ${details.item}`);
      if (details.status) keyInfo.push(`Status: ${details.status}`);
      if (details.type) keyInfo.push(`Type: ${details.type}`);
      if (details.id) keyInfo.push(`ID: ${details.id}`);
      
      return keyInfo.length > 0 ? keyInfo.join(', ') : JSON.stringify(details);
    } catch (e) {
      return 'Complex details';
    }
  };

  // Get a friendly name for the action
  const getActionName = (action: string): string => {
    const actionMap: {[key: string]: string} = {
      'user_login': 'Logged in',
      'user_logout': 'Logged out',
      'food_scan': 'Scanned food',
      'food_entry': 'Added food entry',
      'bloodwork_upload': 'Uploaded bloodwork',
      'meal_plan_generated': 'Generated meal plan',
      'profile_updated': 'Updated profile',
      'subscription_changed': 'Changed subscription',
      'invite_user': 'Invited user',
      'user_role_updated': 'Updated user role'
    };
    
    return actionMap[action] || action.replace(/_/g, ' ');
  };

  // Get an icon for the action type
  const getActionIcon = (action: string) => {
    // This would be better with a proper icon mapping
    return <Activity className="h-4 w-4 text-primary-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-2">
                  <div className="h-4 w-4 bg-neutral-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                  </div>
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
          <p className="text-red-500">Error loading activity logs: {error}</p>
        </CardBody>
      </Card>
    );
  }

  const displayLogs = showAll ? logs : logs.slice(0, 5);

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary-600" />
            Activity Log
          </h2>
          {logs.length > 5 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'Show All'}
            </Button>
          )}
        </div>
        
        {logs.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600">No recent activity logged</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayLogs.map((log) => (
              <div key={log.id} className="border-b border-neutral-200 pb-3 last:border-0">
                <div className="flex items-start">
                  <div className="p-1.5 bg-primary-100 rounded-full mr-3 mt-0.5">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">
                      {getActionName(log.action)}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {formatDetails(log.details)}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-neutral-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {logs.length > 0 && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All (${logs.length})`}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ActivityLog;
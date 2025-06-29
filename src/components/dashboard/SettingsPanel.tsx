import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Download, CreditCard, Shield, Bell, User, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { clearUserCache, forceClearAllStorage } from '../../lib/cache';

interface SettingsPanelProps {
  userId: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ userId }) => {
  const { signOut, profile } = useAuth();
  const { hasActiveSubscription, hasPremiumAccess, productName, nextBillingDate, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    // Force refresh subscription status when component mounts
    refreshSubscription();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log('Signing out from SettingsPanel');
      
      // Clear cache before signing out
      await clearUserCache();
      
      await signOut();
      navigate('/login');
    } catch (err: any) {
      console.error('Error signing out from SettingsPanel:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const downloadData = async () => {
    try {
      setExportLoading(true);
      
      // Fetch user's data from various tables
      const [foodEntries, foodScans, bloodworkResults, mealPlans] = await Promise.all([
        supabase.from('food_entries').select('*').eq('user_id', userId),
        supabase.from('food_scans').select('*').eq('user_id', userId),
        supabase.from('bloodwork_results').select('*').eq('user_id', userId),
        supabase.from('meal_plans').select('*').eq('user_id', userId)
      ]);
      
      // Combine all data
      const userData = {
        profile: profile,
        food_entries: foodEntries.data || [],
        food_scans: foodScans.data || [],
        bloodwork_results: bloodworkResults.data || [],
        meal_plans: mealPlans.data || [],
        exported_at: new Date().toISOString()
      };
      
      // Convert to JSON and create download
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `ownbite-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error('Error exporting data:', err);
      setError(err.message || 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      await forceClearAllStorage();
      setSuccess('Cache cleared successfully. You will be redirected to login page.');
      
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Error clearing cache:', err);
      setError(err.message || 'Failed to clear cache');
    } finally {
      setClearingCache(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2 text-neutral-600" />
            Settings
          </h2>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 mb-4 bg-green-50 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
        
        <div className="space-y-5">
          {/* Subscription Section */}
          <div>
            <div className="flex items-center mb-2">
              <CreditCard className="h-4 w-4 text-neutral-600 mr-2" />
              <h3 className="font-medium text-neutral-800">Subscription Plan</h3>
            </div>
            <div className="flex items-center justify-between pl-6">
              <div>
                <p className="text-neutral-700">
                  {hasPremiumAccess 
                    ? `${productName || 'Ultimate Wellbeing'} Plan` 
                    : 'Free Plan'}
                </p>
                {nextBillingDate && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Renews on: {nextBillingDate.toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant={hasPremiumAccess ? 'outline' : 'primary'}
                onClick={() => navigate('/pricing')}
              >
                {hasPremiumAccess ? 'Manage Subscription' : 'Upgrade to Ultimate Wellbeing'}
              </Button>
            </div>
          </div>
          
          {/* Account Section */}
          <div>
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 text-neutral-600 mr-2" />
              <h3 className="font-medium text-neutral-800">Account</h3>
            </div>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-700">Profile</p>
                  <p className="text-xs text-neutral-500">
                    {profile?.full_name || 'Update your personal information'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                >
                  Edit
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-700">Email Notifications</p>
                  <p className="text-xs text-neutral-500">
                    Manage your email preferences
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/notifications')}
                  leftIcon={<Bell className="h-4 w-4" />}
                >
                  Settings
                </Button>
              </div>
              
              {profile?.role === 'admin' && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-700">Admin Panel</p>
                    <p className="text-xs text-neutral-500">
                      Manage users and system settings
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin/users')}
                    leftIcon={<Shield className="h-4 w-4" />}
                  >
                    Access
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Data Section */}
          <div>
            <div className="flex items-center mb-2">
              <Download className="h-4 w-4 text-neutral-600 mr-2" />
              <h3 className="font-medium text-neutral-800">Data & Privacy</h3>
            </div>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-700">Export Your Data</p>
                  <p className="text-xs text-neutral-500">
                    Download all your nutrition and health data
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadData}
                  disabled={exportLoading}
                  leftIcon={exportLoading ? <span className="animate-spin">↻</span> : undefined}
                >
                  {exportLoading ? 'Exporting...' : 'Export'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-700">Clear Cache</p>
                  <p className="text-xs text-neutral-500">
                    Clear application cache and storage
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  disabled={clearingCache}
                  leftIcon={clearingCache ? <span className="animate-spin">↻</span> : undefined}
                >
                  {clearingCache ? 'Clearing...' : 'Clear Cache'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-700">Privacy Settings</p>
                  <p className="text-xs text-neutral-500">
                    Manage your data sharing preferences
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/privacy-settings')}
                >
                  Manage
                </Button>
              </div>
            </div>
          </div>
          
          {/* Sign Out */}
          <div className="pt-4 border-t border-neutral-200">
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={loading}
              leftIcon={<LogOut className="h-4 w-4" />}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SettingsPanel;
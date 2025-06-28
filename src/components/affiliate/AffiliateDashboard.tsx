import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Share2, 
  Copy, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Download, 
  RefreshCw,
  Loader2
} from 'lucide-react';
import { affiliateService, AffiliateDashboard as DashboardData } from '../../services/affiliateService';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

const AffiliateDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await affiliateService.getAffiliateDashboard();
      setDashboardData(data);
      
    } catch (err: any) {
      console.error('Error loading affiliate dashboard:', err);
      setError(err.message || 'Failed to load affiliate dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };
  
  const copyReferralLink = () => {
    if (!dashboardData?.affiliate.referral_code) return;
    
    const referralLink = `https://ownbite.me/signup?ref=${dashboardData.affiliate.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={loadDashboardData}>Try Again</Button>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-neutral-900 mb-2">
          You're not an affiliate yet
        </h3>
        <p className="text-neutral-600 mb-6">
          Join our affiliate program to earn commissions by referring new users.
        </p>
        <Link to="/affiliate/signup">
          <Button variant="primary">
            Become an Affiliate
          </Button>
        </Link>
      </div>
    );
  }
  
  const referralLink = `https://ownbite.me/signup?ref=${dashboardData.affiliate.referral_code}`;
  
  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">Affiliate Dashboard</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          leftIcon={refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-700">Total Referrals</p>
                <p className="text-2xl font-bold text-primary-900">{dashboardData.stats.total_referrals}</p>
              </div>
              <div className="p-3 bg-primary-200 rounded-full">
                <Users className="h-6 w-6 text-primary-700" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Earnings</p>
                <p className="text-2xl font-bold text-green-900">${dashboardData.stats.total_earnings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <DollarSign className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending Earnings</p>
                <p className="text-2xl font-bold text-yellow-900">${dashboardData.stats.pending_earnings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Paid Earnings</p>
                <p className="text-2xl font-bold text-blue-900">${dashboardData.stats.paid_earnings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-primary-600" />
            Your Referral Link
          </h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 p-3 bg-neutral-50 border border-neutral-200 rounded-lg overflow-x-auto">
              <code className="text-sm text-neutral-800">{referralLink}</code>
            </div>
            <Button
              onClick={copyReferralLink}
              leftIcon={<Copy className="h-4 w-4" />}
              variant={copied ? "primary" : "outline"}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">How to use your referral link:</h4>
            <ol className="list-decimal pl-5 space-y-1 text-blue-700">
              <li>Share this link on your social media, blog, or with friends</li>
              <li>When someone signs up using your link, you'll earn commission</li>
              <li>Track your referrals and earnings on this dashboard</li>
            </ol>
          </div>
        </CardBody>
      </Card>
      
      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-600" />
            Recent Referrals
          </h3>
        </CardHeader>
        <CardBody>
          {dashboardData.recent_referrals && dashboardData.recent_referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Hashtag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {dashboardData.recent_referrals.map((referral) => (
                    <tr key={referral.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                        {new Date(referral.joined_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                        {referral.source || 'Direct'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                        {referral.hashtag}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600">No referrals yet</p>
              <p className="text-sm text-neutral-500 mt-1">Share your referral link to start earning</p>
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Recent Commissions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
              Recent Commissions
            </h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              disabled={!dashboardData.recent_commissions || dashboardData.recent_commissions.length === 0}
            >
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {dashboardData.recent_commissions && dashboardData.recent_commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {dashboardData.recent_commissions.map((commission) => (
                    <tr key={commission.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                        {new Date(commission.generated_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-700">
                        ${commission.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          commission.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : commission.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                        {commission.paid_at ? new Date(commission.paid_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600">No commissions yet</p>
              <p className="text-sm text-neutral-500 mt-1">Commissions are generated when your referrals upgrade to premium</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AffiliateDashboard;
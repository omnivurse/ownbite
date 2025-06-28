import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Loader2,
  Calendar,
  Hash
} from 'lucide-react';
import { socialSharingService } from '../../services/socialSharingService';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface SocialShareHistoryProps {
  className?: string;
  limit?: number;
}

const SocialShareHistory: React.FC<SocialShareHistoryProps> = ({ 
  className = '',
  limit = 10
}) => {
  const [shareHistory, setShareHistory] = useState<any>({ shares: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadShareHistory();
  }, []);

  const loadShareHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await socialSharingService.getShareHistory(limit);
      setShareHistory(data);
    } catch (err: any) {
      console.error('Error loading share history:', err);
      setError(err.message || 'Failed to load share history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadShareHistory();
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold">{provider.charAt(0).toUpperCase()}</div>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold">Share History</h3>
        </CardHeader>
        <CardBody>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold">Share History</h3>
        </CardHeader>
        <CardBody>
          <div className="text-red-500 mb-4">{error}</div>
          <Button variant="outline" onClick={loadShareHistory}>Try Again</Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Share History</h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {shareHistory.shares.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">No share history yet</p>
            <p className="text-sm text-neutral-500 mt-2">
              Share your achievements and progress to earn points!
            </p>
          </div>
        ) : (
          <>
            {/* Share Stats */}
            {shareHistory.stats && shareHistory.stats.total_shares > 0 && (
              <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">Sharing Stats</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{shareHistory.stats.total_shares}</div>
                    <div className="text-sm text-neutral-600">Total Shares</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {Object.keys(shareHistory.stats.by_platform || {}).length}
                    </div>
                    <div className="text-sm text-neutral-600">Platforms Used</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {shareHistory.stats.by_content_type?.recipe || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Recipes Shared</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Share List */}
            <div className="space-y-3">
              {shareHistory.shares.map((share: any) => (
                <div key={share.id} className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      {getProviderIcon(share.provider)}
                      <span className="ml-2 font-medium capitalize">
                        {socialSharingService.getProviderDisplayName(share.provider)}
                      </span>
                    </div>
                    <div>
                      {getStatusIcon(share.share_status)}
                    </div>
                  </div>
                  
                  <p className="text-neutral-700 mb-2 line-clamp-2">{share.share_text}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {share.hashtags.map((tag: string, index: number) => (
                      <span 
                        key={index} 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tag === '#iamhealthierwithownbite.me' 
                            ? 'bg-primary-100 text-primary-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-xs text-neutral-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(share.created_at).toLocaleString()}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{socialSharingService.getContentTypeDisplayName(share.content_type)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {shareHistory.shares.length > limit && (
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Implement view more logic */}}
                >
                  View More
                </Button>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default SocialShareHistory;
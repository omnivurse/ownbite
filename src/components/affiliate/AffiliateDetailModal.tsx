import React, { useState, useEffect } from 'react';
import { X, User, Link, DollarSign, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { adminService, AdminAffiliate } from '../../services/adminService';
import Button from '../ui/Button';

interface AffiliateDetailModalProps {
  affiliateId: string;
  onClose: () => void;
  onStatusChange: () => void;
}

const AffiliateDetailModal: React.FC<AffiliateDetailModalProps> = ({ 
  affiliateId, 
  onClose,
  onStatusChange
}) => {
  const [affiliate, setAffiliate] = useState<AdminAffiliate | null>(null);
  const [stats, setStats] = useState<{
    referralCount: number;
    conversionCount: number;
    totalEarnings: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  useEffect(() => {
    loadAffiliateDetails();
  }, [affiliateId]);
  
  const loadAffiliateDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [affiliateData, statsData] = await Promise.all([
        adminService.getAffiliateDetails(affiliateId),
        adminService.getAffiliateStats(affiliateId)
      ]);
      
      setAffiliate(affiliateData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading affiliate details:', err);
      setError(err.message || 'Failed to load affiliate details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async () => {
    if (!affiliate) return;
    
    try {
      setActionLoading(true);
      await adminService.approveAffiliate(affiliate.id);
      setAffiliate({ ...affiliate, approved: true });
      onStatusChange();
    } catch (err: any) {
      console.error('Error approving affiliate:', err);
      setError(err.message || 'Failed to approve affiliate');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!affiliate) return;
    
    try {
      setActionLoading(true);
      await adminService.rejectAffiliate(affiliate.id);
      setAffiliate({ ...affiliate, approved: false });
      onStatusChange();
    } catch (err: any) {
      console.error('Error rejecting affiliate:', err);
      setError(err.message || 'Failed to reject affiliate');
    } finally {
      setActionLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Affiliate Details</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          ) : affiliate ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-neutral-900">{affiliate.full_name}</h3>
                  <p className="text-neutral-600">{affiliate.email}</p>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      affiliate.approved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {affiliate.approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              {affiliate.bio && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">Bio</h4>
                  <p className="text-neutral-700">{affiliate.bio}</p>
                </div>
              )}
              
              {/* Referral Code */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-2">Referral Code</h4>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-neutral-100 rounded-lg flex-1">
                    <code className="text-neutral-800">{affiliate.referral_code}</code>
                  </div>
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Link className="h-5 w-5 text-neutral-500" />
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Referral link: https://ownbite.me/signup?ref={affiliate.referral_code}
                </p>
              </div>
              
              {/* Social Links */}
              {affiliate.social_links && Object.keys(affiliate.social_links).length > 0 && (
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Social Media</h4>
                  <div className="space-y-2">
                    {Object.entries(affiliate.social_links).map(([platform, link]) => (
                      <div key={platform} className="flex items-center">
                        <span className="text-neutral-700 capitalize w-24">{platform}:</span>
                        <a 
                          href={link.startsWith('http') ? link : `https://${link}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 truncate"
                        >
                          {link}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-neutral-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{stats.referralCount}</div>
                    <div className="text-sm text-neutral-600">Referrals</div>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{stats.conversionCount}</div>
                    <div className="text-sm text-neutral-600">Conversions</div>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">${stats.totalEarnings.toFixed(2)}</div>
                    <div className="text-sm text-neutral-600">Earnings</div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Close
                </Button>
                
                {affiliate.approved ? (
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    leftIcon={<XCircle className="h-4 w-4" />}
                    onClick={handleReject}
                    isLoading={actionLoading}
                  >
                    Reject
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    leftIcon={<CheckCircle className="h-4 w-4" />}
                    onClick={handleApprove}
                    isLoading={actionLoading}
                  >
                    Approve
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600">Affiliate not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateDetailModal;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import AffiliateDetailModal from '../components/affiliate/AffiliateDetailModal';

interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  full_name: string;
  bio: string;
  social_links: Record<string, string>;
  approved: boolean;
  created_at: string;
}

const AdminAffiliatesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [filteredAffiliates, setFilteredAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<string | null>(null);
  
  const itemsPerPage = 10;
  
  // Check if user is admin
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);
  
  // Load affiliates
  useEffect(() => {
    loadAffiliates();
  }, []);
  
  // Filter affiliates when search query or status filter changes
  useEffect(() => {
    filterAffiliates();
  }, [searchQuery, statusFilter, affiliates]);
  
  const loadAffiliates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('affiliates')
        .select(`
          id,
          user_id,
          referral_code,
          full_name,
          bio,
          social_links,
          approved,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAffiliates(data || []);
    } catch (err: any) {
      console.error('Error loading affiliates:', err);
      setError(err.message || 'Failed to load affiliates');
    } finally {
      setLoading(false);
    }
  };
  
  const filterAffiliates = () => {
    let filtered = [...affiliates];
    
    // Apply status filter
    if (statusFilter === 'approved') {
      filtered = filtered.filter(affiliate => affiliate.approved);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(affiliate => !affiliate.approved);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        affiliate => 
          affiliate.full_name?.toLowerCase().includes(query) ||
          affiliate.referral_code?.toLowerCase().includes(query)
      );
    }
    
    setFilteredAffiliates(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ approved: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state for optimistic UI update
      setAffiliates(affiliates.map(affiliate => 
        affiliate.id === id ? { ...affiliate, approved: true } : affiliate
      ));
      
      toast.success('Affiliate approved successfully');
    } catch (err: any) {
      console.error('Error approving affiliate:', err);
      toast.error(err.message || 'Failed to approve affiliate');
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ approved: false })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state for optimistic UI update
      setAffiliates(affiliates.map(affiliate => 
        affiliate.id === id ? { ...affiliate, approved: false } : affiliate
      ));
      
      toast.success('Affiliate rejected successfully');
    } catch (err: any) {
      console.error('Error rejecting affiliate:', err);
      toast.error(err.message || 'Failed to reject affiliate');
    }
  };
  
  const getPaginatedAffiliates = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAffiliates.slice(startIndex, endIndex);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleViewDetails = (id: string) => {
    setSelectedAffiliateId(id);
  };
  
  const handleCloseModal = () => {
    setSelectedAffiliateId(null);
  };
  
  const handleStatusChange = () => {
    // Refresh the affiliate list after status change
    loadAffiliates();
  };
  
  if (loading) {
    return (
      <PageContainer title="Affiliate Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        </div>
      </PageContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer title="Affiliate Management">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Affiliates</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAffiliates}>Try Again</Button>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title="Affiliate Management">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Affiliate Management</h1>
          <p className="text-neutral-600">
            Review and manage affiliate applications. Approve or reject affiliates and track their performance.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or referral code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-neutral-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'approved' | 'pending')}
                className="px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Affiliates</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={loadAffiliates}
            leftIcon={<Loader2 className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
        
        {/* Affiliates Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-600" />
                Affiliates
              </h2>
              <span className="text-sm text-neutral-500">
                {filteredAffiliates.length} {filteredAffiliates.length === 1 ? 'affiliate' : 'affiliates'} found
              </span>
            </div>
          </CardHeader>
          <CardBody>
            {filteredAffiliates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No affiliates found</h3>
                <p className="text-neutral-600">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'No affiliates have signed up yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Referral Code
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Social
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {getPaginatedAffiliates().map((affiliate) => (
                        <tr key={affiliate.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-900">{affiliate.full_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-600">{affiliate.referral_code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-600">
                              {affiliate.social_links && Object.keys(affiliate.social_links).length > 0 
                                ? Object.keys(affiliate.social_links).map(platform => (
                                    <span key={platform} className="inline-block px-2 py-1 mr-1 bg-neutral-100 rounded-full text-xs">
                                      {platform}
                                    </span>
                                  ))
                                : <span className="text-neutral-400">None</span>
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-600">
                              {new Date(affiliate.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              affiliate.approved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {affiliate.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Eye className="h-4 w-4" />}
                                onClick={() => handleViewDetails(affiliate.id)}
                              >
                                View
                              </Button>
                              
                              {!affiliate.approved ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  leftIcon={<CheckCircle className="h-4 w-4" />}
                                  onClick={() => handleApprove(affiliate.id)}
                                >
                                  Approve
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  leftIcon={<XCircle className="h-4 w-4" />}
                                  onClick={() => handleReject(affiliate.id)}
                                >
                                  Reject
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 sm:px-6 mt-4">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-neutral-700">
                          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, filteredAffiliates.length)}
                          </span>{' '}
                          of <span className="font-medium">{filteredAffiliates.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <Button
                            variant="outline"
                            size="sm"
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                          </Button>
                          
                          {/* Page numbers */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
        
        {/* Affiliate Detail Modal */}
        {selectedAffiliateId && (
          <AffiliateDetailModal 
            affiliateId={selectedAffiliateId}
            onClose={handleCloseModal}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default AdminAffiliatesPage;
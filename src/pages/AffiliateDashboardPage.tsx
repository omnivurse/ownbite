import React from 'react';
import PageContainer from '../components/Layout/PageContainer';
import AffiliateDashboard from '../components/affiliate/AffiliateDashboard';

const AffiliateDashboardPage: React.FC = () => {
  return (
    <PageContainer title="Affiliate Dashboard">
      <div className="max-w-6xl mx-auto">
        <AffiliateDashboard />
      </div>
    </PageContainer>
  );
};

export default AffiliateDashboardPage;
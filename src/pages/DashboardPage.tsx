import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LayoutGrid, Activity, ChefHat, TestTube, User } from 'lucide-react';
import NutritionSummary from '../components/dashboard/NutritionSummary';
import BloodworkPreview from '../components/dashboard/BloodworkPreview';
import MealPlanAccess from '../components/dashboard/MealPlanAccess';
import ActivityLog from '../components/dashboard/ActivityLog';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import ProfileCard from '../components/dashboard/ProfileCard';
import RewardsPreview from '../components/dashboard/RewardsPreview';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Lazy load KPI Dashboard for better performance
const KPIDashboard = lazy(() => import('../components/dashboard/KPIDashboard'));

const DashboardPage: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'kpi' | 'nutrition' | 'bloodwork'>('overview');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // If auth is still loading, wait
    if (loading) return;

    // If no user after loading is complete, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // User exists, we can show the dashboard
    setIsLoading(false);
  }, [user, loading, navigate]);

  // Error handler for error boundaries
  const handleComponentError = (error: Error) => {
    console.error('Component error in dashboard:', error);
    setLoadError(`Error loading component: ${error.message}`);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user after loading is complete, this shouldn't happen due to redirect above
  // but keeping as safety net
  if (!user) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'kpi':
        return (
          <ErrorBoundary onError={handleComponentError}>
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
              </div>
            }>
              <KPIDashboard />
            </Suspense>
          </ErrorBoundary>
        );
      case 'nutrition':
        return (
          <div className="space-y-6">
            <ErrorBoundary onError={handleComponentError}>
              <NutritionSummary userId={user.id} />
            </ErrorBoundary>
            <ErrorBoundary onError={handleComponentError}>
              <MealPlanAccess userId={user.id} />
            </ErrorBoundary>
          </div>
        );
      case 'bloodwork':
        return (
          <div className="space-y-6">
            <ErrorBoundary onError={handleComponentError}>
              <BloodworkPreview userId={user.id} />
            </ErrorBoundary>
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ErrorBoundary onError={handleComponentError}>
                <ProfileCard userId={user.id} />
              </ErrorBoundary>
              <ErrorBoundary onError={handleComponentError}>
                <NutritionSummary userId={user.id} />
              </ErrorBoundary>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ErrorBoundary onError={handleComponentError}>
                <BloodworkPreview userId={user.id} />
              </ErrorBoundary>
              <ErrorBoundary onError={handleComponentError}>
                <RewardsPreview />
              </ErrorBoundary>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ErrorBoundary onError={handleComponentError}>
                <ActivityLog userId={user.id} />
              </ErrorBoundary>
              <ErrorBoundary onError={handleComponentError}>
                <SettingsPanel userId={user.id} />
              </ErrorBoundary>
            </div>
          </div>
        );
    }
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900">
            👋 Welcome, {profile?.full_name || user.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-1">
            Here's an overview of your nutrition and health data
          </p>
        </div>

        {/* Global Error Display */}
        {loadError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-red-700 flex items-center">
              <span className="mr-2">⚠️</span> {loadError}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutGrid className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'kpi'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('kpi')}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Health & Lifestyle
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'nutrition'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('nutrition')}
          >
            <ChefHat className="h-4 w-4 inline mr-2" />
            Nutrition
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'bloodwork'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('bloodwork')}
          >
            <TestTube className="h-4 w-4 inline mr-2" />
            Bloodwork
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
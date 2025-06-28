import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LayoutGrid, Activity, ChefHat, TestTube, User } from 'lucide-react';
import NutritionSummary from '../components/dashboard/NutritionSummary';
import BloodworkPreview from '../components/dashboard/BloodworkPreview';
import MealPlanAccess from '../components/dashboard/MealPlanAccess';
import ActivityLog from '../components/dashboard/ActivityLog';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import ProfileCard from '../components/dashboard/ProfileCard';
import KPIDashboard from '../components/dashboard/KPIDashboard';
import RewardsPreview from '../components/dashboard/RewardsPreview';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'kpi' | 'nutrition' | 'bloodwork'>('overview');

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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
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
        return <KPIDashboard />;
      case 'nutrition':
        return (
          <div className="space-y-6">
            <NutritionSummary userId={user.id} />
            <MealPlanAccess userId={user.id} />
          </div>
        );
      case 'bloodwork':
        return (
          <div className="space-y-6">
            <BloodworkPreview userId={user.id} />
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileCard userId={user.id} />
              <NutritionSummary userId={user.id} />
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BloodworkPreview userId={user.id} />
              <RewardsPreview />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActivityLog userId={user.id} />
              <SettingsPanel userId={user.id} />
            </div>
          </div>
        );
    }
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900">
            👋 Welcome, {profile?.full_name || user.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-neutral-600 mt-1">
            Here's an overview of your nutrition and health data
          </p>
        </div>

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
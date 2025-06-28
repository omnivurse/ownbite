import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { SocialProvider } from './contexts/SocialContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ScanPage from './pages/ScanPage';
import RecipesPage from './pages/RecipesPage';
import DiaryPage from './pages/DiaryPage';
import CoachPage from './pages/CoachPage';
import GroceryPage from './pages/GroceryPage';
import BloodworkPage from './pages/BloodworkPage';
import BloodworkTrendsPage from './pages/BloodworkTrendsPage';
import OnboardingPage from './pages/OnboardingPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import ActivityLoggerPage from './pages/ActivityLoggerPage';
import RemindersPage from './pages/RemindersPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CommunityPage from './pages/CommunityPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRecipePage from './pages/CreateRecipePage';
import UserProfilePage from './pages/UserProfilePage';
import GroceryListPage from './pages/GroceryListPage';
import ProfilePage from './pages/ProfilePage';
import SocialCallbackPage from './pages/SocialCallbackPage';
import AffiliateDashboardPage from './pages/AffiliateDashboardPage';
import AffiliateSignupPage from './pages/AffiliateSignupPage';
import AffiliateLoginPage from './pages/AffiliateLoginPage';
import ReferralBanner from './components/affiliate/ReferralBanner';
import AdminAffiliatesPage from './pages/AdminAffiliatesPage';
import RewardsPage from './pages/RewardsPage';
import SocialSharingPage from './pages/SocialSharingPage';

// Feature pages for non-authenticated users
import FoodScannerPage from './pages/features/FoodScannerPage';
import BloodworkAnalysisPage from './pages/features/BloodworkAnalysisPage';
import MealPlansPage from './pages/features/MealPlansPage';
import LifestyleDashboardPage from './pages/features/LifestyleDashboardPage';
import CommunityRecipesPage from './pages/features/CommunityRecipesPage';

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <SocialProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <ReferralBanner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
            <Route path="/checkout/success" element={<Layout><CheckoutSuccessPage /></Layout>} />
            <Route path="/social-callback" element={<SocialCallbackPage />} />
            
            {/* Affiliate public routes */}
            <Route path="/affiliate/login" element={<AffiliateLoginPage />} />
            
            {/* Feature pages for non-authenticated users */}
            <Route path="/features/food-scanner" element={<Layout><FoodScannerPage /></Layout>} />
            <Route path="/features/bloodwork-analysis" element={<Layout><BloodworkAnalysisPage /></Layout>} />
            <Route path="/features/meal-plans" element={<Layout><MealPlansPage /></Layout>} />
            <Route path="/features/lifestyle-dashboard" element={<Layout><LifestyleDashboardPage /></Layout>} />
            <Route path="/features/community-recipes" element={<Layout><CommunityRecipesPage /></Layout>} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/scan" element={
              <ProtectedRoute>
                <Layout><ScanPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/diary" element={
              <ProtectedRoute>
                <Layout><DiaryPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/recipes" element={
              <ProtectedRoute>
                <Layout><RecipesPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/coach" element={
              <ProtectedRoute>
                <Layout><CoachPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/grocery" element={
              <ProtectedRoute>
                <Layout><GroceryPage /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/grocery/list/:listId" element={
              <ProtectedRoute>
                <Layout><GroceryListPage /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/bloodwork" element={
              <ProtectedRoute>
                <Layout><BloodworkPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/bloodwork/trends" element={
              <ProtectedRoute>
                <Layout><BloodworkTrendsPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/activity-logger" element={
              <ProtectedRoute>
                <Layout><ActivityLoggerPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reminders" element={
              <ProtectedRoute>
                <Layout><RemindersPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/rewards" element={
              <ProtectedRoute>
                <Layout><RewardsPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/social-sharing" element={
              <ProtectedRoute>
                <Layout><SocialSharingPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community" element={
              <ProtectedRoute>
                <Layout><CommunityPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/recipe/:recipeId" element={
              <ProtectedRoute>
                <Layout><RecipeDetailPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/create" element={
              <ProtectedRoute>
                <Layout><CreateRecipePage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/edit/:recipeId" element={
              <ProtectedRoute>
                <Layout><CreateRecipePage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/profile" element={
              <ProtectedRoute>
                <Layout><UserProfilePage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/profile/:userId" element={
              <ProtectedRoute>
                <Layout><UserProfilePage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout><ProfilePage /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Affiliate routes */}
            <Route path="/affiliate/dashboard" element={
              <ProtectedRoute>
                <Layout><AffiliateDashboardPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/affiliate/signup" element={
              <ProtectedRoute>
                <Layout><AffiliateSignupPage /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <Layout><div className="p-6 max-w-4xl mx-auto">
                  <h1 className="text-2xl font-bold text-neutral-900 mb-4">User Management</h1>
                  <p className="text-neutral-600">User management coming soon...</p>
                </div></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/affiliates" element={
              <ProtectedRoute requiredRole="admin">
                <Layout><AdminAffiliatesPage /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocialProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
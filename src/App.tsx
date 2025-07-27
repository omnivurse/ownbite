import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { SocialProvider } from './contexts/SocialContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Eagerly loaded components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import PricingPage from './pages/PricingPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import SocialCallbackPage from './pages/SocialCallbackPage';
import ReferralBanner from './components/affiliate/ReferralBanner';

// Lazy loaded components
const ScanPage = lazy(() => import('./pages/ScanPage'));
const RecipesPage = lazy(() => import('./pages/RecipesPage'));
const DiaryPage = lazy(() => import('./pages/DiaryPage'));
const CoachPage = lazy(() => import('./pages/CoachPage'));
const GroceryPage = lazy(() => import('./pages/GroceryPage'));
const BloodworkPage = lazy(() => import('./pages/BloodworkPage'));
const BloodworkTrendsPage = lazy(() => import('./pages/BloodworkTrendsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ActivityLoggerPage = lazy(() => import('./pages/ActivityLoggerPage'));
const RemindersPage = lazy(() => import('./pages/RemindersPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage'));
const CreateRecipePage = lazy(() => import('./pages/CreateRecipePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const GroceryListPage = lazy(() => import('./pages/GroceryListPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AffiliateDashboardPage = lazy(() => import('./pages/AffiliateDashboardPage'));
const AffiliateSignupPage = lazy(() => import('./pages/AffiliateSignupPage'));
const AffiliateLoginPage = lazy(() => import('./pages/AffiliateLoginPage'));
const AdminAffiliatesPage = lazy(() => import('./pages/AdminAffiliatesPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const SocialSharingPage = lazy(() => import('./pages/SocialSharingPage'));

// Feature pages for non-authenticated users
const FoodScannerPage = lazy(() => import('./pages/features/FoodScannerPage'));
const BloodworkAnalysisPage = lazy(() => import('./pages/features/BloodworkAnalysisPage'));
const MealPlansPage = lazy(() => import('./pages/features/MealPlansPage'));
const LifestyleDashboardPage = lazy(() => import('./pages/features/LifestyleDashboardPage'));
const CommunityRecipesPage = lazy(() => import('./pages/features/CommunityRecipesPage'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <SocialProvider>
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
            <Route path="/features/food-scanner" element={
              <Layout>
                <Suspense fallback={<LoadingScreen message="Loading Food Scanner..." />}>
                  <FoodScannerPage />
                </Suspense>
              </Layout>
            } />
            <Route path="/features/bloodwork-analysis" element={
              <Layout>
                <Suspense fallback={<LoadingScreen message="Loading Bloodwork Analysis..." />}>
                  <BloodworkAnalysisPage />
                </Suspense>
              </Layout>
            } />
            <Route path="/features/meal-plans" element={
              <Layout>
                <Suspense fallback={<LoadingScreen message="Loading Meal Plans..." />}>
                  <MealPlansPage />
                </Suspense>
              </Layout>
            } />
            <Route path="/features/lifestyle-dashboard" element={
              <Layout>
                <Suspense fallback={<LoadingScreen message="Loading Lifestyle Dashboard..." />}>
                  <LifestyleDashboardPage />
                </Suspense>
              </Layout>
            } />
            <Route path="/features/community-recipes" element={
              <Layout>
                <Suspense fallback={<LoadingScreen message="Loading Community Recipes..." />}>
                  <CommunityRecipesPage />
                </Suspense>
              </Layout>
            } />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <DashboardPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/scan" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <ScanPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/diary" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <DiaryPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/recipes" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <RecipesPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/coach" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <CoachPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/grocery" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <GroceryPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/grocery/list/:listId" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <GroceryListPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/bloodwork" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <BloodworkPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/bloodwork/trends" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <BloodworkTrendsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/activity-logger" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <ActivityLoggerPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reminders" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <RemindersPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/rewards" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <RewardsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/social-sharing" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <SocialSharingPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <CommunityPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/recipe/:recipeId" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <RecipeDetailPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/create" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <CreateRecipePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/edit/:recipeId" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <CreateRecipePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <UserProfilePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community/profile/:userId" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <UserProfilePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <ProfilePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Affiliate routes */}
            <Route path="/affiliate/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <AffiliateDashboardPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/affiliate/signup" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <AffiliateSignupPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <div className="p-6 max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-neutral-900 mb-4">User Management</h1>
                    <p className="text-neutral-600">User management coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/affiliates" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminAffiliatesPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </SocialProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
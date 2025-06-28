import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit2, Save, Camera, X, Shield, Settings, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import NutrientDeficiencyAlerts from '../components/bloodwork/NutrientDeficiencyAlerts';
import SocialConnectPanel from '../components/social/SocialConnectPanel';
import SocialShareHistory from '../components/social/SocialShareHistory';

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { hasPremiumAccess, userSubscription, productName, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'preferences'>('profile');
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Force refresh subscription status when component mounts
    refreshSubscription();
    setLoading(false);
    
    // Check if user is an affiliate and get referral code
    const checkAffiliateStatus = async () => {
      try {
        const affiliateProfile = await affiliateService.getAffiliateProfile();
        if (affiliateProfile && affiliateProfile.referral_code) {
          setReferralLink(`https://ownbite.me/signup?ref=${affiliateProfile.referral_code}`);
        }
      } catch (error) {
        console.error('Error checking affiliate status:', error);
      }
    };
    
    checkAffiliateStatus();
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDietaryPreferences(profile.dietary_preferences || []);
      setAllergies(profile.allergies || []);
      setHealthGoals(profile.health_goals || []);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        full_name: fullName,
        dietary_preferences: dietaryPreferences,
        allergies: allergies,
        health_goals: healthGoals
      });
      
      setEditing(false);
      setMessage({
        text: 'Profile updated successfully!',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        text: 'Failed to update profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDietaryPreference = (preference: string) => {
    setDietaryPreferences(prev => 
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleHealthGoal = (goal: string) => {
    setHealthGoals(prev => 
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };
  
  const copyReferralLink = () => {
    if (!referralLink) return;
    
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (!user || !profile) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Session Expired</h2>
            <p className="text-neutral-600 mb-4">Please sign in again to access your profile.</p>
            <Button 
              variant="primary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 
    'Low Carb', 'Gluten Free', 'Dairy Free', 'No Restrictions'
  ];

  const allergyOptions = [
    'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Fish', 
    'Shellfish', 'Soy', 'Wheat', 'None'
  ];

  const healthGoalOptions = [
    'Weight Loss', 'Weight Gain', 'Muscle Building', 'Better Energy',
    'Improved Digestion', 'Heart Health', 'Better Sleep', 'General Wellness'
  ];

  return (
    <PageContainer title="Your Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {profile.full_name || user.email}
              </h1>
              <p className="text-neutral-600">
                {user.email}
                {profile.role === 'admin' && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
                {hasPremiumAccess && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                    {productName || 'Premium'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  isLoading={isSaving}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                leftIcon={<Edit2 className="h-4 w-4" />}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {message.text}
              </div>
            ) : (
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {message.text}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'social'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('social')}
          >
            Social Media
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'preferences'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>

        {activeTab === 'profile' && (
          <>
            {/* Profile Information */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Full Name</h3>
                        <p className="mt-1">{profile.full_name || 'Not set'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Email Address</h3>
                        <p className="mt-1">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Subscription Information */}
            <Card>
              <CardBody>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">
                      {hasPremiumAccess ? `${productName || 'Ultimate Wellbeing'} Plan` : 'Free Plan'}
                    </h3>
                    <p className="text-neutral-600">
                      {hasPremiumAccess 
                        ? 'You have access to all premium features' 
                        : 'Upgrade to unlock premium features'}
                    </p>
                    {userSubscription?.subscription_end_date && (
                      <p className="text-sm text-neutral-500 mt-1">
                        Renews on: {new Date(userSubscription.subscription_end_date).toLocaleDateString()}
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
              </CardBody>
            </Card>

            {/* Referral Link (if user is an affiliate) */}
            {referralLink && (
              <Card>
                <CardBody>
                  <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
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
                  <p className="mt-3 text-sm text-neutral-600">
                    Share this link with friends and earn commissions when they sign up and upgrade to premium.
                  </p>
                  <div className="mt-3">
                    <Link to="/affiliate/dashboard">
                      <Button variant="outline" size="sm">
                        View Affiliate Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Nutrient Recommendations */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Nutrient Recommendations</h2>
                <NutrientDeficiencyAlerts />
              </CardBody>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 text-neutral-500 mr-3" />
                      <div>
                        <h3 className="font-medium">Account Settings</h3>
                        <p className="text-sm text-neutral-500">Manage your account settings</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/settings')}
                    >
                      Manage
                    </Button>
                  </div>
                  
                  {profile.role === 'admin' && (
                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-red-500 mr-3" />
                        <div>
                          <h3 className="font-medium">Admin Panel</h3>
                          <p className="text-sm text-neutral-500">Access admin controls</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/users')}
                      >
                        Access
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center">
                      <LogOut className="h-5 w-5 text-red-500 mr-3" />
                      <div>
                        <h3 className="font-medium">Sign Out</h3>
                        <p className="text-sm text-neutral-500">Log out of your account</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {activeTab === 'social' && (
          <>
            <SocialConnectPanel className="mb-6" />
            <SocialShareHistory />
          </>
        )}

        {activeTab === 'preferences' && (
          <>
            {/* Dietary Preferences */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Dietary Preferences</h2>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Select your dietary preferences
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {dietaryOptions.map(option => (
                          <div 
                            key={option}
                            onClick={() => toggleDietaryPreference(option)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              dietaryPreferences.includes(option)
                                ? 'bg-primary-100 border-primary-500 text-primary-800'
                                : 'border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                                dietaryPreferences.includes(option) ? 'bg-primary-500' : 'border border-neutral-400'
                              }`}>
                                {dietaryPreferences.includes(option) && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {dietaryPreferences && dietaryPreferences.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {dietaryPreferences.map(pref => (
                          <span 
                            key={pref}
                            className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500">No dietary preferences set</p>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Allergies */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Allergies</h2>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Select your allergies
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {allergyOptions.map(option => (
                          <div 
                            key={option}
                            onClick={() => toggleAllergy(option)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              allergies.includes(option)
                                ? 'bg-red-100 border-red-500 text-red-800'
                                : 'border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                                allergies.includes(option) ? 'bg-red-500' : 'border border-neutral-400'
                              }`}>
                                {allergies.includes(option) && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {allergies && allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {allergies.map(allergy => (
                          <span 
                            key={allergy}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500">No allergies set</p>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Health Goals */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Health Goals</h2>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Select your health goals
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {healthGoalOptions.map(option => (
                          <div 
                            key={option}
                            onClick={() => toggleHealthGoal(option)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              healthGoals.includes(option)
                                ? 'bg-blue-100 border-blue-500 text-blue-800'
                                : 'border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                                healthGoals.includes(option) ? 'bg-blue-500' : 'border border-neutral-400'
                              }`}>
                                {healthGoals.includes(option) && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {healthGoals && healthGoals.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {healthGoals.map(goal => (
                          <span 
                            key={goal}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500">No health goals set</p>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
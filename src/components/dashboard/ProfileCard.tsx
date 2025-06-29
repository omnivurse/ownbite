import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Edit, Award, Shield, Calendar, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';

interface ProfileCardProps {
  userId: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userId }) => {
  const { user, profile } = useAuth();
  const { hasActiveSubscription, productName, refreshSubscription } = useSubscription();
  const [joinDate, setJoinDate] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Format the user's join date
      const date = new Date(user.created_at);
      setJoinDate(date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
      
      // Refresh subscription status when component mounts
      refreshSubscription();
    }
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-neutral-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 sm:h-5 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-3 sm:h-4 bg-neutral-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-3 sm:h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-3 sm:h-4 bg-neutral-200 rounded w-3/4"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-primary-100 rounded-full flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'User'} 
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                {profile?.full_name || user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-sm text-neutral-600">{user.email}</p>
            </div>
          </div>
          <Link to="/profile" className="sm:self-start">
            <Button 
              variant="outline" 
              size="sm"
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Edit
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {/* Membership Status */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center">
              {hasActiveSubscription ? (
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mr-2" />
              ) : (
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-500 mr-2" />
              )}
              <span className="text-sm sm:text-base font-medium">
                {hasActiveSubscription ? `${productName || 'Ultimate Wellbeing'} Member` : 'Free Account'}
              </span>
            </div>
            {!hasActiveSubscription && (
              <Link to="/pricing">
                <Button variant="primary" size="sm">Upgrade</Button>
              </Link>
            )}
          </div>
          
          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <p className="text-neutral-500">Member Since</p>
              <p className="font-medium flex items-center">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-neutral-400" />
                {joinDate}
              </p>
            </div>
            
            {profile?.role === 'admin' && (
              <div>
                <p className="text-neutral-500">Role</p>
                <p className="font-medium flex items-center text-red-600">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Administrator
                </p>
              </div>
            )}
            
            {profile?.health_goals && profile.health_goals.length > 0 && (
              <div className="col-span-1 sm:col-span-2">
                <p className="text-neutral-500">Health Goals</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.health_goals.map((goal, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile?.dietary_preferences && profile.dietary_preferences.length > 0 && (
              <div className="col-span-1 sm:col-span-2">
                <p className="text-neutral-500">Dietary Preferences</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.dietary_preferences.map((pref, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfileCard;
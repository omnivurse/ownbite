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
              <div className="h-16 w-16 bg-neutral-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'User'} 
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                {profile?.full_name || user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-neutral-600">{user.email}</p>
            </div>
          </div>
          <Link to="/profile">
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
                <Award className="h-5 w-5 text-primary-600 mr-2" />
              ) : (
                <User className="h-5 w-5 text-neutral-500 mr-2" />
              )}
              <span className="font-medium">
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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">Member Since</p>
              <p className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-neutral-400" />
                {joinDate}
              </p>
            </div>
            
            {profile?.role === 'admin' && (
              <div>
                <p className="text-neutral-500">Role</p>
                <p className="font-medium flex items-center text-red-600">
                  <Shield className="h-4 w-4 mr-1" />
                  Administrator
                </p>
              </div>
            )}
            
            {profile?.health_goals && profile.health_goals.length > 0 && (
              <div className="col-span-2">
                <p className="text-neutral-500">Health Goals</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.health_goals.map((goal, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile?.dietary_preferences && profile.dietary_preferences.length > 0 && (
              <div className="col-span-2">
                <p className="text-neutral-500">Dietary Preferences</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.dietary_preferences.map((pref, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
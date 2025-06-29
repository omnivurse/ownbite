import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Scan, 
  FileText, 
  ChefHat, 
  ShoppingCart, 
  MessageCircle, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Activity, 
  CreditCard, 
  Users, 
  LayoutGrid,
  Clock,
  AlarmClock,
  TestTube,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  UserCog,
  Award,
  Share2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Button from '../ui/Button';
import { clearUserCache } from '../../lib/cache';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { hasActiveSubscription, hasPremiumAccess, productName, refreshSubscription } = useSubscription();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Force refresh subscription status when component mounts
  useEffect(() => {
    if (user) {
      refreshSubscription();
    }
  }, [user]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear cache before signing out
      await clearUserCache();
      
      await signOut();
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const displayName = profile?.full_name || user?.email || 'User';
  const initials = getInitials(profile?.full_name, user?.email);

  // Define navigation items based on subscription status
  const baseNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Scan Food', href: '/scan', icon: Scan },
    { name: 'Food Diary', href: '/diary', icon: FileText },
    { name: 'Bloodwork', href: '/bloodwork', icon: TestTube },
    { name: 'Recipes', href: '/recipes', icon: ChefHat },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Grocery', href: '/grocery', icon: ShoppingCart },
    { name: 'Coach', href: '/coach', icon: MessageCircle },
    { name: 'Rewards', href: '/rewards', icon: Award },
    { name: 'Social Sharing', href: '/social-sharing', icon: Share2 },
    { name: 'Affiliate', href: '/affiliate/dashboard', icon: DollarSign },
  ];

  // Premium-only items
  const premiumItems = [
    { name: 'Activity', href: '/activity-logger', icon: Clock, premium: true },
    { name: 'Reminders', href: '/reminders', icon: AlarmClock, premium: true },
  ];

  // Combine items based on subscription status
  const navItems = hasPremiumAccess 
    ? [...baseNavItems, ...premiumItems]
    : baseNavItems;

  const adminNavItems = [
    { name: 'Admin Dashboard', href: '/dashboard/admin', icon: LayoutGrid },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Affiliate Management', href: '/admin/affiliates', icon: UserCog },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // Only render if user is authenticated
  if (!user) return null;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} lg:translate-x-0 flex flex-col h-full`}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
          <div className="flex items-center">
            <Scan className={`h-8 w-8 text-primary-600 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
            {!isCollapsed && <span className="text-xl font-bold text-primary-800">OwnBite</span>}
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md hover:bg-neutral-100 hidden lg:block"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-neutral-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2" aria-label="Main navigation">
            {(profile?.role === 'admin' ? adminNavItems : navItems).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }
                  `}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>{item.name}</span>
                      {'premium' in item && item.premium && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          Ultimate
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-neutral-200 p-4">
          <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'items-center'} mb-4`}>
            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-900 truncate max-w-[160px]">
                  {profile?.full_name || user?.email}
                </p>
                <p className="text-xs text-neutral-500 capitalize">
                  {profile?.role || 'Member'}
                  {hasPremiumAccess && (
                    <span className="ml-1 text-primary-600 font-medium">
                      • {productName || 'Ultimate Wellbeing'}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className={`${isCollapsed ? 'p-2 w-10 h-10' : 'w-full'}`}
            leftIcon={isCollapsed ? undefined : <LogOut className="h-4 w-4" />}
            onClick={handleSignOut}
            disabled={isLoggingOut}
          >
            {isCollapsed ? <LogOut className="h-4 w-4" /> : isLoggingOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
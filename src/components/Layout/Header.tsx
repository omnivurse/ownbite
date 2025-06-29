import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Scan, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  CreditCard,
  Users,
  LayoutGrid,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Button from '../ui/Button';
import { clearUserCache } from '../../lib/cache';

/**
 * Main application header with navigation
 */
const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { hasActiveSubscription, productName } = useSubscription();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear cache before signing out
      await clearUserCache();
      
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out from Header:', error);
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

  return (
    <header className="bg-white shadow-md relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Scan className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-primary-800">OwnBite</span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          {!user && (
            <div className="flex md:hidden items-center">
              <button
                type="button"
                className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="relative">
                {/* Avatar Dropdown */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  disabled={isLoggingOut}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar */}
                  <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{initials}</span>
                  </div>
                  
                  {/* User Info - Hidden on small screens */}
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-neutral-900 truncate max-w-32">
                      {displayName}
                    </div>
                    {hasActiveSubscription && (
                      <div className="text-xs text-primary-600 font-medium">
                        {productName || 'Ultimate Wellbeing'}
                      </div>
                    )}
                    {profile?.role === 'admin' && (
                      <div className="text-xs text-red-600 font-medium">Admin</div>
                    )}
                  </div>
                  
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={closeDropdown}
                      aria-hidden="true"
                    />
                    
                    {/* Dropdown Content */}
                    <div 
                      className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-20"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">{initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-neutral-900 truncate">
                              {displayName}
                            </div>
                            <div className="text-xs text-neutral-500 truncate">
                              {user.email}
                            </div>
                            {hasActiveSubscription && (
                              <div className="text-xs text-primary-600 font-medium">
                                {productName || 'Ultimate Wellbeing'} Member
                              </div>
                            )}
                            {profile?.role === 'admin' && (
                              <div className="text-xs text-red-600 font-medium">Administrator</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1" role="none">
                        <button
                          onClick={() => {
                            navigate('/dashboard');
                            closeDropdown();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                          role="menuitem"
                        >
                          <LayoutGrid className="h-4 w-4 mr-3" />
                          Dashboard
                        </button>

                        <button
                          onClick={() => {
                            navigate('/profile');
                            closeDropdown();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                          role="menuitem"
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile
                        </button>

                        <Link
                          to="/pricing"
                          onClick={closeDropdown}
                          className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                          role="menuitem"
                        >
                          <CreditCard className="h-4 w-4 mr-3" />
                          {hasActiveSubscription ? 'Manage Subscription' : 'Upgrade to Ultimate Wellbeing'}
                        </Link>

                        {profile?.role === 'admin' && (
                          <button
                            onClick={() => {
                              navigate('/admin/users');
                              closeDropdown();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                            role="menuitem"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Admin Panel
                          </button>
                        )}
                      </div>

                      {/* Separator */}
                      <div className="border-t border-neutral-100 my-1" role="none" />

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoggingOut}
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Desktop navigation for non-authenticated users */}
                <div className="hidden md:flex items-center space-x-3">
                  <Link to="/pricing">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Pricing
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="primary"
                      leftIcon={<User className="h-4 w-4" />}
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu for non-authenticated users */}
      {!user && isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-neutral-200">
            <Link 
              to="/pricing"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={closeMobileMenu}
            >
              Pricing
            </Link>
            <Link 
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50"
              onClick={closeMobileMenu}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getCacheItem, setCacheItem, clearUserCache, CACHE_KEYS, CACHE_EXPIRY } from '../lib/cache';
import { toast } from 'react-toastify';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  role: 'member' | 'admin';
  dietary_preferences?: string[];
  allergies?: string[];
  health_goals?: string[];
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // Try to get from cache first
        const cachedUser = await getCacheItem<User>(CACHE_KEYS.USER);
        const cachedProfile = await getCacheItem<UserProfile>(CACHE_KEYS.PROFILE);
        
        if (cachedUser && cachedProfile && mounted) {
          console.log('Using cached user and profile');
          setUser(cachedUser);
          setProfile(cachedProfile);
          setLoading(false);
          setAuthInitialized(true);
          
          // Verify the session in background
          verifySession(cachedUser);
          return;
        }
        
        // Get from Supabase if not in cache
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
            setAuthInitialized(true);
          }
          return;
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            // Cache the user
            await setCacheItem(CACHE_KEYS.USER, session.user, CACHE_EXPIRY.USER);
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setLoading(false);
            setAuthInitialized(true);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            // Cache the user
            await setCacheItem(CACHE_KEYS.USER, session.user, CACHE_EXPIRY.USER);
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setLoading(false);
            setAuthInitialized(true);
            // Clear cache on logout
            if (event === 'SIGNED_OUT') {
              await clearUserCache();
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Verify the session is still valid
  const verifySession = async (cachedUser: User) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('Cached session is invalid, clearing cache');
        await clearUserCache();
        setUser(null);
        setProfile(null);
        return;
      }
      
      // Update user if needed
      if (session.user.id !== cachedUser.id) {
        console.log('User changed, updating from session');
        setUser(session.user);
        await setCacheItem(CACHE_KEYS.USER, session.user, CACHE_EXPIRY.USER);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error verifying session:', error);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log(`Loading profile for user: ${userId}`);
      
      // Try to get from cache first
      const cachedProfile = await getCacheItem<UserProfile>(CACHE_KEYS.PROFILE);
      if (cachedProfile && cachedProfile.user_id === userId) {
        console.log('Using cached profile');
        setProfile(cachedProfile);
        setLoading(false);
        setAuthInitialized(true);
        return;
      }
      
      // Get from Supabase if not in cache
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('Profile not found, creating default profile');
          await createDefaultProfile(userId);
          setLoading(false);
          setAuthInitialized(true);
          return;
        }
        
        // For other errors, continue without profile but don't keep loading
        console.warn('Continuing without profile due to error:', error);
        setProfile(null);
        setLoading(false);
        setAuthInitialized(true);
        return;
      }

      console.log('Profile loaded successfully:', data);
      setProfile(data);
      // Cache the profile
      if (data) {
        await setCacheItem(CACHE_KEYS.PROFILE, data, CACHE_EXPIRY.PROFILE);
      }
      setLoading(false);
      setAuthInitialized(true);
      
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      
      // Try to create a default profile if loading fails
      console.log('Profile load failed, attempting to create default profile');
      await createDefaultProfile(userId);
      setLoading(false);
      setAuthInitialized(true);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      console.log('Creating default profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          role: 'member',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating default profile:', error);
        
        // If profile already exists (race condition), try to fetch it
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          console.log('Profile already exists, attempting to fetch...');
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (existingProfile) {
            setProfile(existingProfile);
            // Cache the profile
            await setCacheItem(CACHE_KEYS.PROFILE, existingProfile, CACHE_EXPIRY.PROFILE);
            setLoading(false);
            setAuthInitialized(true);
            return;
          }
        }
        
        // If we can't create or fetch profile, continue without it
        setProfile(null);
      } else {
        console.log('Default profile created successfully:', data);
        setProfile(data);
        // Cache the profile
        await setCacheItem(CACHE_KEYS.PROFILE, data, CACHE_EXPIRY.PROFILE);
      }
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
      setAuthInitialized(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Log the credentials being used (without the actual password)
    console.log('Attempting to sign in with email:', email);
    setLoading(true);
    
    try {
      // Clear any existing cache before signing in
      await clearUserCache();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        throw error;
      }
      
      console.log('Sign in successful:', data.user?.id);
      // Note: We don't need to set user/profile here as the auth state change listener will handle it
    } catch (error) {
      console.error('Error in signIn function:', error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      // Clear any existing cache before signing up
      await clearUserCache();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        setLoading(false);
        throw error;
      }
      
      console.log('Sign up successful:', data.user?.id);
      // Note: We don't need to set user/profile here as the auth state change listener will handle it
    } catch (error) {
      console.error('Error in signUp function:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      setLoading(true);
      
      // Clear cache before signing out
      await clearUserCache();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Explicitly clear user and profile state
      setUser(null);
      setProfile(null);
      
      console.log('Sign out successful');
      setLoading(false);
      
      // Show success toast
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error in signOut function:', error);
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Update profile error:', error);
        setLoading(false);
        throw error;
      }

      // Reload profile and update cache
      await loadUserProfile(user.id);
    } catch (error) {
      console.error('Error in updateProfile function:', error);
      setLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin: profile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
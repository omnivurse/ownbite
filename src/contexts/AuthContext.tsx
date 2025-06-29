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

// Timeout for auth operations in milliseconds
const AUTH_TIMEOUT = 15000; // 15 seconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: number | undefined;

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
        
        // Set a timeout to prevent hanging
        const timeoutPromise = new Promise<null>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Session retrieval timed out'));
          }, AUTH_TIMEOUT) as unknown as number;
        });
        
        // Race between the actual request and the timeout
        const result = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);
        
        // Clear timeout if request completed
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = undefined;
        }
        
        // If result is null, it means the timeout won
        if (result === null) {
          throw new Error('Session retrieval timed out');
        }
        
        const { data: { session }, error } = result;
        
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
        
        // Clear cache if there was an error
        await clearUserCache();
        
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setAuthInitialized(true);
          
          // Show toast notification for timeout
          if (error instanceof Error && error.message.includes('timed out')) {
            toast.error('Connection timed out. Please try again.');
          }
        }
      } finally {
        // Ensure timeout is cleared
        if (timeoutId) {
          clearTimeout(timeoutId);
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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Verify the session is still valid
  const verifySession = async (cachedUser: User) => {
    try {
      let timeoutId: number | undefined;
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Session verification timed out'));
        }, AUTH_TIMEOUT) as unknown as number;
      });
      
      // Race between the actual request and the timeout
      const result = await Promise.race([
        supabase.auth.getSession(),
        timeoutPromise
      ]);
      
      // Clear timeout if request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Session verification timed out');
      }
      
      const { data: { session }, error } = result;
      
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
      
      // If timeout occurred, clear cache and reset state
      if (error instanceof Error && error.message.includes('timed out')) {
        console.warn('Session verification timed out, clearing cache');
        await clearUserCache();
        setUser(null);
        setProfile(null);
      }
    }
  };

  const loadUserProfile = async (userId: string) => {
    let profileTimeoutId: number | undefined;
    
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
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        profileTimeoutId = setTimeout(() => {
          reject(new Error('Profile loading timed out'));
        }, AUTH_TIMEOUT) as unknown as number;
      });
      
      // Race between the actual request and the timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      const result = await Promise.race([
        profilePromise,
        timeoutPromise
      ]);
      
      // Clear timeout if request completed
      if (profileTimeoutId) {
        clearTimeout(profileTimeoutId);
        profileTimeoutId = undefined;
      }
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Profile loading timed out');
      }
      
      const { data, error } = result;

      if (error && error.code !== 'PGRST116') throw error;
      
      // If profile doesn't exist, create one
      if (error?.code === 'PGRST116' || error?.message?.includes('No rows found') || !data) {
        console.log('Profile not found, creating default profile');
        await createDefaultProfile(userId);
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
      
      // Clear timeout if it exists
      if (profileTimeoutId) {
        clearTimeout(profileTimeoutId);
      }
      
      // If timeout occurred, show a toast notification
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error('Profile loading timed out. Please try again.');
      }
      
      // Try to create a default profile if loading fails
      console.log('Profile load failed, attempting to create default profile');
      await createDefaultProfile(userId);
      setLoading(false);
      setAuthInitialized(true);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    let createProfileTimeoutId: number | undefined;
    
    try {
      console.log('Creating default profile for user:', userId);
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        createProfileTimeoutId = setTimeout(() => {
          reject(new Error('Profile creation timed out'));
        }, AUTH_TIMEOUT) as unknown as number;
      });
      
      // Race between the actual request and the timeout
      const createProfilePromise = supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          role: 'member',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      const result = await Promise.race([
        createProfilePromise,
        timeoutPromise
      ]);
      
      // Clear timeout if request completed
      if (createProfileTimeoutId) {
        clearTimeout(createProfileTimeoutId);
        createProfileTimeoutId = undefined;
      }
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Profile creation timed out');
      }
      
      const { data, error } = result;

      if (error) {
        console.error('Error creating default profile:', error);
        
        // If profile already exists (race condition), try to fetch it
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          console.log('Profile already exists, attempting to fetch...');
          
          // Set a new timeout for fetching
          const fetchTimeoutPromise = new Promise<null>((_, reject) => {
            const fetchTimeoutId = setTimeout(() => {
              reject(new Error('Profile fetch timed out'));
            }, AUTH_TIMEOUT) as unknown as number;
            
            // Clean up timeout if component unmounts
            return () => clearTimeout(fetchTimeoutId);
          });
          
          const fetchProfilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          const fetchResult = await Promise.race([
            fetchProfilePromise,
            fetchTimeoutPromise
          ]);
          
          // If result is null, it means the timeout won
          if (fetchResult === null) {
            throw new Error('Profile fetch timed out');
          }
          
          const { data: existingProfile, error: fetchError } = fetchResult;
          
          if (fetchError) {
            throw fetchError;
          }
          
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
      
      // Clear timeout if it exists
      if (createProfileTimeoutId) {
        clearTimeout(createProfileTimeoutId);
      }
      
      // If timeout occurred, show a toast notification
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error('Profile creation timed out. Please try again.');
      }
      
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
    
    let signInTimeoutId: number | undefined;
    
    try {
      // Clear any existing cache before signing in
      await clearUserCache();
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        signInTimeoutId = setTimeout(() => {
          reject(new Error('Sign in timed out'));
        }, AUTH_TIMEOUT) as unknown as number;
      });
      
      // Race between the actual request and the timeout
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const result = await Promise.race([
        signInPromise,
        timeoutPromise
      ]);
      
      // Clear timeout if request completed
      if (signInTimeoutId) {
        clearTimeout(signInTimeoutId);
        signInTimeoutId = undefined;
      }
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Sign in timed out');
      }
      
      const { data, error } = result;

      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        throw error;
      }
      
      console.log('Sign in successful:', data.user?.id);
      // Note: We don't need to set user/profile here as the auth state change listener will handle it
    } catch (error) {
      console.error('Error in signIn function:', error);
      
      // Clear timeout if it exists
      if (signInTimeoutId) {
        clearTimeout(signInTimeoutId);
      }
      
      // Clear cache if there was an error
      await clearUserCache();
      
      // Show toast notification for timeout
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error('Sign in timed out. Please try again.');
      }
      
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    
    let signUpTimeoutId: number | undefined;
    
    try {
      // Clear any existing cache before signing up
      await clearUserCache();
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        signUpTimeoutId = setTimeout(() => {
          reject(new Error('Sign up timed out'));
        }, AUTH_TIMEOUT) as unknown as number;
      });
      
      // Race between the actual request and the timeout
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      const result = await Promise.race([
        signUpPromise,
        timeoutPromise
      ]);
      
      // Clear timeout if request completed
      if (signUpTimeoutId) {
        clearTimeout(signUpTimeoutId);
        signUpTimeoutId = undefined;
      }
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Sign up timed out');
      }
      
      const { data, error } = result;

      if (error) {
        console.error('Sign up error:', error);
        setLoading(false);
        throw error;
      }
      
      console.log('Sign up successful:', data.user?.id);
      // Note: We don't need to set user/profile here as the auth state change listener will handle it
    } catch (error) {
      console.error('Error in signUp function:', error);
      
      // Clear timeout if it exists
      if (signUpTimeoutId) {
        clearTimeout(signUpTimeoutId);
      }
      
      // Clear cache if there was an error
      await clearUserCache();
      
      // Show toast notification for timeout
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error('Sign up timed out. Please try again.');
      }
      
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out user...');
      
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

    let updateProfileTimeoutId: number | undefined;
    
    try {
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        updateProfileTimeoutId = setTimeout(() => {
          reject(new Error('Profile update timed out'));
        }, AUTH_TIMEOUT) as unknown as number;
      });
      
      // Race between the actual request and the timeout
      const updateProfilePromise = supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
        
      const result = await Promise.race([
        updateProfilePromise,
        timeoutPromise
      ]);
      
      // Clear timeout if request completed
      if (updateProfileTimeoutId) {
        clearTimeout(updateProfileTimeoutId);
        updateProfileTimeoutId = undefined;
      }
      
      // If result is null, it means the timeout won
      if (result === null) {
        throw new Error('Profile update timed out');
      }
      
      const { error } = result;

      if (error) {
        console.error('Update profile error:', error);
        setLoading(false);
        throw error;
      }

      // Reload profile and update cache
      await loadUserProfile(user.id);
    } catch (error) {
      console.error('Error in updateProfile function:', error);
      
      // Clear timeout if it exists
      if (updateProfileTimeoutId) {
        clearTimeout(updateProfileTimeoutId);
      }
      
      // Show toast notification for timeout
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error('Profile update timed out. Please try again.');
      }
      
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
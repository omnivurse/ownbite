import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set after connecting to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Please click the "Connect to Supabase" button in the top right to set up your database connection.'
  );
}

// Create a single supabase client for the entire app with persistent session storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'ownbite-auth-storage',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Cache-Control': 'no-cache'
    },
    fetch: (...args) => {
      // Get the request method from the options or default to GET
      const method = args[1]?.method?.toUpperCase() || 'GET';
      
      // Set appropriate Content-Type for data-modifying requests
      const headers = {
        ...args[1]?.headers,
        'apikey': supabaseAnonKey,
        'Cache-Control': 'no-cache'
      };

      // Only set Content-Type to application/json for requests that send data
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        headers['Content-Type'] = 'application/json';
      }

      const fetchOptions = {
        ...args[1],
        headers
      };

      return fetch(args[0], fetchOptions);
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2 // Limit realtime events to prevent overloading
    }
  }
});

// Type definitions for database tables
export type User = {
  id: string;
  email: string;
  created_at: string;
  profile?: UserProfile;
};

export type UserProfile = {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  dietary_preferences?: string[];
  allergies?: string[];
  health_goals?: string[];
};

export type FoodEntry = {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: string;
  image_url?: string;
  timestamp: string;
  created_at: string;
};

export type FoodScan = {
  id: string;
  user_id: string;
  image_url?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  created_at: string;
};

export type FoodItem = {
  id: string;
  scan_id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  health_benefits?: string[];
  health_risks?: string[];
  created_at: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  ingredients: string[];
  image_url: string;
  cuisine_type: string;
  diet_type: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  calories_per_serving: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  created_at: string;
};
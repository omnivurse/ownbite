import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'ownbite',
  storeName: 'ownbite_cache',
  description: 'Cache for OwnBite app',
  version: 1.5 // Increment version to force cache reset
});

// Cache keys
export const CACHE_KEYS = {
  USER: 'user',
  PROFILE: 'profile',
  SUBSCRIPTION: 'subscription',
  SUBSCRIPTION_DETAILS: 'subscription_details',
  NUTRITION_GOALS: 'nutrition_goals',
  BLOODWORK: 'bloodwork',
  FOOD_ENTRIES: 'food_entries',
  SCANS: 'scans',
  KPI_DASHBOARD: 'kpi_dashboard',
};

// Cache expiration times (in milliseconds)
export const CACHE_EXPIRY = {
  USER: 1000 * 60 * 5, // 5 minutes
  PROFILE: 1000 * 60 * 5, // 5 minutes
  SUBSCRIPTION: 1000 * 60 * 1, // 1 minute
  SUBSCRIPTION_DETAILS: 1000 * 60 * 1, // 1 minute
  NUTRITION_GOALS: 1000 * 60 * 30, // 30 minutes
  BLOODWORK: 1000 * 60 * 60, // 1 hour
  FOOD_ENTRIES: 1000 * 60 * 5, // 5 minutes
  SCANS: 1000 * 60 * 10, // 10 minutes
  KPI_DASHBOARD: 1000 * 60 * 5, // 5 minutes
};

// Cache item interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

// Set item in cache with expiry
export async function setCacheItem<T>(key: string, data: T, expiryTime: number): Promise<void> {
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    expiryTime
  };
  try {
    await localforage.setItem(key, cacheItem);
  } catch (error) {
    console.error('Error setting cache item:', error);
    // Silently fail but log the error
  }
}

// Get item from cache, returns null if expired or not found
export async function getCacheItem<T>(key: string): Promise<T | null> {
  try {
    const cacheItem = await localforage.getItem<CacheItem<T>>(key);
    
    if (!cacheItem) {
      return null;
    }
    
    // Check if cache is expired
    if (Date.now() - cacheItem.timestamp > cacheItem.expiryTime) {
      await localforage.removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
}

// Remove item from cache
export async function removeCacheItem(key: string): Promise<void> {
  try {
    await localforage.removeItem(key);
  } catch (error) {
    console.error('Error removing cache item:', error);
  }
}

// Clear all cache
export async function clearCache(): Promise<void> {
  try {
    await localforage.clear();
    console.log('Cache cleared successfully');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Clear user-related cache (useful for logout)
export async function clearUserCache(): Promise<void> {
  try {
    await Promise.all([
      localforage.removeItem(CACHE_KEYS.USER),
      localforage.removeItem(CACHE_KEYS.PROFILE),
      localforage.removeItem(CACHE_KEYS.SUBSCRIPTION),
      localforage.removeItem(CACHE_KEYS.SUBSCRIPTION_DETAILS),
      localforage.removeItem(CACHE_KEYS.NUTRITION_GOALS),
      localforage.removeItem(CACHE_KEYS.BLOODWORK),
      localforage.removeItem(CACHE_KEYS.FOOD_ENTRIES),
      localforage.removeItem(CACHE_KEYS.SCANS),
      localforage.removeItem(CACHE_KEYS.KPI_DASHBOARD),
    ]);
    console.log('User cache cleared successfully');
    
    // Also clear localStorage items that might be related to auth
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('ownbite-auth-storage');
    localStorage.removeItem('pendingReferralCode');
    localStorage.removeItem('referralSource');
    localStorage.removeItem('processedReferrals');
    
    // Clear session storage as well
    sessionStorage.clear();
    
    console.log('Local storage auth items cleared');
  } catch (error) {
    console.error('Error clearing user cache:', error);
  }
}

// Force clear all browser storage (for troubleshooting)
export async function forceClearAllStorage(): Promise<void> {
  try {
    // Clear localforage
    await localforage.clear();
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear IndexedDB
    const databases = await window.indexedDB.databases();
    databases.forEach(db => {
      if (db.name) window.indexedDB.deleteDatabase(db.name);
    });
    
    console.log('All storage cleared successfully');
  } catch (error) {
    console.error('Error clearing all storage:', error);
  }
}
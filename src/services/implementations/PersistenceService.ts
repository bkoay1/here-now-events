/**
 * PersistenceService Implementation
 * 
 * Provides data persistence using localStorage/IndexedDB.
 * Implements the IPersistenceService interface for consistent data access.
 * All data is stored locally; ready for backend integration later.
 */

import {
  IPersistenceService,
  UserProfile,
  DailyEvent,
  StorageKey,
} from '../interfaces/IPersistenceService';

/**
 * Number of ads required to unlock daily event.
 */
const ADS_REQUIRED = 3;

/**
 * Gets today's date as a string in YYYY-MM-DD format.
 * Used for daily resets and event date matching.
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * PersistenceService class implementing IPersistenceService.
 * Manages all data storage operations for the app.
 */
export class PersistenceService implements IPersistenceService {
  /**
   * Creates a new PersistenceService instance.
   * Checks for localStorage availability.
   */
  constructor() {
    // Verify localStorage is available
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available, persistence will not work');
    }
  }

  /**
   * Checks if localStorage is available and functional.
   * Some browsers block localStorage in private mode.
   */
  private isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Stores a value in localStorage with JSON serialization.
   * @param key Storage key to use
   * @param value Value to store (will be serialized)
   */
  async set<T>(key: StorageKey | string, value: T): Promise<void> {
    try {
      // Serialize the value to JSON
      const serialized = JSON.stringify(value);
      // Store in localStorage
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to store value for key ${key}:`, error);
      throw new Error(`Failed to persist data for key ${key}`);
    }
  }

  /**
   * Retrieves a value from localStorage with JSON deserialization.
   * @param key Storage key to retrieve
   * @returns The deserialized value or null if not found
   */
  async get<T>(key: StorageKey | string): Promise<T | null> {
    try {
      // Get the raw value from localStorage
      const raw = localStorage.getItem(key);
      
      // Return null if not found
      if (raw === null) {
        return null;
      }

      // Deserialize and return
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`Failed to retrieve value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Removes a value from localStorage.
   * @param key Storage key to remove
   */
  async remove(key: StorageKey | string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove key ${key}:`, error);
    }
  }

  /**
   * Clears all HereNow data from localStorage.
   * Removes only keys that start with 'herenow_'.
   */
  async clear(): Promise<void> {
    try {
      // Get all keys that belong to HereNow
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('herenow_')) {
          keysToRemove.push(key);
        }
      }

      // Remove each key
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Checks if a key exists in localStorage.
   * @param key Storage key to check
   * @returns True if the key exists
   */
  async exists(key: StorageKey | string): Promise<boolean> {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Gets the user profile from storage.
   * Convenience method with proper typing.
   */
  async getUserProfile(): Promise<UserProfile | null> {
    return this.get<UserProfile>(StorageKey.USER_PROFILE);
  }

  /**
   * Saves the user profile to storage.
   * Also updates the preferences separately for quick access.
   */
  async setUserProfile(profile: UserProfile): Promise<void> {
    // Save the full profile
    await this.set(StorageKey.USER_PROFILE, profile);
    
    // Also save preferences separately for quick access
    await this.set(StorageKey.USER_PREFERENCES, profile.preferences);
  }

  /**
   * Gets the cached daily event for today.
   * Returns null if cache is stale or doesn't exist.
   */
  async getCachedDailyEvent(): Promise<DailyEvent | null> {
    // Get the last cached event date
    const lastEventDate = await this.get<string>(StorageKey.LAST_EVENT_DATE);
    const today = getTodayDateString();

    // If cache is from a different day, return null
    if (lastEventDate !== today) {
      return null;
    }

    // Return the cached event
    return this.get<DailyEvent>(StorageKey.DAILY_EVENT_CACHE);
  }

  /**
   * Caches the daily event for offline access.
   * Also stores the date for cache invalidation.
   */
  async cacheDailyEvent(event: DailyEvent): Promise<void> {
    const today = getTodayDateString();
    
    // Store the event
    await this.set(StorageKey.DAILY_EVENT_CACHE, event);
    
    // Store the date for cache validation
    await this.set(StorageKey.LAST_EVENT_DATE, today);
  }

  /**
   * Records that an ad was watched.
   * Resets count daily to ensure fair monetization.
   */
  async recordAdWatch(): Promise<number> {
    const today = getTodayDateString();
    
    // Get current ad data
    const adData = await this.get<{ date: string; count: number }>(StorageKey.AD_WATCH_COUNT);
    
    // Check if this is a new day
    if (!adData || adData.date !== today) {
      // Reset count for new day
      const newData = { date: today, count: 1 };
      await this.set(StorageKey.AD_WATCH_COUNT, newData);
      return 1;
    }

    // Increment the count
    const newCount = adData.count + 1;
    await this.set(StorageKey.AD_WATCH_COUNT, { date: today, count: newCount });
    
    return newCount;
  }

  /**
   * Gets the number of ads watched today.
   * Returns 0 if no ads watched or data is from a different day.
   */
  async getAdWatchCount(): Promise<number> {
    const today = getTodayDateString();
    const adData = await this.get<{ date: string; count: number }>(StorageKey.AD_WATCH_COUNT);
    
    // Return 0 if no data or from different day
    if (!adData || adData.date !== today) {
      return 0;
    }

    return adData.count;
  }

  /**
   * Checks if the daily event is unlocked.
   * Event unlocks after watching 3 ads.
   */
  async isEventUnlocked(): Promise<boolean> {
    const adCount = await this.getAdWatchCount();
    return adCount >= ADS_REQUIRED;
  }

  /**
   * Helper method to add an event to attended events list.
   * @param eventId ID of the event to mark as attended
   */
  async markEventAttended(eventId: string): Promise<void> {
    // Get current attended events
    const attended = await this.get<string[]>(StorageKey.ATTENDED_EVENTS) || [];
    
    // Add this event if not already present
    if (!attended.includes(eventId)) {
      attended.push(eventId);
      await this.set(StorageKey.ATTENDED_EVENTS, attended);
    }

    // Also update the user profile if it exists
    const profile = await this.getUserProfile();
    if (profile && !profile.attendedEventIds.includes(eventId)) {
      profile.attendedEventIds.push(eventId);
      await this.setUserProfile(profile);
    }
  }

  /**
   * Gets the list of attended event IDs.
   */
  async getAttendedEvents(): Promise<string[]> {
    return await this.get<string[]>(StorageKey.ATTENDED_EVENTS) || [];
  }
}

/**
 * Singleton instance of PersistenceService.
 * Use this for dependency injection across the app.
 */
export const persistenceService = new PersistenceService();

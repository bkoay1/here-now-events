/**
 * useProfileViewModel Hook
 * 
 * ViewModel for user profile management.
 * Handles profile data, preferences, and onboarding state.
 * Follows MVVM pattern for clean separation of concerns.
 */

import { useState, useEffect, useCallback } from 'react';
import { usePersistenceService } from '@/contexts/ServiceContext';
import {
  UserProfile,
  UserPreferences,
  PriceRange,
  ActivityType,
  DurationRange,
  MeetupType,
} from '@/services';

/**
 * State managed by the profile ViewModel.
 */
interface ProfileViewModelState {
  /** The user's profile (null if not logged in) */
  profile: UserProfile | null;
  /** Whether profile is being loaded */
  isLoading: boolean;
  /** Whether profile changes are being saved */
  isSaving: boolean;
  /** Whether onboarding is complete */
  onboardingComplete: boolean;
  /** Error message if something went wrong */
  error: string | null;
}

/**
 * Actions available from the profile ViewModel.
 */
interface ProfileViewModelActions {
  /** Create a new profile (during onboarding) */
  createProfile: (displayName: string, preferences: UserPreferences) => Promise<void>;
  /** Update the user's profile */
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  /** Update just the preferences */
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
  /** Mark onboarding as complete */
  completeOnboarding: () => Promise<void>;
  /** Refresh profile data */
  refreshProfile: () => Promise<void>;
  /** Clear all user data (logout) */
  clearProfile: () => Promise<void>;
}

/**
 * Combined ViewModel return type.
 */
type ProfileViewModel = ProfileViewModelState & ProfileViewModelActions;

/**
 * Default preferences for new users.
 * Provides sensible starting values.
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  priceRange: PriceRange.MEDIUM,
  activityTypes: [ActivityType.SOCIAL, ActivityType.PHYSICAL],
  durationRange: DurationRange.MEDIUM,
  maxDistanceMiles: 25,
  meetupType: MeetupType.BOTH,
  interests: [],
};

/**
 * Generates a unique user ID.
 * In production, this would come from the auth system.
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * useProfileViewModel Hook
 * 
 * Provides all state and actions for profile management.
 * Handles the full lifecycle from creation to updates.
 * 
 * @example
 * function ProfileScreen() {
 *   const { profile, updatePreferences, isSaving } = useProfileViewModel();
 *   // Render profile UI...
 * }
 */
export function useProfileViewModel(): ProfileViewModel {
  // Get persistence service for data storage
  const persistence = usePersistenceService();

  // ============================================
  // State
  // ============================================

  /** User's profile data */
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  /** Loading state while fetching profile */
  const [isLoading, setIsLoading] = useState(true);
  
  /** Saving state for profile updates */
  const [isSaving, setIsSaving] = useState(false);
  
  /** Whether onboarding has been completed */
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  /** Error message for display */
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // Load Initial Data
  // ============================================

  useEffect(() => {
    /**
     * Loads the user profile on mount.
     */
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load existing profile
        const savedProfile = await persistence.getUserProfile();
        
        if (savedProfile) {
          setProfile(savedProfile);
          setOnboardingComplete(savedProfile.onboardingComplete);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load your profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [persistence]);

  // ============================================
  // Actions
  // ============================================

  /**
   * Creates a new user profile.
   * Called during the onboarding flow.
   */
  const createProfile = useCallback(async (
    displayName: string,
    preferences: UserPreferences = DEFAULT_PREFERENCES
  ) => {
    try {
      setIsSaving(true);
      setError(null);

      // Create the new profile object
      const newProfile: UserProfile = {
        id: generateUserId(),
        displayName,
        preferences,
        attendedEventIds: [],
        rating: 0,
        ratingCount: 0,
        createdAt: new Date(),
        onboardingComplete: false,
      };

      // Save to persistence
      await persistence.setUserProfile(newProfile);
      
      // Update local state
      setProfile(newProfile);
    } catch (err) {
      console.error('Failed to create profile:', err);
      setError('Failed to create your profile. Please try again.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [persistence]);

  /**
   * Updates the user's profile with partial data.
   * Merges updates with existing profile.
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) {
      setError('No profile to update');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Merge updates with existing profile
      const updatedProfile: UserProfile = {
        ...profile,
        ...updates,
        // Don't allow overwriting these fields directly
        id: profile.id,
        createdAt: profile.createdAt,
      };

      // Save to persistence
      await persistence.setUserProfile(updatedProfile);
      
      // Update local state
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to save your changes. Please try again.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [profile, persistence]);

  /**
   * Updates just the user's preferences.
   * Convenience method for preference-only updates.
   */
  const updatePreferences = useCallback(async (preferences: UserPreferences) => {
    await updateProfile({ preferences });
  }, [updateProfile]);

  /**
   * Marks the onboarding flow as complete.
   */
  const completeOnboarding = useCallback(async () => {
    if (!profile) {
      setError('No profile to update');
      return;
    }

    try {
      setIsSaving(true);
      
      // Update profile with onboarding complete flag
      const updatedProfile = {
        ...profile,
        onboardingComplete: true,
      };

      await persistence.setUserProfile(updatedProfile);
      
      setProfile(updatedProfile);
      setOnboardingComplete(true);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setError('Failed to save onboarding status');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [profile, persistence]);

  /**
   * Refreshes profile data from storage.
   */
  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const savedProfile = await persistence.getUserProfile();
      
      if (savedProfile) {
        setProfile(savedProfile);
        setOnboardingComplete(savedProfile.onboardingComplete);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      setError('Failed to refresh profile data');
    } finally {
      setIsLoading(false);
    }
  }, [persistence]);

  /**
   * Clears all user data (logout functionality).
   */
  const clearProfile = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Clear all persisted data
      await persistence.clear();
      
      // Reset local state
      setProfile(null);
      setOnboardingComplete(false);
    } catch (err) {
      console.error('Failed to clear profile:', err);
      setError('Failed to clear your data');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [persistence]);

  // ============================================
  // Return ViewModel
  // ============================================

  return {
    // State
    profile,
    isLoading,
    isSaving,
    onboardingComplete,
    error,
    // Actions
    createProfile,
    updateProfile,
    updatePreferences,
    completeOnboarding,
    refreshProfile,
    clearProfile,
  };
}

/**
 * Export default preferences for use in onboarding.
 */
export { DEFAULT_PREFERENCES };

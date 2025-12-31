/**
 * useEventViewModel Hook
 * 
 * ViewModel for the daily event feature.
 * Manages event data, ad watching progress, and attendance state.
 * Follows MVVM pattern by separating UI logic from components.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePersistenceService } from '@/contexts/ServiceContext';
import { DailyEvent, ActivityType, MeetupType } from '@/services';

/**
 * State managed by the event ViewModel.
 */
interface EventViewModelState {
  /** Today's event (null if not loaded or not unlocked) */
  event: DailyEvent | null;
  /** Whether the event is loading */
  isLoading: boolean;
  /** Whether the event is unlocked (3 ads watched) */
  isUnlocked: boolean;
  /** Number of ads watched today (0-3) */
  adsWatched: number;
  /** Whether user is attending this event */
  isAttending: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Time remaining until event reveal (for countdown) */
  timeUntilReveal: number;
}

/**
 * Actions available from the event ViewModel.
 */
interface EventViewModelActions {
  /** Record that user watched an ad */
  watchAd: () => Promise<void>;
  /** Toggle attendance for the event */
  toggleAttendance: () => Promise<void>;
  /** Refresh event data */
  refreshEvent: () => Promise<void>;
}

/**
 * Combined ViewModel return type.
 */
type EventViewModel = EventViewModelState & EventViewModelActions;

/**
 * Mock event data for development.
 * In production, this would come from an API.
 */
const MOCK_EVENT: DailyEvent = {
  id: 'event-001',
  title: 'Sunset Yoga at Dolores Park',
  description: 'Join fellow San Franciscans for a peaceful evening yoga session as the sun sets over the city. All skill levels welcome! Bring your own mat or borrow one from our collection.',
  address: 'Dolores Park, San Francisco, CA',
  coordinates: {
    latitude: 37.7596,
    longitude: -122.4269,
  },
  startTime: new Date(new Date().setHours(17, 30, 0, 0)),
  endTime: new Date(new Date().setHours(19, 0, 0, 0)),
  price: 0,
  activityType: ActivityType.RELAXATION,
  maxAttendees: 30,
  currentAttendees: 12,
  imageUrls: [],
  meetupType: MeetupType.INDIVIDUAL,
  tags: ['yoga', 'outdoor', 'sunset', 'wellness', 'free'],
  eventDate: new Date().toISOString().split('T')[0],
};

/**
 * useEventViewModel Hook
 * 
 * Provides all state and actions needed for the daily event feature.
 * Handles loading, ad tracking, and attendance management.
 * 
 * @example
 * function EventScreen() {
 *   const { event, isUnlocked, adsWatched, watchAd } = useEventViewModel();
 *   // Render based on state...
 * }
 */
export function useEventViewModel(): EventViewModel {
  // Get persistence service for data storage
  const persistence = usePersistenceService();

  // ============================================
  // State
  // ============================================

  /** Current event data */
  const [event, setEvent] = useState<DailyEvent | null>(null);
  
  /** Loading state while fetching event */
  const [isLoading, setIsLoading] = useState(true);
  
  /** Number of ads watched today */
  const [adsWatched, setAdsWatched] = useState(0);
  
  /** Whether user is attending the event */
  const [isAttending, setIsAttending] = useState(false);
  
  /** Error message for display */
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // Computed Values
  // ============================================

  /** Event is unlocked after watching 3 ads */
  const isUnlocked = useMemo(() => adsWatched >= 3, [adsWatched]);

  /** Calculate time until reveal (8 AM reveal time) */
  const timeUntilReveal = useMemo(() => {
    const now = new Date();
    const revealTime = new Date();
    revealTime.setHours(8, 0, 0, 0);
    
    // If it's past 8 AM, event is already revealed
    if (now >= revealTime) {
      return 0;
    }
    
    return revealTime.getTime() - now.getTime();
  }, []);

  // ============================================
  // Load Initial Data
  // ============================================

  useEffect(() => {
    /**
     * Loads event data and ad count on mount.
     */
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        // Load ad watch count
        const count = await persistence.getAdWatchCount();
        setAdsWatched(count);

        // Check if event is unlocked
        const unlocked = await persistence.isEventUnlocked();
        
        if (unlocked) {
          // Try to load cached event first
          const cached = await persistence.getCachedDailyEvent();
          
          if (cached) {
            setEvent(cached);
          } else {
            // In production, fetch from API
            // For now, use mock data
            setEvent(MOCK_EVENT);
            await persistence.cacheDailyEvent(MOCK_EVENT);
          }
        }
      } catch (err) {
        console.error('Failed to load event data:', err);
        setError('Failed to load today\'s event');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [persistence]);

  // ============================================
  // Actions
  // ============================================

  /**
   * Records that user watched an ad.
   * Updates the ad count and unlocks event if threshold reached.
   */
  const watchAd = useCallback(async () => {
    try {
      // Record the ad watch
      const newCount = await persistence.recordAdWatch();
      setAdsWatched(newCount);

      // If this unlocked the event, load it
      if (newCount >= 3 && !event) {
        // In production, fetch from API
        setEvent(MOCK_EVENT);
        await persistence.cacheDailyEvent(MOCK_EVENT);
      }
    } catch (err) {
      console.error('Failed to record ad watch:', err);
      setError('Failed to record ad. Please try again.');
    }
  }, [persistence, event]);

  /**
   * Toggles user's attendance for the event.
   */
  const toggleAttendance = useCallback(async () => {
    if (!event) return;

    try {
      const newAttendingState = !isAttending;
      setIsAttending(newAttendingState);

      if (newAttendingState) {
        // Mark event as attended in persistence
        await (persistence as any).markEventAttended?.(event.id);
      }

      // In production, this would also update the server
    } catch (err) {
      console.error('Failed to toggle attendance:', err);
      // Revert the optimistic update
      setIsAttending(!isAttending);
      setError('Failed to update attendance. Please try again.');
    }
  }, [event, isAttending, persistence]);

  /**
   * Refreshes event data from the server.
   */
  const refreshEvent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In production, fetch fresh data from API
      // For now, just reload the mock
      if (isUnlocked) {
        setEvent(MOCK_EVENT);
        await persistence.cacheDailyEvent(MOCK_EVENT);
      }
    } catch (err) {
      console.error('Failed to refresh event:', err);
      setError('Failed to refresh event data');
    } finally {
      setIsLoading(false);
    }
  }, [isUnlocked, persistence]);

  // ============================================
  // Return ViewModel
  // ============================================

  return {
    // State
    event,
    isLoading,
    isUnlocked,
    adsWatched,
    isAttending,
    error,
    timeUntilReveal,
    // Actions
    watchAd,
    toggleAttendance,
    refreshEvent,
  };
}

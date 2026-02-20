/**
 * useEventViewModel Hook
 * 
 * ViewModel for the daily event feature.
 * Manages event data, countdown to 12pm reveal, and attendance state.
 * Follows MVVM pattern by separating UI logic from components.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePersistenceService } from '@/contexts/ServiceContext';
import { DailyEvent, ActivityType, MeetupType } from '@/services';

/** State managed by the event ViewModel. */
interface EventViewModelState {
  /** Today's event (null if not loaded or not revealed) */
  event: DailyEvent | null;
  /** Whether the event is loading */
  isLoading: boolean;
  /** Whether the event is revealed (past 12pm local time) */
  isRevealed: boolean;
  /** Whether user is attending this event */
  isAttending: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Milliseconds remaining until 12pm reveal */
  timeUntilReveal: number;
}

/** Actions available from the event ViewModel. */
interface EventViewModelActions {
  /** Toggle attendance for the event */
  toggleAttendance: () => Promise<void>;
  /** Refresh event data */
  refreshEvent: () => Promise<void>;
}

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
  coordinates: { latitude: 37.7596, longitude: -122.4269 },
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

/** Calculate milliseconds until 12pm local time today. Returns 0 if past 12pm. */
function getTimeUntilNoon(): number {
  const now = new Date();
  const noon = new Date();
  noon.setHours(12, 0, 0, 0);
  return now >= noon ? 0 : noon.getTime() - now.getTime();
}

/**
 * useEventViewModel Hook
 * 
 * Provides all state and actions for the daily event feature.
 * Event is revealed at 12pm local time each day.
 */
export function useEventViewModel(): EventViewModel {
  const persistence = usePersistenceService();

  const [event, setEvent] = useState<DailyEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilReveal, setTimeUntilReveal] = useState(getTimeUntilNoon);

  /** Event is revealed once countdown reaches 0 */
  const isRevealed = useMemo(() => timeUntilReveal <= 0, [timeUntilReveal]);

  /** Tick the countdown every second */
  useEffect(() => {
    if (timeUntilReveal <= 0) return;
    const interval = setInterval(() => {
      setTimeUntilReveal(getTimeUntilNoon());
    }, 1000);
    return () => clearInterval(interval);
  }, [timeUntilReveal > 0]);

  /** Load event data on mount and when revealed */
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        if (isRevealed) {
          const cached = await persistence.getCachedDailyEvent();
          if (cached) {
            setEvent(cached);
          } else {
            setEvent(MOCK_EVENT);
            await persistence.cacheDailyEvent(MOCK_EVENT);
          }
        }
      } catch (err) {
        console.error('Failed to load event data:', err);
        setError("Failed to load today's event");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [persistence, isRevealed]);

  const toggleAttendance = useCallback(async () => {
    if (!event) return;
    try {
      const newState = !isAttending;
      setIsAttending(newState);
      if (newState) {
        await (persistence as any).markEventAttended?.(event.id);
      }
    } catch (err) {
      console.error('Failed to toggle attendance:', err);
      setIsAttending(!isAttending);
      setError('Failed to update attendance. Please try again.');
    }
  }, [event, isAttending, persistence]);

  const refreshEvent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (isRevealed) {
        setEvent(MOCK_EVENT);
        await persistence.cacheDailyEvent(MOCK_EVENT);
      }
    } catch (err) {
      console.error('Failed to refresh event:', err);
      setError('Failed to refresh event data');
    } finally {
      setIsLoading(false);
    }
  }, [isRevealed, persistence]);

  return {
    event,
    isLoading,
    isRevealed,
    isAttending,
    error,
    timeUntilReveal,
    toggleAttendance,
    refreshEvent,
  };
}

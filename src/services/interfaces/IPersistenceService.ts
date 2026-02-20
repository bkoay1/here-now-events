/**
 * IPersistenceService Interface
 * 
 * Defines the contract for data persistence in HereNow.
 * Abstracts storage operations to allow different backends (localStorage, IndexedDB, etc).
 * Supports typed data storage with automatic serialization.
 */

/**
 * Represents a user profile in the system.
 * Contains preferences, history, and identification data.
 */
export interface UserProfile {
  /** Unique user identifier */
  id: string;
  /** Display name shown to other users */
  displayName: string;
  /** URL to user's profile photo */
  avatarUrl?: string;
  /** Short bio or description */
  bio?: string;
  /** User's event preferences */
  preferences: UserPreferences;
  /** IDs of events the user has attended */
  attendedEventIds: string[];
  /** User's rating based on feedback (0-5 scale) */
  rating: number;
  /** Number of ratings received */
  ratingCount: number;
  /** Account creation timestamp */
  createdAt: Date;
  /** Whether onboarding has been completed */
  onboardingComplete: boolean;
}

/**
 * User preferences for event matching.
 * Used to personalize the daily event suggestions.
 */
export interface UserPreferences {
  /** Preferred price range for events */
  priceRange: PriceRange;
  /** Preferred activity types */
  activityTypes: ActivityType[];
  /** Preferred event duration range in minutes */
  durationRange: DurationRange;
  /** Maximum distance willing to travel in miles */
  maxDistanceMiles: number;
  /** Whether user prefers group or individual events */
  meetupType: MeetupType;
  /** Specific interests for better matching */
  interests: string[];
}

/**
 * Price range preferences for events.
 * Allows users to set their budget constraints.
 */
export enum PriceRange {
  FREE = 'free',
  LOW = 'low',        // $1-20
  MEDIUM = 'medium',  // $21-50
  HIGH = 'high',      // $51-100
  PREMIUM = 'premium' // $100+
}

/**
 * Types of activities available for events.
 * Used to categorize and match events to preferences.
 */
export enum ActivityType {
  PHYSICAL = 'physical',   // Sports, hiking, dancing
  MENTAL = 'mental',       // Puzzles, games, learning
  SOCIAL = 'social',       // Meetups, parties, dining
  CREATIVE = 'creative',   // Art, music, crafts
  RELAXATION = 'relaxation' // Spa, yoga, meditation
}

/**
 * Event duration preferences in minutes.
 */
export enum DurationRange {
  SHORT = 'short',     // Under 1 hour
  MEDIUM = 'medium',   // 1-2 hours
  LONG = 'long',       // 2-4 hours
  EXTENDED = 'extended' // 4+ hours
}

/**
 * Type of meetup the user prefers.
 */
export enum MeetupType {
  /** Groups meet other groups */
  GROUP = 'group',
  /** Individuals meet other individuals */
  INDIVIDUAL = 'individual',
  /** No preference, open to both */
  BOTH = 'both'
}

/**
 * Represents a daily event in the system.
 * Core data structure for the event discovery feature.
 */
export interface DailyEvent {
  /** Unique event identifier */
  id: string;
  /** Event title/name */
  title: string;
  /** Detailed description of the event */
  description: string;
  /** Event location address */
  address: string;
  /** Geographic coordinates for mapping */
  coordinates: {
    latitude: number;
    longitude: number;
  };
  /** Start time of the event */
  startTime: Date;
  /** End time of the event */
  endTime: Date;
  /** Price in dollars (0 for free events) */
  price: number;
  /** Activity category */
  activityType: ActivityType;
  /** Maximum number of attendees */
  maxAttendees: number;
  /** Current number of confirmed attendees */
  currentAttendees: number;
  /** URLs to event photos */
  imageUrls: string[];
  /** The sponsor of this event (if any) */
  sponsor?: EventSponsor;
  /** Whether this is a group or individual event */
  meetupType: MeetupType;
  /** Tags for searchability and matching */
  tags: string[];
  /** Date this event is for (daily events are tied to a specific date) */
  eventDate: string; // YYYY-MM-DD format
}

/**
 * Event sponsor information.
 * Used for sponsored/promoted events in the feed.
 */
export interface EventSponsor {
  /** Sponsor name/brand */
  name: string;
  /** Sponsor logo URL */
  logoUrl: string;
  /** Link to sponsor website */
  websiteUrl?: string;
}

/**
 * Storage keys used by the persistence service.
 * Centralized to prevent key collisions and typos.
 */
export enum StorageKey {
  USER_PROFILE = 'herenow_user_profile',
  USER_PREFERENCES = 'herenow_user_preferences',
  DAILY_EVENT_CACHE = 'herenow_daily_event',
  ATTENDED_EVENTS = 'herenow_attended_events',
  NOTIFICATION_PREFS = 'herenow_notification_prefs',
  ONBOARDING_STATE = 'herenow_onboarding',
  LAST_EVENT_DATE = 'herenow_last_event_date',
}

/**
 * The main persistence service interface.
 * Provides typed storage operations for all app data.
 */
export interface IPersistenceService {
  /**
   * Stores a value in persistent storage.
   * Automatically serializes objects to JSON.
   * @param key The storage key to use
   * @param value The value to store
   */
  set<T>(key: StorageKey | string, value: T): Promise<void>;

  /**
   * Retrieves a value from persistent storage.
   * Automatically deserializes JSON to the expected type.
   * @param key The storage key to retrieve
   * @returns The stored value or null if not found
   */
  get<T>(key: StorageKey | string): Promise<T | null>;

  /**
   * Removes a value from persistent storage.
   * @param key The storage key to remove
   */
  remove(key: StorageKey | string): Promise<void>;

  /**
   * Clears all data from persistent storage.
   * Use with caution - this removes all app data.
   */
  clear(): Promise<void>;

  /**
   * Checks if a key exists in storage.
   * @param key The storage key to check
   * @returns True if the key exists
   */
  exists(key: StorageKey | string): Promise<boolean>;

  /**
   * Gets the user profile from storage.
   * Convenience method with proper typing.
   * @returns The user profile or null if not logged in
   */
  getUserProfile(): Promise<UserProfile | null>;

  /**
   * Saves the user profile to storage.
   * @param profile The profile to save
   */
  setUserProfile(profile: UserProfile): Promise<void>;

  /**
   * Gets cached daily event for today.
   * @returns Today's event or null if not cached
   */
  getCachedDailyEvent(): Promise<DailyEvent | null>;

  /**
   * Caches the daily event for offline access.
   * @param event The event to cache
   */
  cacheDailyEvent(event: DailyEvent): Promise<void>;

  /**
   * Checks if the daily event is revealed (past 12pm local time).
   * @returns True if event is revealed
   */
  isEventRevealed(): Promise<boolean>;
}

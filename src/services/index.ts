/**
 * Services Index
 * 
 * Central export point for all services in the HereNow app.
 * Provides access to both interfaces (for typing) and implementations (for use).
 */

// ============================================
// Location Service
// ============================================

/** Interface exports for type definitions */
export type {
  ILocationService,
  Coordinates,
  LocationData,
  GeofenceRegion,
  LocationUpdateCallback,
  GeofenceEventCallback,
} from './interfaces/ILocationService';

/** Implementation exports */
export { LocationService, locationService } from './implementations/LocationService';


// ============================================
// Notification Service
// ============================================

/** Interface exports for type definitions */
export type {
  INotificationService,
  NotificationContent,
  ScheduledNotification,
  LocationNotification,
  NotificationPreferences,
  NotificationTapCallback,
} from './interfaces/INotificationService';

/** Enum exports (enums need regular export, not type export) */
export { NotificationCategory } from './interfaces/INotificationService';

/** Implementation exports */
export { NotificationService, notificationService } from './implementations/NotificationService';


// ============================================
// Persistence Service
// ============================================

/** Interface exports for type definitions */
export type {
  IPersistenceService,
  UserProfile,
  UserPreferences,
  DailyEvent,
  EventSponsor,
} from './interfaces/IPersistenceService';

/** Enum exports (enums need regular export, not type export) */
export {
  PriceRange,
  ActivityType,
  DurationRange,
  MeetupType,
  StorageKey,
} from './interfaces/IPersistenceService';

/** Implementation exports */
export { PersistenceService, persistenceService } from './implementations/PersistenceService';

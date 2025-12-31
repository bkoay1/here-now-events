/**
 * INotificationService Interface
 * 
 * Defines the contract for notification operations in HereNow.
 * Supports both local notifications (scheduled) and push notifications.
 * Designed to be extendable for location-triggered notifications.
 */

/**
 * Represents a notification to be displayed to the user.
 * Contains all the content and metadata for the notification.
 */
export interface NotificationContent {
  /** Unique identifier for this notification */
  id: string;
  /** Main title text shown prominently */
  title: string;
  /** Body/description text with more details */
  body: string;
  /** Optional image URL to display in the notification */
  imageUrl?: string;
  /** Optional deep link to navigate when notification is tapped */
  actionUrl?: string;
  /** Category for grouping related notifications */
  category: NotificationCategory;
  /** Additional custom data to pass with the notification */
  data?: Record<string, unknown>;
}

/**
 * Categories for organizing notifications.
 * Helps users manage notification preferences by type.
 */
export enum NotificationCategory {
  /** Daily event reveal notifications */
  DAILY_EVENT = 'daily_event',
  /** Event reminders before start time */
  EVENT_REMINDER = 'event_reminder',
  /** Updates about friend activity */
  SOCIAL = 'social',
  /** Nearby event discovery alerts */
  DISCOVERY = 'discovery',
  /** System messages and updates */
  SYSTEM = 'system',
}

/**
 * Configuration for a scheduled notification.
 * Allows notifications to be triggered at specific times.
 */
export interface ScheduledNotification extends NotificationContent {
  /** When to deliver the notification */
  scheduledTime: Date;
  /** Whether this notification repeats */
  repeating: boolean;
  /** Repeat interval (if repeating is true) */
  repeatInterval?: 'daily' | 'weekly';
}

/**
 * Configuration for a location-triggered notification.
 * Integrates with the LocationService for geofence triggers.
 */
export interface LocationNotification extends NotificationContent {
  /** The geofence region ID that triggers this notification */
  geofenceId: string;
  /** Trigger on enter, exit, or both */
  trigger: 'enter' | 'exit' | 'both';
}

/**
 * User preferences for notification delivery.
 * Controls what types of notifications the user receives.
 */
export interface NotificationPreferences {
  /** Whether all notifications are enabled */
  enabled: boolean;
  /** Per-category enable/disable settings */
  categories: Record<NotificationCategory, boolean>;
  /** Quiet hours start time (HH:MM format) */
  quietHoursStart?: string;
  /** Quiet hours end time (HH:MM format) */
  quietHoursEnd?: string;
}

/**
 * Callback type for notification tap events.
 * Called when user interacts with a notification.
 */
export type NotificationTapCallback = (notification: NotificationContent) => void;

/**
 * The main notification service interface.
 * Implementations handle all notification delivery and scheduling.
 */
export interface INotificationService {
  /**
   * Requests permission to send notifications to the user.
   * Must be called before any notifications can be delivered.
   * @returns Promise resolving to true if permission granted
   */
  requestPermission(): Promise<boolean>;

  /**
   * Checks if notification permission has been granted.
   * @returns Promise resolving to the current permission state
   */
  hasPermission(): Promise<boolean>;

  /**
   * Displays an immediate local notification.
   * Notification appears right away without scheduling.
   * @param notification The notification content to display
   */
  showNotification(notification: NotificationContent): Promise<void>;

  /**
   * Schedules a notification for future delivery.
   * @param notification The scheduled notification configuration
   * @returns Promise resolving to the scheduled notification ID
   */
  scheduleNotification(notification: ScheduledNotification): Promise<string>;

  /**
   * Cancels a previously scheduled notification.
   * @param notificationId The ID of the notification to cancel
   */
  cancelScheduledNotification(notificationId: string): Promise<void>;

  /**
   * Cancels all scheduled notifications.
   * Useful when user logs out or disables notifications.
   */
  cancelAllScheduledNotifications(): Promise<void>;

  /**
   * Registers a notification triggered by location.
   * Integrates with geofence monitoring.
   * @param notification The location-triggered notification config
   */
  registerLocationNotification(notification: LocationNotification): Promise<void>;

  /**
   * Removes a location-triggered notification.
   * @param notificationId The ID of the notification to remove
   */
  unregisterLocationNotification(notificationId: string): Promise<void>;

  /**
   * Gets the user's notification preferences.
   * @returns Current notification preferences
   */
  getPreferences(): NotificationPreferences;

  /**
   * Updates the user's notification preferences.
   * @param preferences New preferences to save
   */
  setPreferences(preferences: NotificationPreferences): Promise<void>;

  /**
   * Registers a callback for notification tap events.
   * @param callback Function to call when a notification is tapped
   */
  onNotificationTap(callback: NotificationTapCallback): void;

  /**
   * Gets all pending scheduled notifications.
   * @returns Array of scheduled notifications
   */
  getPendingNotifications(): Promise<ScheduledNotification[]>;
}

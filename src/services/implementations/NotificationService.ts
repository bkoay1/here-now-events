/**
 * NotificationService Implementation
 * 
 * Provides notification functionality using the Web Notifications API.
 * Implements the INotificationService interface for consistent usage.
 * Designed to be extended for native push notifications via Capacitor.
 */

import {
  INotificationService,
  NotificationContent,
  NotificationCategory,
  ScheduledNotification,
  LocationNotification,
  NotificationPreferences,
  NotificationTapCallback,
} from '../interfaces/INotificationService';

/**
 * Default notification preferences.
 * All categories enabled by default, no quiet hours.
 */
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  categories: {
    [NotificationCategory.DAILY_EVENT]: true,
    [NotificationCategory.EVENT_REMINDER]: true,
    [NotificationCategory.SOCIAL]: true,
    [NotificationCategory.DISCOVERY]: true,
    [NotificationCategory.SYSTEM]: true,
  },
  quietHoursStart: undefined,
  quietHoursEnd: undefined,
};

/**
 * Key for storing preferences in localStorage.
 */
const PREFERENCES_KEY = 'herenow_notification_prefs';

/**
 * Key for storing scheduled notifications in localStorage.
 */
const SCHEDULED_KEY = 'herenow_scheduled_notifications';

/**
 * NotificationService class implementing INotificationService.
 * Manages all notification-related functionality for the app.
 */
export class NotificationService implements INotificationService {
  /** Current notification preferences */
  private preferences: NotificationPreferences;
  
  /** Map of scheduled notification timeouts */
  private scheduledTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  /** Map of location-triggered notifications */
  private locationNotifications: Map<string, LocationNotification> = new Map();
  
  /** Registered tap callback handlers */
  private tapCallbacks: NotificationTapCallback[] = [];

  /**
   * Creates a new NotificationService instance.
   * Loads saved preferences from storage.
   */
  constructor() {
    // Load preferences from storage or use defaults
    this.preferences = this.loadPreferences();
    
    // Restore any scheduled notifications
    this.restoreScheduledNotifications();
  }

  /**
   * Loads notification preferences from localStorage.
   * Falls back to defaults if not found.
   */
  private loadPreferences(): NotificationPreferences {
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) {
        return JSON.parse(saved) as NotificationPreferences;
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Saves notification preferences to localStorage.
   */
  private savePreferences(): void {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  /**
   * Restores scheduled notifications from localStorage.
   * Re-schedules any that haven't passed yet.
   */
  private restoreScheduledNotifications(): void {
    try {
      const saved = localStorage.getItem(SCHEDULED_KEY);
      if (!saved) return;

      const notifications: ScheduledNotification[] = JSON.parse(saved);
      const now = new Date();

      notifications.forEach((notification) => {
        const scheduledTime = new Date(notification.scheduledTime);
        if (scheduledTime > now) {
          // Re-schedule this notification
          this.scheduleNotificationInternal(notification);
        }
      });
    } catch (error) {
      console.error('Failed to restore scheduled notifications:', error);
    }
  }

  /**
   * Saves scheduled notifications to localStorage.
   */
  private saveScheduledNotifications(): void {
    try {
      const notifications = Array.from(this.getPendingNotificationsSync());
      localStorage.setItem(SCHEDULED_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save scheduled notifications:', error);
    }
  }

  /**
   * Gets pending notifications synchronously (for internal use).
   */
  private getPendingNotificationsSync(): ScheduledNotification[] {
    // In a real implementation, this would return actual pending notifications
    // For now, return empty array as we store timeout references, not full data
    return [];
  }

  /**
   * Checks if we're currently in quiet hours.
   */
  private isQuietHours(): boolean {
    const { quietHoursStart, quietHoursEnd } = this.preferences;
    if (!quietHoursStart || !quietHoursEnd) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (quietHoursStart > quietHoursEnd) {
      return currentTime >= quietHoursStart || currentTime < quietHoursEnd;
    }
    
    return currentTime >= quietHoursStart && currentTime < quietHoursEnd;
  }

  /**
   * Checks if a notification category is enabled.
   */
  private isCategoryEnabled(category: NotificationCategory): boolean {
    return this.preferences.enabled && this.preferences.categories[category];
  }

  /**
   * Requests permission to send notifications.
   */
  async requestPermission(): Promise<boolean> {
    // Check if Notification API is supported
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    // Request permission from user
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  /**
   * Checks if notification permission is granted.
   */
  async hasPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  /**
   * Shows an immediate notification to the user.
   */
  async showNotification(notification: NotificationContent): Promise<void> {
    // Check if notifications are enabled for this category
    if (!this.isCategoryEnabled(notification.category)) {
      console.log(`Notification category ${notification.category} is disabled`);
      return;
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      console.log('Currently in quiet hours, notification suppressed');
      return;
    }

    // Check permission
    const hasPermission = await this.hasPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    // Create and show the notification
    const webNotification = new Notification(notification.title, {
      body: notification.body,
      icon: notification.imageUrl || '/favicon.ico',
      tag: notification.id,
      data: notification.data,
    });

    // Handle notification click
    webNotification.onclick = () => {
      // Call all registered tap callbacks
      this.tapCallbacks.forEach((callback) => callback(notification));
      
      // Navigate if action URL is provided
      if (notification.actionUrl) {
        window.open(notification.actionUrl, '_blank');
      }
      
      // Close the notification
      webNotification.close();
    };
  }

  /**
   * Schedules a notification for future delivery.
   */
  async scheduleNotification(notification: ScheduledNotification): Promise<string> {
    // Schedule the notification internally
    this.scheduleNotificationInternal(notification);
    
    // Save to storage for persistence
    this.saveScheduledNotifications();
    
    return notification.id;
  }

  /**
   * Internal method to schedule a notification.
   * Sets up the timeout for delayed delivery.
   */
  private scheduleNotificationInternal(notification: ScheduledNotification): void {
    const now = new Date();
    const scheduledTime = new Date(notification.scheduledTime);
    const delay = scheduledTime.getTime() - now.getTime();

    // Don't schedule if time has passed
    if (delay <= 0) {
      console.log(`Scheduled time for notification ${notification.id} has passed`);
      return;
    }

    // Create timeout for the notification
    const timeout = setTimeout(async () => {
      // Show the notification
      await this.showNotification(notification);
      
      // Handle repeating notifications
      if (notification.repeating && notification.repeatInterval) {
        // Calculate next occurrence
        const nextTime = new Date(scheduledTime);
        if (notification.repeatInterval === 'daily') {
          nextTime.setDate(nextTime.getDate() + 1);
        } else if (notification.repeatInterval === 'weekly') {
          nextTime.setDate(nextTime.getDate() + 7);
        }
        
        // Schedule the next occurrence
        const nextNotification: ScheduledNotification = {
          ...notification,
          scheduledTime: nextTime,
        };
        this.scheduleNotificationInternal(nextNotification);
      }
      
      // Remove from scheduled timeouts
      this.scheduledTimeouts.delete(notification.id);
    }, delay);

    // Store the timeout reference
    this.scheduledTimeouts.set(notification.id, timeout);
  }

  /**
   * Cancels a scheduled notification.
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    const timeout = this.scheduledTimeouts.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledTimeouts.delete(notificationId);
    }
    this.saveScheduledNotifications();
  }

  /**
   * Cancels all scheduled notifications.
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    // Clear all timeouts
    this.scheduledTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.scheduledTimeouts.clear();
    
    // Clear from storage
    localStorage.removeItem(SCHEDULED_KEY);
  }

  /**
   * Registers a location-triggered notification.
   * Will fire when user enters/exits the specified geofence.
   */
  async registerLocationNotification(notification: LocationNotification): Promise<void> {
    this.locationNotifications.set(notification.id, notification);
  }

  /**
   * Removes a location-triggered notification.
   */
  async unregisterLocationNotification(notificationId: string): Promise<void> {
    this.locationNotifications.delete(notificationId);
  }

  /**
   * Gets the current notification preferences.
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Updates notification preferences.
   */
  async setPreferences(preferences: NotificationPreferences): Promise<void> {
    this.preferences = { ...preferences };
    this.savePreferences();
  }

  /**
   * Registers a callback for notification tap events.
   */
  onNotificationTap(callback: NotificationTapCallback): void {
    this.tapCallbacks.push(callback);
  }

  /**
   * Gets all pending scheduled notifications.
   */
  async getPendingNotifications(): Promise<ScheduledNotification[]> {
    return this.getPendingNotificationsSync();
  }

  /**
   * Handles a geofence event (for integration with LocationService).
   * Shows the appropriate notification when user enters/exits a region.
   */
  handleGeofenceEvent(regionId: string, event: 'enter' | 'exit'): void {
    this.locationNotifications.forEach((notification) => {
      if (notification.geofenceId === regionId) {
        if (notification.trigger === 'both' || notification.trigger === event) {
          this.showNotification(notification);
        }
      }
    });
  }
}

/**
 * Singleton instance of NotificationService.
 * Use this for dependency injection across the app.
 */
export const notificationService = new NotificationService();

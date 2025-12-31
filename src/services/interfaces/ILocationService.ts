/**
 * ILocationService Interface
 * 
 * Defines the contract for location-related operations in HereNow.
 * This abstraction allows for easy testing and swapping implementations.
 * Designed to be extendable for future geofence trigger support.
 */

/**
 * Represents a geographic coordinate with latitude and longitude.
 * Used throughout the app for positioning and distance calculations.
 */
export interface Coordinates {
  /** The latitude in decimal degrees (-90 to 90) */
  latitude: number;
  /** The longitude in decimal degrees (-180 to 180) */
  longitude: number;
}

/**
 * Extended location data including accuracy and timestamp.
 * Provides more context about the location reading quality.
 */
export interface LocationData extends Coordinates {
  /** Accuracy of the location reading in meters */
  accuracy: number;
  /** Timestamp when the location was captured */
  timestamp: Date;
  /** Optional city name derived from reverse geocoding */
  city?: string;
  /** Optional neighborhood or area name */
  neighborhood?: string;
}

/**
 * Defines a geographic region for monitoring.
 * Used for geofence triggers and area-based event matching.
 */
export interface GeofenceRegion {
  /** Unique identifier for this geofence region */
  id: string;
  /** Human-readable name for the region */
  name: string;
  /** Center point coordinates of the region */
  center: Coordinates;
  /** Radius of the region in meters */
  radiusMeters: number;
  /** Whether monitoring is currently active */
  isActive: boolean;
}

/**
 * Callback type for location updates.
 * Called whenever the user's location changes significantly.
 */
export type LocationUpdateCallback = (location: LocationData) => void;

/**
 * Callback type for geofence events.
 * Called when user enters or exits a monitored region.
 */
export type GeofenceEventCallback = (
  region: GeofenceRegion,
  event: 'enter' | 'exit'
) => void;

/**
 * The main location service interface.
 * Implementations must provide all these methods for location functionality.
 */
export interface ILocationService {
  /**
   * Requests permission to access the user's location.
   * Should be called before any other location operations.
   * @returns Promise resolving to true if permission granted, false otherwise
   */
  requestPermission(): Promise<boolean>;

  /**
   * Checks if location permission has been granted.
   * @returns Promise resolving to the current permission state
   */
  hasPermission(): Promise<boolean>;

  /**
   * Gets the current location of the user.
   * This is a one-time read, not continuous monitoring.
   * @returns Promise resolving to the current LocationData
   * @throws Error if permission denied or location unavailable
   */
  getCurrentLocation(): Promise<LocationData>;

  /**
   * Starts continuous location monitoring.
   * Updates will be delivered through the provided callback.
   * @param callback Function to call on each location update
   */
  startLocationUpdates(callback: LocationUpdateCallback): void;

  /**
   * Stops continuous location monitoring.
   * Conserves battery when location updates aren't needed.
   */
  stopLocationUpdates(): void;

  /**
   * Calculates the distance between two coordinates.
   * Uses the Haversine formula for accurate Earth-surface distance.
   * @param from Starting coordinates
   * @param to Ending coordinates
   * @returns Distance in meters
   */
  calculateDistance(from: Coordinates, to: Coordinates): number;

  /**
   * Registers a geofence region for monitoring.
   * Will trigger callbacks when user enters or exits the region.
   * @param region The geofence region to monitor
   * @param callback Function to call on enter/exit events
   */
  registerGeofence(region: GeofenceRegion, callback: GeofenceEventCallback): void;

  /**
   * Removes a geofence region from monitoring.
   * @param regionId The ID of the region to stop monitoring
   */
  unregisterGeofence(regionId: string): void;

  /**
   * Gets all currently registered geofence regions.
   * @returns Array of active GeofenceRegion objects
   */
  getActiveGeofences(): GeofenceRegion[];
}

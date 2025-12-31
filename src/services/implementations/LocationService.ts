/**
 * LocationService Implementation
 * 
 * Provides location functionality using the browser's Geolocation API.
 * Implements the ILocationService interface for consistent usage across the app.
 * Designed to be extended for native Capacitor integration later.
 */

import {
  ILocationService,
  Coordinates,
  LocationData,
  GeofenceRegion,
  LocationUpdateCallback,
  GeofenceEventCallback,
} from '../interfaces/ILocationService';

/**
 * Configuration options for the location service.
 * Controls accuracy and update frequency.
 */
interface LocationServiceConfig {
  /** Enable high accuracy mode (uses more battery) */
  enableHighAccuracy: boolean;
  /** Maximum age of cached position in milliseconds */
  maximumAge: number;
  /** Timeout for location requests in milliseconds */
  timeout: number;
  /** Minimum distance change to trigger update in meters */
  distanceFilter: number;
}

/**
 * Default configuration for location service.
 * Balanced between accuracy and battery consumption.
 */
const DEFAULT_CONFIG: LocationServiceConfig = {
  enableHighAccuracy: true,
  maximumAge: 30000, // 30 seconds
  timeout: 15000, // 15 seconds
  distanceFilter: 100, // 100 meters
};

/**
 * Earth's radius in meters for distance calculations.
 * Using mean radius for Haversine formula.
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Converts degrees to radians.
 * Helper function for distance calculations.
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * LocationService class implementing ILocationService.
 * Manages all location-related functionality for the app.
 */
export class LocationService implements ILocationService {
  /** Configuration for location behavior */
  private config: LocationServiceConfig;
  
  /** Currently active watch position ID (for stopping updates) */
  private watchId: number | null = null;
  
  /** Registered geofences being monitored */
  private geofences: Map<string, { region: GeofenceRegion; callback: GeofenceEventCallback }> = new Map();
  
  /** Last known location (for geofence checking) */
  private lastLocation: LocationData | null = null;

  /**
   * Creates a new LocationService instance.
   * @param config Optional configuration overrides
   */
  constructor(config: Partial<LocationServiceConfig> = {}) {
    // Merge provided config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Requests location permission from the user.
   * Uses a test location request to trigger the permission prompt.
   */
  async requestPermission(): Promise<boolean> {
    // Check if geolocation is supported
    if (!('geolocation' in navigator)) {
      console.warn('Geolocation is not supported by this browser');
      return false;
    }

    try {
      // Trigger permission prompt by requesting current position
      await this.getCurrentLocation();
      return true;
    } catch (error) {
      // Permission denied or other error
      console.error('Location permission request failed:', error);
      return false;
    }
  }

  /**
   * Checks if location permission is granted.
   * Uses the Permissions API when available.
   */
  async hasPermission(): Promise<boolean> {
    // Check if Permissions API is available
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state === 'granted';
      } catch {
        // Permissions API query failed, fall back to trying geolocation
      }
    }

    // Fallback: try to get location and see if it works
    try {
      await this.getCurrentLocation();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the current location of the user.
   * Returns a promise that resolves with location data.
   */
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      // Check for geolocation support
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      // Request current position with configured options
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Convert browser position to our LocationData format
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          };
          
          // Update last known location for geofence checking
          this.lastLocation = locationData;
          
          resolve(locationData);
        },
        (error) => {
          // Handle specific error types
          let message: string;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
            default:
              message = 'Unknown location error';
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: this.config.enableHighAccuracy,
          maximumAge: this.config.maximumAge,
          timeout: this.config.timeout,
        }
      );
    });
  }

  /**
   * Starts continuous location monitoring.
   * Delivers updates through the provided callback.
   */
  startLocationUpdates(callback: LocationUpdateCallback): void {
    // Stop any existing watch first
    this.stopLocationUpdates();

    // Check for geolocation support
    if (!('geolocation' in navigator)) {
      console.error('Geolocation is not supported');
      return;
    }

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Convert to our LocationData format
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        };

        // Update last known location
        this.lastLocation = locationData;

        // Check geofences for enter/exit events
        this.checkGeofences(locationData);

        // Deliver update to callback
        callback(locationData);
      },
      (error) => {
        console.error('Location update error:', error.message);
      },
      {
        enableHighAccuracy: this.config.enableHighAccuracy,
        maximumAge: this.config.maximumAge,
        timeout: this.config.timeout,
      }
    );
  }

  /**
   * Stops continuous location monitoring.
   * Clears the watch and saves battery.
   */
  stopLocationUpdates(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Calculates distance between two coordinates using Haversine formula.
   * Returns distance in meters, accounting for Earth's curvature.
   */
  calculateDistance(from: Coordinates, to: Coordinates): number {
    // Convert coordinates to radians
    const lat1 = toRadians(from.latitude);
    const lat2 = toRadians(to.latitude);
    const deltaLat = toRadians(to.latitude - from.latitude);
    const deltaLon = toRadians(to.longitude - from.longitude);

    // Haversine formula
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate distance in meters
    return EARTH_RADIUS_METERS * c;
  }

  /**
   * Registers a geofence region for monitoring.
   * Will trigger callbacks when user enters or exits.
   */
  registerGeofence(region: GeofenceRegion, callback: GeofenceEventCallback): void {
    // Store the geofence and its callback
    this.geofences.set(region.id, { region, callback });

    // Check if user is already inside the region
    if (this.lastLocation) {
      const distance = this.calculateDistance(this.lastLocation, region.center);
      if (distance <= region.radiusMeters) {
        // User is inside the region, mark as active
        region.isActive = true;
        // Optionally trigger enter callback immediately
        callback(region, 'enter');
      }
    }
  }

  /**
   * Unregisters a geofence region.
   * Stops monitoring for the specified region.
   */
  unregisterGeofence(regionId: string): void {
    this.geofences.delete(regionId);
  }

  /**
   * Gets all currently registered geofence regions.
   */
  getActiveGeofences(): GeofenceRegion[] {
    return Array.from(this.geofences.values()).map((entry) => entry.region);
  }

  /**
   * Checks all registered geofences against current location.
   * Triggers enter/exit callbacks as appropriate.
   * @param currentLocation The current location to check against
   */
  private checkGeofences(currentLocation: LocationData): void {
    this.geofences.forEach(({ region, callback }) => {
      // Calculate distance from current location to geofence center
      const distance = this.calculateDistance(currentLocation, region.center);
      const isInside = distance <= region.radiusMeters;

      // Check for state change
      if (isInside && !region.isActive) {
        // User just entered the region
        region.isActive = true;
        callback(region, 'enter');
      } else if (!isInside && region.isActive) {
        // User just exited the region
        region.isActive = false;
        callback(region, 'exit');
      }
    });
  }
}

/**
 * Singleton instance of LocationService.
 * Use this for dependency injection across the app.
 */
export const locationService = new LocationService();

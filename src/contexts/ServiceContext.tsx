/**
 * ServiceContext
 * 
 * React Context for dependency injection of services throughout the app.
 * Allows components to access services without prop drilling.
 * Makes testing easier by allowing service mocking.
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import {
  ILocationService,
  INotificationService,
  IPersistenceService,
  locationService,
  notificationService,
  persistenceService,
} from '@/services';

/**
 * Interface defining all available services.
 * Used for type-safe service access throughout the app.
 */
export interface ServiceContextType {
  /** Location service for GPS and geofencing */
  location: ILocationService;
  /** Notification service for alerts and reminders */
  notification: INotificationService;
  /** Persistence service for data storage */
  persistence: IPersistenceService;
}

/**
 * Default service instances.
 * Uses the singleton implementations from the services module.
 */
const defaultServices: ServiceContextType = {
  location: locationService,
  notification: notificationService,
  persistence: persistenceService,
};

/**
 * The React Context for services.
 * Initialized with default implementations.
 */
const ServiceContext = createContext<ServiceContextType>(defaultServices);

/**
 * Props for the ServiceProvider component.
 */
interface ServiceProviderProps {
  /** Child components that will have access to services */
  children: ReactNode;
  /** Optional custom services for testing or different environments */
  services?: Partial<ServiceContextType>;
}

/**
 * ServiceProvider Component
 * 
 * Wraps the app to provide service access via context.
 * Allows overriding services for testing purposes.
 * 
 * @example
 * // In production
 * <ServiceProvider>
 *   <App />
 * </ServiceProvider>
 * 
 * @example
 * // In tests
 * <ServiceProvider services={{ location: mockLocationService }}>
 *   <ComponentUnderTest />
 * </ServiceProvider>
 */
export function ServiceProvider({ children, services = {} }: ServiceProviderProps) {
  /**
   * Merge provided services with defaults.
   * Memoized to prevent unnecessary re-renders.
   */
  const contextValue = useMemo(() => ({
    ...defaultServices,
    ...services,
  }), [services]);

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
}

/**
 * useServices Hook
 * 
 * Provides access to all services from any component.
 * Must be used within a ServiceProvider.
 * 
 * @example
 * function MyComponent() {
 *   const { location, persistence } = useServices();
 *   // Use services...
 * }
 */
export function useServices(): ServiceContextType {
  const context = useContext(ServiceContext);
  
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  
  return context;
}

/**
 * useLocationService Hook
 * 
 * Convenience hook for accessing just the location service.
 * 
 * @example
 * function LocationComponent() {
 *   const locationService = useLocationService();
 *   // Use location service...
 * }
 */
export function useLocationService(): ILocationService {
  const { location } = useServices();
  return location;
}

/**
 * useNotificationService Hook
 * 
 * Convenience hook for accessing just the notification service.
 */
export function useNotificationService(): INotificationService {
  const { notification } = useServices();
  return notification;
}

/**
 * usePersistenceService Hook
 * 
 * Convenience hook for accessing just the persistence service.
 */
export function usePersistenceService(): IPersistenceService {
  const { persistence } = useServices();
  return persistence;
}

/**
 * Settings Page
 * 
 * App settings and configuration including:
 * - Notification preferences
 * - Location settings
 * - Event preferences
 * - Privacy settings
 * - Account management
 * 
 * Uses useProfileViewModel for preference management.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useProfileViewModel } from '@/viewmodels';
import { 
  Bell, 
  MapPin, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Clock,
  Users
} from 'lucide-react';

/**
 * Settings section configuration type.
 * Defines structure for each settings item.
 */
interface SettingItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  type: 'toggle' | 'link' | 'button';
  value?: boolean;
  danger?: boolean;
}

/**
 * Settings Page Component
 * 
 * Provides access to all app settings organized by category.
 * Uses MVVM pattern with useProfileViewModel for state.
 */
const Settings = () => {
  /**
   * Get profile state and update function from ViewModel.
   * Used for managing user preferences.
   */
  const { profile } = useProfileViewModel();

  /**
   * Get preferences from profile, or use defaults if not loaded.
   */
  const preferences = profile?.preferences || {
    priceRange: 'medium',
    activityTypes: ['social'],
    durationRange: 'medium',
    maxDistanceMiles: 25,
    meetupType: 'both',
    interests: [],
  };

  /**
   * Notification settings configuration.
   * Controls what notifications the user receives.
   */
  const notificationSettings: SettingItem[] = [
    {
      id: 'daily_reminder',
      label: 'Daily Event Reminder',
      description: 'Get notified about today\'s event',
      icon: Bell,
      type: 'toggle',
      value: true,
    },
    {
      id: 'event_updates',
      label: 'Event Updates',
      description: 'Changes to events you\'re attending',
      icon: Clock,
      type: 'toggle',
      value: true,
    },
    {
      id: 'friend_activity',
      label: 'Friend Activity',
      description: 'When friends join events',
      icon: Users,
      type: 'toggle',
      value: false,
    },
  ];

  /**
   * Location settings configuration.
   * Controls location-based features.
   */
  const locationSettings: SettingItem[] = [
    {
      id: 'location_access',
      label: 'Location Access',
      description: 'Required for nearby events',
      icon: MapPin,
      type: 'toggle',
      value: true,
    },
    {
      id: 'radius',
      label: 'Search Radius',
      description: `${preferences.maxDistanceMiles || 25} miles`,
      icon: MapPin,
      type: 'link',
    },
  ];

  /**
   * Handles toggling notification settings.
   * For now, just logs the change.
   * 
   * @param settingId - The ID of the setting being toggled
   */
  const handleNotificationToggle = (settingId: string) => {
    console.log('Toggle notification:', settingId);
  };

  /**
   * Handles toggling location settings.
   * For now, just logs the change.
   * 
   * @param settingId - The ID of the setting being toggled
   */
  const handleLocationToggle = (settingId: string) => {
    console.log('Toggle location:', settingId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================ */}
      {/* Fixed header */}
      {/* ============================================ */}
      <Header hasNotifications={false} />

      {/* ============================================ */}
      {/* Main scrollable content */}
      {/* ============================================ */}
      <main className="pt-16 pb-20 px-4 max-w-lg mx-auto">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6"
        >
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your preferences
          </p>
        </motion.div>

        {/* ============================================ */}
        {/* Notifications Section */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h3>
          
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {notificationSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4"
                >
                  {/* Setting info */}
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-foreground">{setting.label}</p>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    )}
                  </div>
                  
                  {/* Toggle switch */}
                  <Switch
                    checked={setting.value}
                    onCheckedChange={() => handleNotificationToggle(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        {/* ============================================ */}
        {/* Location Section */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </h3>
          
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {locationSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4"
                >
                  {/* Setting info */}
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-foreground">{setting.label}</p>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    )}
                  </div>
                  
                  {/* Toggle or link indicator */}
                  {setting.type === 'toggle' ? (
                    <Switch
                      checked={setting.value}
                      onCheckedChange={() => handleLocationToggle(setting.id)}
                    />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        {/* ============================================ */}
        {/* Privacy & Help Section */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy & Support
          </h3>
          
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {/* Privacy Policy link */}
              <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Privacy Policy</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              {/* Help & Support link */}
              <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Help & Support</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </motion.section>

        {/* ============================================ */}
        {/* Logout Button */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            variant="outline" 
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </motion.section>

        {/* App version footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          HereNow v1.0.0
        </motion.p>
      </main>

      {/* ============================================ */}
      {/* Fixed bottom navigation */}
      {/* ============================================ */}
      <BottomNav />
    </div>
  );
};

export default Settings;

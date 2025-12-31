/**
 * Header Component
 * 
 * Top app bar with logo and quick actions.
 * Features location display and notification access.
 * Adapts to different screen contexts.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** Current location name to display */
  locationName?: string;
  /** Whether there are unread notifications */
  hasNotifications?: boolean;
  /** Callback when notification button is clicked */
  onNotificationClick?: () => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * Header Component
 * 
 * Renders the top navigation bar with branding and actions.
 * Fixed position with blur background for modern feel.
 */
export function Header({
  locationName = 'San Francisco',
  hasNotifications = false,
  onNotificationClick,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-background/80 backdrop-blur-lg border-b border-border/50',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* ============================================ */}
        {/* Logo / Brand */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1"
        >
          {/* App name with gradient */}
          <h1 className="text-xl font-bold text-gradient-herenow">
            HereNow
          </h1>
        </motion.div>

        {/* ============================================ */}
        {/* Location Display */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">{locationName}</span>
        </motion.div>

        {/* ============================================ */}
        {/* Notification Button */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationClick}
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            
            {/* Notification badge */}
            {hasNotifications && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'absolute top-1.5 right-1.5',
                  'w-2 h-2 rounded-full bg-primary'
                )}
              />
            )}
          </Button>
        </motion.div>
      </div>
    </header>
  );
}

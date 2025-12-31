/**
 * AttendeePreview Component
 * 
 * Displays a preview of users attending an event.
 * Shows overlapping avatar circles with a count badge.
 * Encourages social engagement by showing who's going.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Represents a preview user for display.
 */
interface AttendeeUser {
  /** Unique user ID */
  id: string;
  /** User's display name */
  name: string;
  /** URL to avatar image */
  avatarUrl?: string;
}

/**
 * Props for the AttendeePreview component.
 */
interface AttendeePreviewProps {
  /** Array of attending users to display */
  attendees: AttendeeUser[];
  /** Total number of attendees (may be more than shown) */
  totalCount: number;
  /** Maximum avatars to display */
  maxDisplayed?: number;
  /** Optional className for styling */
  className?: string;
  /** Click handler for the component */
  onClick?: () => void;
}

/**
 * Default avatar colors for users without profile pictures.
 * Creates a visually pleasing variety.
 */
const AVATAR_COLORS = [
  'bg-primary',
  'bg-accent',
  'bg-secondary',
  'bg-physical',
  'bg-mental',
  'bg-social',
];

/**
 * Gets initials from a name for avatar display.
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * AttendeePreview Component
 * 
 * Shows a compact preview of event attendees.
 * Features overlapping avatars and a total count.
 */
export function AttendeePreview({
  attendees,
  totalCount,
  maxDisplayed = 5,
  className,
  onClick,
}: AttendeePreviewProps) {
  /** Limit the displayed attendees */
  const displayedAttendees = attendees.slice(0, maxDisplayed);
  
  /** Calculate remaining count */
  const remainingCount = totalCount - displayedAttendees.length;

  return (
    <motion.div
      /** Hover animation */
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      /** Click handler */
      onClick={onClick}
      /** Styling */
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-muted/50 hover:bg-muted transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* ============================================ */}
      {/* Avatar Stack */}
      {/* ============================================ */}
      <div className="flex -space-x-2">
        {displayedAttendees.map((attendee, index) => (
          <motion.div
            key={attendee.id}
            /** Staggered entrance animation */
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            /** Avatar styling */
            className={cn(
              'w-8 h-8 rounded-full border-2 border-card',
              'flex items-center justify-center text-xs font-medium',
              'overflow-hidden',
              !attendee.avatarUrl && AVATAR_COLORS[index % AVATAR_COLORS.length],
              !attendee.avatarUrl && 'text-primary-foreground'
            )}
            /** Z-index for overlap effect */
            style={{ zIndex: displayedAttendees.length - index }}
          >
            {attendee.avatarUrl ? (
              <img
                src={attendee.avatarUrl}
                alt={attendee.name}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(attendee.name)
            )}
          </motion.div>
        ))}

        {/* Remaining count badge */}
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: displayedAttendees.length * 0.05 }}
            className={cn(
              'w-8 h-8 rounded-full border-2 border-card',
              'flex items-center justify-center text-xs font-medium',
              'bg-primary text-primary-foreground'
            )}
          >
            +{remainingCount}
          </motion.div>
        )}
      </div>

      {/* ============================================ */}
      {/* Attendee Text */}
      {/* ============================================ */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {totalCount === 0 
            ? 'No one yet'
            : totalCount === 1
              ? `${attendees[0]?.name || '1 person'} is going`
              : `${totalCount} people going`
          }
        </p>
        <p className="text-xs text-muted-foreground">
          {totalCount === 0 
            ? 'Be the first to join!'
            : 'Tap to see who\'s attending'
          }
        </p>
      </div>

      {/* Icon */}
      <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </motion.div>
  );
}

/**
 * Export mock attendees for development/testing.
 */
export const MOCK_ATTENDEES: AttendeeUser[] = [
  { id: '1', name: 'Sarah Chen' },
  { id: '2', name: 'Mike Rodriguez' },
  { id: '3', name: 'Emma Wilson' },
  { id: '4', name: 'James Liu' },
  { id: '5', name: 'Olivia Brown' },
  { id: '6', name: 'Daniel Kim' },
  { id: '7', name: 'Sophia Martinez' },
];

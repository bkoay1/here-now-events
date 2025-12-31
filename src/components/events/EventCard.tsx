/**
 * EventCard Component
 * 
 * Displays a daily event with all its details.
 * Features animated reveal, attendee avatars, and action buttons.
 * Central visual element of the HereNow experience.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Tag,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { DailyEvent, ActivityType } from '@/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Props for the EventCard component.
 */
interface EventCardProps {
  /** The event to display */
  event: DailyEvent;
  /** Whether the user is attending */
  isAttending: boolean;
  /** Callback when attendance button is clicked */
  onToggleAttendance: () => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * Maps activity types to their display properties.
 * Provides consistent styling across the app.
 */
const ACTIVITY_CONFIG: Record<ActivityType, { label: string; color: string; icon: string }> = {
  [ActivityType.PHYSICAL]: { label: 'Physical', color: 'bg-physical/20 text-physical', icon: '🏃' },
  [ActivityType.MENTAL]: { label: 'Mental', color: 'bg-mental/20 text-mental', icon: '🧠' },
  [ActivityType.SOCIAL]: { label: 'Social', color: 'bg-social/20 text-social', icon: '👥' },
  [ActivityType.CREATIVE]: { label: 'Creative', color: 'bg-accent/20 text-accent-foreground', icon: '🎨' },
  [ActivityType.RELAXATION]: { label: 'Relaxation', color: 'bg-secondary text-secondary-foreground', icon: '🧘' },
};

/**
 * Formats a price for display.
 * Shows "Free" for $0, otherwise formats as currency.
 */
function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return `$${price}`;
}

/**
 * Formats a time for display.
 * Shows hours and minutes in 12-hour format.
 */
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Calculates duration between two dates in hours.
 */
function getDuration(start: Date, end: Date): string {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const hours = (endMs - startMs) / (1000 * 60 * 60);
  
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  return `${hours.toFixed(1)} hrs`;
}

/**
 * EventCard Component
 * 
 * Renders a beautiful, animated card for the daily event.
 * Includes all event details and interactive attendance button.
 */
export function EventCard({ 
  event, 
  isAttending, 
  onToggleAttendance,
  className 
}: EventCardProps) {
  // Get activity type configuration for styling
  const activityConfig = ACTIVITY_CONFIG[event.activityType];

  return (
    <motion.div
      /** Initial animation state - slightly below and scaled down */
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      /** Final animation state - fully visible */
      animate={{ opacity: 1, y: 0, scale: 1 }}
      /** Animation timing configuration */
      transition={{ duration: 0.5, ease: 'easeOut' }}
      /** Styling classes for the card */
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card shadow-soft',
        'border border-border/50',
        className
      )}
    >
      {/* ============================================ */}
      {/* Event Image / Gradient Header */}
      {/* ============================================ */}
      <div className="relative h-48 bg-gradient-herenow">
        {/* Decorative sparkle icon */}
        <div className="absolute top-4 right-4">
          <motion.div
            /** Subtle floating animation */
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-6 w-6 text-primary-foreground/80" />
          </motion.div>
        </div>

        {/* Activity type badge */}
        <div className="absolute top-4 left-4">
          <Badge className={cn('font-medium', activityConfig.color)}>
            <span className="mr-1">{activityConfig.icon}</span>
            {activityConfig.label}
          </Badge>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-4 right-4">
          <Badge 
            variant="secondary" 
            className="bg-card/90 backdrop-blur-sm font-semibold text-lg px-3 py-1"
          >
            {formatPrice(event.price)}
          </Badge>
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
      </div>

      {/* ============================================ */}
      {/* Event Content */}
      {/* ============================================ */}
      <div className="p-5 space-y-4">
        {/* Event title */}
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          {event.title}
        </h2>

        {/* Event description */}
        <p className="text-muted-foreground leading-relaxed line-clamp-3">
          {event.description}
        </p>

        {/* Event meta information */}
        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.address}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
              <span className="text-muted-foreground/60 ml-2">
                ({getDuration(event.startTime, event.endTime)})
              </span>
            </span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>
              {event.currentAttendees} / {event.maxAttendees} going
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {event.tags.slice(0, 4).map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="text-xs font-normal"
            >
              #{tag}
            </Badge>
          ))}
        </div>

        {/* ============================================ */}
        {/* Attendance Button */}
        {/* ============================================ */}
        <Button
          /** Full width button */
          className="w-full mt-4"
          /** Change variant based on attendance state */
          variant={isAttending ? 'secondary' : 'default'}
          /** Size for better touch target */
          size="lg"
          /** Handle click */
          onClick={onToggleAttendance}
        >
          {isAttending ? (
            <>
              <Calendar className="mr-2 h-5 w-5" />
              You're Going! 🎉
            </>
          ) : (
            <>
              <Users className="mr-2 h-5 w-5" />
              I'm In!
            </>
          )}
        </Button>

        {/* Sponsor badge if present */}
        {event.sponsor && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Sponsored by <span className="font-medium">{event.sponsor.name}</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

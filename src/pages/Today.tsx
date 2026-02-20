/**
 * Today Page (Home / Daily Event)
 * 
 * The main screen of HereNow showing today's daily event.
 * A countdown timer counts down to 12pm, then the event is revealed.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { EventCard, EventCountdown, AttendeePreview, MOCK_ATTENDEES } from '@/components/events';
import { useEventViewModel } from '@/viewmodels';
import { Loader2 } from 'lucide-react';

const Today = () => {
  const {
    event,
    isLoading,
    isRevealed,
    isAttending,
    timeUntilReveal,
    toggleAttendance,
  } = useEventViewModel();

  return (
    <div className="min-h-screen bg-background">
      <Header hasNotifications={true} />

      <main className="pt-16 pb-20 px-4 max-w-lg mx-auto">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6"
        >
          <h2 className="text-2xl font-bold text-foreground">Today's Adventure</h2>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </motion.div>

        {/* Countdown / Reveal status */}
        <EventCountdown
          isRevealed={isRevealed}
          timeRemaining={timeUntilReveal}
          className="mb-6"
        />

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Revealed event */}
        {isRevealed && event && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <AttendeePreview
              attendees={MOCK_ATTENDEES}
              totalCount={event.currentAttendees}
            />
            <EventCard
              event={event}
              isAttending={isAttending}
              onToggleAttendance={toggleAttendance}
            />
          </motion.div>
        )}

        {/* Pre-reveal teaser */}
        {!isRevealed && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-6 rounded-2xl bg-muted/50 border border-border/50"
          >
            <p className="text-lg font-medium text-foreground mb-2">
              🎲 Something exciting awaits...
            </p>
            <p className="text-muted-foreground">
              Your daily event will be revealed at 12:00 PM!
            </p>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Today;

/**
 * Today Page (Home / Daily Event)
 * 
 * The main screen of HereNow showing today's daily event.
 * Users watch ads to unlock, then see the event details.
 * This is the primary experience users see when opening the app.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { EventCard, AdWatchProgress, AttendeePreview, MOCK_ATTENDEES } from '@/components/events';
import { useEventViewModel } from '@/viewmodels';
import { Loader2 } from 'lucide-react';

/**
 * Today Page Component
 * 
 * Displays the daily event experience with ad-unlock flow.
 * Users must watch 3 ads to reveal today's unique event.
 */
const Today = () => {
  /**
   * Get event state and actions from ViewModel.
   * This separates UI from business logic following MVVM pattern.
   */
  const {
    event,        // Today's event data (null if not unlocked)
    isLoading,    // Whether event data is being fetched
    isUnlocked,   // Whether user has watched 3 ads
    adsWatched,   // Number of ads watched (0-3)
    isAttending,  // Whether user is attending this event
    watchAd,      // Function to record ad watch
    toggleAttendance, // Function to toggle attendance
  } = useEventViewModel();

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================ */}
      {/* Fixed header with app branding and actions */}
      {/* ============================================ */}
      <Header hasNotifications={true} />

      {/* ============================================ */}
      {/* Main content area with padding for fixed nav */}
      {/* ============================================ */}
      <main className="pt-16 pb-20 px-4 max-w-lg mx-auto">
        {/* Page title and current date */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6"
        >
          <h2 className="text-2xl font-bold text-foreground">Today's Adventure</h2>
          <p className="text-muted-foreground mt-1">
            {/* Display current date in readable format */}
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        {/* ============================================ */}
        {/* Ad unlock progress tracker */}
        {/* Shows 3 circles for ads, fills as user watches */}
        {/* ============================================ */}
        <AdWatchProgress
          adsWatched={adsWatched}
          isUnlocked={isUnlocked}
          onWatchAd={watchAd}
          className="mb-6"
        />

        {/* ============================================ */}
        {/* Loading state while fetching event data */}
        {/* ============================================ */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* ============================================ */}
        {/* Event card when unlocked (3 ads watched) */}
        {/* Shows attendees and full event details */}
        {/* ============================================ */}
        {isUnlocked && event && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Preview of who's attending */}
            <AttendeePreview
              attendees={MOCK_ATTENDEES}
              totalCount={event.currentAttendees}
            />

            {/* Main event card with all details */}
            <EventCard
              event={event}
              isAttending={isAttending}
              onToggleAttendance={toggleAttendance}
            />
          </motion.div>
        )}

        {/* ============================================ */}
        {/* Teaser message when event is still locked */}
        {/* Encourages user to watch more ads */}
        {/* ============================================ */}
        {!isUnlocked && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-6 rounded-2xl bg-muted/50 border border-border/50"
          >
            <p className="text-lg font-medium text-foreground mb-2">
              🎲 Something exciting awaits...
            </p>
            <p className="text-muted-foreground">
              Watch {3 - adsWatched} more ad{3 - adsWatched !== 1 ? 's' : ''} to reveal today's unique event!
            </p>
          </motion.div>
        )}
      </main>

      {/* ============================================ */}
      {/* Fixed bottom navigation bar */}
      {/* ============================================ */}
      <BottomNav />
    </div>
  );
};

export default Today;

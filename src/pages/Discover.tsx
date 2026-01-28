/**
 * Discover Page
 * 
 * Browse and explore upcoming events in your area.
 * Users can see what's happening nearby and filter by category.
 * Will integrate with LocationService for proximity-based results.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Sparkles, TrendingUp, Heart } from 'lucide-react';

/**
 * Mock categories for event filtering.
 * In production, these would come from the backend.
 */
const EVENT_CATEGORIES = [
  { id: 'outdoor', label: 'Outdoor', icon: '🌲', count: 12 },
  { id: 'food', label: 'Food & Drink', icon: '🍕', count: 8 },
  { id: 'wellness', label: 'Wellness', icon: '🧘', count: 6 },
  { id: 'social', label: 'Social', icon: '🎉', count: 15 },
  { id: 'creative', label: 'Creative', icon: '🎨', count: 4 },
  { id: 'sports', label: 'Sports', icon: '⚽', count: 9 },
];

/**
 * Mock upcoming events for display.
 * In production, these would come from an API.
 */
const UPCOMING_EVENTS = [
  {
    id: '1',
    title: 'Sunrise Hike at Twin Peaks',
    date: 'Tomorrow',
    time: '6:00 AM',
    attendees: 18,
    category: 'outdoor',
  },
  {
    id: '2',
    title: 'Coffee Tasting Tour',
    date: 'Saturday',
    time: '10:00 AM',
    attendees: 12,
    category: 'food',
  },
  {
    id: '3',
    title: 'Beach Volleyball Meetup',
    date: 'Sunday',
    time: '2:00 PM',
    attendees: 24,
    category: 'sports',
  },
];

/**
 * Discover Page Component
 * 
 * Displays event discovery features including:
 * - Category browsing
 * - Upcoming events list
 * - Trending and popular events
 */
const Discover = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* ============================================ */}
      {/* Fixed header with app branding */}
      {/* ============================================ */}
      <Header hasNotifications={false} />

      {/* ============================================ */}
      {/* Main scrollable content area */}
      {/* ============================================ */}
      <main className="pt-16 pb-20 px-4 max-w-lg mx-auto">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6"
        >
          <h2 className="text-2xl font-bold text-foreground">Discover</h2>
          <p className="text-muted-foreground mt-1">
            Find exciting events near you
          </p>
        </motion.div>

        {/* ============================================ */}
        {/* Event Categories Grid */}
        {/* Quick filters for different event types */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Categories
          </h3>
          
          {/* Grid of category cards */}
          <div className="grid grid-cols-3 gap-3">
            {EVENT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                className="flex flex-col items-center p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all"
              >
                {/* Category emoji icon */}
                <span className="text-2xl mb-2">{category.icon}</span>
                {/* Category name */}
                <span className="text-sm font-medium text-foreground">{category.label}</span>
                {/* Event count badge */}
                <span className="text-xs text-muted-foreground mt-1">{category.count} events</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ============================================ */}
        {/* Upcoming Events Section */}
        {/* List of events happening soon */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Coming Up
          </h3>
          
          {/* List of upcoming event cards */}
          <div className="space-y-3">
            {UPCOMING_EVENTS.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Event title */}
                  <h4 className="font-semibold text-foreground mb-2">{event.title}</h4>
                  
                  {/* Event metadata row */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {/* Date and time */}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {event.date} · {event.time}
                    </span>
                    
                    {/* Attendee count */}
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.attendees}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* ============================================ */}
        {/* Friends Activity Section (Placeholder) */}
        {/* Shows what friends are attending */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Friends Going
          </h3>
          
          {/* Empty state - no friends connected yet */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Connect with friends to see what events they're attending!
              </p>
              <Badge variant="secondary" className="mt-3">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      {/* ============================================ */}
      {/* Fixed bottom navigation bar */}
      {/* ============================================ */}
      <BottomNav />
    </div>
  );
};

export default Discover;

/**
 * Profile Page
 * 
 * Displays user profile information including:
 * - Avatar and display name
 * - User rating and stats
 * - Event history
 * - Current preferences
 * 
 * Uses useProfileViewModel for state management.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfileViewModel } from '@/viewmodels';
import { 
  Star, 
  Edit2, 
  ChevronRight,
  Trophy,
  Zap,
  Clock
} from 'lucide-react';

/**
 * Profile Page Component
 * 
 * Shows user profile with stats, preferences, and event history.
 * Follows MVVM pattern using useProfileViewModel for data.
 */
const Profile = () => {
  /**
   * Get profile state and actions from ViewModel.
   * profile contains user data including preferences.
   */
  const { profile, isLoading } = useProfileViewModel();

  /**
   * Get preferences from profile, or use defaults if not loaded.
   * This ensures we always have valid preference values to display.
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
   * Mock user data for display.
   * In production, this would come from authentication/API.
   */
  const mockUser = {
    displayName: profile?.displayName || 'Adventure Seeker',
    email: 'user@example.com',
    avatar: null, // No avatar image yet
    rating: profile?.rating || 4.8,
    eventsAttended: profile?.attendedEventIds?.length || 12,
    memberSince: 'January 2024',
  };

  /**
   * Mock recent events for history display.
   * In production, this would come from the persistence service.
   */
  const recentEvents = [
    { id: '1', title: 'Sunset Yoga', date: 'Jan 15', rating: 5 },
    { id: '2', title: 'Coffee Tasting', date: 'Jan 12', rating: 4 },
    { id: '3', title: 'Beach Cleanup', date: 'Jan 8', rating: 5 },
  ];

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
        {/* ============================================ */}
        {/* Profile Header Section */}
        {/* Avatar, name, and key stats */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 text-center"
        >
          {/* User avatar with fallback initials */}
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20">
            <AvatarImage src={mockUser.avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {/* Extract first letter of display name */}
              {mockUser.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Display name */}
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {mockUser.displayName}
          </h2>

          {/* Member since info */}
          <p className="text-muted-foreground text-sm mb-4">
            Member since {mockUser.memberSince}
          </p>

          {/* Edit profile button */}
          <Button variant="outline" size="sm" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        </motion.section>

        {/* ============================================ */}
        {/* Stats Row */}
        {/* Quick overview of user activity */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="grid grid-cols-3 gap-3">
            {/* Rating stat */}
            <Card className="text-center">
              <CardContent className="p-4">
                <Star className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{mockUser.rating}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </CardContent>
            </Card>

            {/* Events attended stat */}
            <Card className="text-center">
              <CardContent className="p-4">
                <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{mockUser.eventsAttended}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </CardContent>
            </Card>

            {/* Streak stat (placeholder) */}
            <Card className="text-center">
              <CardContent className="p-4">
                <Zap className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Streak</p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* ============================================ */}
        {/* Preferences Summary */}
        {/* Shows current user preferences */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">
            My Preferences
          </h3>
          
          <Card>
            <CardContent className="p-4">
              {/* Preference tags */}
              <div className="flex flex-wrap gap-2">
                {/* Activity type preference */}
                <Badge variant="secondary" className="gap-1">
                  <Zap className="h-3 w-3" />
                  {Array.isArray(preferences.activityTypes) && preferences.activityTypes.length > 0
                    ? preferences.activityTypes.join(', ')
                    : 'Any Activity'}
                </Badge>

                {/* Price range preference */}
                <Badge variant="secondary" className="gap-1">
                  💰 {preferences.priceRange || 'Any'}
                </Badge>

                {/* Duration preference */}
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {preferences.durationRange || 'Any'} duration
                </Badge>

                {/* Meetup type preference */}
                <Badge variant="secondary" className="gap-1">
                  👥 {String(preferences.meetupType) === 'individuals' ? 'Individuals' : 
                      String(preferences.meetupType) === 'groups' ? 'Groups' : 'Both'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ============================================ */}
        {/* Recent Events Section */}
        {/* History of attended events */}
        {/* ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Events
            </h3>
            <Button variant="ghost" size="sm" className="text-primary">
              See All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {/* List of recent events */}
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <Card key={event.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  {/* Event info */}
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                  
                  {/* User's rating for this event */}
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-medium">{event.rating}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      </main>

      {/* ============================================ */}
      {/* Fixed bottom navigation */}
      {/* ============================================ */}
      <BottomNav />
    </div>
  );
};

export default Profile;

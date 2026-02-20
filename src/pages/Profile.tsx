/**
 * Profile Page
 * 
 * Full user profile with preferences as badges, rating system,
 * streaks, recent events, and report button.
 * Uses useProfileViewModel for state management.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useProfileViewModel } from '@/viewmodels';
import {
  Star,
  Edit2,
  ChevronRight,
  Trophy,
  Zap,
  Clock,
  MapPin,
  Flag,
  Flame,
  Shield,
  DollarSign,
  Users,
  Dumbbell,
  Brain,
} from 'lucide-react';

/** Maps price range enum to display labels */
const PRICE_LABELS: Record<string, string> = {
  free: 'Free',
  low: '$1–20',
  medium: '$21–50',
  high: '$51–100',
  premium: '$100+',
};

/** Maps activity type enum to icon + label */
const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; label: string }> = {
  physical: { icon: Dumbbell, label: 'Physical' },
  mental: { icon: Brain, label: 'Mental' },
  social: { icon: Users, label: 'Social' },
  creative: { icon: Zap, label: 'Creative' },
  relaxation: { icon: Clock, label: 'Relaxation' },
};

/** Maps duration enum to display labels */
const DURATION_LABELS: Record<string, string> = {
  short: '< 1 hr',
  medium: '1–2 hrs',
  long: '2–4 hrs',
  extended: '4+ hrs',
};

/** Maps meetup type to display labels */
const MEETUP_LABELS: Record<string, string> = {
  individual: 'Individuals',
  group: 'Groups',
  both: 'Both',
};

/**
 * Mock recent events for history display.
 * In production, this comes from the persistence service.
 */
const RECENT_EVENTS = [
  { id: '1', title: 'Sunset Yoga', date: 'Feb 15', rating: 5, attendees: 8 },
  { id: '2', title: 'Coffee Tasting', date: 'Feb 12', rating: 4, attendees: 12 },
  { id: '3', title: 'Beach Cleanup', date: 'Feb 8', rating: 5, attendees: 20 },
  { id: '4', title: 'Board Game Night', date: 'Feb 3', rating: 4, attendees: 6 },
];

/** Mock badges earned */
const BADGES = [
  { id: 'first_event', emoji: '🎉', label: 'First Event' },
  { id: 'streak_3', emoji: '🔥', label: '3-Day Streak' },
  { id: 'social_butterfly', emoji: '🦋', label: 'Social Butterfly' },
  { id: 'adventurer', emoji: '🧭', label: 'Adventurer' },
  { id: 'five_star', emoji: '⭐', label: '5-Star Rated' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { profile } = useProfileViewModel();
  const [showReportInfo, setShowReportInfo] = useState(false);

  /** Get preferences with defaults */
  const preferences = profile?.preferences || {
    priceRange: 'medium',
    activityTypes: ['social'],
    durationRange: 'medium',
    maxDistanceMiles: 25,
    meetupType: 'both',
    interests: [],
  };

  const mockUser = {
    displayName: profile?.displayName || 'Adventure Seeker',
    bio: profile?.bio || 'Ready for the next adventure ✨',
    avatar: profile?.avatarUrl || null,
    rating: profile?.rating || 4.8,
    ratingCount: profile?.ratingCount || 24,
    eventsAttended: profile?.attendedEventIds?.length || 12,
    streak: 5,
    memberSince: 'January 2024',
  };

  /** Render star rating display */
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'fill-accent text-accent'
            : i < rating
            ? 'fill-accent/50 text-accent'
            : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header hasNotifications={false} />

      <main className="pt-16 pb-20 px-4 max-w-lg mx-auto">
        {/* Profile Header */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 text-center"
        >
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20">
            <AvatarImage src={mockUser.avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {mockUser.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {mockUser.displayName}
          </h2>

          <p className="text-muted-foreground text-sm mb-2">{mockUser.bio}</p>

          {/* Star rating */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {renderStars(mockUser.rating)}
            <span className="text-sm font-medium text-foreground ml-2">
              {mockUser.rating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({mockUser.ratingCount} reviews)
            </span>
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/settings')}
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => setShowReportInfo(!showReportInfo)}
            >
              <Flag className="h-4 w-4" />
              Report
            </Button>
          </div>

          {/* Report info toast */}
          {showReportInfo && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-lg bg-muted text-sm text-muted-foreground"
            >
              <Shield className="h-4 w-4 inline mr-1" />
              Reports are anonymous and used only for matchmaking & safety. The reported user is never notified.
            </motion.div>
          )}
        </motion.section>

        {/* Stats Row */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <CardContent className="p-4">
                <Star className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{mockUser.rating}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{mockUser.eventsAttended}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Flame className="h-5 w-5 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{mockUser.streak}</p>
                <p className="text-xs text-muted-foreground">Streak 🔥</p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Badges */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">Badges</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center min-w-[72px] p-3 rounded-xl bg-card border border-border/50"
              >
                <span className="text-2xl mb-1">{badge.emoji}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Preferences as Badges */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {/* Price badge */}
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <DollarSign className="h-3.5 w-3.5" />
              {PRICE_LABELS[preferences.priceRange] || preferences.priceRange}
            </Badge>

            {/* Activity type badges */}
            {(Array.isArray(preferences.activityTypes) ? preferences.activityTypes : []).map((type) => {
              const info = ACTIVITY_ICONS[type] || { icon: Zap, label: type };
              const Icon = info.icon;
              return (
                <Badge key={type} variant="secondary" className="gap-1.5 py-1.5 px-3">
                  <Icon className="h-3.5 w-3.5" />
                  {info.label}
                </Badge>
              );
            })}

            {/* Duration badge */}
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <Clock className="h-3.5 w-3.5" />
              {DURATION_LABELS[preferences.durationRange] || preferences.durationRange}
            </Badge>

            {/* Distance badge */}
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <MapPin className="h-3.5 w-3.5" />
              {preferences.maxDistanceMiles} mi
            </Badge>

            {/* Meetup type badge */}
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <Users className="h-3.5 w-3.5" />
              {MEETUP_LABELS[String(preferences.meetupType)] || 'Both'}
            </Badge>
          </div>
        </motion.section>

        <Separator className="mb-6" />

        {/* Recent Events */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">Recent Events</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              See All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-2">
            {RECENT_EVENTS.map((event) => (
              <Card key={event.id} className="hover:bg-accent/10 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{event.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      <span>{event.date}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.attendees}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-medium">{event.rating}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;

/**
 * Settings / Edit Profile Page
 * 
 * Full edit profile with preference controls for:
 * - Price Point
 * - Activity Type (Physical vs. Mental)
 * - Duration
 * - Distance from user (capped at 100 miles)
 * 
 * Also includes notification, privacy, and account settings.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useProfileViewModel } from '@/viewmodels';
import { useToast } from '@/hooks/use-toast';
import {
  PriceRange,
  ActivityType,
  DurationRange,
  MeetupType,
} from '@/services';
import {
  Bell,
  MapPin,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Clock,
  Users,
  Save,
  DollarSign,
  Dumbbell,
  Brain,
  Sparkles,
  Heart,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** Price range options for selection */
const PRICE_OPTIONS = [
  { value: PriceRange.FREE, label: 'Free', icon: '🆓' },
  { value: PriceRange.LOW, label: '$1–20', icon: '💵' },
  { value: PriceRange.MEDIUM, label: '$21–50', icon: '💰' },
  { value: PriceRange.HIGH, label: '$51–100', icon: '💎' },
  { value: PriceRange.PREMIUM, label: '$100+', icon: '👑' },
];

/** Activity type options */
const ACTIVITY_OPTIONS = [
  { value: ActivityType.PHYSICAL, label: 'Physical', icon: Dumbbell, desc: 'Sports, hiking, dancing' },
  { value: ActivityType.MENTAL, label: 'Mental', icon: Brain, desc: 'Puzzles, games, learning' },
  { value: ActivityType.SOCIAL, label: 'Social', icon: Users, desc: 'Meetups, dining, parties' },
  { value: ActivityType.CREATIVE, label: 'Creative', icon: Sparkles, desc: 'Art, music, crafts' },
  { value: ActivityType.RELAXATION, label: 'Relaxation', icon: Heart, desc: 'Yoga, spa, meditation' },
];

/** Duration options */
const DURATION_OPTIONS = [
  { value: DurationRange.SHORT, label: '< 1 hour' },
  { value: DurationRange.MEDIUM, label: '1–2 hours' },
  { value: DurationRange.LONG, label: '2–4 hours' },
  { value: DurationRange.EXTENDED, label: '4+ hours' },
];

/** Meetup type options */
const MEETUP_OPTIONS = [
  { value: MeetupType.INDIVIDUAL, label: 'Individuals', desc: 'Meet other solo attendees' },
  { value: MeetupType.GROUP, label: 'Groups', desc: 'Your group meets other groups' },
  { value: MeetupType.BOTH, label: 'Both', desc: 'Open to either' },
];

const Settings = () => {
  const { profile, updateProfile, updatePreferences, isSaving } = useProfileViewModel();
  const { toast } = useToast();

  /** Local form state */
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [priceRange, setPriceRange] = useState<PriceRange>(PriceRange.MEDIUM);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([ActivityType.SOCIAL]);
  const [durationRange, setDurationRange] = useState<DurationRange>(DurationRange.MEDIUM);
  const [maxDistance, setMaxDistance] = useState(25);
  const [meetupType, setMeetupType] = useState<MeetupType>(MeetupType.BOTH);

  /** Sync form state from profile on load */
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      if (profile.preferences) {
        setPriceRange(profile.preferences.priceRange);
        setActivityTypes(profile.preferences.activityTypes);
        setDurationRange(profile.preferences.durationRange);
        setMaxDistance(profile.preferences.maxDistanceMiles);
        setMeetupType(profile.preferences.meetupType);
      }
    }
  }, [profile]);

  /** Toggle an activity type in the selection */
  const toggleActivity = (type: ActivityType) => {
    setActivityTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  /** Save all changes */
  const handleSave = async () => {
    try {
      await updateProfile({ displayName, bio });
      await updatePreferences({
        priceRange,
        activityTypes,
        durationRange,
        maxDistanceMiles: maxDistance,
        meetupType,
        interests: profile?.preferences?.interests || [],
      });
      toast({ title: 'Saved!', description: 'Your profile and preferences have been updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header hasNotifications={false} />

      <main className="pt-16 pb-20 px-4 max-w-lg mx-auto">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-foreground">Edit Profile</h2>
            <p className="text-muted-foreground mt-1">Customize your experience</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </motion.div>

        {/* Basic Info */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic Info
          </h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Meetup Type */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Meetup Type
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {MEETUP_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setMeetupType(option.value)}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all',
                  meetupType === option.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                )}
              >
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-[10px] mt-0.5 leading-tight">{option.desc}</p>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Price Point */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Point
          </h3>
          <div className="flex flex-wrap gap-2">
            {PRICE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setPriceRange(option.value)}
                className={cn(
                  'px-4 py-2.5 rounded-full border text-sm font-medium transition-all',
                  priceRange === option.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                )}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Activity Type */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Activity Types
          </h3>
          <p className="text-xs text-muted-foreground mb-3">Select all that interest you</p>
          <div className="space-y-2">
            {ACTIVITY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = activityTypes.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleActivity(option.value)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                    selected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  )}
                >
                  <Icon className={cn('h-5 w-5', selected ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', selected ? 'text-foreground' : 'text-muted-foreground')}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                  {selected && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Duration */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Preferred Duration
          </h3>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setDurationRange(option.value)}
                className={cn(
                  'px-4 py-2.5 rounded-full border text-sm font-medium transition-all',
                  durationRange === option.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Distance Slider */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Max Distance
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">How far are you willing to travel?</span>
                <span className="text-lg font-bold text-foreground">{maxDistance} mi</span>
              </div>
              <Slider
                value={[maxDistance]}
                onValueChange={(v) => setMaxDistance(v[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>1 mi</span>
                <span>100 mi</span>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="mb-6" />

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {[
                { id: 'daily', label: 'Daily Event Reminder', desc: "Get notified about today's event", value: true },
                { id: 'updates', label: 'Event Updates', desc: "Changes to events you're attending", value: true },
                { id: 'friends', label: 'Friend Activity', desc: 'When friends join events', value: false },
              ].map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-foreground">{s.label}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                  <Switch checked={s.value} />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        {/* Privacy & Help */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy & Support
          </h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <button className="w-full flex items-center justify-between p-4 hover:bg-accent/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Privacy Policy</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-accent/10 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Help & Support</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </motion.section>

        {/* Logout */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </motion.section>

        <p className="text-center text-sm text-muted-foreground mt-8 mb-4">
          HereNow v1.0.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;

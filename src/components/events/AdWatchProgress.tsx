/**
 * AdWatchProgress Component
 * 
 * Displays progress toward unlocking the daily event.
 * Users must watch 3 ads to unlock. Features animated progress.
 * Provides the "Watch Ad" CTA and shows remaining count.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock, Unlock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for the AdWatchProgress component.
 */
interface AdWatchProgressProps {
  /** Number of ads watched (0-3) */
  adsWatched: number;
  /** Whether event is unlocked (ads >= 3) */
  isUnlocked: boolean;
  /** Callback when watch ad button is clicked */
  onWatchAd: () => void;
  /** Whether an ad is currently being loaded/played */
  isLoading?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * Total ads required to unlock the daily event.
 */
const TOTAL_ADS = 3;

/**
 * AdWatchProgress Component
 * 
 * Shows the user's progress toward unlocking today's event.
 * Features a visual progress indicator and action button.
 */
export function AdWatchProgress({
  adsWatched,
  isUnlocked,
  onWatchAd,
  isLoading = false,
  className,
}: AdWatchProgressProps) {
  /** Calculate progress percentage for visual display */
  const progressPercent = Math.min((adsWatched / TOTAL_ADS) * 100, 100);

  return (
    <motion.div
      /** Initial fade-in animation */
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      /** Card styling */
      className={cn(
        'rounded-2xl bg-card border border-border/50 p-6 shadow-soft',
        className
      )}
    >
      {/* ============================================ */}
      {/* Header with icon */}
      {/* ============================================ */}
      <div className="flex items-center gap-3 mb-4">
        {/* Animated lock/unlock icon */}
        <AnimatePresence mode="wait">
          {isUnlocked ? (
            <motion.div
              key="unlocked"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="w-12 h-12 rounded-xl bg-gradient-herenow flex items-center justify-center"
            >
              <Unlock className="h-6 w-6 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="locked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, rotate: 180 }}
              className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"
            >
              <Lock className="h-6 w-6 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title and subtitle */}
        <div>
          <h3 className="font-semibold text-lg text-foreground">
            {isUnlocked ? "Today's Event Unlocked!" : 'Unlock Today\'s Event'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isUnlocked 
              ? 'Scroll down to see your daily adventure'
              : `Watch ${TOTAL_ADS - adsWatched} more ${TOTAL_ADS - adsWatched === 1 ? 'ad' : 'ads'} to reveal`
            }
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* Progress Bar */}
      {/* ============================================ */}
      <div className="mb-4">
        {/* Progress track */}
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          {/* Animated progress fill */}
          <motion.div
            className="h-full bg-gradient-herenow rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Progress dots indicator */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: TOTAL_ADS }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                'transition-colors duration-300',
                index < adsWatched
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
              animate={index < adsWatched ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {index < adsWatched ? '✓' : index + 1}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* Action Button */}
      {/* ============================================ */}
      <AnimatePresence mode="wait">
        {!isUnlocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Button
              /** Full width button */
              className="w-full"
              /** Large size for touch */
              size="lg"
              /** Click handler */
              onClick={onWatchAd}
              /** Disabled while loading */
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                  Loading Ad...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Watch Ad ({adsWatched}/{TOTAL_ADS})
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlocked celebration */}
      {isUnlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-secondary"
        >
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-secondary-foreground">
            Ready for your daily adventure!
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

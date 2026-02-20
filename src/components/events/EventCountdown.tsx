/**
 * EventCountdown Component
 * 
 * Displays a countdown timer to the daily event reveal at 12pm local time.
 * Shows hours, minutes, and seconds remaining. Once revealed, shows a success state.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCountdownProps {
  /** Whether the event has been revealed (past 12pm) */
  isRevealed: boolean;
  /** Milliseconds remaining until reveal */
  timeRemaining: number;
  /** Optional className */
  className?: string;
}

/** Formats milliseconds into { hours, minutes, seconds } */
function formatTime(ms: number) {
  if (ms <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Single countdown digit block */
function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
        <span className="text-2xl font-bold text-foreground tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export function EventCountdown({ isRevealed, timeRemaining, className }: EventCountdownProps) {
  /** Live countdown state, ticks every second */
  const [remaining, setRemaining] = useState(timeRemaining);

  useEffect(() => {
    setRemaining(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1000, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining > 0]);

  const { hours, minutes, seconds } = formatTime(remaining);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl bg-card border border-border/50 p-6 shadow-soft',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <AnimatePresence mode="wait">
          {isRevealed ? (
            <motion.div
              key="revealed"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="w-12 h-12 rounded-xl bg-gradient-herenow flex items-center justify-center"
            >
              <Eye className="h-6 w-6 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, rotate: 180 }}
              className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"
            >
              <Clock className="h-6 w-6 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h3 className="font-semibold text-lg text-foreground">
            {isRevealed ? "Today's Event Revealed!" : "Event Reveal Countdown"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRevealed
              ? 'Scroll down to see your daily adventure'
              : 'Your daily event reveals at 12:00 PM'}
          </p>
        </div>
      </div>

      {/* Countdown or success state */}
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-center gap-3"
          >
            <TimeBlock value={hours} label="hrs" />
            <div className="flex items-center text-2xl font-bold text-muted-foreground pb-5">:</div>
            <TimeBlock value={minutes} label="min" />
            <div className="flex items-center text-2xl font-bold text-muted-foreground pb-5">:</div>
            <TimeBlock value={seconds} label="sec" />
          </motion.div>
        ) : (
          <motion.div
            key="success"
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
      </AnimatePresence>
    </motion.div>
  );
}

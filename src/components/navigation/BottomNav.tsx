/**
 * BottomNav Component
 * 
 * Mobile-first bottom navigation bar.
 * Provides access to main app sections.
 * Features active state styling and smooth transitions.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Navigation item configuration.
 */
interface NavItem {
  /** Display label */
  label: string;
  /** Route path */
  path: string;
  /** Lucide icon component */
  icon: React.ElementType;
}

/**
 * Navigation items configuration.
 * Defines all main app sections accessible from nav.
 */
const NAV_ITEMS: NavItem[] = [
  {
    label: 'Today',
    path: '/',
    icon: Home,
  },
  {
    label: 'Discover',
    path: '/discover',
    icon: Compass,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

/**
 * BottomNav Component
 * 
 * Renders a fixed bottom navigation bar for mobile-first design.
 * Highlights the active section and animates transitions.
 */
export function BottomNav() {
  /** Get current location for active state */
  const location = useLocation();
  
  /** Navigation function */
  const navigate = useNavigate();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-card/95 backdrop-blur-lg border-t border-border/50',
        'px-2 pb-safe-area-inset-bottom',
        'safe-area-pb'
      )}
    >
      {/* Navigation items container */}
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          /** Check if this item is active */
          const isActive = location.pathname === item.path;
          
          /** Get the icon component */
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              /** Navigate on click */
              onClick={() => navigate(item.path)}
              /** Accessibility */
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              /** Styling */
              className={cn(
                'relative flex flex-col items-center justify-center',
                'w-16 h-full',
                'transition-colors duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon with animation */}
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>

              {/* Label */}
              <span className={cn(
                'text-[10px] mt-1 font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

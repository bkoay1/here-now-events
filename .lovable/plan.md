
# Plan: Create Separate Page Containers for Each Navigation Section

## Overview
Currently, all four bottom navigation items (Today, Discover, Profile, Settings) route to the same `Index` component. This plan creates dedicated page components for each section, maintaining the MVVM architecture and consistent styling.

---

## Files to Create

### 1. `src/pages/Today.tsx` (Renamed from Index.tsx content)
- Move the current daily event experience to this dedicated page
- Contains the ad-unlock flow, event card, and attendee preview
- Uses `useEventViewModel` for state management

### 2. `src/pages/Discover.tsx`
- New page for discovering upcoming and nearby events
- Placeholder UI with sections for:
  - Upcoming events in your area
  - Popular event categories
  - Events your friends are attending
- Will later integrate with location service

### 3. `src/pages/Profile.tsx`
- User profile page showing:
  - Display name and avatar placeholder
  - User rating and events attended count
  - Current preferences summary
  - Edit profile button
- Uses `useProfileViewModel` for state management

### 4. `src/pages/Settings.tsx`
- Settings page with sections for:
  - Notification preferences
  - Location preferences
  - Privacy settings
  - About / Help
  - Logout option
- Uses `useProfileViewModel` for preference updates

### 5. `src/pages/index.ts` (Export barrel)
- Central export file for all pages
- Clean imports in App.tsx

---

## Files to Modify

### 1. `src/App.tsx`
Update routes to use the new page components:
```
/          -> Today.tsx
/discover  -> Discover.tsx
/profile   -> Profile.tsx
/settings  -> Settings.tsx
```

### 2. `src/pages/Index.tsx`
- Keep as a simple redirect to Today, or remove entirely
- The core content moves to Today.tsx

---

## Shared Layout Approach
Each page will include:
- `<Header />` component (fixed top)
- `<BottomNav />` component (fixed bottom)
- Consistent padding: `pt-16 pb-20 px-4 max-w-lg mx-auto`

This ensures visual consistency while allowing each page to have its own content.

---

## Technical Details

### File Structure After Changes
```
src/pages/
  index.ts       (barrel export)
  Today.tsx      (daily event - main experience)
  Discover.tsx   (explore events)
  Profile.tsx    (user profile)
  Settings.tsx   (app settings)
  NotFound.tsx   (404 page - unchanged)
```

### Page Component Pattern
Each page follows this structure:
```tsx
const PageName = () => {
  // ViewModel hook (if needed)
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20 px-4 max-w-lg mx-auto">
        {/* Page content */}
      </main>
      <BottomNav />
    </div>
  );
};
```

### Comments
All files will include comprehensive block-level and line-by-line comments as requested, explaining each function, variable, and block.

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/pages/Today.tsx` | Create (from Index.tsx content) |
| `src/pages/Discover.tsx` | Create new |
| `src/pages/Profile.tsx` | Create new |
| `src/pages/Settings.tsx` | Create new |
| `src/pages/index.ts` | Create (barrel export) |
| `src/App.tsx` | Update routes |
| `src/pages/Index.tsx` | Remove or redirect |

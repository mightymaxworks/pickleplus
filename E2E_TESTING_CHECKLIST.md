# End-to-End Testing Checklist - Pickle+ Platform

## Test Environment
- **URL**: http://localhost:5000
- **Test Date**: October 2, 2025
- **Browser**: Chrome/Chromium (via Puppeteer)

---

## 1. Authentication Flow ✅

### 1.1 Registration
- [ ] Navigate to /login and click "Register"
- [ ] Fill out registration form (username, email, displayName, password, confirmPassword)
- [ ] Submit form
- [ ] Verify redirect to /unified-prototype (new requirement!)
- [ ] Verify user data loads in UnifiedPrototype (real data, not demo!)

### 1.2 Login
- [ ] Navigate to /login
- [ ] Enter valid credentials (username/password)
- [ ] Click "Log In"
- [ ] Verify redirect to /unified-prototype
- [ ] Verify user session persists on page refresh

### 1.3 Logout
- [ ] Click logout button
- [ ] Verify redirect to landing page or login
- [ ] Verify protected routes are inaccessible

### 1.4 Invalid Credentials
- [ ] Try logging in with wrong username
- [ ] Try logging in with wrong password
- [ ] Verify error messages display
- [ ] Verify user stays on login page

---

## 2. Match Recording & Certification ⏳

### 2.1 Quick Match Recorder
- [ ] Navigate to /record-match
- [ ] Select match type (Singles/Doubles/Mixed Doubles)
- [ ] Search for opponent (or partner if doubles)
- [ ] Enter game scores
- [ ] Submit match
- [ ] Verify match appears in pending certifications

### 2.2 Match Certification
- [ ] Player 2 logs in
- [ ] Navigate to /pending-certifications
- [ ] See pending match from Player 1
- [ ] Certify or dispute the match
- [ ] Verify points are awarded after certification

### 2.3 Points Calculation
- [ ] Verify correct points calculation (System B: 3 win, 1 loss)
- [ ] Verify age group multipliers apply
- [ ] Verify gender bonuses (1.15x for women <1000 pts in cross-gender)
- [ ] Verify decimal precision (2 decimal places, not rounded)

---

## 3. Challenge System 🎮

### 3.1 Create Challenge
- [ ] Navigate to /rankings
- [ ] Find player ranked above you
- [ ] Click "Challenge" button
- [ ] Select match type
- [ ] Send challenge
- [ ] Verify challenge appears in /challenges

### 3.2 Accept Challenge
- [ ] Challenged player navigates to /challenges
- [ ] See incoming challenge with 24h expiry timer
- [ ] Accept challenge
- [ ] Verify match pre-fills in Quick Match Recorder
- [ ] Record match results

### 3.3 Decline Challenge
- [ ] Receive challenge
- [ ] Decline challenge
- [ ] Verify challenge removed from list
- [ ] Verify challenger is notified

---

## 4. Rankings & Leaderboards 📊

### 4.1 View Rankings
- [ ] Navigate to /rankings
- [ ] Toggle between Singles/Doubles/Mixed Doubles tabs
- [ ] Verify regional filtering works
- [ ] Verify age group filtering (Pro, Open, U19, 35+, 50+, 60+, 70+)

### 4.2 Ranking Display
- [ ] Check player card shows highest category ranking
- [ ] Format: "#[value] [category]" (e.g., "#42 Open")
- [ ] Verify cross-category eligibility (U19 players in Open)

### 4.3 Points Display
- [ ] Verify decimal precision (e.g., 1247.35 instead of 1248)
- [ ] Verify additive points system (points accumulate, never replace)
- [ ] Verify Pickle Points multiplier (1.5x PER MATCH)

---

## 5. Notifications System 🔔

### 5.1 WebSocket Connection
- [ ] Login and verify WebSocket connects
- [ ] Check browser console for connection logs
- [ ] Verify notification bell appears in nav

### 5.2 Real-Time Notifications
- [ ] Receive challenge → notification appears
- [ ] Match certified → notification appears
- [ ] Achievement unlocked → notification appears
- [ ] Click notification → navigate to relevant page

### 5.3 Notification Preferences
- [ ] Navigate to /notification-preferences
- [ ] Toggle notification types
- [ ] Save preferences
- [ ] Verify preferences persist

---

## 6. Mobile Features 📱

### 6.1 PWA Capabilities
- [ ] Open app on mobile device
- [ ] Check for "Install" prompt
- [ ] Verify service worker registers
- [ ] Test offline functionality (basic caching)

### 6.2 Mobile Bottom Navigation
- [ ] Resize browser to mobile width (< 640px)
- [ ] Verify bottom nav appears
- [ ] Tap each nav item (Dashboard, Record Match, Rankings, Profile)
- [ ] Verify smooth transitions

### 6.3 Pull-to-Refresh
- [ ] On mobile view, pull down on rankings page
- [ ] Verify refresh animation
- [ ] Verify data reloads

### 6.4 Haptic Feedback
- [ ] On mobile device, tap buttons
- [ ] Verify haptic feedback on interactions
- [ ] Check Settings for haptic toggle

### 6.5 Logo Tagline (Mobile)
- [ ] Verify "Where Players Become Legends" is HIDDEN on mobile (<640px)
- [ ] Verify tagline appears on tablet/desktop (≥640px)

---

## 7. UnifiedPrototype Dashboard 🎮

### 7.1 Real User Data
- [ ] Login and navigate to /unified-prototype
- [ ] Verify loading spinner appears
- [ ] Verify real user data loads (NOT demo data!)
- [ ] Check player name, rank, points display
- [ ] Verify avatar/photo loads

### 7.2 Dashboard Sections
- [ ] Hexagonal Stats display
- [ ] Content Feed (coaching videos, assessments)
- [ ] Battle Log (recent matches)
- [ ] Interactive Leaderboard
- [ ] Challenge system integration

---

## 8. Critical Data Integrity 🔐

### 8.1 Additive Points System
- [ ] Record 3 matches with same player
- [ ] Verify points ADD to total (never replace)
- [ ] Check database: `SELECT * FROM users WHERE id = [user_id]`
- [ ] Confirm ranking_points column increases additively

### 8.2 Decimal Precision
- [ ] Record match worth 3.5 points
- [ ] Verify points display as 3.50 (not 4)
- [ ] Check database for exact decimal values

### 8.3 Gender Bonus Detection
- [ ] Female player <1000 pts challenges male player
- [ ] Female player wins
- [ ] Verify 1.15x multiplier auto-applies
- [ ] Check match record for bonus flag

---

## 9. Known Issues to Fix 🐛

- [ ] Service Worker registration failing (check console)
- [ ] WebSocket undefined port error (wss://localhost:undefined)
- [ ] LSP error: achievements.tsx case-sensitivity
- [ ] Demo pages still in routes (cleanup pending)

---

## Test Automation Commands

```bash
# Run E2E tests (when fixed)
npx jest --config=tests/e2e/jest.config.cjs

# Run specific test
npx jest --config=tests/e2e/jest.config.cjs --testNamePattern="should load login page"

# Run with browser visible
HEADLESS=false npx jest --config=tests/e2e/jest.config.cjs

# Enable debug console
DEBUG_CONSOLE=true npx jest --config=tests/e2e/jest.config.cjs

# Take screenshots
SCREENSHOTS=true npx jest --config=tests/e2e/jest.config.cjs
```

---

## Manual Testing Priority Order

1. **Authentication** (critical path)
2. **UnifiedPrototype real data** (just fixed!)
3. **Match recording** (core feature)
4. **Rankings display** (core feature)
5. **Mobile navigation** (user experience)
6. **Challenge system** (engagement feature)
7. **Notifications** (real-time feature)
8. **PWA features** (progressive enhancement)

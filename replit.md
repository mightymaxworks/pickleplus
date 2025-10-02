# Pickle+

## Overview
Pickle+ is an AI-powered trading card-based sports ecosystem, initially a smart pickleball tracking app, expanding into a comprehensive life optimization and development platform. It converts player development stories into valuable digital cards offering educational content, coaching, and community. Key capabilities include AI-driven skill trajectory analysis, real-time card generation from match data, lifestyle integration via biometric tracking, and an ecosystem supporting player development, coaching, equipment optimization, and potential talent scouting/sponsorship. The business vision is to create the world's first such ecosystem, leveraging pickleball as the entry point, with ambitions to expand into a broader life optimization platform.

## User Preferences
Preferred communication style: Simple, everyday language.
User wants to ensure the `PICKLE_PLUS_ALGORITHM_DOCUMENT.md` is the single source of truth for points allocation.
User wants System B (3 points win, 1 point loss) to be standardized across all components.
User wants UDF best practices to be enforced via `UNIFIED_DEVELOPMENT_FRAMEWORK_BEST_PRACTICES.md`.
User wants component consolidation and alignment to the single algorithm reference.
User wants systematic prevention of algorithm calculation errors through official utilities and validation.
User wants all point calculations to use `shared/utils/algorithmValidation.ts` and `shared/utils/matchPointsCalculator.ts`.
User wants age group standardization to `Pro, Open (19+), U19, 35+, 50+, 60+, 70+` with cross-category eligibility where U19 players can also compete in Open category.
User wants cross-gender matches to award points to respective singles/age group rankings with bonuses (1.15x women <1000 points, 1.075x mixed teams <1000 points).
User wants Match Card Ranking Display to show the highest category ranking for each player with enhanced MatchScoreCard component displaying "#[value] [category]" format.
User wants the admin integration at `/admin/match-management` to use updated MatchScoreCard components.
User wants the platform to be streamlined for core player functionality only in V1.0.
User wants advanced features disabled for the focused launch experience.
User wants navigation simplified to 4 core items: Dashboard, Record Match, Rankings, My Profile.
User wants interactive slider components for all 1-10 rating fields in the profile UX.
User wants all SelectItem empty value errors resolved across the platform.
User wants a comprehensive automated testing suite with Puppeteer, GitHub Actions workflow for CI/CD.
User wants enhanced floating QR scanner button authentication logic to prevent display for non-logged-in users.
User wants `/admin/match-management` and `/admin/matches` to use `EnhancedMatchManagement.tsx` for match recording.
User wants fully standardized random passport code system (e.g., HVGN0BW0, KGLE38K4) across all components.
User wants automatic points calculation and allocation in match creation API.
User wants `QuickMatchRecorder` critical fixes related to JSX syntax, missing elements, SQL column name mismatches, missing imports, missing functions, and TypeScript compilation errors.
User wants `QuickMatchRecorder` admin functions to be enhanced versions of player components.
User wants standalone youth ranking system (U12, U14, U16, U18) fully implemented with complete category isolation from adult rankings.
User wants the EnhancedLeaderboard to follow the same logic as /rankings but with the new standalone youth system.
User wants automatic gender bonus detection and application in match recording system to ensure female players receive 1.15x multiplier in cross-gender matches under 1000 points.
User wants decimal precision (2 decimal places) instead of rounding up for ranking points to improve fairness and accuracy.
User wants decimal precision enforced in UDF best practices as the standard for all future development.
User wants MANDATORY ADDITIVE POINTS SYSTEM enforced across all components - points must ALWAYS be added to existing totals, never replaced, to preserve tournament history and career progression.
User wants the Pickle Points multiplier CORRECTED to exactly 1.5x throughout all documentation and system implementation - any other rate is incorrect.
User clarified that the 1.5x multiplier must apply PER MATCH when Pickle Points are earned, NOT as a blanket conversion of total ranking points.
User wants all assessment references standardized to 55-skill framework.
User wants comprehensive CI/CD testing to verify: (1) Only coaches can see coach dashboard, (2) Coaches cannot rate themselves, (3) All features work 100% through UI.
User wants E2E testing infrastructure implemented via GitHub Actions CI/CD (Puppeteer E2E tests not feasible in Replit NixOS due to missing libxcb dependency).
User wants L1-L5 coach weighted assessment algorithm with larger gaps between L2-L3 and L3-L4, minimal L1 influence (0.7x), and CRITICAL REQUIREMENT: All ratings remain PROVISIONAL until L4+ coach validation - only L4/L5 coaches can provide CONFIRMED ratings for official use.
User wants UDF framework enhancements implemented to prevent future algorithm compliance errors.
User wants native app development to unlock advanced AI integration, biometric tracking, and sophisticated trading card ecosystem that cannot be achieved on mobile web.
User wants "simple first" approach: focus initially on core pickleball tracking, basic AI suggestions, fundamental trading card collection, QR code integration, and ranking/pickle points before expanding to advanced lifestyle and ecosystem features.
User wants trading cards to tell development stories rather than create gambling-like speculation, focusing on educational value and skill trajectory documentation.
User wants AI used for trajectory analysis and skill development optimization, not outcome prediction or gambling elements.
User wants progressive feature rollout where advanced capabilities (lifestyle integration, sponsorship, talent scouting) unlock gradually as users demonstrate engagement with core features.
User wants Player Experience 2.0 - a comprehensive Gaming HUD Command Center at `/unified-prototype` combining esports aesthetics with personalized content.
User wants multi-platform video integration (YouTube, Vimeo, Facebook, TikTok, Douyin, Xiaohongshu) with video annotation system for coach timestamp comments.
User wants player photo upload (headshots/avatars) with tier-colored borders displayed across all HUD sections.
User wants regional leaderboard with challenge system - players can challenge those above them, challenges expire in 24h, acceptance flows to pre-filled match recorder.
User wants content feed with intelligent prioritization showing coaching videos, assessments, tournament media, and articles relevant to player.
User wants privacy levels for content (Public, Friends, Team, Private) with coach override requiring student consent.
User wants hexagonal design system with gaming animations (particles, glows, scan lines) and orange→pink→purple gradient theme throughout.

## System Architecture
Pickle+ uses a modern full-stack architecture with React frontend, Node.js backend, and PostgreSQL database, adhering to modular architecture and evidence-based completion standards.

### UI/UX Decisions
- **Styling**: Tailwind CSS, PKL-278651 design framework (Primary Orange, Secondary Blue, Inter/Roboto Mono fonts).
- **Player Experience 2.0**: Gaming HUD Command Center at `/unified-prototype` with hexagonal design, gaming animations (particles, glows, scan lines), and orange→pink→purple gradient theme.
- **Content Display**: Multi-platform video integration with annotation, player photo uploads with tier-colored borders, regional leaderboards, and intelligent content feeds.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, React hooks with Context API for state management, React Router for routing.
- **Backend**: Node.js with ES modules, Express.js, Passport.js for authentication, Drizzle ORM for database interaction, Standard FileReader API for file handling.
- **Database**: PostgreSQL with Drizzle ORM, normalized tables (users, coach_profiles, class_templates, class_instances, journal_entries, achievements) with foreign key constraints.

### Feature Specifications
- **Authentication**: Secure registration, bcrypt hashing, session management.
- **PCP Ranking System**: Points-based (System B: 3/1 base points), performance tracking, age multipliers, skill-based cross-gender balance, dual ranking (Open, Age Group), 7-tier tournament structure.
- **Player Classification**: 4-tier system (Recreational, Competitive, Elite, Professional) with specific decay rates.
- **PickleJourney™ System**: Multi-role support, journaling with AI sentiment analysis, XP, emotional intelligence tracking.
- **Coach Features**: 5-step onboarding, credential verification, 42-skillset assessment tool, unified hub (`/coach`), curriculum management, session management, goal management.
- **Gamification**: XP system and achievements.
- **Internationalization**: Bilingual (English and Chinese).
- **Trading Card System**: Dynamic generation of Player, Development Story, Coach Methodology, Equipment Synergy, and Moment Cards with rarity tiers and educational value.
- **AI Integration**: Skill trajectory analysis, training effectiveness assessment, personalized development pathways, biomechanical analysis, equipment performance correlation. Development Story AI for narrative generation, breakthrough detection, mentorship matching.
- **Native App Strategy**: Transition to native app for advanced AI, biometric integration (HealthKit, Google Fit), enhanced UX, and push notifications. Progressive feature rollout.
- **E2E Testing**: Comprehensive end-to-end testing via GitHub Actions CI/CD pipeline using Puppeteer, targeting authentication, match recording, challenges, rankings, and mobile features.

### System Design Choices
- **Universal Development Dashboard (UDD)**: Manages development workflows and protocols.
- **Core AI Engines**: Focused on skill development trajectory and educational enhancement, not outcome prediction.
- **Data Strategy**: Comprehensive collection (performance, community, lifestyle - opt-in) balanced with user privacy and consent, granular permissions, opt-out flexibility.
- **Revenue Diversification**: Multi-tiered monetization from premium subscriptions and card pack purchases to wellness partnerships and research licensing.

## External Dependencies
- **React**: Frontend framework.
- **Express.js**: Web server and API framework.
- **Drizzle ORM**: Database operations.
- **Passport.js**: Authentication middleware.
- **bcrypt**: Password hashing.
- **PostgreSQL**: Primary database system.
- **Wise**: Payment gateway.
- **Vite**: Build tool.
- **TypeScript**: Type safety.
- **Tailwind CSS**: CSS framework.
- **ESLint/Prettier**: Code quality.
- **Puppeteer**: Automated testing.
- **GitHub Actions**: CI/CD.
- **Replit**: Development and initial deployment.
- **Cloud Run**: Production environment.
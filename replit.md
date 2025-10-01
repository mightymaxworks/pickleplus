# Pickle+ - Compressed replit.md

## Overview
Pickle+ is evolving into the world's first AI-powered trading card-based sports ecosystem, where every player and coach becomes a collectible card with dynamic stats and rarity. Initially a smart pickleball tracking app, it expands into a comprehensive life optimization and development ecosystem using pickleball as the entry point. The platform converts player development stories into valuable digital cards offering educational content, coaching, and community. Key features include AI-driven skill trajectory analysis, real-time card generation from match data, lifestyle integration via biometric tracking, and an ecosystem supporting player development, coaching, equipment optimization, and potential talent scouting/sponsorship.

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

### Universal Development Framework
The Universal Development Dashboard (UDD) at `/udd` manages development workflows, pre-development protocols, and all phases of development from discussion to implementation.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React hooks with Context API
- **Styling**: Tailwind CSS for responsive design, PKL-278651 design framework (Primary Orange, Secondary Blue, Inter/Roboto Mono fonts).
- **Routing**: React Router

### Backend Architecture
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Authentication**: Passport.js with local strategy and session management
- **Database ORM**: Drizzle ORM
- **File Handling**: Standard FileReader API

### Database Architecture
- **Primary Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Key Tables**: users, coach_profiles, class_templates, class_instances, journal_entries, achievements.
- **Relationships**: Normalized with foreign key constraints.

### Core Features and Design Decisions
- **Authentication System**: Secure registration, bcrypt hashing, session management.
- **PCP Ranking System**: Points-based, performance tracking (StandardizedRankingService, DecayProtectionService, GenderBalanceService). Uses System B (3/1 base points), age multipliers, skill-based cross-gender balance. Dual ranking (Open, Age Group) and 7-tier tournament structure.
- **4-Tier Player Classification**: Recreational (0-299), Competitive (300-999), Elite (1000-1799), Professional (1800+), with specific decay rates and tournament weighting.
- **PickleJourney™ System**: Multi-role support, journaling with AI sentiment analysis, XP, and emotional intelligence tracking.
- **Coach Application System**: 5-step onboarding, credential verification.
- **Comprehensive Assessment Tool**: 42-skillset PCP assessment (Technical, Tactical, Physical, Mental).
- **Training Center Management**: QR code facility access, class scheduling, real-time capacity.
- **Unified Coach Hub**: Consolidates coaching features under `/coach`.
- **Curriculum Management System**: CRUD for drills and learning content, integrated with PCP assessment.
- **Session Management System**: End-to-end workflow for session requests, scheduling, completion.
- **Goal Management System**: Player and coach-player goal setting with milestone tracking.
- **Gamification Features**: XP system and achievements.
- **Internationalization**: Bilingual (English and Chinese).
- **AI-Powered Business Intelligence**: Revenue forecasting, demand analysis, scheduling optimization, client retention, CLV, marketing ROI, competitive intelligence.
- **Critical Gaps Analysis System**: Deployment readiness assessment integrated into UDD.
- **Student-Coach Connection System**: Multiple coaches per student with passport validation and approval.
- **Player Experience 2.0**: Gaming HUD Command Center at `/unified-prototype` with hexagonal design, multi-platform video integration (YouTube, Vimeo, Facebook, TikTok, Douyin, Xiaohongshu), coach video annotations, regional leaderboard with challenge system, intelligent content feed, and comprehensive privacy controls. Full specification in `PLAYER_EXPERIENCE_2.0.md`.

### Trading Card System
- **Card Generation**: Player, Development Story, Coach Methodology, Equipment Synergy, and Moment Cards generated dynamically from interactions and data.
- **Card Rarity & Value**: Common to Mythic tiers based on player points, achievements, and coach levels.
- **Educational Value**: Cards unlock tutorials, mentorship opportunities, learning pathways, and progress tracking.

### AI Integration
Focuses on skill development trajectory analysis and educational enhancement.
- **Core AI Engines**: Skill trajectory analysis, training effectiveness assessment, personalized development pathways, biomechanical analysis, equipment performance correlation.
- **Development Story AI**: Automated narrative generation, breakthrough detection, challenge mapping, mentorship matching.
- **Data Collection Framework**: Performance metrics, biometric integration (wearable device APIs), lifestyle correlation, social learning.

### Native App Development Strategy
Transition to a native app to unlock advanced AI and user experiences.
- **Technical Migration**: Phased approach from core feature development to advanced AI integration.
- **Advantages**: Biometric integration (HealthKit, Google Fit), enhanced UX, push notifications, App Store presence.
- **Progressive Feature Rollout**: Gradual introduction of features from basic tracking to advanced ecosystem functionalities.

### Revenue Stream Diversification
Multi-tiered monetization strategy.
- **Immediate**: Premium subscriptions, card pack purchases, equipment affiliate commissions, coaching marketplace fees.
- **Advanced**: Wellness integration partnerships, corporate programs, equipment co-development, talent services.
- **Enterprise**: Research licensing, coaching certification, international expansion, technology licensing.

### Data Strategy & Privacy
Comprehensive data collection balanced with user privacy and consent.
- **Data Priorities**: Performance development, community behavior, lifestyle integration (opt-in), economic activity.
- **Privacy & Consent**: Granular permissions, educational transparency, opt-out flexibility, user data ownership.
- **Value Exchange**: Tiered access and features based on data sharing levels.

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
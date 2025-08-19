# Pickle+ - Comprehensive Ecosystem Platform

## Overview
Pickle+ is a comprehensive ecosystem platform designed as the central operating system for the global FPF (Future Pickleball Federation) franchise network. It unifies players, coaches, franchisees, headquarters, events, retail, facilities, and digital currency into a seamless and scalable platform. Its main purpose is to serve various stakeholder groups including casual and competitive players, certified coaches, franchisees managing facilities and operations, FPF headquarters for strategic oversight, facilities requiring operational management, and retail partners for equipment management and sales. Key capabilities include a unified player passport system, gamified loyalty via Pickle Points digital currency, and comprehensive franchise management, all while supporting the core pickleball community and coaching development.

## User Preferences
Preferred communication style: Simple, everyday language.
User wants to ensure the `PICKLE_PLUS_ALGORITHM_DOCUMENT.md` is the single source of truth for points allocation.
User wants System B (3 points win, 1 point loss) to be standardized across all components.
User wants UDF best practices to be enforced via `UNIFIED_DEVELOPMENT_FRAMEWORK_BEST_PRACTICES.md`.
User wants component consolidation and alignment to the single algorithm reference.
User wants age group standardization to `Pro, Open (19+), U19, 35+, 50+, 60+, 70+` with cross-category eligibility where U19 players can also compete in Open category.
User wants cross-gender matches to award points to respective singles/age group rankings with bonuses (1.15x women <1000 points, 1.075x mixed teams <1000 points).
User wants Match Card Ranking Display to show the highest category ranking for each player with enhanced MatchScoreCard component displaying "#[value] [category]" format.
User wants the admin integration at `/admin/match-management` to use updated MatchScoreCard components.
User wants the platform to be streamlined for core player functionality only in V1.0.
User wants advanced features disabled for the focused launch experience.
User wants navigation simplified to 4 core items: Dashboard, Record Match, Rankings, My Profile.

## Current Sprint Focus - Simplified Coaching System
User wants to focus on actual sprint development rather than infrastructure distractions. Current coaching system sprint priorities:

### ✅ Phase 1: Admin Infrastructure (COMPLETED)
- Admin authentication fixed for both mightymax and admin_test users
- Admin dashboard accessible at `/admin` with full protection
- Admin navigation menu operational

### ✅ Phase 2: Admin-Controlled Coach Levels (COMPLETED)
- L1-L5 coach level system implemented with detailed descriptions
- Streamlined assignment workflow with admin-only activation
- Enhanced coach management interface with level descriptions
- Security validation for coach level assignments (0-5)

### ✅ Phase 3: Mandatory Coach-Student Validation (COMPLETED)
- Coach-student relationship validation API endpoint created
- Security controls requiring active coach-student assignments
- Authorization checks preventing unauthorized assessments
- Admin-only assignment requirement enforced

### ✅ Phase 4: Preserve Assessment Tools (COMPLETED)
- Comprehensive 35-skill assessment tool preserved and enhanced
- 4-dimensional PCP system maintained with security integration
- CoachingAssessmentValidator component created with mandatory validation
- Coaching system demo page built for admin testing and validation
- Complete sprint pipeline implemented and functional

## Simplified Coaching System Sprint - COMPLETE ✅
All 4 phases of the simplified coaching system have been successfully implemented and tested. The system now provides:
- Admin-controlled coach levels (L1-L5) with detailed descriptions
- Mandatory coach-student relationship validation for security
- Preserved comprehensive 55-skill assessment tools (upgraded from 35 skills)
- Functional demo interface for admin testing

## PCP Rating Algorithm Implementation - INTEGRATED ✅
**Date**: August 19, 2025
**Status**: Progressive Assessment Model fully integrated with existing CoachingAssessmentValidator

**Integration Achievement**:
- **Unified Assessment System**: Progressive Assessment capabilities integrated into existing CoachingAssessmentValidator component
- **Enhanced 3-Tab Interface**: Validation, Progressive Assessment, Results & PCP tabs
- **Focused Session Capability**: Coaches can assess specific skill categories or comprehensive 55-skill evaluations
- **Real-Time PCP Calculation**: Live updates as skills are assessed using existing algorithm
- **Security Integration**: Maintains existing L1-L5 coach validation and admin-controlled assignments
- **Session Type Selection**: Focused, Comprehensive, or Baseline assessment workflows
- **Individual Skill Tracking**: Each of 55 skills tracked individually with category-based organization

**Progressive Assessment Features**:
- Realistic coaching workflow (focused training sessions on specific categories)
- Category selection with weighted importance display (Touch 30%, Technical 25%, etc.)
- Session notes capability for coaching documentation
- Progress tracking with visual indicators
- Real-time PCP rating calculation as skills are assessed

**Algorithm Formula** (unchanged):
```
Raw_Score = (Touch×0.30 + Technical×0.25 + Mental×0.20 + Athletic×0.15 + Power×0.10)
PCP_Rating = 2.0 + (Raw_Score - 1.0) × (6.0/9.0)
```

**UDF Compliance**: Progressive assessment integrated with existing coaching infrastructure - single comprehensive assessment system.

## Next Sprint Phase Options
Priority development areas identified from user preferences:
1. **Match Management Enhancement** - QuickMatchRecorder fixes, enhanced admin tools
2. **Youth Rankings System** - Standalone youth categories (U12, U14, U16, U18)
3. **UI/UX Critical Fixes** - Interactive sliders, SelectItem errors, QR scanner
4. **Gender Bonus & Decimal Precision** - Automatic detection, 2-decimal accuracy
5. **Testing & Deployment** - Automated testing, CI/CD, passport standardization
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
User wants the Pickle Points multiplier CORRECTED to exactly 1.5x throughout all documentation and system implementation - any other rate is incorrect.
User clarified that the 1.5x multiplier must apply PER MATCH when Pickle Points are earned, NOT as a blanket conversion of total ranking points.
User reported Tony Guo showing 28 matches but physical records don't match, leading to discovery of massive historical data corruption.
User wants immediate data integrity cleanup to resolve system-wide duplicate match corruption affecting rankings and points.
✅ DATA CORRUPTION CLEANUP EXECUTED: Successfully removed 42 duplicate matches system-wide while preserving 5 legitimate matches.
✅ TONY GUO CASE RESOLVED: Match count corrected from 28 to 11 matches, confirming massive data corruption cleanup.
✅ SYSTEM INTEGRITY RESTORED: Live cleanup completed with zero errors, affecting 7 users total.

## System Architecture
Pickle+ utilizes a modern full-stack architecture with a React frontend, Node.js backend, and PostgreSQL database. All development adheres to a modular architecture and evidence-based completion standards, ensuring specialized route modules, proper registration functions, and authentic data integration.

### Universal Development Framework
The Universal Development Dashboard (UDD) at `/udd` tracks all development workflows, enforces pre-development protocols, and manages the discussion, integration, review, validation, dependency check, authorization, and implementation phases of development.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React hooks with Context API
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router
- **UI Components**: Custom, mobile-first responsive components adhering to the PKL-278651 design framework, emphasizing fewer clicks, QR code integration, and comprehensive ranking system display. Color scheme: Primary Orange, Secondary Blue, with Inter and Roboto Mono fonts.

### Backend Architecture
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Authentication**: Passport.js with local strategy and session management
- **Database ORM**: Drizzle ORM for type-safe operations
- **File Handling**: Standard FileReader API for image uploads

### Database Architecture
- **Primary Database**: PostgreSQL
- **ORM**: Drizzle ORM with TypeScript
- **Key Tables**: users, coach_profiles, class_templates, class_instances, journal_entries, achievements.
- **Relationships**: Normalized structure with foreign key constraints.

### Core Features and Design Decisions
- **Authentication System**: Secure user registration with email validation, bcrypt hashing, and session management.
- **PCP Ranking System**: Points-based ranking with performance tracking, implemented with `StandardizedRankingService`, `DecayProtectionService`, and `GenderBalanceService`. Uses System B (3/1 base points), age multipliers, and skill-based cross-gender balance. Features a dual ranking architecture (Open Rankings, Age Group Rankings) and a 7-tier tournament structure.
- **4-Tier Player Classification System**: Recreational (0-299 pts), Competitive (300-999 pts), Elite (1000-1799 pts), Professional (1800+ pts), with specific decay rates and enhanced tournament weighting for the Professional tier.
- **PickleJourney™ System**: Multi-role support, journaling with AI sentiment analysis, XP system, and emotional intelligence tracking.
- **Coach Application System**: Streamlined 5-step onboarding, credential verification, and achievement showcase.
- **Comprehensive Assessment Tool**: 42-skillset PCP assessment across Technical, Tactical, Physical, and Mental dimensions.
- **Training Center Management**: QR code-based facility access, class scheduling, real-time capacity management.
- **Unified Coach Hub**: Consolidates coaching features under a single `/coach` hub.
- **Curriculum Management System**: CRUD operations for drills and learning content, integrated with PCP assessment.
- **Session Management System**: End-to-end workflow for session requests, scheduling, and completion.
- **Goal Management System**: Player and coach-player goal setting with milestone tracking.
- **Gamification Features**: XP system and achievements.
- **Internationalization**: Bilingual support for English and Chinese.
- **AI-Powered Business Intelligence**: AI Revenue Forecasting, Demand Pattern Analysis, Smart Scheduling Optimization, Client Retention Analytics, Client Lifetime Value Analysis, Marketing ROI Dashboard, and Competitive Intelligence.
- **Critical Gaps Analysis System**: Comprehensive deployment readiness assessment with identified critical gaps, integrated into the UDD's unified Development Ledger.

## External Dependencies
- **React**: Frontend framework.
- **Express.js**: Web server and API framework.
- **Drizzle ORM**: Database operations.
- **Passport.js**: Authentication middleware.
- **bcrypt**: Password hashing.
- **PostgreSQL**: Primary database system.
- **Wise**: Payment gateway for transactions.
- **Vite**: Build tool.
- **TypeScript**: Type safety.
- **Tailwind CSS**: CSS framework.
- **ESLint/Prettier**: Code quality and formatting.
- **Puppeteer**: For automated testing.
- **GitHub Actions**: For CI/CD.
- **Replit**: Development and initial deployment.
- **Cloud Run**: Production environment.
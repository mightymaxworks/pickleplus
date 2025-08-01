# Pickle+ - Compressed replit.md

## Overview
Pickle+ is a comprehensive pickleball platform offering player development, coaching tools, social features, and training center management. It aims to be the go-to platform for pickleball enthusiasts, coaches, and facilities, fostering growth and community within the sport. The platform integrates an XP system with tier progression, a PCP ranking system based on performance and achievements, and a PickleJourney™ system for emotional intelligence tracking. It includes robust coach onboarding and management capabilities, and aims for international expansion with strategic localization.

## User Preferences
Preferred communication style: Simple, everyday language.
Coach workflow preferences:
- Coaches should access training facilities to apply as facility coaches
- Profile management should use inline editing rather than separate page navigation
- Use "Coaching Bio" for coaching profile sections (not "PCP Coaching Certification Programme")

## System Architecture
Pickle+ utilizes a modern full-stack architecture with a React frontend, Node.js backend, and PostgreSQL database.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React hooks with Context API
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router
- **UI Components**: Custom, mobile-first responsive components adhering to the PKL-278651 design framework.

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
- **Training Center Management**: QR code-based facility access, comprehensive class scheduling, real-time capacity management, and coach profiles.
- **PickleJourney™ System**: Multi-role support, comprehensive journaling with AI sentiment analysis, XP system for progress tracking, and emotional intelligence tracking.
- **Coach Application System**: Streamlined 5-step onboarding, credential verification, rate setting, and achievement showcase.
- **PCP Ranking System**: Points-based ranking with performance tracking and progress visualization.
- **Comprehensive Assessment Tool**: 42-skillset PCP assessment across Technical, Tactical, Physical, and Mental dimensions.
- **Modern Passport UI/UX**: Emphasizes fewer clicks, QR code integration for facility access, and comprehensive ranking system display.
- **Payment Gateway Integration**: Wise payment gateway for cost-effective international and domestic transactions.
- **Unified Coach Hub**: Consolidates all coaching features under a single `/coach` hub with smart routing and progressive disclosure.
- **Curriculum Management System**: Full CRUD operations for drills and learning content, integrated with a 4-dimensional PCP assessment.
- **Session Management System**: End-to-end workflow for session requests, coach responses, scheduling, and completion.
- **Goal Management System**: Player-only and coach-player goal setting with milestone tracking and progress monitoring.
- **Gamification Features**: XP system, achievements, and progress tracking (some advanced features may be hidden for current deployment).
- **Internationalization**: Comprehensive bilingual support for English and Chinese across all major platform components.

### Design System Standards (PKL-278651 Framework)
- **Official UI/UX Standard**: Mandatory mobile-first design with desktop enhancement.
- **Core Principles**: Gesture navigation, 44px+ touch targets, micro-animations, voice-ready architecture, progressive disclosure.
- **Color Scheme**: Primary Orange (#FF5722), Secondary Blue (#2196F3), Success Green, Warning Amber, Error Red, Neutral Grays.
- **Typography**: Inter for headings and body text, Roboto Mono for statistics.
- **Component Standards**: Card-based layouts, swipeable interfaces, skeleton loaders, friendly error handling, responsive breakpoints.

## External Dependencies
### Core Dependencies
- **React**: Frontend framework.
- **Express.js**: Web server and API framework.
- **Drizzle ORM**: Database operations.
- **Passport.js**: Authentication middleware.
- **bcrypt**: Password hashing.
- **PostgreSQL**: Primary database system.
- **Wise**: Payment gateway.

### Development Tools
- **Vite**: Build tool.
- **TypeScript**: Type safety.
- **Tailwind CSS**: CSS framework.
- **ESLint/Prettier**: Code quality and formatting.

### Deployment
- **Replit**: Development and initial deployment.
- **Cloud Run**: Production environment.
- **Environment Variables**: For sensitive data like `DATABASE_URL`, `SESSION_SECRET`, `PORT`, `WISE_API_TOKEN`.
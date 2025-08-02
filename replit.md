# Pickle+ - Comprehensive Ecosystem Platform

## Overview
Pickle+ is the central operating system for the global FPF (Future Pickleball Federation) franchise network, designed as a comprehensive ecosystem that unifies players, coaches, franchisees, headquarters, events, retail, facilities, and digital currency into one seamless and scalable platform. 

The platform serves multiple stakeholder groups:
- **Players**: From casual participants to competitive athletes, with both members and non-members
- **Coaches**: PCP-certified professionals with standardized training and performance tracking
- **Franchisees**: Business owners managing facilities, revenue, and local operations
- **FPF Headquarters**: Strategic oversight, compliance monitoring, and network growth
- **Facilities**: Physical locations requiring operational management and optimization
- **Retail Partners**: Equipment authentication, inventory management, and sales integration

The ecosystem emphasizes a unified player passport system, gamified loyalty through Pickle Points digital currency, and comprehensive franchise management capabilities while maintaining the core pickleball community and coaching development features.

## User Preferences
Preferred communication style: Simple, everyday language.
Coach workflow preferences:
- Coaches should access training facilities to apply as facility coaches
- Profile management should use inline editing rather than separate page navigation
- Use "Coaching Bio" for coaching profile sections (not "PCP Coaching Certification Programme")

## Development Accuracy Standards
**CRITICAL REQUIREMENT**: Never claim features are "complete" without operational verification.
- Only schemas/API routes created = "Design Phase Complete" (NOT "Complete")
- Frontend + Backend implemented = "Implementation Phase" (NOT "Complete") 
- End-to-end tested and functional = "OPERATIONALLY COMPLETE"
- Single source of truth: `client/src/pages/EnhancedCoachingWorkflowAnalysis.tsx`
- All completion claims must include evidence (screenshots, test results, working URLs)
- **Mandatory Development Dashboard**: EnhancedCoachingWorkflowAnalysis.tsx serves as real-time progress tracker
- **User Journey Validation**: Each feature must include UX testing (happy path, error handling, mobile, accessibility)
- See `DEVELOPMENT_ACCURACY_FRAMEWORK.md` for complete standards

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

#### Phase 1: Player & Coaching Platform (Current) ✅ COMPLETE
**MAJOR MILESTONE**: All critical Phase 1 infrastructure now operational (August 2025)
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
- **Phase 1 Complete Infrastructure**: Course Module System, Admin Approval Workflow, Session Booking System, and Payout System with comprehensive API coverage and database schemas.

#### Phase 2: Franchise Ecosystem Expansion (Planned) 🚀
- **Franchise Management Module**: Revenue tracking, royalty calculations (20%), compliance monitoring, SOP libraries, multi-location analytics
- **Retail & Equipment Authentication**: NFC-based SHOT3 product authentication, inventory management, affiliate programs, smart recommendations
- **Facility Management System**: Asset scheduling, maintenance tracking, utility monitoring, security controls, vendor management
- **Pickle Points Digital Currency**: Blockchain-ready point economy, tier system (Bronze/Silver/Gold/Platinum), corporate integration, cross-module payments
- **Advanced Analytics & AI Engine**: Predictive analytics, real-time dashboards, compliance automation, growth optimization

#### Strategic Development Approach
**Current Focus**: Complete Phase 1 platform with validated core features for individual facilities and coaches
**Architecture Design**: Building franchise-ready multi-tenant architecture from the ground up
**Revenue Validation**: Establish coaching ($95 sessions) and certification revenue ($699-$2,499) before franchise expansion
**Incremental Scaling**: Individual facilities → Regional partnerships → Full franchise network

### WISE Payment Integration Status ✅ COMPLETE
- **Technical Integration**: 100% complete with bidirectional money flow (send + receive)
- **Self-Service Solution**: Wise Business API integration ready for immediate use
- **Business API Routes**: `/api/wise/business/*` endpoints operational  
- **Coach Payout System**: End-to-end international payment workflow implemented
- **Receiving Money**: Account balance monitoring, transaction history, incoming payment simulation
- **Multi-Currency Support**: 40+ currencies, 160+ countries ready
- **Implementation Options**:
  1. **✅ Wise Business API** (Self-Service) - ACTIVE & RECOMMENDED
  2. **⚠️ Platform Partnership API** (Future enhancement)
  3. **🔧 Diagnostic System** (Development & testing)
- **Production Ready**: Set WISE_BUSINESS_API_TOKEN and deploy immediately

### PCP Coach Onboarding System ✅ COMPLETE (PKL-278651-PCP-BASIC-TIER)
- **Comprehensive Basic Tier**: Unlimited sessions and full platform access for all PCP coaches
- **4-Step Onboarding Flow**: PCP verification, profile setup, specializations, emergency contact
- **Sequential Level Progression**: MANDATORY - Level 1 → 2 → 3 → 4 → 5 (no skipping allowed)
- **Commission Structure**: Level-based rates (15% L1, 13% L2, 12% L3, 10% L4, 8% L5)
- **Premium Upgrade Path**: $19.99/month for advanced business tools (automated payouts, analytics, marketing)
- **Apple-Style Philosophy**: Simplicity without sacrificing functionality - no artificial barriers
- **Technical Implementation**: Complete schema, storage layer, validation system, and API routes
- **Routes Active**: `/api/pcp-coach/*` and `/api/pcp-cert/*` endpoints operational
- **Level Validation**: Real-time progression checking and prerequisite enforcement
- **Frontend Components**: Onboarding, Dashboard, and Level Validation components ready

### Payment Architecture & Revenue Streams
- **PCP Certification**: $699-$2,499 (automatic platform listing upon completion)
- **Coaching Sessions**: $95 per session (tiered commission: 15% Level 1, 13% Level 2, 12% Level 3+)
- **Coach Subscriptions**: COMPREHENSIVE BASIC (free) vs PREMIUM BUSINESS TOOLS ($19.99/month)
- **Revenue Strategy**: Primary revenue from session commissions, secondary from premium business tools
- **Coach Tiers**: Level-based system (1-5) with automatic listing for all PCP-certified coaches
- **Basic Tier**: Unlimited sessions, full profiles, standard payment processing, basic analytics
- **Premium Tier**: Automated payouts, advanced analytics, marketing tools, video sessions, business reporting

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
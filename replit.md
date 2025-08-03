# Pickle+ - Comprehensive Ecosystem Platform

## Overview
Pickle+ is a comprehensive ecosystem platform designed as the central operating system for the global FPF (Future Pickleball Federation) franchise network. It unifies players, coaches, franchisees, headquarters, events, retail, facilities, and digital currency into a seamless and scalable platform. The platform's main purpose is to serve various stakeholder groups including casual and competitive players, certified coaches, franchisees managing facilities and operations, FPF headquarters for strategic oversight, facilities requiring operational management, and retail partners for equipment management and sales. Key capabilities include a unified player passport system, gamified loyalty via Pickle Points digital currency, and comprehensive franchise management, all while supporting the core pickleball community and coaching development.

## User Preferences
Preferred communication style: Simple, everyday language.
Coach workflow preferences:
- Coaches should access training facilities to apply as facility coaches
- Profile management should use inline editing rather than separate page navigation
- Use "Coaching Bio" for coaching profile sections (not "PCP Coaching Certification Programme")

## Development Guidelines
- Keep things simple - avoid unnecessary complex naming like "Enhanced" prefixes
- Use only `/udd` route for Universal Development Dashboard
- Tab labels must be concise and easy to navigate
- **Mandatory Pre-Development Protocol**: All new requirements must be discussed, confirmed, and integrated into UDD before development begins
- **Mobile-First UDD Design**: All dashboard sections must be mobile-optimized and concise
- All critical gaps development strategy must be integrated into universal development dashboard before proceeding with implementation

## System Architecture
Pickle+ utilizes a modern full-stack architecture with a React frontend, Node.js backend, and PostgreSQL database. All development adheres to a modular architecture and evidence-based completion standards, ensuring specialized route modules, proper registration functions, and authentic data integration.

### Universal Development Framework
- **Universal Development Dashboard (UDD)**: Located at `/udd` route (`client/src/pages/CoachingWorkflowAnalysis.tsx`), this dashboard serves as the central hub for tracking all development workflows including:
  - **Requirements Planning**: Mandatory integration point for all new feature discussions and approvals
  - **Mobile-First Design**: Optimized interface for mobile devices with concise information display
  - **Interactive UDF Workflow**: Full implementation of the Discussion → UDD Integration → Review → Sequential Validation → Development protocol with proper button functionality
  - Module development and integration status
  - User journey implementation and testing
  - UI/UX component development tracking
  - API endpoint validation and testing
  - Critical gaps analysis and resolution
  - Phase-based development progression
- **UDF Workflow Implementation**: Complete workflow system with:
  - "Review Requirements & Begin Development" buttons that trigger proper UDF workflow
  - RequirementReviewDialog with sequential validation checks
  - Workflow state management and history tracking
  - Proper dependency validation before development authorization
  - **Agent Communication System**: "Begin Development" button generates and copies development request message for user to send to agent, triggering actual implementation work
- **Unified Tracking**: All development activities are monitored through the UDD, providing real-time validation and comprehensive status reporting across the entire platform ecosystem.
- **Pre-Development Protocol**: No development begins until requirements are discussed, confirmed, and integrated into UDD with proper phase planning.
- **Development Workflow**: Discussion → UDD Integration → Review & Validation → Sequential Dependency Check → Development Authorization → Implementation

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React hooks with Context API
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router
- **UI Components**: Custom, mobile-first responsive components adhering to the PKL-278651 design framework, emphasizing fewer clicks, QR code integration, and comprehensive ranking system display.

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
The platform is developed in phases, with current focus on core coaching marketplace and advanced analytics.
- **Authentication System**: Secure user registration with email validation, bcrypt hashing, and session management.
- **Training Center Management**: QR code-based facility access, class scheduling, real-time capacity management.
- **PickleJourney™ System**: Multi-role support, journaling with AI sentiment analysis, XP system, and emotional intelligence tracking.
- **Coach Application System**: Streamlined 5-step onboarding, credential verification, and achievement showcase.
- **PCP Ranking System**: Points-based ranking with performance tracking.
- **Comprehensive Assessment Tool**: 42-skillset PCP assessment across Technical, Tactical, Physical, and Mental dimensions.
- **Payment Gateway Integration**: Wise payment gateway for international and domestic transactions.
- **Unified Coach Hub**: Consolidates coaching features under a single `/coach` hub.
- **Curriculum Management System**: CRUD operations for drills and learning content, integrated with PCP assessment.
- **Session Management System**: End-to-end workflow for session requests, scheduling, and completion.
- **Goal Management System**: Player and coach-player goal setting with milestone tracking.
- **Gamification Features**: XP system and achievements.
- **Internationalization**: Bilingual support for English and Chinese.
- **Coach Business Analytics Dashboard**: Revenue analytics, client metrics, schedule optimization, marketing ROI, performance KPIs.
- **Student Progress Analytics System**: Skill assessments, goal tracking, session history, progress reports.
- **Curriculum Management Integration**: Advanced drill libraries and lesson planning.
- **Multi-dimensional Analytics Engine**: Real-time business intelligence and predictive coaching insights.
- **AI-Powered Business Intelligence**: AI Revenue Forecasting, Demand Pattern Analysis, Smart Scheduling Optimization, Client Retention Analytics, Client Lifetime Value Analysis, Marketing ROI Dashboard, and Competitive Intelligence.
- **PCP Coach Onboarding System**: 4-step onboarding flow for coaches, supporting sequential level progression with tiered commission structures.
- **Payment Architecture**: Revenue from PCP Certifications, Coaching Sessions (tiered commission), and optional Premium Coach Subscriptions ($19.99/month) for advanced business tools.
- **Design System Standards (PKL-278651 Framework)**: Mandatory mobile-first design, gesture navigation, 44px+ touch targets, micro-animations, voice-ready architecture, progressive disclosure. Color scheme includes Primary Orange, Secondary Blue, with Inter and Roboto Mono fonts.
- **Critical Gaps Analysis System**: Comprehensive deployment readiness assessment with identified critical gaps: PCP Sequential Enforcement (10% complete), Coach Marketplace Discovery (25% complete), and Coach Reputation System (0% complete).
- **Universal Development Dashboard (UDD)**: Integrated at `/udd` route as part of the unified development framework. Features a unified Development Ledger that combines gaps and development phases into a complete tracking system with four categories: Completed Features (live and deployed), Ready to Develop (dependencies met), Blocked Features (dependency waiting), and Planned Features (future roadmap). Includes sequential validation system that prevents premature development and platform disruption by enforcing proper dependency sequencing.

## External Dependencies
### Core Dependencies
- **React**: Frontend framework.
- **Express.js**: Web server and API framework.
- **Drizzle ORM**: Database operations.
- **Passport.js**: Authentication middleware.
- **bcrypt**: Password hashing.
- **PostgreSQL**: Primary database system.
- **Wise**: Payment gateway for transactions.

### Development Tools
- **Vite**: Build tool.
- **TypeScript**: Type safety.
- **Tailwind CSS**: CSS framework.
- **ESLint/Prettier**: Code quality and formatting.

### Deployment
- **Replit**: Development and initial deployment.
- **Cloud Run**: Production environment.
- **Environment Variables**: Used for sensitive data like `DATABASE_URL`, `SESSION_SECRET`, `PORT`, `WISE_API_TOKEN`.
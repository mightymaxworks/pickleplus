# Pickle+ - Comprehensive Pickleball Platform

## Overview

Pickle+ is a comprehensive pickleball platform that combines player development, coaching tools, social features, and training center management. The application uses a modern full-stack architecture with React frontend, Node.js backend, and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **State Management**: React hooks with Context API for global state
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for client-side navigation
- **UI Components**: Custom components with mobile-first responsive design

### Backend Architecture
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js for API server
- **Authentication**: Passport.js with local strategy and session management
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Handling**: Standard FileReader API for image uploads

### Database Architecture
- **Primary Database**: PostgreSQL with comprehensive schema
- **ORM**: Drizzle ORM with TypeScript integration
- **Key Tables**: users, coach_profiles, class_templates, class_instances, journal_entries, achievements
- **Relationships**: Proper foreign key constraints and normalized structure

## Key Components

### 1. Authentication System
- **User Registration**: Complete with email validation and password security
- **Session Management**: Secure session handling with database storage
- **Password Security**: bcrypt hashing with salt rounds
- **Profile Management**: User profiles with avatar, bio, and skill tracking

### 2. Training Center Management
- **Facility Selection**: QR code-based facility access
- **Class Scheduling**: Comprehensive class management with coach assignments
- **Capacity Management**: Real-time enrollment tracking and waitlist functionality
- **Coach Profiles**: Professional credentials, ratings, and specializations

### 3. PickleJourney™ System
- **Multi-Role Support**: Player, coach, and referee role management
- **Journal Entries**: Comprehensive journaling with mood tracking and sentiment analysis
- **Progress Tracking**: XP system with tier progression and achievements
- **Emotional Intelligence**: Mood and energy level tracking with AI analysis

### 4. Coach Application System
- **5-Step Application**: Streamlined coach onboarding process
- **Credential Verification**: Professional background and certification tracking
- **Rate Setting**: Individual and group lesson pricing management
- **Achievement Showcase**: Professional accomplishments and testimonials

### 5. PCP Rating System
- **4-Dimensional Assessment**: Technical (40%), Tactical (25%), Physical (20%), Mental (15%)
- **Skill Tracking**: Comprehensive player evaluation across 20+ metrics
- **Progress Visualization**: Rating history and improvement tracking
- **Coach Dashboard**: Player management and assessment tools

## Data Flow

### User Registration and Authentication
1. User submits registration form with first name, last name, email, and password
2. Backend validates data and checks for existing users
3. Password is hashed using bcrypt
4. User record created in database
5. Session established with passport.js
6. User redirected to dashboard

### Training Center Booking
1. User selects training center via QR code or facility selection
2. System fetches available classes and coach information
3. User views class details including capacity and prerequisites
4. Enrollment processed with real-time capacity updates
5. Confirmation sent to user and coach notification triggered

### Journal Entry Creation
1. User selects entry type and role context
2. Content created with mood and energy level ratings
3. AI sentiment analysis performed on entry content
4. Entry stored with proper visibility settings
5. Achievement progress updated based on milestones

## External Dependencies

### Core Dependencies
- **React**: Frontend framework and ecosystem
- **Express.js**: Web server and API framework
- **Drizzle ORM**: Database operations and migrations
- **Passport.js**: Authentication middleware
- **bcrypt**: Password hashing and security
- **PostgreSQL**: Primary database system

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code quality and formatting

### Deployment
- **Replit**: Primary deployment platform
- **Cloud Run**: Production environment
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, PORT

## Deployment Strategy

### Production Configuration
- **Port**: Uses PORT environment variable (default 5000 for Replit)
- **Database**: PostgreSQL via DATABASE_URL environment variable
- **Session Store**: Database-backed session storage
- **Static Files**: Vite-built client served from dist/public

### Build Process
1. Client application built using Vite to dist/public
2. Server compiled to ES modules in dist/
3. Dependencies installed in production environment
4. Environment variables configured for database and sessions
5. Application started with proper port binding

### Error Handling
- **Authentication Resilience**: Robust error handling in passport deserializeUser
- **Database Connectivity**: Connection retry logic and fallback mechanisms
- **Session Management**: Graceful session error handling
- **API Validation**: Comprehensive input validation and error responses

## Recent Changes

### June 18, 2025 - Enhanced Role-Based Dashboard
- **Role-Based Quick Actions**: Dashboard now adapts based on user's coaching status
- **Coach Profile Integration**: "Manage Coach Profile" opens inline editing instead of separate page
- **Universal Training Facilities**: Both coaches and players can access "Find Training Facilities"
- **Coach Status Detection**: API endpoint `/api/coaches/my-profile` detects existing coaches
- **UX Improvements**: Coaches see "Manage Coach Profile", regular players see "Find Coaches"

### June 14, 2025 - Initial Setup
- Core platform architecture established
- Authentication and user management systems implemented
- PCP rating system with 4-dimensional assessment

## User Preferences

Preferred communication style: Simple, everyday language.
Coach workflow preferences: 
- Coaches should access training facilities to apply as facility coaches
- Profile management should use inline editing rather than separate page navigation
- Always use "PCP Coaching Certification Programme" (no acronyms)
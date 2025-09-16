# PicklePlus Advanced Facility Management Development Plan
**Phase 2: Programme Management & Digital Currency Integration**

## 📋 Executive Summary

This document outlines the comprehensive development plan for PicklePlus Phase 2, focusing on two major feature expansions:

1. **Programme Management System** - Structured training programs with assessment integration
2. **Digital Currency System** - Pickle Credits with corporate accounts and gift cards
3. **Integrated Coach-Facility Revenue Model** - Revenue sharing with home facility royalties

### Strategic Decision: Integrated Model
After comprehensive analysis, we've chosen the **Integrated Coach-Facility Model** over separate entities to:
- Create defensible three-way relationships (user-coach-facility)
- Ensure quality through facility vetting
- Enable multiple revenue streams per transaction
- Build a valuable ecosystem rather than a commoditized marketplace

---

## 💰 Digital Currency System Architecture

### Core Concept: Pickle Credits
- **Closed-Loop Currency**: Cash converts to Pickle Credits, stays within PicklePlus ecosystem
- **Bonus Structure**: Progressive bonuses (e.g., $100 → 107 credits, $500 → 535 credits)
- **No Expiry**: Credits remain valid indefinitely
- **Low Balance Warnings**: Proactive notifications when credits run low
- **Cross-Platform Usage**: Credits work for facilities, coaching, programs, retail

### Pickle Points Integration
- **3:1 Earning Ratio**: 3 Pickle Points earned per Pickle Credit purchased
- **Dual System**: Pickle Credits for purchasing, Pickle Points for ranking/gamification
- **Purchase Trigger**: Points awarded on credit purchase (not usage)
- **Corporate Integration**: Points go to individual employees, not company pools

### Account Types & Features

#### Individual Accounts
- **Standard Top-ups**: Credit card via Wise integration
- **Bonus Credits**: Incentivize larger purchases (10-15% bonus on $100+)
- **Transfer Capability**: Users can gift/transfer credits to others
- **Transaction History**: Complete audit trail of all credit activity

#### Corporate Accounts (50-200 Employees)
- **Multi-Level Administration**:
  - Master Admin (C-suite): Unlimited spending, all reports, user management
  - Department Admins (HR/Operations): Department budgets, team reports
  - Team Leads (Managers): Team allocation, member reports
  - Budget Controllers (Finance): Read-only financial access

- **Bulk Purchase Benefits**:
  - 10% bonus credits for $5K+ purchases
  - 15% bonus credits for $10K+ purchases
  - Additional 5% discount for annual commitments
  - Volume-based corporate pricing

- **Granular Controls**:
  - Individual employee spending limits set by administrators
  - Department budget allocation and burn rate tracking
  - Real-time usage analytics and wellness metrics
  - Employee turnover credit management (credits stay with company)

#### Gift Card System
- **Fixed Denominations**: $25, $50, $100, $250, $500
- **Fresh Payment Only**: Gift cards purchased with new payments, not existing credits
- **Partial Redemption**: Recipients can use gift cards in multiple transactions
- **Seasonal Specials**: Holiday themes, "New Year Fitness" editions
- **Corporate Bulk**: Discounted rates for employee recognition programs

---

## 📚 Programme Management System

### Program Structure & Types

#### Group Classes
- **Multi-participant programs** with fixed schedules
- **Skill-based enrollment** requiring minimum PCP scores
- **Capacity management** with intelligent waitlist systems
- **Package pricing** (per-session or full program)

#### Individual Programs
- **Personalized coaching series** with higher price points
- **Flexible scheduling** based on coach availability
- **Customized curriculum** based on player assessments
- **One-on-one progress tracking**

#### Certification Programs
- **Structured multi-week curriculum** with testing requirements
- **Official credential awards** upon completion
- **Ranking point bonuses** for certified achievements
- **Industry recognition** and badge system integration

### Assessment Integration Framework

#### Entry Requirements
- **Skill Gating**: "Advanced Tactics requires 1200+ ranking points"
- **Dynamic Recommendations**: "Your 1200 ranking qualifies you for Advanced Strategy Program"
- **Cross-Category Eligibility**: U19 players can compete in Open programs

#### Progress Measurement
- **Pre/Post Assessments**: Quantified skill improvement tracking
- **Session-by-Session Updates**: Real-time progress monitoring
- **Milestone Tracking**: Achievement unlocks throughout programs
- **Completion Certificates**: Official credentials with verification

#### Coach Integration
- **L4/L5 Coach Verification**: Only certified coaches can confirm official ratings
- **Weighted Assessment Algorithm**: L1:0.7x, L2:1.0x, L3:1.8x, L4:3.2x, L5:3.8x
- **Two-Tier Rating System**: PROVISIONAL (all coaches) vs VERIFIED (L4+ only)

### Waitlist Management Intelligence

#### Smart Prioritization
- **Premium Account Priority**: Higher-tier members get preference
- **Frequent User Bonuses**: Platform loyalty influences position
- **Early Bird Rewards**: First registrants get priority for similar programs
- **Alternative Suggestions**: "Beginner Tennis full, but Beginner Padel available"

#### Automated Management
- **Predictive Analytics**: Historical dropout patterns inform over-enrollment
- **Auto-Enrollment**: Next person automatically enrolled with 24hr confirmation
- **Compensation Credits**: Bumped users receive small credit bonuses
- **Communication Automation**: Smart notifications for likely openings

---

## 💼 Integrated Coach-Facility Revenue Model

### Revenue Split Framework

#### Base Split Structure (Backend Configurable)
- **Facility-Hosted Programs**: Facility 60%, Coach 30%, Platform 10%
- **Coach-Led Programs**: Facility 25%, Coach 65%, Platform 10%
- **Certification Programs**: Facility 15%, Coach 75%, Platform 10%
- **Corporate Programs**: Facility 40%, Coach 50%, Platform 10%

#### Performance Modifiers (Automated)
- **Coach Rating Bonus**: +5% to coach split if rating >4.8
- **Completion Rate Bonus**: +3% to coach split if >90% completion
- **Exclusive Partnership**: +7% to coach split for facility exclusivity
- **Volume Incentives**: Automatic improvements based on monthly thresholds

#### Dynamic Configuration System
- **Global Defaults**: Platform-wide standard splits
- **Regional Overrides**: City/state-specific adjustments
- **Facility-Specific**: Individual facility negotiated rates
- **Coach-Specific**: Star coach special arrangements
- **Emergency Adjustments**: Crisis response modifications

### Home Facility Royalty Model

#### Royalty Trigger Conditions
- **Geographic Threshold**: Applies when coach works >10 miles from home facility
- **Revenue Threshold**: Kicks in after coach earns >$750/month externally
- **Relationship Duration**: Home facility must have hosted coach 90+ days
- **Activity Requirement**: Coach must have completed >20 sessions at home facility

#### Royalty Rate Structure
- **$750-$1,500/month**: 8% royalty to home facility
- **$1,501-$3,000/month**: 10% royalty to home facility
- **$3,001-$5,000/month**: 12% royalty to home facility
- **$5,000+/month**: 15% royalty to home facility

#### Customer Origin Attribution
- **Discovery Attribution**: Track where customer first found coach
- **Home Facility Discovery**: 5% perpetual royalty on revenue
- **Facility Marketing**: 5% perpetual royalty on facility-promoted coaches
- **Coach Personal Marketing**: 0% royalty
- **Platform Discovery**: 2% platform arbitration fee
- **Attribution Expiry**: 24-month tracking window

#### Edge Case Management
- **Home Facility Changes**: Previous facility retains 3% for 12 months
- **Facility Exits Platform**: Royalty obligations terminate immediately
- **Seasonal Facilities**: Reduced rates (5-8%) for temporary venues
- **Geographic Exceptions**: Different rules for multi-city operations

---

## 🔧 Technical Implementation Architecture

### Database Schema Requirements

#### Digital Currency Tables
```sql
-- Core credit system
credits_accounts (user_id, balance, created_at, updated_at)
credits_transactions (id, user_id, amount, type, reference_id, wise_transaction_id)
credits_gift_cards (id, code, amount, purchaser_id, recipient_email, redeemed_at)

-- Corporate accounts
corporate_accounts (id, company_name, master_admin_id, total_credits)
corporate_hierarchy (id, corporate_account_id, user_id, role, spending_limit, department)
corporate_transactions (id, corporate_account_id, user_id, amount, approved_by, purpose)
```

#### Programme Management Tables
```sql
-- Program structure
programs (id, title, description, coach_id, facility_id, program_type, capacity, price_credits)
program_sessions (id, program_id, session_date, duration, location, max_participants)
program_enrollments (id, program_id, user_id, enrolled_at, status, credits_paid)
program_waitlists (id, program_id, user_id, position, priority_score, joined_at)

-- Assessment integration
program_requirements (id, program_id, min_ranking_points, skill_categories, coach_level_required)
program_assessments (id, program_id, user_id, pre_assessment, post_assessment, progress_notes)
program_certificates (id, program_id, user_id, certificate_type, issued_date, verification_code)
```

#### Revenue Management Tables
```sql
-- Revenue splits and royalties
revenue_splits (id, transaction_id, coach_percentage, facility_percentage, platform_percentage)
royalty_calculations (id, coach_id, home_facility_id, external_facility_id, royalty_percentage, amount)
facility_relationships (id, coach_id, facility_id, relationship_type, start_date, exclusivity_terms)
split_configurations (id, program_type, base_splits, modifier_rules, effective_date)
```

### API Endpoints Architecture

#### Digital Currency APIs
```
POST /api/credits/top-up - Process credit purchase via Wise
GET /api/credits/balance - Get current user credit balance
POST /api/credits/transfer - Transfer credits between users
GET /api/credits/history - Get transaction history

POST /api/gift-cards/purchase - Buy gift card
POST /api/gift-cards/redeem - Redeem gift card code
GET /api/gift-cards/validate - Validate gift card status

POST /api/corporate/accounts - Create corporate account
POST /api/corporate/users/add - Add user to corporate account
PUT /api/corporate/limits - Update spending limits
GET /api/corporate/analytics - Get usage analytics
```

#### Programme Management APIs
```
POST /api/programs/create - Create new program
GET /api/programs/search - Search available programs
POST /api/programs/enroll - Enroll in program
POST /api/programs/waitlist - Join program waitlist
GET /api/programs/my-programs - Get user's enrolled programs

POST /api/programs/assessments - Submit assessment data
GET /api/programs/progress - Get program progress
POST /api/programs/certificates - Issue completion certificate
```

#### Revenue Management APIs
```
POST /api/revenue/calculate-split - Calculate revenue distribution
GET /api/revenue/splits/history - Get split payment history
POST /api/revenue/royalty/calculate - Calculate home facility royalty
PUT /api/revenue/splits/config - Update split configuration
GET /api/revenue/analytics - Get revenue analytics
```

### Wise Payment Integration

#### Payment Flow Architecture
```
User Top-up → Wise API → Credit Issuance → Points Award → Balance Update
Corporate Bulk → Wise Business → Admin Distribution → Employee Allocation
Gift Purchase → Wise → Certificate Generation → Email Delivery → Recipient Activation
```

#### Security & Compliance
- **PCI Compliance**: All payment data handled by Wise, not stored locally
- **Fraud Detection**: Unusual spending patterns trigger reviews
- **Transaction Limits**: Daily limits prevent abuse ($1K individual, $50K corporate)
- **Audit Trails**: Complete transaction logging with Wise reference IDs
- **Reconciliation**: Nightly settlement matching against credit ledger

---

## 📱 Mobile-First Implementation Requirements

### Mobile UX Principles
- **Touch Target Compliance**: All interactive elements ≥44px minimum
- **Single-Handed Operation**: Critical actions accessible within thumb reach
- **Progressive Disclosure**: Complex features hidden behind accordions/bottom sheets
- **Offline Capability**: Core functions work with limited connectivity

### Mobile-Specific Features

#### Programme Management Mobile UX
- **Swipeable Program Cards**: Easy browsing of available programs
- **Bottom Sheet Enrollment**: Modal enrollment forms from mobile
- **Progress Ring Indicators**: Visual progress tracking with animations
- **Mobile Assessment Tools**: Touch-friendly skill evaluation interfaces

#### Corporate Mobile Admin
- **Dashboard Widget System**: Key metrics in mobile-friendly cards
- **Quick Actions**: Common admin tasks accessible via FAB menus
- **Mobile Analytics**: Charts and graphs optimized for small screens
- **Approval Workflows**: Mobile-friendly approval processes for spending

#### Credit Management Mobile UX
- **Gesture-Based Top-ups**: Swipe actions for common amounts
- **Quick Transfer**: Contact-based credit transfers
- **Balance Widgets**: Always-visible balance in navigation
- **Mobile Receipt System**: Digital receipts with sharing capability

### Performance Requirements
- **Page Load Times**: <2 seconds on 3G networks
- **Lighthouse Mobile Score**: ≥90 for all new features
- **Battery Optimization**: Efficient algorithms to preserve device battery
- **Data Usage**: Minimize API calls and payload sizes

---

## 🎯 5-Sprint Development Timeline

### Sprint 1: Foundation & Digital Currency Core (Weeks 1-4)
**Goal**: Establish digital currency infrastructure with Wise integration

**Deliverables**:
- Digital currency database schema and core APIs
- Individual credit system with top-up and spending flows
- Gift card purchase, generation, and redemption system
- Pickle Points 3:1 integration with existing ranking system
- Basic admin interfaces for credit management

**Acceptance Criteria**:
- Users can top up credits via Wise with bonus calculations
- Gift cards work end-to-end (purchase → delivery → redemption)
- Credit balances update in real-time across all sessions
- Pickle Points awarded correctly for all credit transactions
- Complete audit trail for financial compliance

### Sprint 2: Corporate Accounts & Admin Systems (Weeks 5-8)
**Goal**: Build corporate account hierarchy targeting 50-200 employee companies

**Deliverables**:
- Multi-level corporate account architecture and permissions
- Corporate admin dashboard with real-time analytics
- Bulk credit purchase system with volume discounts
- Corporate onboarding workflow with pilot programs
- Employee spending controls and limit management

**Acceptance Criteria**:
- Corporate admins can manage multi-level user hierarchies
- Granular spending reports available at all administrative levels
- Bulk purchases process correctly with automatic discount calculations
- Employee spending limits enforced properly across all platforms
- Corporate onboarding flow completed end-to-end successfully

### Sprint 3: Programme Management Foundation (Weeks 9-12)
**Goal**: Build structured program creation with assessment integration

**Deliverables**:
- Program creation system for all three types (group, individual, certification)
- Enrollment and booking system with credit-based payments
- Assessment integration with entry requirements and progress tracking
- Coach-facility collaboration tools for joint program creation
- Intelligent waitlist management with priority algorithms

**Acceptance Criteria**:
- Coaches and facilities can create programs together successfully
- Users can discover, enroll, and pay for programs using credits
- Assessment scores properly gate program access based on requirements
- Waitlist system handles overflow enrollment with smart prioritization
- Program completion updates participant credentials and rankings

### Sprint 4: Integrated Revenue Model (Weeks 13-16)
**Goal**: Implement dynamic revenue splitting with home facility royalties

**Deliverables**:
- Dynamic revenue split engine with backend configuration
- Home facility royalty system with geographic and revenue thresholds
- Customer origin attribution tracking for royalty calculations
- Revenue management dashboard with real-time split tracking
- Cross-facility program management with territorial controls

**Acceptance Criteria**:
- Revenue splits calculate correctly across all program types
- Home facility royalties process automatically based on thresholds
- Backend admins can adjust split percentages without code deployment
- Cross-facility programs trigger appropriate royalty payments
- All financial transactions maintain complete audit trails

### Sprint 5: Mobile Optimization & Integration (Weeks 17-20)
**Goal**: Apply mobile-first design and complete system integration

**Deliverables**:
- Mobile-optimized interfaces for all new features
- Cross-system integration with existing facility management
- Performance optimization for mobile networks and devices
- Comprehensive QA testing across all features and devices
- Complete documentation and admin training materials

**Acceptance Criteria**:
- All features work seamlessly on mobile (44px+ touch targets)
- Page load times <2 seconds on mobile networks
- Complete integration with existing facility management features
- Zero blocking bugs in financial transaction flows
- Comprehensive test coverage for all new functionality

---

## 📊 Success Metrics & KPIs

### Financial Metrics
- **Credit Adoption Rate**: 30% of users top up credits within 60 days
- **Corporate Customer Acquisition**: 10+ companies (50-200 employees) within 6 months
- **Average Credit Balance**: $50+ maintained balance per active user
- **Gift Card Performance**: 85% redemption rate within 12 months
- **Revenue Growth**: 25% platform revenue increase through new models

### Program Metrics
- **Program Utilization**: 40% of users enroll in at least one program
- **Completion Rates**: 85%+ completion rate for enrolled programs
- **Coach Participation**: 60% of coaches create at least one program
- **Assessment Integration**: 70% of programs utilize entry requirements
- **Cross-Feature Usage**: 50% of users utilize multiple features

### Technical Performance Metrics
- **System Uptime**: 99.9% availability for financial transactions
- **Mobile Performance**: <2s load times, Lighthouse score ≥90
- **Financial Accuracy**: Zero calculation errors in splits/credits
- **Integration Quality**: Seamless navigation between all features
- **Support Volume**: <5% of transactions require customer support

### User Experience Metrics
- **Mobile Satisfaction**: 4.5+ rating for mobile experience
- **Feature Discovery**: 60% discover programs through facility pages
- **Corporate Engagement**: 70% monthly active usage in corporate accounts
- **Credit System NPS**: Net Promoter Score ≥50 for credit system
- **Program Satisfaction**: 4.7+ average rating for completed programs

---

## ⚠️ Risk Management & Mitigation

### Technical Risks
- **Wise Integration Complexity**: Extensive sandbox testing, fallback payment methods
- **Revenue Split Accuracy**: Comprehensive unit testing, mathematical verification
- **Mobile Performance**: Progressive enhancement, performance budgets, CDN optimization
- **Corporate Scale**: Load testing with simulated high-volume usage scenarios
- **Data Consistency**: Strong consistency requirements, transaction rollback mechanisms

### Business Risks
- **Coach-Facility Relationship Management**: Clear contracts, dispute resolution processes
- **Corporate Customer Acquisition**: Reference customers, pilot success metrics
- **Revenue Split Disputes**: Transparent calculation, automated evidence collection
- **Competitive Response**: Focus on defensible integrated model advantages
- **Financial Compliance**: Regular audit processes, legal review of terms

### Operational Risks
- **Customer Support Volume**: Dedicated support queues, comprehensive FAQs
- **Payment Processing Issues**: Multiple payment method options, clear error handling
- **Data Privacy Compliance**: GDPR/CCPA compliance for corporate customer data
- **Scaling Challenges**: Auto-scaling infrastructure, performance monitoring
- **Quality Control**: Automated testing, staging environment validation

---

## 🔗 Integration Points with Existing Systems

### Facility Management Integration
- **Seamless Navigation**: Direct links between facility booking and program enrollment
- **Shared Credit Balance**: Single balance across booking and program payments
- **Unified Search**: Search across facilities, coaches, and programs simultaneously
- **Cross-Feature Analytics**: Combined reporting on facility usage and program participation

### Ranking System Integration
- **Assessment Gating**: Program entry requirements based on current rankings
- **Progress Rewards**: Ranking point bonuses for program completion
- **Coach Verification**: L4/L5 coach requirements for official assessments
- **Competitive Pathways**: Programs designed to improve specific ranking categories

### Mobile Optimization Integration
- **Consistent Design System**: All features follow established mobile primitives
- **Shared Components**: Reuse MobilePage, SectionCard, ResponsiveGrid patterns
- **Unified Navigation**: Consistent navigation patterns across all features
- **Performance Standards**: Same 44px touch target and load time requirements

### Administrative Integration
- **Unified Admin Dashboard**: All features accessible through single admin interface
- **Role-Based Access**: Consistent permission system across all administrative functions
- **Audit Trail Integration**: Combined audit logs across all platform features
- **Reporting Consolidation**: Unified analytics covering all aspects of platform usage

---

## 🚀 Post-Launch Enhancement Roadmap

### Phase 3 Enhancements (Months 21-24)
- **AI Program Recommendations**: Machine learning for personalized program suggestions
- **Advanced Analytics**: Predictive modeling for corporate wellness outcomes
- **Integration Marketplace**: Third-party integrations with wellness platforms
- **International Expansion**: Multi-currency support, localized payment methods

### Continuous Improvement Areas
- **Split Configuration UI**: Visual interface for revenue split management
- **Advanced Waitlist Intelligence**: Machine learning for dropout prediction
- **Corporate Wellness API**: Integration with enterprise wellness platforms
- **Mobile App Development**: Native iOS/Android apps for enhanced mobile experience

This comprehensive development plan provides the foundation for PicklePlus Phase 2, establishing advanced facility management capabilities that create sustainable competitive advantages through integrated coach-facility relationships, comprehensive digital currency systems, and world-class mobile experiences.
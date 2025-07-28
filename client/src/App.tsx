import React, { Fragment, useEffect, Suspense } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { TournamentChangeProvider } from './core/modules/tournament/context/TournamentChangeContext'
import { UserDataProvider } from '@/contexts/UserDataContext' // PKL-278651-PERF-0001.1-CACHE
// Onboarding system disabled - removed TutorialProvider import
import { CommunityProvider } from '@/lib/providers/CommunityProvider' // PKL-278651-COMM-0014-CONT
import { GuidedTaskProvider } from '@/contexts/BounceGuidedTaskContext' // PKL-278651-BOUNCE-0008-ASSIST
import { SageDataProvider } from '@/contexts/SageDataContext' // PKL-278651-SAGE-0029-API
import { DerivedDataProvider } from '@/contexts/DerivedDataContext' // PKL-278651-CALC-0002-CONTEXT
import { BounceFloatingWidget } from '@/components/bounce/BounceFloatingWidget' // PKL-278651-BOUNCE-0008-ASSIST
import QuickMatchFAB from '@/components/QuickMatchFAB' // Match Recording FAB
import { LazyLoadingFallback, lazyLoad } from '@/utils/lazyLoad' // PKL-278651-PERF-0001.2-SPLIT
import { moduleRegistry } from '@/core/modules/moduleRegistry' // For feedback module
import { SimpleBugReportButton } from '@/components/bug-report/BugReportButton' // Simplified bug report button
import { ProtectedRouteWithLayout } from './lib/protected-route-with-layout' // PKL-278651-UI-0001-STDROUTE
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute' // PKL-278651-AUTH-0008-ROLES
import { BounceMascot } from '@/components/mascot' // PKL-278651-MASCOT-0001-CORE
// Onboarding complete page removed - onboarding system disabled
import RoleProtectedDemoPage from './pages/RoleProtectedDemoPage' // PKL-278651-AUTH-0008-ROLES
import { UserRole } from '@/lib/roles' // PKL-278651-AUTH-0008-ROLES
import { LanguageProvider } from '@/contexts/LanguageContext' // Language internationalization
import { SmartFeatureGuide } from '@/components/onboarding/SmartFeatureGuide' // Smart feature discovery
import { ProfileCompletionWrapper } from '@/components/profile/ProfileCompletionWrapper' // Profile completion system


// Import module initializations
import '@/modules/admin/init'
import '@/core/modules/tournament/init'

// Import lazy-loaded components (PKL-278651-PERF-0001.2-SPLIT)
import {
  LazyLandingPage,
  LazyAuthPage,
  LazyAboutUsPage,
  LazyFeatureShowcasePage,
  LazyProfilePage,
  LazyProfileEditPage,
  LazyMatchesPage,
  // LazyMatchHistoryPage removed - using LazyMatchesPage instead
  LazyRecordMatchPage,
  LazyTournamentDiscoveryPage,
  LazyTournamentManagementPage,
  LazyTournamentDetailsPage,
  LazyBracketDetailsPage,
  LazyLeaderboardPage,
  LazyMasteryPathsPage,
  // LazyOnboardingPage removed - onboarding system disabled
  LazyEventDiscoveryPage,
  LazyMyEventsPage,
  LazyAdminDashboardPage,
  LazyPrizeDrawingPage,
  LazyGoldenTicketAdmin,
  LazyPassportVerificationPage,
  
  // PKL-278651-COACH-0001-CORE - S.A.G.E. Coaching System
  LazySageCoachingPage,
  // PKL-278651-COACH-001 - Coach Management System
  LazyCoachApplicationPage,
  LazyReportsPage,
  LazySettingsPage,
  LazyMobileTestPage,
  LazyBugReportDashboard,
  LazyBouncePage, // PKL-278651-BOUNCE-0001-CORE
  LazyBounceFindingsPage, // PKL-278651-BOUNCE-0006-ADMIN
  LazyUserDetailsPage, // PKL-278651-ADMIN-0015-USER
  LazyUsersPage, // PKL-278651-ADMIN-0015-USER
  LazyPCPLearningPage,
  LazyNotFoundPage,
  LazyDashboardPage,

  LazyCourtIQDetailedAnalysisPage, // PKL-278651-COURTIQ-0005-DETAIL
  LazyPassportPage, // PKL-278651-CONN-0008-UX-MOD2
  preloadProfilePages,
  preloadMatchPages,
  preloadTournamentPages,
  preloadEventPages,
  preloadAdminPages
} from './lazyComponents'

// Import community pages (PKL-278651-COMM-0006-HUB-UI)
import CommunitiesPage from './pages/communities'
import CommunityDetailPage from './pages/communities/[id]'
import CreateCommunityPage from './pages/communities/create'
import CommunityEventDetailPage from './pages/CommunityEventDetailPage' // PKL-278651-COMM-0016-RSVP
import CommunityDiscoveryPage from './pages/community-discover' // PKL-278651-COMM-0022-DISC
import CommunityEngagementPage from './pages/community/CommunityEngagementPage' // PKL-278651-COMM-0021-ENGAGE

// Import notification pages (PKL-278651-COMM-0028-NOTIF)
import NotificationsPage from './pages/notifications-page'
import NotificationPreferencesPage from './pages/NotificationPreferencesPage'

// Import PickleJourney™ page (PKL-278651-JOUR-001)
import PickleJourneyDashboard from './pages/PickleJourneyDashboard'

// Import referral page (PKL-278651-COMM-0007 - Enhanced Referral System)
import ReferralPage from './pages/ReferralPage'

// Import social content page (PKL-278651-SAGE-0011-SOCIAL)
import SocialContentPage from './pages/social-content'

// Import SAGE Demo Page (PKL-278651-COACH-0021-WIDGET-DEMO)
import SageDemoPage from './pages/SageDemoPage'

// Import custom test login page to help with loading issues
import TestLoginPage from './pages/test-login-page'

// Import icons test page (PKL-278651-COMM-0007-ICONS)
import IconsPage from './pages/icons'

// Keep imports for non-lazy loaded pages
import TestAuthPage from './pages/TestAuthPage'
import TestRoutingPage from './pages/TestRoutingPage'
import PlayerSearchTestPage from './pages/PlayerSearchTestPage'
import MatchRewardDemo from './pages/match-reward-demo'


import LandingPageTest from './pages/LandingPageTest'
import ModernLandingPage from './pages/ModernLandingPage'
import QRTestPage from './pages/dev/QRTestPage'
import EventTestPage from './pages/events/EventTestPage'
import CommunityPage from './pages/CommunityPage'
import SettingsPage from './pages/SettingsPage'
import SearchTestPage from './pages/SearchTest'
import Register from './pages/Register'
import TestCommunityPage from './pages/TestCommunityPage' // PKL-278651-COMM-0001-UIMOCK
import CommunityDashboardMockup from './pages/CommunityDashboardMockup' // PKL-278651-COMM-0002-DASH-MOCK
import ModernCommunityDashboard from './pages/ModernCommunityDashboard' // PKL-278651-COMM-0003-DASH-MODERN
import FixedTwitterDashboard from './pages/FixedTwitterDashboard' // PKL-278651-COMM-0004-DASH-TWITTER
import UnifiedActivityDashboard from './pages/UnifiedActivityDashboard' // PKL-278651-COMM-0005-DASH-UNIFIED
import SimpleUnifiedDashboard from './pages/SimpleUnifiedDashboard' // PKL-278651-COMM-0005-DASH-SIMPLE
import XpDashboardPage from './pages/xp-dashboard' // PKL-278651-XP-0002-UI
import PointsDemo from './pages/points-demo' // PKL-278651-POINTS-0001-DEMO - Pickle+ Points Demo
import CoachPage from './pages/CoachPage' // PKL-278651-COACH-0001-AI - AI Coach
import FeedbackDemo from './pages/FeedbackDemo' // PKL-278651-SAGE-0010-FEEDBACK - Feedback System Demo
 // PKL-278651-PROF-0008-DEV - Development Profile Page
import TrainingCenterPage from './pages/training-center' // PKL-278651-TRAINING-CENTER-001 - Training Center Management
import TrainingCenterTabsPage from './pages/training-center-tabs' // PKL-278651-TRAINING-CENTER-CALENDAR - Complete Calendar Integration
import MyClassesPage from './pages/MyClassesPage' // My Classes page
import FontTestPage from './pages/FontTestPage' // Font comparison test page
import SessionPlanningPage from './pages/coach/session-planning' // Sprint 2 Phase 2: Session Planning Integration

import { useAuth } from '@/contexts/AuthContext'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'

// Import the centralized ProtectedRoute component
import { ProtectedRoute as CentralProtectedRoute } from '@/components/auth/ProtectedRoute';

// Authentication wrapper component that only renders children when user is authenticated
function AuthenticationWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
}

export default function App() {
  // Add location hook to debug routing
  const [location] = useLocation();
  
  console.log("Current location:", location);
  
  // Debugging useEffect to log location changes
  useEffect(() => {
    console.log("App.tsx - Location changed to:", location);
  }, [location]);
  
  // Import bug report button directly
  const { BugReportButton } = moduleRegistry.hasModule('feedback') 
    ? moduleRegistry.getModule('feedback').exports 
    : { BugReportButton: null };

  // Use this for debugging
  useEffect(() => {
    console.log("Feedback module loaded:", moduleRegistry.hasModule('feedback'));
    if (moduleRegistry.hasModule('feedback')) {
      console.log("Feedback module exports:", Object.keys(moduleRegistry.getModule('feedback').exports));
    }
  }, []);

  return (
    <div className="app-container">
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <UserDataProvider>
                <TournamentChangeProvider>
                {/* TutorialProvider removed - onboarding system disabled */}
                <CommunityProvider>
                  <GuidedTaskProvider>
                    <SageDataProvider>
                      <DerivedDataProvider>
                        <Suspense fallback={<LazyLoadingFallback />}>
                          {/* Add Simplified Bug Report Button (PKL-278651-FEED-0001-BUG) - Only for authenticated users */}
                          <AuthenticationWrapper>
                            <SimpleBugReportButton position="bottom-right" />
                          </AuthenticationWrapper>
                          
                          {/* PKL-278651-BOUNCE-0008-ASSIST - Add Bounce Floating Widget */}
                          <BounceFloatingWidget />
                          
                          {/* Match Recording Button - Only shown when user is authenticated */}
                          <AuthenticationWrapper>
                            <QuickMatchFAB />
                          </AuthenticationWrapper>
                          
                          {/* Smart Feature Discovery Guide - Context-aware feature onboarding */}
                          <AuthenticationWrapper>
                            <SmartFeatureGuide />
                          </AuthenticationWrapper>
                          
                          {/* Profile Completion System - Helps users complete missing first/last names */}
                          <AuthenticationWrapper>
                            <ProfileCompletionWrapper>
                              <></>
                            </ProfileCompletionWrapper>
                          </AuthenticationWrapper>
                    
                    {/* Bounce Mascot disabled for now (PKL-278651-MASCOT-0001-CORE) */}
                    {/* Removed to focus on launch priorities */}
                    
                    {/* Community navigation commented out for now */}
                    
                    <Switch>
                    {/* Public Routes */}
                  <Route path="/" component={ModernLandingPage} />
                  <Route path="/login" component={LazyAuthPage} />
                  <Route path="/register" component={Register} />
                  <Route path="/auth" component={LazyAuthPage} />
                  <Route path="/forgot-password" component={lazyLoad(() => import('./pages/ForgotPasswordPage'))} />
                  <Route path="/reset-password" component={lazyLoad(() => import('./pages/ResetPasswordPage'))} />
                  {/* DISABLED: Onboarding system disabled for all new users */}
                  {/* Onboarding routes completely removed - system disabled */}
                  <Route path="/about" component={LazyAboutUsPage} />
                  <Route path="/features" component={LazyFeatureShowcasePage} />
                  <Route path="/test-routing" component={TestRoutingPage} />
                  <Route path="/landing-test" component={LandingPageTest} />
                  <Route path="/modern-landing" component={ModernLandingPage} />
                  <Route path="/test-login" component={TestLoginPage} />
                  <Route path="/sage-demo" component={SageDemoPage} />
                  <Route path="/mobile-test" component={lazyLoad(() => import('./pages/MobileTestPage'))} />
                  <Route path="/sprint4-demo" component={lazyLoad(() => import('./pages/Sprint4DemoPage'))} />
                  <Route path="/session-management-demo" component={lazyLoad(() => import('./pages/SessionManagementDemoPage'))} />
                  <Route path="/complete-flow-demo" component={lazyLoad(() => import('./pages/CompleteFlowDemoPage'))} />
                  <Route path="/passport-preview" component={lazyLoad(() => import('./components/dashboard/PassportDashboardPreview'))} />
                  <Route path="/mobile-ux-showcase" component={lazyLoad(() => import('./pages/mobile-ux-showcase'))} />
                  <Route path="/enhanced-community-demo" component={lazyLoad(() => import('./pages/enhanced-community-demo'))} />
                  <Route path="/migration-control-center" component={lazyLoad(() => import('./pages/migration-control-center'))} />
                  <Route path="/curriculum-management-demo" component={lazyLoad(() => import('./pages/curriculum-management-demo'))} />
                  
                  {/* QR Code Scanning Pages */}
                  <ProtectedRouteWithLayout 
                    path="/scan" 
                    component={lazyLoad(() => import('./pages/ScanPage'))} 
                    pageTitle="QR Scanner"
                  />
                  <ProtectedRouteWithLayout 
                    path="/qr-test" 
                    component={lazyLoad(() => import('./pages/QRScannerTestPage'))} 
                    pageTitle="QR Scanner Test"
                  />
                
                  {/* Protected Routes - Now using StandardLayout */}
                  <ProtectedRouteWithLayout 
                    path="/dashboard" 
                    component={LazyDashboardPage} 
                    pageTitle="Dashboard"
                  />
                  <ProtectedRouteWithLayout 
                    path="/matches" 
                    component={lazyLoad(() => import('./pages/Matches'))} 
                    pageTitle="Your Matches"
                  />
                  <ProtectedRouteWithLayout 
                    path="/match-history" 
                    component={lazyLoad(() => import('./pages/MatchHistoryPage'))} 
                    pageTitle="Match History"
                  />
                  <ProtectedRouteWithLayout 
                    path="/tournaments" 
                    component={lazyLoad(() => import('./pages/tournaments/index'))} 
                    pageTitle="Tournaments"
                  />
                  
                  <Route path="/tournaments/create">
                    {() => {
                      const CreateTournamentPage = lazyLoad(() => import('./pages/tournaments/create'));
                      return (
                        <AdminProtectedRoute>
                          <CreateTournamentPage />
                        </AdminProtectedRoute>
                      );
                    }}
                  </Route>
                  
                  <Route path="/tournaments/:id">
                    {(params) => {
                      const TournamentDetailsPage = lazyLoad(() => 
                        import('./pages/tournaments/[id]').then(mod => ({
                          default: (props: any) => <mod.default id={params.id} {...props} />
                        }))
                      );
                      return <TournamentDetailsPage />;
                    }}
                  </Route>
                  {/* Communities Page */}
                  <ProtectedRouteWithLayout 
                    path="/communities" 
                    component={lazyLoad(() => import('./pages/Communities'))} 
                    pageTitle="Communities"
                  />
                  
                  {/* Settings Page */}
                  <ProtectedRouteWithLayout 
                    path="/settings" 
                    component={lazyLoad(() => import('./pages/Settings'))} 
                    pageTitle="Settings"
                  />
                  
                  {/* PKL-278651-COMM-0007 - Enhanced Referral System */}
                  <ProtectedRouteWithLayout 
                    path="/referrals" 
                    component={ReferralPage} 
                    pageTitle="Referral Program"
                  />
                  
                  {/* PCP Learning Management System Routes */}
                  <ProtectedRouteWithLayout 
                    path="/pcp-learning" 
                    component={lazyLoad(() => import('./pages/pcp-learning-dashboard'))} 
                    pageTitle="PCP Learning Dashboard"
                  />
                  <ProtectedRouteWithLayout 
                    path="/pcp-assessment/:id" 
                    component={lazyLoad(() => import('./pages/pcp-assessment'))} 
                    pageTitle="PCP Assessment"
                  />
                  <Route path="/admin/tournaments">
                    {(params) => {
                      const TournamentAdminDashboardRedesigned = lazyLoad(() => import('./components/admin/tournaments/TournamentAdminDashboardRedesigned'));
                      return (
                        <AdminProtectedRoute>
                          <TournamentAdminDashboardRedesigned />
                        </AdminProtectedRoute>
                      );
                    }}
                  </Route>
                  <Route path="/admin/training-centers">
                    {(params) => {
                      const TrainingCentersAdminPage = lazyLoad(() => import('./pages/admin/training-centers'));
                      return (
                        <AdminProtectedRoute>
                          <TrainingCentersAdminPage />
                        </AdminProtectedRoute>
                      );
                    }}
                  </Route>
                  <Route path="/admin/tournaments/:id">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyTournamentDetailsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/brackets/:id">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyBracketDetailsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/training">
                    {(params) => <CentralProtectedRoute component={LazyDashboardPage} path="/training" />}
                  </Route>
                  {/* Redirect old /community route to /communities */}
                  <Route path="/community">
                    {() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/communities';
                      }
                      return null;
                    }}
                  </Route>
                  <Route path="/passport">
                    {(params) => <CentralProtectedRoute component={LazyPassportPage} path="/passport" />}
                  </Route>
                  
                  {/* Unified Coach Hub - Smart routing based on user status */}
                  <ProtectedRouteWithLayout
                    path="/coach"
                    component={lazyLoad(() => import('./pages/CoachHubPage'))}
                    pageTitle="Coach Hub"
                  />
                  
                  {/* Coach Application Process */}
                  <ProtectedRouteWithLayout
                    path="/coach/apply"
                    component={lazyLoad(() => import('./pages/coach/CoachApplicationWizard'))}
                    pageTitle="Coach Application"
                  />
                  
                  {/* PCP Certification integrated within coach hub */}
                  <ProtectedRouteWithLayout
                    path="/pcp-certification"
                    component={lazyLoad(() => import('./pages/pcp-certification/index'))}
                    pageTitle="PCP Certification"
                  />
                  
                  {/* Coach Management Tools - for active coaches */}
                  <ProtectedRouteWithLayout
                    path="/coach/students"
                    component={lazyLoad(() => import('./pages/coach/students'))}
                    pageTitle="My Students"
                  />
                  <ProtectedRouteWithLayout
                    path="/coach/curriculum"
                    component={lazyLoad(() => import('./pages/coach/curriculum'))}
                    pageTitle="Drill Library"
                  />
                  <ProtectedRouteWithLayout
                    path="/coach/session-planning"
                    component={SessionPlanningPage}
                    pageTitle="Session Planning"
                  />
                  <ProtectedRouteWithLayout
                    path="/coach/assessment-tool"
                    component={lazyLoad(() => import('./pages/coach/assessment-tool'))}
                    pageTitle="PCP Assessment Tool"
                  />
                  <ProtectedRouteWithLayout
                    path="/coach/student-progress-dashboard"
                    component={lazyLoad(() => import('./pages/coach/student-progress-dashboard-fixed'))}
                    pageTitle="Student Progress Dashboard"
                  />
                  
                  {/* Sprint 3 Phase 1: Assessment-Goal Integration Test Page */}
                  <ProtectedRouteWithLayout
                    path="/coach/assessment-goal-integration-test"
                    component={lazyLoad(() => import('./pages/coach/assessment-goal-integration-test'))}
                    pageTitle="Sprint 3: Assessment-Goal Integration Test"
                  />
                  
                  {/* Sprint 3 Phase 2: Enhanced Assessment-Goal UI */}
                  <ProtectedRouteWithLayout
                    path="/coach/assessment-analysis-dashboard"
                    component={lazyLoad(() => import('./pages/coach/assessment-analysis-dashboard'))}
                    pageTitle="Assessment Analysis Dashboard"
                  />
                  <ProtectedRouteWithLayout
                    path="/coach/intelligent-goal-creation"
                    component={lazyLoad(() => import('./pages/coach/intelligent-goal-creation'))}
                    pageTitle="Intelligent Goal Creation"
                  />
                  <ProtectedRouteWithLayout
                    path="/coach/phase2-enhanced-ui-demo"
                    component={lazyLoad(() => import('./pages/coach/phase2-enhanced-ui-demo'))}
                    pageTitle="Phase 2: Enhanced UI Demo"
                  />
                  
                  {/* Legacy coaching routes for backward compatibility */}
                  <ProtectedRouteWithLayout
                    path="/coach/sage"
                    component={LazySageCoachingPage}
                    pageTitle="S.A.G.E. Coaching"
                  />
                  <ProtectedRouteWithLayout
                    path="/coach/pcp"
                    component={lazyLoad(() => import('./pages/coach/pcp-coach-dashboard'))}
                    pageTitle="PCP Coaching Dashboard"
                  />
                  <ProtectedRouteWithLayout
                    path="/coach/pcp/player-progress/:id"
                    component={lazyLoad(() => import('./pages/coach/pcp-player-progress'))}
                    pageTitle="Player Progress Report"
                  />
                  <ProtectedRouteWithLayout
                    path="/coach/pcp-assessment"
                    component={lazyLoad(() => import('./pages/coach/pcp-enhanced-assessment'))}
                    pageTitle="PCP Player Assessment"
                  />
                  
                  {/* Player-Coach Connection System */}
                  <ProtectedRouteWithLayout
                    path="/find-coaches"
                    component={lazyLoad(() => import('./pages/find-coaches'))}
                    pageTitle="Find Coaches"
                  />
                  <ProtectedRouteWithLayout
                    path="/my-coach"
                    component={lazyLoad(() => import('./pages/my-coach'))}
                    pageTitle="My Coach"
                  />
                  
                  {/* PKL-278651-JOUR-001 - PickleJourney™ */}
                  <ProtectedRouteWithLayout
                    path="/journey"
                    component={PickleJourneyDashboard}
                    pageTitle="Your Pickleball Journey"
                  />
                  
                  {/* PKL-278651-PLAYER-DEVELOPMENT-HUB - Player Development Hub */}
                  <ProtectedRouteWithLayout
                    path="/player-development-hub"
                    component={TrainingCenterPage}
                    pageTitle="Player Development Hub"
                  />
                  
                  {/* My Classes Page */}
                  <ProtectedRouteWithLayout
                    path="/calendar/my-classes"
                    component={MyClassesPage}
                    pageTitle="My Classes"
                  />
                  
                  {/* PKL-278651-TRAINING-CENTER-CALENDAR - Complete Calendar Integration */}
                  {/* DEPLOYMENT CONTROL: Disabled in production - remove this condition to enable */}
                  {process.env.NODE_ENV !== 'production' && (
                    <ProtectedRouteWithLayout
                      path="/training-center-full"
                      component={TrainingCenterTabsPage}
                      pageTitle="Training Center with Calendar"
                    />
                  )}
                  
                  {/* PKL-278651-AUTH-0008-ROLES - Role protected routes demo */}
                  <Route path="/roles/demo">
                    {() => <RoleProtectedRoute component={RoleProtectedDemoPage} path="/roles/demo" />}
                  </Route>
                  
                  {/* Coach-specific route example */}
                  <Route path="/coach/dashboard">
                    {() => <RoleProtectedRoute 
                      component={RoleProtectedDemoPage} 
                      path="/coach/dashboard" 
                      requiredRole={UserRole.COACH} 
                    />}
                  </Route>
                  
                  {/* Referee-specific route example */}
                  <Route path="/referee/matches">
                    {() => <RoleProtectedRoute 
                      component={RoleProtectedDemoPage} 
                      path="/referee/matches" 
                      requiredRole={UserRole.REFEREE} 
                    />}
                  </Route>
                  
                  {/* Admin-specific route example */}
                  <Route path="/admin/system">
                    {() => <RoleProtectedRoute 
                      component={RoleProtectedDemoPage} 
                      path="/admin/system" 
                      requiredRole={UserRole.ADMIN} 
                    />}
                  </Route>
                  {/* Main profile route using consolidated Profile component */}
                  <ProtectedRouteWithLayout
                    path="/profile"
                    component={LazyProfilePage}
                    pageTitle="Profile"
                  />
                  {/* Keep the edit profile route as it's still needed for editing */}
                  <ProtectedRouteWithLayout
                    path="/profile/edit"
                    component={LazyProfileEditPage}
                    pageTitle="Edit Profile"
                  />
                  {/* PKL-278651-COACH-GOALS-001 - Goal-Setting Foundation */}
                  <ProtectedRouteWithLayout
                    path="/goals"
                    component={lazyLoad(() => import('./pages/goals-page'))}
                    pageTitle="My Goals"
                  />
                  
                  {/* PKL-278651-COACH-GOALS-PHASE2-UI - Coach Goal Management */}
                  <ProtectedRouteWithLayout
                    path="/coach/goals"
                    component={lazyLoad(() => import('./pages/coach-goals-page'))}
                    pageTitle="Coach Goal Management"
                  />
                  
                  {/* PKL-278651-COACH-MATCH-INTEGRATION - Coach Match Integration Dashboard */}
                  <ProtectedRouteWithLayout
                    path="/coach-match-dashboard"
                    component={lazyLoad(() => import('./pages/coach-match-dashboard-page'))}
                    pageTitle="Coach Match Integration"
                  />
                  
                  {/* PKL-278651-COACH-MATCH-INTEGRATION - Phase 2: Transparent Points Allocation */}
                  <ProtectedRouteWithLayout
                    path="/transparent-points-allocation"
                    component={lazyLoad(() => import('./pages/transparent-points-allocation-page'))}
                    pageTitle="Transparent Points Allocation"
                  />
                  
                  {/* PKL-278651-COACH-MATCH-INTEGRATION - Phase 3: Coach Assessment Workflow */}
                  <ProtectedRouteWithLayout
                    path="/coach-assessment-workflow"
                    component={lazyLoad(() => import('./pages/coach-assessment-workflow-page'))}
                    pageTitle="Coach Assessment Workflow"
                  />
                  
                  {/* PKL-278651-COACH-WORKFLOW-GUIDE - Complete Coach Workflow Documentation */}
                  <ProtectedRouteWithLayout
                    path="/coach-workflow-guide"
                    component={lazyLoad(() => import('./pages/coach-workflow-guide-page'))}
                    pageTitle="Coach Workflow Guide"
                  />
                  
                  {/* PKL-278651-COURTIQ-0005-DETAIL - CourtIQ Detailed Analysis */}
                  <ProtectedRouteWithLayout 
                    path="/courtiq/analysis"
                    component={LazyCourtIQDetailedAnalysisPage}
                    pageTitle="CourtIQ Analysis"
                  />
                  <ProtectedRouteWithLayout 
                    path="/courtiq/analysis/:userId"
                    component={LazyCourtIQDetailedAnalysisPage}
                    pageTitle="CourtIQ Analysis"
                  />
                  {/* PKL-278651-COACH-0001-AI - AI Coach */}
                  <ProtectedRouteWithLayout 
                    path="/coach"
                    component={CoachPage}
                    pageTitle="AI Coach"
                  />
                  
                  {/* PKL-278651-COACH-001 - Coach Application */}
                  <ProtectedRouteWithLayout 
                    path="/coach/apply"
                    component={LazyCoachApplicationPage}
                    pageTitle="Become a Coach"
                  />
                  
                  {/* PCP Coaching Certification Programme */}
                  <ProtectedRouteWithLayout 
                    path="/pcp-certification"
                    component={lazyLoad(() => import('./pages/pcp-certification/index'))}
                    pageTitle="PCP Certification"
                  />
                  <ProtectedRouteWithLayout 
                    path="/pcp-certification/apply/:levelId"
                    component={lazyLoad(() => import('./pages/pcp-certification/apply'))}
                    pageTitle="Apply for PCP Certification"
                  />
                  
                  {/* Player-Coach Connection Pages */}
                  <ProtectedRouteWithLayout 
                    path="/find-coaches"
                    component={lazyLoad(() => import('./pages/find-coaches'))}
                    pageTitle="Find Coaches"
                  />
                  <ProtectedRouteWithLayout 
                    path="/my-coach"
                    component={lazyLoad(() => import('./pages/my-coach'))}
                    pageTitle="My Coach"
                  />
                  {/* PKL-278651-TRAINING-CENTER-001 - Training Center Management - DISABLED FOR DEPLOYMENT */}
                  {/* <ProtectedRouteWithLayout 
                    path="/training-center"
                    component={TrainingCenterPage}
                    pageTitle="Training Center"
                  /> */}
                  <Route path="/record-match">
                    {(params) => <CentralProtectedRoute component={LazyRecordMatchPage} path="/record-match" />}
                  </Route>
                  <Route path="/admin">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyAdminDashboardPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/prize-drawing">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyPrizeDrawingPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/golden-ticket">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyGoldenTicketAdmin />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/passport-verification">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyPassportVerificationPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/mobile-test">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyMobileTestPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/reports">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyReportsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/pcp-learning">
                    {() => (
                      <AdminProtectedRoute>
                        <LazyPCPLearningPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/reporting">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyReportsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  {/* PKL-278651-ADMIN-0015-USER - User Management Routes */}
                  <Route path="/admin/users/:id/edit">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyUserDetailsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/users/:id">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyUserDetailsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/users">
                    {() => (
                      <AdminProtectedRoute>
                        <LazyUsersPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/settings">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazySettingsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/bug-reports">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyBugReportDashboard />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  {/* PKL-278651-COACH-ADMIN-001 - Coach Applications Management */}
                  <Route path="/admin/coach-applications">
                    {(params) => (
                      <AdminProtectedRoute>
                        {React.createElement(lazyLoad(() => import('./pages/admin/coach-applications')))}
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  {/* PKL-278651-PLAYER-ADMIN-001 - Player Management */}
                  <Route path="/admin/players">
                    {(params) => (
                      <AdminProtectedRoute>
                        {React.createElement(lazyLoad(() => import('./pages/admin/player-management')))}
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  {/* PKL-278651-CHARGE-CARD-ADMIN - Charge Card Management */}
                  <Route path="/admin/charge-cards">
                    {() => (
                      <AdminProtectedRoute>
                        {React.createElement(lazyLoad(() => import('./pages/admin/charge-cards')))}
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  {/* PKL-278651-BOUNCE-0001-CORE: Bounce Testing System Route */}
                  <Route path="/admin/bounce">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyBouncePage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  {/* PKL-278651-BOUNCE-0006-ADMIN: Bounce Findings Page */}
                  <Route path="/admin/bounce/findings">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyBounceFindingsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/settings">
                    {(params) => <CentralProtectedRoute component={SettingsPage} path="/settings" />}
                  </Route>
                  <ProtectedRouteWithLayout
                    path="/leaderboard"
                    component={LazyLeaderboardPage}
                    pageTitle="Leaderboard"
                  />
                  <ProtectedRouteWithLayout
                    path="/mastery-paths"
                    component={LazyMasteryPathsPage}
                    pageTitle="Mastery Paths"
                  />
                  
                  {/* PKL-278651-COMM-0028-NOTIF - Notifications Page */}
                  <ProtectedRouteWithLayout
                    path="/notifications"
                    component={NotificationsPage}
                    pageTitle="Notifications"
                  />
                  <ProtectedRouteWithLayout
                    path="/notifications/preferences"
                    component={NotificationPreferencesPage}
                    pageTitle="Notification Preferences"
                  />
                  <Route path="/demo/match-reward" component={MatchRewardDemo} />
                  <Route path="/dev/qr-test" component={QRTestPage} />
                  <Route path="/events">
                    {(params) => <CentralProtectedRoute component={LazyEventDiscoveryPage} path="/events" />}
                  </Route>
                  <Route path="/events/my">
                    {(params) => <CentralProtectedRoute component={LazyMyEventsPage} path="/events/my" />}
                  </Route>
                  <Route path="/events/test">
                    {(params) => <CentralProtectedRoute component={EventTestPage} path="/events/test" />}
                  </Route>
                  <Route path="/search-test">
                    {(params) => <CentralProtectedRoute component={SearchTestPage} path="/search-test" />}
                  </Route>
                  <Route path="/player-search-test">
                    {(params) => <CentralProtectedRoute component={PlayerSearchTestPage} path="/player-search-test" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0001-UIMOCK - Community Module UI Test Route */}
                  <Route path="/test/community" component={TestCommunityPage} />
                  
                  {/* PKL-278651-COMM-0002-DASH-MOCK - Community Dashboard Mockup Route */}
                  <Route path="/test/community-dashboard" component={CommunityDashboardMockup} />
                  
                  {/* PKL-278651-COMM-0003-DASH-MODERN - Modern Social Media Inspired Dashboard Route */}
                  <Route path="/test/modern-community" component={ModernCommunityDashboard} />
                  
                  {/* PKL-278651-COMM-0004-DASH-TWITTER - Twitter/X-Inspired Dashboard Route */}
                  <Route path="/test/twitter-style" component={FixedTwitterDashboard} />
                  
                  {/* PKL-278651-XP-0002-UI - XP System Dashboard */}
                  <Route path="/xp-dashboard">
                    {(params) => <CentralProtectedRoute component={XpDashboardPage} path="/xp-dashboard" />}
                  </Route>
                  
                  {/* PKL-278651-POINTS-0001-DEMO - Pickle+ Points Demo */}
                  <Route path="/points-demo">
                    {(params) => <CentralProtectedRoute component={PointsDemo} path="/points-demo" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0005-DASH-UNIFIED - Unified Activity-Centric Dashboard Route */}
                  <Route path="/test/unified-activity" component={UnifiedActivityDashboard} />
                  
                  {/* PKL-278651-COMM-0005-DASH-SIMPLE - Simple Unified Activity-Centric Dashboard Route */}
                  <Route path="/test/simple-unified" component={SimpleUnifiedDashboard} />
                  
                  {/* PKL-278651-SAGE-0010-FEEDBACK - Feedback System Demo Route */}
                  <Route path="/test/feedback" component={FeedbackDemo} />
                  
                  {/* PKL-278651-COMM-0006-HUB - Community Hub Implementation */}
                  <Route path="/communities/create">
                    {(params) => <CentralProtectedRoute component={CreateCommunityPage} path="/communities/create" />}
                  </Route>
                  <Route path="/communities/:id">
                    {(params) => <CentralProtectedRoute component={CommunityDetailPage} path="/communities/:id" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0021-ENGAGE - Community Engagement Page */}
                  <Route path="/communities/:communityId/engagement">
                    {(params) => <CentralProtectedRoute component={CommunityEngagementPage} path="/communities/:communityId/engagement" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0016-RSVP - Community Event Detail Page with RSVP */}
                  <Route path="/communities/:communityId/events/:eventId">
                    {(params) => <CentralProtectedRoute component={CommunityEventDetailPage} path="/communities/:communityId/events/:eventId" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0036-MEDIA - Community Media Management */}
                  <Route path="/communities/:communityId/media">
                    {(params) => {
                      const MediaManagementPage = lazyLoad(() => import('./pages/community/MediaManagementPage'));
                      return <CentralProtectedRoute component={MediaManagementPage} path="/communities/:communityId/media" />;
                    }}
                  </Route>
                  
                  <ProtectedRouteWithLayout 
                    path="/communities" 
                    component={CommunitiesPage} 
                    pageTitle="Communities"
                  />
                  
                  {/* PKL-278651-COMM-0022-DISC - Enhanced Community Discovery */}
                  <Route path="/communities/discover">
                    {(params) => <CentralProtectedRoute component={CommunityDiscoveryPage} path="/communities/discover" />}
                  </Route>
                  
                  {/* PKL-278651-SAGE-0011-SOCIAL - Social Content - TEMPORARILY DISABLED */}
                  <Route path="/social/content">
                    {() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/dashboard';
                      }
                      return null;
                    }}
                  </Route>
                  
                  {/* PKL-278651-COMM-0011-OSI - NodeBB Community Hub v2 */}
                  <Route path="/community/v2">
                    {(params) => <CentralProtectedRoute component={(props: any) => {
                      const CommunityHubV2 = lazyLoad(() => import('./pages/community/v2'));
                      return <CommunityHubV2 {...props} />;
                    }} path="/community/v2" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0007-ICONS - Custom Icons Showcase */}
                  <ProtectedRouteWithLayout
                    path="/icons"
                    component={IconsPage}
                    pageTitle="Icons"
                  />
                  
                  {/* Font Test Page */}
                  <Route path="/font-test" component={FontTestPage} />
                  
                  {/* Test Login Page for easier testing */}
                  <Route path="/test-login">
                    {(params) => <TestLoginPage />}
                  </Route>
                  
                  <Route component={LazyNotFoundPage} />
                </Switch>
                  </Suspense>
                      </DerivedDataProvider>
                    </SageDataProvider>
                  </GuidedTaskProvider>
                </CommunityProvider>
              {/* TutorialProvider closing tag removed - onboarding system disabled */}
            </TournamentChangeProvider>
          </UserDataProvider>
          </AuthProvider>
        </LanguageProvider>
        <Toaster />
      </QueryClientProvider>
    </div>
  )
}
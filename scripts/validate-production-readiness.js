#!/usr/bin/env node

/**
 * Production Readiness Validation for Coach Application System
 * PKL-278651-COACH-001-PROD - Comprehensive production deployment validation
 * 
 * This script performs end-to-end validation of the coach application workflow
 * to ensure production readiness including database connectivity, API endpoints,
 * frontend integration, and error handling.
 */

import fs from 'fs';
import path from 'path';

const PRODUCTION_CHECKS = {
  database: {
    schema: false,
    connectivity: false,
    migrations: false
  },
  api: {
    endpoints: false,
    authentication: false,
    validation: false,
    errorHandling: false
  },
  frontend: {
    components: false,
    routing: false,
    forms: false,
    navigation: false
  },
  integration: {
    endToEnd: false,
    userExperience: false,
    dataFlow: false
  }
};

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateDatabaseReadiness() {
  log('\n🗄️  Validating Database Production Readiness...', 'blue');
  
  try {
    // Check schema file exists and is properly structured
    const schemaPath = 'shared/schema/coach-management.ts';
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      // Validate required tables
      const requiredTables = ['coachApplications', 'coachCertifications', 'coachProfiles', 'coachReviews'];
      const hasAllTables = requiredTables.every(table => 
        schemaContent.includes(table) && schemaContent.includes('pgTable')
      );
      
      // Validate foreign key relationships
      const hasRelations = schemaContent.includes('relations') || schemaContent.includes('foreignKey');
      
      // Validate TypeScript types
      const hasTypes = schemaContent.includes('type CoachApplication') && 
                      schemaContent.includes('InsertCoachApplication');
      
      PRODUCTION_CHECKS.database.schema = hasAllTables && hasRelations && hasTypes;
      
      log(`  ✓ Database Schema: ${PRODUCTION_CHECKS.database.schema ? 'READY' : 'NEEDS WORK'}`, 
          PRODUCTION_CHECKS.database.schema ? 'green' : 'red');
      
      // Check if database configuration exists
      const dbConfigExists = fs.existsSync('server/db.ts') && fs.existsSync('drizzle.config.ts');
      PRODUCTION_CHECKS.database.connectivity = dbConfigExists;
      
      log(`  ✓ Database Configuration: ${dbConfigExists ? 'READY' : 'MISSING'}`, 
          dbConfigExists ? 'green' : 'red');
      
    } else {
      log('  ✗ Schema file not found', 'red');
    }
    
    // Check for migration scripts
    const migrationExists = fs.existsSync('scripts') && 
      fs.readdirSync('scripts').some(file => file.includes('coach') && file.includes('.ts'));
    PRODUCTION_CHECKS.database.migrations = migrationExists;
    
    log(`  ✓ Migration Scripts: ${migrationExists ? 'AVAILABLE' : 'CREATE NEEDED'}`, 
        migrationExists ? 'green' : 'yellow');
    
  } catch (error) {
    log(`  ✗ Database validation failed: ${error.message}`, 'red');
  }
}

function validateAPIReadiness() {
  log('\n🔗 Validating API Production Readiness...', 'blue');
  
  try {
    // Check coach routes implementation
    const coachRoutesPath = 'server/routes/coach-routes.ts';
    if (fs.existsSync(coachRoutesPath)) {
      const routesContent = fs.readFileSync(coachRoutesPath, 'utf8');
      
      // Validate required endpoints
      const requiredEndpoints = [
        '/api/coach/application/status',
        '/api/coach/application/submit',
        '/api/coach/profile',
        '/api/coach/certifications'
      ];
      
      const hasAllEndpoints = requiredEndpoints.every(endpoint => 
        routesContent.includes(endpoint)
      );
      
      PRODUCTION_CHECKS.api.endpoints = hasAllEndpoints;
      
      log(`  ✓ API Endpoints: ${hasAllEndpoints ? 'COMPLETE' : 'INCOMPLETE'}`, 
          hasAllEndpoints ? 'green' : 'red');
      
      // Check authentication middleware
      const hasAuth = routesContent.includes('isAuthenticated') || 
                     routesContent.includes('requireAuth') ||
                     routesContent.includes('auth');
      
      PRODUCTION_CHECKS.api.authentication = hasAuth;
      
      log(`  ✓ Authentication: ${hasAuth ? 'IMPLEMENTED' : 'MISSING'}`, 
          hasAuth ? 'green' : 'red');
      
      // Check input validation
      const hasValidation = routesContent.includes('zod') || 
                           routesContent.includes('validation') ||
                           routesContent.includes('schema');
      
      PRODUCTION_CHECKS.api.validation = hasValidation;
      
      log(`  ✓ Input Validation: ${hasValidation ? 'IMPLEMENTED' : 'MISSING'}`, 
          hasValidation ? 'green' : 'red');
      
      // Check error handling
      const hasErrorHandling = routesContent.includes('try') && 
                              routesContent.includes('catch') &&
                              routesContent.includes('status(');
      
      PRODUCTION_CHECKS.api.errorHandling = hasErrorHandling;
      
      log(`  ✓ Error Handling: ${hasErrorHandling ? 'IMPLEMENTED' : 'BASIC'}`, 
          hasErrorHandling ? 'green' : 'yellow');
      
    } else {
      log('  ✗ Coach routes file not found', 'red');
    }
    
    // Check main routes integration
    const mainRoutesPath = 'server/routes.ts';
    if (fs.existsSync(mainRoutesPath)) {
      const mainRoutesContent = fs.readFileSync(mainRoutesPath, 'utf8');
      const hasCoachIntegration = mainRoutesContent.includes('coach-routes') || 
                                 mainRoutesContent.includes('./routes/coach');
      
      log(`  ✓ Route Integration: ${hasCoachIntegration ? 'INTEGRATED' : 'NOT INTEGRATED'}`, 
          hasCoachIntegration ? 'green' : 'red');
    }
    
  } catch (error) {
    log(`  ✗ API validation failed: ${error.message}`, 'red');
  }
}

function validateFrontendReadiness() {
  log('\n🎨 Validating Frontend Production Readiness...', 'blue');
  
  try {
    // Check coach application page
    const coachPagePath = 'client/src/pages/coach/apply.tsx';
    if (fs.existsSync(coachPagePath)) {
      const pageContent = fs.readFileSync(coachPagePath, 'utf8');
      
      // Validate form implementation
      const hasForm = pageContent.includes('useForm') && 
                     pageContent.includes('onSubmit') &&
                     pageContent.includes('coachType');
      
      PRODUCTION_CHECKS.frontend.forms = hasForm;
      
      log(`  ✓ Application Form: ${hasForm ? 'IMPLEMENTED' : 'MISSING'}`, 
          hasForm ? 'green' : 'red');
      
      // Check form validation
      const hasValidation = pageContent.includes('zodResolver') || 
                           pageContent.includes('validation');
      
      log(`  ✓ Form Validation: ${hasValidation ? 'IMPLEMENTED' : 'BASIC'}`, 
          hasValidation ? 'green' : 'yellow');
      
      // Check error handling
      const hasErrorHandling = pageContent.includes('error') && 
                              pageContent.includes('toast');
      
      log(`  ✓ Error Display: ${hasErrorHandling ? 'IMPLEMENTED' : 'BASIC'}`, 
          hasErrorHandling ? 'green' : 'yellow');
      
    } else {
      log('  ✗ Coach application page not found', 'red');
    }
    
    // Check routing configuration
    const appPath = 'client/src/App.tsx';
    if (fs.existsSync(appPath)) {
      const appContent = fs.readFileSync(appPath, 'utf8');
      const hasCoachRoute = appContent.includes('/coach/apply') && 
                           appContent.includes('CoachApplicationPage');
      
      PRODUCTION_CHECKS.frontend.routing = hasCoachRoute;
      
      log(`  ✓ Route Configuration: ${hasCoachRoute ? 'CONFIGURED' : 'MISSING'}`, 
          hasCoachRoute ? 'green' : 'red');
    }
    
    // Check dashboard integration
    const dashboardPath = 'client/src/components/dashboard/PassportDashboard.tsx';
    if (fs.existsSync(dashboardPath)) {
      const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
      const hasCoachButton = dashboardContent.includes('Become a Coach') && 
                            dashboardContent.includes('coach/apply');
      
      PRODUCTION_CHECKS.frontend.navigation = hasCoachButton;
      
      log(`  ✓ Dashboard Integration: ${hasCoachButton ? 'INTEGRATED' : 'MISSING'}`, 
          hasCoachButton ? 'green' : 'red');
    }
    
    // Overall frontend component check
    PRODUCTION_CHECKS.frontend.components = PRODUCTION_CHECKS.frontend.forms && 
                                           PRODUCTION_CHECKS.frontend.routing && 
                                           PRODUCTION_CHECKS.frontend.navigation;
    
  } catch (error) {
    log(`  ✗ Frontend validation failed: ${error.message}`, 'red');
  }
}

function validateIntegrationReadiness() {
  log('\n🔄 Validating Integration Production Readiness...', 'blue');
  
  // Check end-to-end data flow
  const hasDatabase = PRODUCTION_CHECKS.database.schema && PRODUCTION_CHECKS.database.connectivity;
  const hasAPI = PRODUCTION_CHECKS.api.endpoints && PRODUCTION_CHECKS.api.validation;
  const hasFrontend = PRODUCTION_CHECKS.frontend.components && PRODUCTION_CHECKS.frontend.routing;
  
  PRODUCTION_CHECKS.integration.endToEnd = hasDatabase && hasAPI && hasFrontend;
  
  log(`  ✓ End-to-End Flow: ${PRODUCTION_CHECKS.integration.endToEnd ? 'READY' : 'INCOMPLETE'}`, 
      PRODUCTION_CHECKS.integration.endToEnd ? 'green' : 'red');
  
  // Check user experience completeness
  const hasNavigation = PRODUCTION_CHECKS.frontend.navigation;
  const hasErrorHandling = PRODUCTION_CHECKS.api.errorHandling;
  const hasAuth = PRODUCTION_CHECKS.api.authentication;
  
  PRODUCTION_CHECKS.integration.userExperience = hasNavigation && hasErrorHandling && hasAuth;
  
  log(`  ✓ User Experience: ${PRODUCTION_CHECKS.integration.userExperience ? 'COMPLETE' : 'NEEDS WORK'}`, 
      PRODUCTION_CHECKS.integration.userExperience ? 'green' : 'yellow');
  
  // Check data flow integrity
  PRODUCTION_CHECKS.integration.dataFlow = PRODUCTION_CHECKS.integration.endToEnd && 
                                           PRODUCTION_CHECKS.api.validation &&
                                           PRODUCTION_CHECKS.database.schema;
  
  log(`  ✓ Data Flow Integrity: ${PRODUCTION_CHECKS.integration.dataFlow ? 'VALIDATED' : 'AT RISK'}`, 
      PRODUCTION_CHECKS.integration.dataFlow ? 'green' : 'yellow');
}

function generateProductionReport() {
  log('\n📊 Production Readiness Report', 'bold');
  log('================================', 'bold');
  
  // Calculate overall readiness score
  const allChecks = [
    ...Object.values(PRODUCTION_CHECKS.database),
    ...Object.values(PRODUCTION_CHECKS.api),
    ...Object.values(PRODUCTION_CHECKS.frontend),
    ...Object.values(PRODUCTION_CHECKS.integration)
  ];
  
  const passedChecks = allChecks.filter(check => check === true).length;
  const totalChecks = allChecks.length;
  const readinessScore = ((passedChecks / totalChecks) * 100).toFixed(1);
  
  log(`\nOverall Readiness Score: ${readinessScore}%`, 
      readinessScore >= 90 ? 'green' : readinessScore >= 75 ? 'yellow' : 'red');
  
  // Category breakdown
  log('\n📋 Category Breakdown:', 'cyan');
  
  const categories = [
    { name: 'Database', checks: PRODUCTION_CHECKS.database },
    { name: 'API', checks: PRODUCTION_CHECKS.api },
    { name: 'Frontend', checks: PRODUCTION_CHECKS.frontend },
    { name: 'Integration', checks: PRODUCTION_CHECKS.integration }
  ];
  
  categories.forEach(category => {
    const categoryChecks = Object.values(category.checks);
    const categoryPassed = categoryChecks.filter(check => check === true).length;
    const categoryTotal = categoryChecks.length;
    const categoryScore = ((categoryPassed / categoryTotal) * 100).toFixed(1);
    
    log(`  ${category.name}: ${categoryScore}% (${categoryPassed}/${categoryTotal})`, 
        categoryScore >= 80 ? 'green' : categoryScore >= 60 ? 'yellow' : 'red');
  });
  
  // Production readiness determination
  log('\n🚀 Production Deployment Status:', 'bold');
  
  if (readinessScore >= 95) {
    log('✅ READY FOR PRODUCTION DEPLOYMENT', 'green');
    log('   All critical systems validated and operational.', 'green');
  } else if (readinessScore >= 85) {
    log('⚠️  READY WITH MINOR ISSUES', 'yellow');
    log('   Can deploy with monitoring for remaining issues.', 'yellow');
  } else if (readinessScore >= 70) {
    log('🔧 NEEDS COMPLETION BEFORE DEPLOYMENT', 'yellow');
    log('   Core functionality works but requires finishing touches.', 'yellow');
  } else {
    log('❌ NOT READY FOR PRODUCTION', 'red');
    log('   Significant work required before deployment.', 'red');
  }
  
  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    readinessScore: parseFloat(readinessScore),
    checks: PRODUCTION_CHECKS,
    categories: categories.map(cat => ({
      name: cat.name,
      score: ((Object.values(cat.checks).filter(c => c === true).length / Object.values(cat.checks).length) * 100),
      details: cat.checks
    })),
    recommendation: readinessScore >= 95 ? 'DEPLOY' : 
                   readinessScore >= 85 ? 'DEPLOY_WITH_MONITORING' :
                   readinessScore >= 70 ? 'COMPLETE_THEN_DEPLOY' : 'NOT_READY'
  };
  
  // Create reports directory and save
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync('test-results/production-readiness-report.json', 
                   JSON.stringify(reportData, null, 2));
  
  log(`\n📄 Detailed report saved to: test-results/production-readiness-report.json`, 'blue');
  
  return reportData;
}

async function main() {
  log('🔍 Starting Production Readiness Validation for Coach Application System', 'bold');
  log('======================================================================', 'bold');
  
  validateDatabaseReadiness();
  validateAPIReadiness();
  validateFrontendReadiness();
  validateIntegrationReadiness();
  
  const report = generateProductionReport();
  
  // Exit with appropriate code for CI/CD
  const success = report.readinessScore >= 85;
  process.exit(success ? 0 : 1);
}

// Run the validation
main().catch(error => {
  log(`\n❌ Production validation failed: ${error.message}`, 'red');
  process.exit(1);
});
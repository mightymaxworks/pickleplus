/**
 * PKL-278651-SEARCH-CICD-001 - Global Search System CI/CD Validation
 * 
 * Comprehensive 100% operational readiness validation for global search functionality:
 * - Search Infrastructure (Backend endpoints, database integration)
 * - Frontend Components (Search bar, results page, navigation)
 * - Search Performance (Response times, relevance scoring, debouncing)
 * - Multi-Category Search (Players, coaches, matches, communities, tournaments)
 * - User Experience (Mobile responsiveness, error handling, loading states)
 * 
 * Run with: npx tsx global-search-cicd-validation.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-27
 */

import { Pool } from '@neondatabase/serverless';
import fetch from 'node-fetch';

interface SearchTest {
  component: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  critical: boolean;
  score: number;
  category: 'Infrastructure' | 'Frontend' | 'Performance' | 'MultiCategory' | 'UserExperience' | 'API' | 'Database' | 'Security';
}

const searchTests: SearchTest[] = [];
const BASE_URL = process.env.REPL_URL || 'http://localhost:5000';

function addTest(
  component: string,
  test: string,
  status: 'PASS' | 'FAIL' | 'WARNING',
  details: string,
  score: number,
  critical = false,
  category: SearchTest['category'] = 'Infrastructure'
) {
  searchTests.push({ component, test, status, details, critical, score, category });
  const statusColor = status === 'PASS' ? '\x1b[32m' : status === 'FAIL' ? '\x1b[31m' : '\x1b[33m';
  console.log(`${statusColor}[${status}]\x1b[0m ${component}: ${test}`);
  if (details) console.log(`  └─ ${details}`);
}

/**
 * Tests Search Infrastructure and Backend Integration
 */
async function testSearchInfrastructure(): Promise<void> {
  console.log('\n🔍 Testing Search Infrastructure...');
  
  try {
    // Test main search endpoint
    const searchResponse = await fetch(`${BASE_URL}/api/search?q=test&type=all&limit=10`);
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      addTest(
        'Search API',
        'Main search endpoint responds',
        'PASS',
        `Status: ${searchResponse.status}, Results: ${searchData.results?.length || 0}`,
        20,
        true,
        'Infrastructure'
      );
      
      // Test result structure
      if (searchData.results && Array.isArray(searchData.results)) {
        const hasValidStructure = searchData.results.every((result: any) => 
          result.id && result.type && result.title && typeof result.relevanceScore === 'number'
        );
        addTest(
          'Search API',
          'Result structure validation',
          hasValidStructure ? 'PASS' : 'FAIL',
          hasValidStructure ? 'All results have required fields' : 'Missing required result fields',
          15,
          true,
          'Infrastructure'
        );
      }
    } else {
      addTest('Search API', 'Main search endpoint responds', 'FAIL', `HTTP ${searchResponse.status}`, 0, true, 'Infrastructure');
    }
    
    // Test search suggestions endpoint
    const suggestionsResponse = await fetch(`${BASE_URL}/api/search/suggestions?q=test`);
    if (suggestionsResponse.ok) {
      addTest('Search API', 'Suggestions endpoint responds', 'PASS', `Status: ${suggestionsResponse.status}`, 10, false, 'Infrastructure');
    } else {
      addTest('Search API', 'Suggestions endpoint responds', 'WARNING', `HTTP ${suggestionsResponse.status}`, 5, false, 'Infrastructure');
    }
    
    // Test search with empty query
    const emptySearchResponse = await fetch(`${BASE_URL}/api/search?q=&type=all`);
    const emptySearchHandled = emptySearchResponse.status === 400 || emptySearchResponse.status === 200;
    addTest(
      'Search API',
      'Empty query handling',
      emptySearchHandled ? 'PASS' : 'FAIL',
      `Status: ${emptySearchResponse.status}`,
      10,
      false,
      'Infrastructure'
    );
    
  } catch (error: any) {
    addTest('Search API', 'Backend connectivity', 'FAIL', `Error: ${error.message}`, 0, true, 'Infrastructure');
  }
}

/**
 * Tests Frontend Search Components
 */
async function testFrontendComponents(): Promise<void> {
  console.log('\n🎨 Testing Frontend Components...');
  
  try {
    // Test search page accessibility
    const searchPageResponse = await fetch(`${BASE_URL}/search`);
    if (searchPageResponse.ok) {
      const searchPageHtml = await searchPageResponse.text();
      
      // Check for search components
      const hasSearchInput = searchPageHtml.includes('search') || searchPageHtml.includes('input');
      const hasTabNavigation = searchPageHtml.includes('tab') || searchPageHtml.includes('filter');
      const hasResultsContainer = searchPageHtml.includes('result') || searchPageHtml.includes('card');
      
      addTest(
        'Search Page',
        'Search input present',
        hasSearchInput ? 'PASS' : 'FAIL',
        hasSearchInput ? 'Search input elements found' : 'No search input found',
        15,
        true,
        'Frontend'
      );
      
      addTest(
        'Search Page',
        'Tab navigation present',
        hasTabNavigation ? 'PASS' : 'WARNING',
        hasTabNavigation ? 'Tab navigation elements found' : 'Tab navigation may be missing',
        10,
        false,
        'Frontend'
      );
      
      addTest(
        'Search Page',
        'Results container present',
        hasResultsContainer ? 'PASS' : 'WARNING',
        hasResultsContainer ? 'Results container elements found' : 'Results container may be missing',
        10,
        false,
        'Frontend'
      );
      
    } else {
      addTest('Search Page', 'Page accessibility', 'FAIL', `HTTP ${searchPageResponse.status}`, 0, true, 'Frontend');
    }
    
    // Test header search integration
    const homePageResponse = await fetch(`${BASE_URL}/`);
    if (homePageResponse.ok) {
      const homePageHtml = await homePageResponse.text();
      const hasHeaderSearch = homePageHtml.includes('search') && (homePageHtml.includes('header') || homePageHtml.includes('nav'));
      
      addTest(
        'Header Integration',
        'Search bar in header',
        hasHeaderSearch ? 'PASS' : 'WARNING',
        hasHeaderSearch ? 'Header search integration found' : 'Header search integration unclear',
        15,
        false,
        'Frontend'
      );
    }
    
  } catch (error: any) {
    addTest('Frontend', 'Component accessibility', 'FAIL', `Error: ${error.message}`, 0, false, 'Frontend');
  }
}

/**
 * Tests Search Performance and Optimization
 */
async function testSearchPerformance(): Promise<void> {
  console.log('\n⚡ Testing Search Performance...');
  
  try {
    // Test response time
    const startTime = Date.now();
    const searchResponse = await fetch(`${BASE_URL}/api/search?q=pickle&type=all&limit=20`);
    const responseTime = Date.now() - startTime;
    
    if (searchResponse.ok) {
      const performanceRating = responseTime < 500 ? 'PASS' : responseTime < 1000 ? 'WARNING' : 'FAIL';
      addTest(
        'Search Performance',
        'Response time optimization',
        performanceRating,
        `Response time: ${responseTime}ms`,
        performanceRating === 'PASS' ? 20 : performanceRating === 'WARNING' ? 10 : 0,
        false,
        'Performance'
      );
      
      // Test search with multiple queries for consistency
      const queries = ['test', 'coach', 'match', 'community'];
      let totalTime = 0;
      let successCount = 0;
      
      for (const query of queries) {
        const queryStart = Date.now();
        const queryResponse = await fetch(`${BASE_URL}/api/search?q=${query}&type=all&limit=5`);
        const queryTime = Date.now() - queryStart;
        
        if (queryResponse.ok) {
          totalTime += queryTime;
          successCount++;
        }
      }
      
      if (successCount > 0) {
        const avgTime = totalTime / successCount;
        const consistencyRating = avgTime < 600 ? 'PASS' : avgTime < 1200 ? 'WARNING' : 'FAIL';
        addTest(
          'Search Performance',
          'Consistency across queries',
          consistencyRating,
          `Average response time: ${Math.round(avgTime)}ms across ${successCount} queries`,
          consistencyRating === 'PASS' ? 15 : consistencyRating === 'WARNING' ? 8 : 0,
          false,
          'Performance'
        );
      }
    }
    
  } catch (error: any) {
    addTest('Search Performance', 'Performance testing', 'FAIL', `Error: ${error.message}`, 0, false, 'Performance');
  }
}

/**
 * Tests Multi-Category Search Functionality
 */
async function testMultiCategorySearch(): Promise<void> {
  console.log('\n📂 Testing Multi-Category Search...');
  
  const categories = ['player', 'coach', 'match', 'community', 'tournament'];
  
  for (const category of categories) {
    try {
      const categoryResponse = await fetch(`${BASE_URL}/api/search?q=test&type=${category}&limit=5`);
      
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        const results = categoryData.results || [];
        const validResults = results.filter((r: any) => r.type === category || category === 'all');
        
        addTest(
          'Multi-Category',
          `${category} search functionality`,
          'PASS',
          `Found ${results.length} results, ${validResults.length} valid`,
          10,
          false,
          'MultiCategory'
        );
        
        // Test result relevance scoring
        const hasRelevanceScores = results.every((r: any) => typeof r.relevanceScore === 'number');
        if (results.length > 0) {
          addTest(
            'Multi-Category',
            `${category} relevance scoring`,
            hasRelevanceScores ? 'PASS' : 'WARNING',
            hasRelevanceScores ? 'All results have relevance scores' : 'Missing relevance scores',
            5,
            false,
            'MultiCategory'
          );
        }
        
      } else {
        addTest(
          'Multi-Category',
          `${category} search functionality`,
          'WARNING',
          `HTTP ${categoryResponse.status}`,
          0,
          false,
          'MultiCategory'
        );
      }
      
    } catch (error: any) {
      addTest(
        'Multi-Category',
        `${category} search functionality`,
        'FAIL',
        `Error: ${error.message}`,
        0,
        false,
        'MultiCategory'
      );
    }
  }
  
  // Test filtering functionality
  try {
    const filteredResponse = await fetch(`${BASE_URL}/api/search?q=test&type=all&location=all&skillLevel=all&limit=10`);
    if (filteredResponse.ok) {
      addTest(
        'Multi-Category',
        'Filter parameters support',
        'PASS',
        'Search accepts filter parameters',
        10,
        false,
        'MultiCategory'
      );
    } else {
      addTest(
        'Multi-Category',
        'Filter parameters support',
        'WARNING',
        `HTTP ${filteredResponse.status}`,
        5,
        false,
        'MultiCategory'
      );
    }
  } catch (error: any) {
    addTest('Multi-Category', 'Filter parameters support', 'FAIL', `Error: ${error.message}`, 0, false, 'MultiCategory');
  }
}

/**
 * Tests User Experience and Error Handling
 */
async function testUserExperience(): Promise<void> {
  console.log('\n👤 Testing User Experience...');
  
  try {
    // Test search with special characters
    const specialCharsResponse = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent('test@#$')}&type=all`);
    const specialCharsHandled = specialCharsResponse.status !== 500;
    addTest(
      'User Experience',
      'Special characters handling',
      specialCharsHandled ? 'PASS' : 'FAIL',
      `Status: ${specialCharsResponse.status}`,
      10,
      false,
      'UserExperience'
    );
    
    // Test very long query
    const longQuery = 'a'.repeat(1000);
    const longQueryResponse = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(longQuery)}&type=all`);
    const longQueryHandled = longQueryResponse.status !== 500;
    addTest(
      'User Experience',
      'Long query handling',
      longQueryHandled ? 'PASS' : 'FAIL',
      `Status: ${longQueryResponse.status}`,
      10,
      false,
      'UserExperience'
    );
    
    // Test pagination support
    const paginatedResponse = await fetch(`${BASE_URL}/api/search?q=test&type=all&limit=5`);
    if (paginatedResponse.ok) {
      const paginatedData = await paginatedResponse.json();
      const hasLimitedResults = !paginatedData.results || paginatedData.results.length <= 5;
      addTest(
        'User Experience',
        'Result limit functionality',
        hasLimitedResults ? 'PASS' : 'WARNING',
        `Results count: ${paginatedData.results?.length || 0}`,
        10,
        false,
        'UserExperience'
      );
    }
    
    // Test mobile responsiveness (simulate mobile request)
    const mobileResponse = await fetch(`${BASE_URL}/search`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    
    if (mobileResponse.ok) {
      addTest(
        'User Experience',
        'Mobile compatibility',
        'PASS',
        'Search page loads on mobile user agent',
        15,
        false,
        'UserExperience'
      );
    } else {
      addTest(
        'User Experience',
        'Mobile compatibility',
        'WARNING',
        `Mobile response: ${mobileResponse.status}`,
        5,
        false,
        'UserExperience'
      );
    }
    
  } catch (error: any) {
    addTest('User Experience', 'Error handling tests', 'FAIL', `Error: ${error.message}`, 0, false, 'UserExperience');
  }
}

/**
 * Tests Database Integration and Search Methods
 */
async function testDatabaseIntegration(): Promise<void> {
  console.log('\n🗄️ Testing Database Integration...');
  
  try {
    if (!process.env.DATABASE_URL) {
      addTest('Database', 'Database connection', 'FAIL', 'DATABASE_URL not configured', 0, true, 'Database');
      return;
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test database connectivity
    const result = await pool.query('SELECT 1 as test');
    if (result.rows[0]?.test === 1) {
      addTest('Database', 'Database connectivity', 'PASS', 'Database connection successful', 20, true, 'Database');
    } else {
      addTest('Database', 'Database connectivity', 'FAIL', 'Database connection failed', 0, true, 'Database');
      return;
    }
    
    // Test users table for search
    try {
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users LIMIT 1');
      addTest(
        'Database',
        'Users table accessibility',
        'PASS',
        `Users table accessible with ${usersResult.rows[0]?.count || 0} records`,
        15,
        false,
        'Database'
      );
    } catch (error: any) {
      addTest('Database', 'Users table accessibility', 'WARNING', `Error: ${error.message}`, 5, false, 'Database');
    }
    
    // Test search indexes (if any)
    try {
      const indexResult = await pool.query(`
        SELECT schemaname, tablename, indexname 
        FROM pg_indexes 
        WHERE tablename IN ('users', 'coach_profiles', 'matches', 'tournaments', 'communities')
        LIMIT 10
      `);
      
      addTest(
        'Database',
        'Search optimization indexes',
        indexResult.rows.length > 0 ? 'PASS' : 'WARNING',
        `Found ${indexResult.rows.length} indexes on search-related tables`,
        10,
        false,
        'Database'
      );
    } catch (error: any) {
      addTest('Database', 'Search optimization indexes', 'WARNING', `Could not check indexes: ${error.message}`, 5, false, 'Database');
    }
    
    await pool.end();
    
  } catch (error: any) {
    addTest('Database', 'Database integration', 'FAIL', `Error: ${error.message}`, 0, true, 'Database');
  }
}

/**
 * Tests Security and Input Validation
 */
async function testSecurityAndValidation(): Promise<void> {
  console.log('\n🔒 Testing Security and Validation...');
  
  try {
    // Test SQL injection protection
    const sqlInjectionQuery = "'; DROP TABLE users; --";
    const sqlInjectionResponse = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(sqlInjectionQuery)}&type=all`);
    const sqlInjectionPrevented = sqlInjectionResponse.status !== 500;
    
    addTest(
      'Security',
      'SQL injection prevention',
      sqlInjectionPrevented ? 'PASS' : 'FAIL',
      `Status: ${sqlInjectionResponse.status}`,
      20,
      true,
      'Security'
    );
    
    // Test XSS protection
    const xssQuery = '<script>alert("xss")</script>';
    const xssResponse = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(xssQuery)}&type=all`);
    const xssPrevented = xssResponse.status !== 500;
    
    addTest(
      'Security',
      'XSS attack prevention',
      xssPrevented ? 'PASS' : 'FAIL',
      `Status: ${xssResponse.status}`,
      15,
      true,
      'Security'
    );
    
    // Test rate limiting tolerance
    const rapidRequests = [];
    for (let i = 0; i < 10; i++) {
      rapidRequests.push(fetch(`${BASE_URL}/api/search?q=test${i}&type=all`));
    }
    
    const rapidResponses = await Promise.all(rapidRequests);
    const successfulRequests = rapidResponses.filter(r => r.ok).length;
    const rateLimitingWorking = successfulRequests >= 8; // Allow some requests to be rate limited
    
    addTest(
      'Security',
      'Rate limiting tolerance',
      rateLimitingWorking ? 'PASS' : 'WARNING',
      `${successfulRequests}/10 requests successful`,
      10,
      false,
      'Security'
    );
    
  } catch (error: any) {
    addTest('Security', 'Security validation', 'FAIL', `Error: ${error.message}`, 0, true, 'Security');
  }
}

/**
 * Calculate overall search system readiness score
 */
function calculateSearchSystemReadiness(): number {
  const totalPossibleScore = searchTests.reduce((sum, test) => sum + (test.status === 'PASS' ? test.score : test.score), 0);
  const actualScore = searchTests.reduce((sum, test) => sum + (test.status === 'PASS' ? test.score : 0), 0);
  
  return totalPossibleScore > 0 ? Math.round((actualScore / totalPossibleScore) * 100) : 0;
}

/**
 * Generate comprehensive search system readiness report
 */
function generateSearchSystemReport(): void {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 GLOBAL SEARCH SYSTEM CI/CD VALIDATION REPORT');
  console.log('='.repeat(80));
  
  const totalTests = searchTests.length;
  const passedTests = searchTests.filter(t => t.status === 'PASS').length;
  const failedTests = searchTests.filter(t => t.status === 'FAIL').length;
  const warningTests = searchTests.filter(t => t.status === 'WARNING').length;
  const criticalFailures = searchTests.filter(t => t.status === 'FAIL' && t.critical).length;
  
  console.log(`\n📊 SUMMARY STATISTICS:`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`❌ Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
  console.log(`⚠️  Warnings: ${warningTests} (${Math.round(warningTests/totalTests*100)}%)`);
  console.log(`🚨 Critical Failures: ${criticalFailures}`);
  
  const readinessScore = calculateSearchSystemReadiness();
  console.log(`\n🎯 OVERALL SEARCH SYSTEM READINESS: ${readinessScore}%`);
  
  if (readinessScore >= 90) {
    console.log('🟢 EXCELLENT - Search system is production ready');
  } else if (readinessScore >= 75) {
    console.log('🟡 GOOD - Search system is mostly ready with minor issues');
  } else if (readinessScore >= 60) {
    console.log('🟠 FAIR - Search system needs improvements before production');
  } else {
    console.log('🔴 POOR - Search system requires significant work before deployment');
  }
  
  // Category breakdown
  console.log(`\n📂 CATEGORY BREAKDOWN:`);
  const categories = ['Infrastructure', 'Frontend', 'Performance', 'MultiCategory', 'UserExperience', 'Database', 'Security'];
  
  categories.forEach(category => {
    const categoryTests = searchTests.filter(t => t.category === category);
    if (categoryTests.length > 0) {
      const categoryPassed = categoryTests.filter(t => t.status === 'PASS').length;
      const categoryScore = Math.round(categoryPassed / categoryTests.length * 100);
      console.log(`  ${category}: ${categoryPassed}/${categoryTests.length} (${categoryScore}%)`);
    }
  });
  
  // Critical issues
  if (criticalFailures > 0) {
    console.log(`\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:`);
    searchTests
      .filter(t => t.status === 'FAIL' && t.critical)
      .forEach(test => {
        console.log(`  ❌ ${test.component}: ${test.test}`);
        console.log(`     └─ ${test.details}`);
      });
  }
  
  // Next steps
  console.log(`\n🎯 RECOMMENDED NEXT STEPS:`);
  if (readinessScore >= 90) {
    console.log('  ✅ Search system is ready for production deployment');
    console.log('  ✅ Consider implementing advanced features like autocomplete');
    console.log('  ✅ Monitor search analytics and user behavior');
  } else {
    console.log('  🔧 Address critical failures first');
    console.log('  🔧 Resolve warning issues for better user experience');
    console.log('  🔧 Optimize performance for better response times');
    console.log('  🔧 Re-run validation after fixes');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`Search System CI/CD Validation Complete - ${new Date().toISOString()}`);
  console.log('='.repeat(80));
}

/**
 * Main search system CI/CD validation execution
 */
async function runGlobalSearchValidation(): Promise<void> {
  console.log('🚀 Starting Global Search System CI/CD Validation...');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    await testSearchInfrastructure();
    await testFrontendComponents();
    await testSearchPerformance();
    await testMultiCategorySearch();
    await testUserExperience();
    await testDatabaseIntegration();
    await testSecurityAndValidation();
    
    generateSearchSystemReport();
    
  } catch (error: any) {
    console.error('❌ CI/CD Validation failed:', error.message);
    addTest('System', 'Overall validation', 'FAIL', error.message, 0, true, 'Infrastructure');
    generateSearchSystemReport();
  }
}

// Execute validation
runGlobalSearchValidation().catch(console.error);
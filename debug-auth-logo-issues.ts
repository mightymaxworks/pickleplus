/**
 * Debug Script for Auth Page and Logo Display Issues
 * Comprehensive testing of both critical regressions
 */

import fs from 'fs';
import path from 'path';

async function debugAuthAndLogoIssues() {
  console.log('🔍 DEBUGGING AUTH PAGE AND LOGO DISPLAY ISSUES\n');

  // 1. Check file existence
  console.log('1. FILE EXISTENCE CHECKS:');
  
  const logoFiles = [
    'client/src/assets/pickle-plus-logo.png',
    'client/src/assets/Pickle (2).png',
    'client/src/components/icons/PicklePlusNewLogo.tsx',
    'client/src/pages/auth-page.tsx'
  ];
  
  for (const file of logoFiles) {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✓' : '✗'} ${file}`);
  }

  // 2. Check import paths
  console.log('\n2. IMPORT PATH ANALYSIS:');
  
  // Check PicklePlusNewLogo component
  const logoComponent = fs.readFileSync('client/src/components/icons/PicklePlusNewLogo.tsx', 'utf8');
  const logoImportMatch = logoComponent.match(/import.*from ['"](.+)['"];/);
  console.log(`   Logo component import: ${logoImportMatch ? logoImportMatch[1] : 'NOT FOUND'}`);
  
  // Check auth page
  const authPage = fs.readFileSync('client/src/pages/auth-page.tsx', 'utf8');
  const authImportMatch = authPage.match(/import pickleLogoPath from ['"](.+)['"];/);
  console.log(`   Auth page import: ${authImportMatch ? authImportMatch[1] : 'NOT FOUND'}`);

  // 3. Test API endpoints
  console.log('\n3. API ENDPOINT TESTS:');
  
  try {
    const authResponse = await fetch('http://localhost:5000/auth');
    console.log(`   /auth endpoint: ${authResponse.status} ${authResponse.statusText}`);
    
    if (authResponse.status === 200) {
      const text = await authResponse.text();
      const hasReactApp = text.includes('id="root"');
      const hasLazyAuthPage = text.includes('LazyAuthPage') || text.includes('auth-page');
      console.log(`   Contains React app div: ${hasReactApp}`);
      console.log(`   References auth page: ${hasLazyAuthPage}`);
    }
  } catch (error) {
    console.log(`   /auth endpoint: ERROR - ${error.message}`);
  }

  // 4. Check router configuration
  console.log('\n4. ROUTER CONFIGURATION:');
  
  const appFile = fs.readFileSync('client/src/App.tsx', 'utf8');
  const authRouteMatch = appFile.match(/Route path="\/auth".*component=\{(.+?)\}/);
  console.log(`   Auth route component: ${authRouteMatch ? authRouteMatch[1] : 'NOT FOUND'}`);
  
  const lazyImportMatch = appFile.match(/LazyAuthPage.*=.*lazyLoad\(\(\) => import\(['"](.+?)['"]\)/);
  console.log(`   LazyAuthPage import path: ${lazyImportMatch ? lazyImportMatch[1] : 'NOT FOUND'}`);

  // 5. Check lazy loading configuration
  console.log('\n5. LAZY LOADING CONFIGURATION:');
  
  const lazyFile = fs.readFileSync('client/src/lazyComponents.tsx', 'utf8');
  const lazyAuthMatch = lazyFile.match(/LazyAuthPage.*=.*lazyLoad\(\(\) => import\(['"](.+?)['"]\)/);
  console.log(`   LazyAuthPage definition: ${lazyAuthMatch ? lazyAuthMatch[1] : 'NOT FOUND'}`);

  console.log('\n🔧 RECOMMENDED FIXES:');
  console.log('   1. Fix import paths to use proper relative paths');
  console.log('   2. Verify auth page component exports');
  console.log('   3. Check Vite asset handling configuration');
  console.log('   4. Test lazy loading component resolution');
}

debugAuthAndLogoIssues().catch(console.error);
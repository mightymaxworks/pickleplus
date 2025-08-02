// Navigation Testing Script
// This script tests key navigation routes for runtime errors

const testRoutes = [
  '/dashboard',
  '/coach', // ✅ Fixed - MapPin import added
  '/matches',
  '/profile',
  '/tournaments',
  '/communities',
  '/settings',
  '/admin',
  '/pcp-certification',
  '/dupr-integration'
];

console.log('Navigation Testing Plan:');
console.log('Routes to test:', testRoutes);

// This would be run in browser console to test frontend routing
// Each route should be tested for:
// 1. No runtime errors
// 2. Components load properly
// 3. Required imports are present
// 4. API calls succeed (where applicable)

testRoutes.forEach(route => {
  console.log(`Testing: ${route}`);
  // window.location.href = route; // Uncomment to test in browser
});
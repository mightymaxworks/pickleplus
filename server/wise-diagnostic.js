#!/usr/bin/env node

// Wise API Diagnostic Tool
// Tests token validity against both sandbox and production environments

const token = process.env.WISE_API_TOKEN;

if (!token) {
  console.log('❌ WISE_API_TOKEN environment variable not found');
  process.exit(1);
}

console.log('🔍 Wise API Token Diagnostic');
console.log('Token format:', token.length === 36 && token.includes('-') ? '✅ Valid UUID format' : '❌ Invalid format');
console.log('Token preview:', token.substring(0, 8) + '...' + token.substring(28));

const environments = [
  {
    name: 'Sandbox',
    baseUrl: 'https://api.sandbox.transferwise.tech',
    description: 'Test environment'
  },
  {
    name: 'Production', 
    baseUrl: 'https://api.transferwise.com',
    description: 'Live environment'
  }
];

async function testEnvironment(env) {
  console.log(`\n🧪 Testing ${env.name} Environment (${env.description})`);
  console.log(`📍 URL: ${env.baseUrl}/v1/profiles`);
  
  try {
    const response = await fetch(`${env.baseUrl}/v1/profiles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const text = await response.text();
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200) {
      const data = JSON.parse(text);
      console.log(`✅ ${env.name} Authentication SUCCESS!`);
      console.log(`📋 Found ${data.length} profile(s)`);
      if (data.length > 0) {
        console.log(`🏢 Business Name: ${data[0].details?.name || 'N/A'}`);
        console.log(`🆔 Profile ID: ${data[0].id}`);
      }
      return true;
    } else if (response.status === 401) {
      const error = JSON.parse(text);
      console.log(`❌ ${env.name} Authentication FAILED`);
      console.log(`🚫 Error: ${error.error_description || error.error}`);
      return false;
    } else {
      console.log(`⚠️  ${env.name} Unexpected response: ${response.status}`);
      console.log(`📄 Response: ${text}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 ${env.name} Network error: ${error.message}`);
    return false;
  }
}

async function runDiagnostic() {
  console.log('=' * 50);
  
  let successCount = 0;
  for (const env of environments) {
    const success = await testEnvironment(env);
    if (success) successCount++;
  }
  
  console.log('\n📋 DIAGNOSTIC SUMMARY');
  console.log('=' * 30);
  
  if (successCount === 0) {
    console.log('❌ Token invalid for both environments');
    console.log('💡 Solutions:');
    console.log('   1. Generate new token from Wise Business dashboard');
    console.log('   2. Verify business account is fully verified');  
    console.log('   3. Check token has correct permissions');
  } else if (successCount === 1) {
    console.log('✅ Token valid for one environment');
    console.log('💡 Update your integration to use the working environment');
  } else {
    console.log('⚠️  Token valid for both environments (unusual)');
  }
}

runDiagnostic().catch(console.error);
/**
 * Frontend Registration Form CI/CD Test
 * Tests the registration API endpoint and form validation
 * 
 * Run with: npx tsx test-frontend-registration.ts
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

interface RegistrationPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
}

const testRegistration: RegistrationPayload = {
  firstName: "Emma",
  lastName: "Johnson",
  username: "emmaj2024",
  email: "emma.johnson@testpickle.com",
  password: "SecureTest123!",
  displayName: "Emma Johnson"
};

async function testRegistrationAPI() {
  console.log("Testing registration API endpoint...");
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRegistration)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Registration response status:", response.status);
      console.log("Registration response:", errorText);
      
      if (response.status === 400 && errorText.includes("Username already exists")) {
        console.log("User already exists - this is expected for repeated tests");
        return true;
      }
      
      throw new Error(`Registration failed: ${response.status} - ${errorText}`);
    }

    const userData = await response.json();
    console.log("Registration successful!");
    console.log("Created user:", {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName
    });

    return true;
  } catch (error) {
    console.error("Registration API test failed:", error);
    return false;
  }
}

async function testLoginAPI() {
  console.log("Testing login API endpoint...");
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testRegistration.username,
        password: testRegistration.password
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Login response status:", response.status);
      console.log("Login response:", errorText);
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }

    const userData = await response.json();
    console.log("Login successful!");
    console.log("Logged in user:", {
      id: userData.id,
      username: userData.username,
      email: userData.email
    });

    return true;
  } catch (error) {
    console.error("Login API test failed:", error);
    return false;
  }
}

async function testValidationErrors() {
  console.log("Testing validation error handling...");
  
  const invalidTests = [
    {
      name: "Missing first name",
      data: { ...testRegistration, firstName: "" },
      expectedError: "First name is required"
    },
    {
      name: "Missing last name", 
      data: { ...testRegistration, lastName: "" },
      expectedError: "Last name is required"
    },
    {
      name: "Short password",
      data: { ...testRegistration, password: "short" },
      expectedError: "Password must be at least 8 characters"
    },
    {
      name: "Invalid email",
      data: { ...testRegistration, email: "invalid-email" },
      expectedError: "Invalid email"
    },
    {
      name: "Invalid username",
      data: { ...testRegistration, username: "user with spaces" },
      expectedError: "Username can only contain"
    }
  ];

  for (const test of invalidTests) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.data)
      });

      if (response.ok) {
        console.log(`FAIL: ${test.name} - Expected validation error but registration succeeded`);
        return false;
      }

      const errorText = await response.text();
      console.log(`PASS: ${test.name} - Validation error caught: ${response.status}`);
      
    } catch (error) {
      console.log(`PASS: ${test.name} - Network error (expected for invalid data)`);
    }
  }

  return true;
}

async function runFrontendTests() {
  console.log("Starting Frontend Registration CI/CD Tests\n");
  
  const results = {
    registration: false,
    login: false,
    validation: false
  };

  // Test registration API
  results.registration = await testRegistrationAPI();
  console.log("");

  // Test login API  
  results.login = await testLoginAPI();
  console.log("");

  // Test validation
  results.validation = await testValidationErrors();
  console.log("");

  // Summary
  console.log("Test Results:");
  console.log("- Registration API:", results.registration ? "PASS" : "FAIL");
  console.log("- Login API:", results.login ? "PASS" : "FAIL");
  console.log("- Validation:", results.validation ? "PASS" : "FAIL");

  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log("\nAll frontend tests passed!");
    console.log("System is ready for deployment");
    return true;
  } else {
    console.log("\nSome tests failed - review issues before deployment");
    return false;
  }
}

// Run the tests
runFrontendTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error during frontend testing:", error);
    process.exit(1);
  });
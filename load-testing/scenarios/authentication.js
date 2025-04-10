/**
 * PKL-278651-PERF-0001-LOAD
 * Authentication System Load Testing Scenario
 * 
 * This script tests the performance of the authentication system under load,
 * including login, registration, session management, and current user checks.
 */

const { sleep } = require('k6');
const http = require('k6/http');
const { check, group } = require('k6');
const { Counter, Rate, Trend } = require('k6/metrics');
const { randomString } = require('../helpers/data-generators');
const { validateAuthResponse } = require('../helpers/validators');
const env = require('../config/environment');
const thresholds = require('../config/thresholds');

// Custom metrics
const loginSuccess = new Rate('login_success');
const registrationSuccess = new Rate('registration_success');
const sessionErrors = new Counter('session_errors');
const loginDuration = new Trend('login_duration');
const registrationDuration = new Trend('registration_duration');
const currentUserDuration = new Trend('current_user_duration');

// Export options for the test scenario
export const options = {
  stages: [
    // Ramp up to baseline users
    { duration: '30s', target: thresholds.testTypes.baseline.users },
    // Hold at baseline for 1 minute
    { duration: '1m', target: thresholds.testTypes.baseline.users },
    // Ramp up to load test level
    { duration: '1m', target: thresholds.testTypes.load.users },
    // Hold at load test level
    { duration: '3m', target: thresholds.testTypes.load.users },
    // Ramp down
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    'http_req_duration{endpoint:login}': [`p(95)<${thresholds.endpoints.auth.login.p95}`],
    'http_req_duration{endpoint:register}': [`p(95)<${thresholds.endpoints.auth.register.p95}`],
    'http_req_duration{endpoint:currentUser}': [`p(95)<${thresholds.endpoints.auth.currentUser.p95}`],
    'login_success': ['rate>0.95'], // 95% success rate for logins
    'registration_success': ['rate>0.95'], // 95% success rate for registrations
    'session_errors': ['count<10'] // Fewer than 10 session errors
  }
};

/**
 * Default function called by k6 for each virtual user
 */
export default function() {
  const baseUrl = env.baseUrl;
  
  group('User Registration', function() {
    // Generate unique username and email for new user registration
    const timestamp = new Date().getTime();
    const username = `${env.testUsers.new.username}${timestamp}`;
    const email = `${env.testUsers.new.username}${timestamp}@example.com`;
    const password = env.testUsers.new.password;
    
    // Prepare registration payload
    const payload = JSON.stringify({
      username,
      email,
      password,
      confirmPassword: password
    });
    
    // Set request headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Make registration request and record metrics
    const startTime = new Date();
    const response = http.post(`${baseUrl}${env.endpoints.auth.register}`, payload, {
      headers,
      tags: { endpoint: 'register' }
    });
    
    // Record registration duration
    registrationDuration.add(new Date() - startTime);
    
    // Validate response
    const success = check(response, {
      'Registration successful': (r) => r.status === 201,
      'Response has user object': (r) => validateAuthResponse(r),
      'Response time acceptable': (r) => r.timings.duration < thresholds.endpoints.auth.register.p95
    });
    
    // Record success rate
    registrationSuccess.add(success);
    
    // On success, extract session cookie
    if (response.status === 201) {
      const cookies = response.cookies;
      // Save cookies for next requests
    }
    
    // Add a small delay between operations
    sleep(1);
  });
  
  group('User Login', function() {
    // Use test standard user for login
    const username = env.testUsers.standard.username;
    const password = env.testUsers.standard.password;
    
    // Prepare login payload
    const payload = JSON.stringify({
      username,
      password
    });
    
    // Set request headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Make login request and record metrics
    const startTime = new Date();
    const response = http.post(`${baseUrl}${env.endpoints.auth.login}`, payload, {
      headers,
      tags: { endpoint: 'login' }
    });
    
    // Record login duration
    loginDuration.add(new Date() - startTime);
    
    // Validate response
    const success = check(response, {
      'Login successful': (r) => r.status === 200,
      'Response has user object': (r) => validateAuthResponse(r),
      'Response time acceptable': (r) => r.timings.duration < thresholds.endpoints.auth.login.p95
    });
    
    // Record success rate
    loginSuccess.add(success);
    
    // Capture session cookie for subsequent requests
    let sessionCookie;
    if (response.status === 200 && response.cookies) {
      sessionCookie = response.cookies['connect.sid'] || response.cookies['pickle.sid'];
    }
    
    // Add a small delay between operations
    sleep(1);
    
    // Only proceed with current user check if login was successful
    if (success && sessionCookie) {
      // Prepare cookies for current user request
      const jar = http.cookieJar();
      jar.set(baseUrl, 'connect.sid', sessionCookie);
      
      // Make current user request
      const currentUserStartTime = new Date();
      const currentUserResponse = http.get(`${baseUrl}${env.endpoints.auth.currentUser}`, {
        tags: { endpoint: 'currentUser' }
      });
      
      // Record current user request duration
      currentUserDuration.add(new Date() - currentUserStartTime);
      
      // Validate current user response
      check(currentUserResponse, {
        'Current user check successful': (r) => r.status === 200,
        'Response has correct user': (r) => {
          try {
            const user = JSON.parse(r.body);
            return user.username === username;
          } catch (e) {
            sessionErrors.add(1);
            return false;
          }
        },
        'Response time acceptable': (r) => r.timings.duration < thresholds.endpoints.auth.currentUser.p95
      });
      
      // Attempt to log out to clean up the session
      http.get(`${baseUrl}${env.endpoints.auth.logout}`, {
        tags: { endpoint: 'logout' }
      });
    } else {
      // Record session error if login failed
      sessionErrors.add(1);
    }
  });
}
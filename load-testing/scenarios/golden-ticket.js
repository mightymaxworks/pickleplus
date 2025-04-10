/**
 * PKL-278651-PERF-0001-LOAD
 * Golden Ticket System Load Testing Scenario
 * 
 * This script tests the performance of the Golden Ticket promotional system under load,
 * including ticket listing, claiming, and sponsor reveal operations.
 */

const { sleep } = require('k6');
const http = require('k6/http');
const { check, group } = require('k6');
const { Counter, Rate, Trend } = require('k6/metrics');
const { validateGoldenTicketResponse } = require('../helpers/validators');
const env = require('../config/environment');
const thresholds = require('../config/thresholds');

// Custom metrics
const availableTicketsSuccess = new Rate('available_tickets_success');
const ticketClaimSuccess = new Rate('ticket_claim_success');
const sponsorRevealSuccess = new Rate('sponsor_reveal_success');
const ticketClaimErrors = new Counter('ticket_claim_errors');
const ticketListDuration = new Trend('ticket_list_duration');
const ticketClaimDuration = new Trend('ticket_claim_duration');
const sponsorRevealDuration = new Trend('sponsor_reveal_duration');

// Export options for the test scenario
export const options = {
  stages: [
    // Ramp up to baseline users
    { duration: '20s', target: Math.floor(thresholds.testTypes.baseline.users / 2) },
    // Hold at baseline for 40 seconds
    { duration: '40s', target: Math.floor(thresholds.testTypes.baseline.users / 2) },
    // Ramp up to load test level
    { duration: '30s', target: Math.floor(thresholds.testTypes.load.users / 2) },
    // Hold at load test level
    { duration: '2m', target: Math.floor(thresholds.testTypes.load.users / 2) },
    // Spike test with sudden increase
    { duration: '10s', target: thresholds.testTypes.load.users },
    // Hold at spike level briefly
    { duration: '20s', target: thresholds.testTypes.load.users },
    // Ramp down
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    'http_req_duration{endpoint:ticketList}': [`p(95)<${thresholds.endpoints.goldenTicket.list.p95}`],
    'http_req_duration{endpoint:ticketClaim}': [`p(95)<${thresholds.endpoints.goldenTicket.claim.p95}`],
    'http_req_duration{endpoint:sponsorReveal}': [`p(95)<${thresholds.endpoints.goldenTicket.reveal.p95}`],
    'available_tickets_success': ['rate>0.98'], // 98% success rate for ticket listings
    'ticket_claim_success': ['rate>0.95'], // 95% success rate for ticket claims
    'sponsor_reveal_success': ['rate>0.95'], // 95% success rate for sponsor reveals
    'ticket_claim_errors': ['count<20'] // Fewer than 20 ticket claim errors
  }
};

// Track claimed tickets to avoid duplicate claims
let claimedTickets = new Set();
// Track successful claims to use for reveals
let successfulClaims = [];

/**
 * Login function to authenticate before testing Golden Ticket operations
 */
function performLogin() {
  const baseUrl = env.baseUrl;
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
  
  // Make login request
  const response = http.post(`${baseUrl}${env.endpoints.auth.login}`, payload, {
    headers
  });
  
  // Return session cookie if login successful
  if (response.status === 200 && response.cookies) {
    return response.cookies['connect.sid'] || response.cookies['pickle.sid'];
  }
  
  return null;
}

/**
 * Default function called by k6 for each virtual user
 */
export default function() {
  const baseUrl = env.baseUrl;
  
  // Authenticate user first
  const sessionCookie = performLogin();
  if (!sessionCookie) {
    console.log('Authentication failed, skipping Golden Ticket tests');
    return;
  }
  
  // Set up cookie jar for authenticated requests
  const jar = http.cookieJar();
  jar.set(baseUrl, 'connect.sid', sessionCookie);
  
  // Request headers
  const headers = {
    'Content-Type': 'application/json'
  };
  
  group('List Available Golden Tickets', function() {
    // Make request to list available tickets
    const startTime = new Date();
    const response = http.get(`${baseUrl}${env.endpoints.goldenTicket.list}`, {
      headers,
      tags: { endpoint: 'ticketList' }
    });
    
    // Record request duration
    ticketListDuration.add(new Date() - startTime);
    
    // Validate response
    const success = check(response, {
      'Available tickets request successful': (r) => r.status === 200,
      'Response has tickets array': (r) => validateGoldenTicketResponse(r, 'list'),
      'Response time acceptable': (r) => r.timings.duration < thresholds.endpoints.goldenTicket.list.p95
    });
    
    // Record success rate
    availableTicketsSuccess.add(success);
    
    // Extract available tickets for claiming
    let availableTickets = [];
    if (success) {
      try {
        const ticketsResponse = JSON.parse(response.body);
        if (Array.isArray(ticketsResponse)) {
          // Filter out tickets that have already been claimed by this test
          availableTickets = ticketsResponse
            .filter(ticket => !claimedTickets.has(ticket.id))
            .map(ticket => ticket.id);
        }
      } catch (e) {
        console.error('Failed to parse available tickets:', e);
      }
    }
    
    // Add a small delay between operations
    sleep(1);
    
    // Only proceed with claim if there are available tickets
    if (availableTickets.length > 0) {
      // Choose a random ticket to claim
      const ticketIndex = Math.floor(Math.random() * availableTickets.length);
      const ticketId = availableTickets[ticketIndex];
      
      // Mark this ticket as claimed to avoid duplicate claims
      claimedTickets.add(ticketId);
      
      group('Claim Golden Ticket', function() {
        // Make claim request
        const claimStartTime = new Date();
        const claimResponse = http.post(
          `${baseUrl}${env.endpoints.goldenTicket.claim.replace(':ticketId', ticketId)}`,
          null, // No payload needed
          {
            headers,
            tags: { endpoint: 'ticketClaim' }
          }
        );
        
        // Record claim duration
        ticketClaimDuration.add(new Date() - claimStartTime);
        
        // Validate claim response
        const claimSuccess = check(claimResponse, {
          'Ticket claim successful': (r) => r.status === 200,
          'Response has claim data': (r) => validateGoldenTicketResponse(r, 'claim'),
          'Response time acceptable': (r) => r.timings.duration < thresholds.endpoints.goldenTicket.claim.p95
        });
        
        // Record claim success rate
        ticketClaimSuccess.add(claimSuccess);
        
        // Extract claim ID for reveal if successful
        if (claimSuccess) {
          try {
            const claimData = JSON.parse(claimResponse.body);
            if (claimData && claimData.id) {
              // Add to successful claims for reveal
              successfulClaims.push(claimData.id);
            }
          } catch (e) {
            console.error('Failed to parse claim response:', e);
            ticketClaimErrors.add(1);
          }
        } else {
          // Record claim error
          ticketClaimErrors.add(1);
        }
        
        // Add a small delay between operations
        sleep(1);
      });
    }
  });
  
  // Try to reveal a sponsor if we have successful claims
  if (successfulClaims.length > 0) {
    // Choose a random successful claim
    const claimIndex = Math.floor(Math.random() * successfulClaims.length);
    const claimId = successfulClaims[claimIndex];
    
    group('Reveal Sponsor', function() {
      // Make reveal request
      const revealStartTime = new Date();
      const revealResponse = http.post(
        `${baseUrl}${env.endpoints.goldenTicket.reveal.replace(':claimId', claimId)}`,
        null, // No payload needed
        {
          headers,
          tags: { endpoint: 'sponsorReveal' }
        }
      );
      
      // Record reveal duration
      sponsorRevealDuration.add(new Date() - revealStartTime);
      
      // Validate reveal response
      const revealSuccess = check(revealResponse, {
        'Sponsor reveal successful': (r) => r.status === 200,
        'Response has sponsor data': (r) => validateGoldenTicketResponse(r, 'reveal'),
        'Response time acceptable': (r) => r.timings.duration < thresholds.endpoints.goldenTicket.reveal.p95
      });
      
      // Record reveal success rate
      sponsorRevealSuccess.add(revealSuccess);
      
      // Add a small delay after reveal
      sleep(1);
    });
  }
  
  // Attempt to log out to clean up the session
  http.get(`${baseUrl}${env.endpoints.auth.logout}`, {
    headers
  });
}
/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket API Service
 * 
 * API service for interacting with the Golden Ticket backend.
 */

import { apiRequest } from '@/lib/queryClient';
import { GoldenTicket, GoldenTicketClaim, Sponsor } from '@shared/golden-ticket.schema';

const API_BASE = '/api/golden-ticket';

// Custom API request wrapper for debugging
async function debugApiRequest<T>(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, data?: any): Promise<T> {
  try {
    console.log(`Making API ${method} request to ${url}`, data ? { data } : '');
    const rawResponse = await apiRequest(method, url, data);
    
    // Process the response to get JSON
    const text = await rawResponse.text();
    console.log(`Raw API text response from ${url}:`, text);
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(text);
      console.log(`Parsed API response from ${url}:`, jsonResponse);
    } catch (parseError) {
      console.error(`Failed to parse JSON from ${url}:`, parseError);
      throw new Error(`Invalid JSON response from ${url}`);
    }
    
    // Enhanced debugging for sponsor list
    if (url.includes('/sponsors')) {
      console.log('SPONSORS DEBUG - Response type:', typeof jsonResponse);
      if (jsonResponse && typeof jsonResponse === 'object') {
        console.log('SPONSORS DEBUG - Response keys:', Object.keys(jsonResponse));
        
        // Safely check and log sponsors array
        if ('sponsors' in jsonResponse && Array.isArray(jsonResponse.sponsors)) {
          console.log('SPONSORS DEBUG - Number of sponsors:', jsonResponse.sponsors.length);
          if (jsonResponse.sponsors.length > 0) {
            console.log('SPONSORS DEBUG - First sponsor:', jsonResponse.sponsors[0]);
          }
        }
      }
    }
    
    return jsonResponse as T;
  } catch (error) {
    console.error(`API error from ${url}:`, error);
    throw error;
  }
}

// Ticket Management API

/**
 * Fetch all available golden tickets
 * @returns List of golden tickets
 */
export async function getAllGoldenTickets(): Promise<GoldenTicket[]> {
  const response = await debugApiRequest<any>("GET", `${API_BASE}/admin/tickets`);
  // Handle the nested response format
  return response.tickets || [];
}

/**
 * Fetch golden tickets that are available to the current user
 * @returns List of golden tickets
 */
export async function getMyGoldenTickets(): Promise<GoldenTicket[]> {
  return debugApiRequest<GoldenTicket[]>("GET", `${API_BASE}/tickets`);
}

/**
 * Create a new golden ticket
 * @param ticket The ticket data
 * @returns The created ticket
 */
export async function createGoldenTicket(ticket: Omit<GoldenTicket, 'id' | 'createdAt' | 'updatedAt' | 'currentClaims'>): Promise<GoldenTicket> {
  return debugApiRequest<GoldenTicket>("POST", `${API_BASE}/admin/tickets`, ticket);
}

/**
 * Update an existing golden ticket
 * @param id The ticket ID
 * @param update The fields to update
 * @returns The updated ticket
 */
export async function updateGoldenTicket(id: number, update: Partial<GoldenTicket>): Promise<GoldenTicket> {
  return debugApiRequest<GoldenTicket>("PATCH", `${API_BASE}/admin/tickets/${id}`, update);
}

/**
 * Delete a golden ticket
 * @param id The ticket ID
 */
export async function deleteGoldenTicket(id: number): Promise<void> {
  return debugApiRequest<void>("DELETE", `${API_BASE}/admin/tickets/${id}`);
}

// Ticket Claims API

/**
 * Claim a golden ticket
 * @param ticketId The ticket ID to claim
 * @returns The claim record
 */
export async function claimGoldenTicket(ticketId: number): Promise<GoldenTicketClaim> {
  return debugApiRequest<GoldenTicketClaim>("POST", `${API_BASE}/tickets/${ticketId}/claim`);
}

/**
 * Get all claims for the current user
 * @returns List of claims
 */
export async function getMyTicketClaims(): Promise<GoldenTicketClaim[]> {
  return debugApiRequest<GoldenTicketClaim[]>("GET", `${API_BASE}/claims`);
}

/**
 * Get all ticket claims (admin only)
 * @returns List of all claims
 */
export async function getAllClaims(): Promise<GoldenTicketClaim[]> {
  const response = await debugApiRequest<any>("GET", `${API_BASE}/admin/claims`);
  // Handle the nested response format
  return response.claims || [];
}

/**
 * Update a claim status
 * @param id The claim ID
 * @param status The new status
 * @returns The updated claim
 */
export async function updateClaimStatus(id: number, status: string): Promise<GoldenTicketClaim> {
  return debugApiRequest<GoldenTicketClaim>("PATCH", `${API_BASE}/admin/claims/${id}`, { status });
}

// Sponsor Management API

/**
 * Get all sponsors
 * @returns List of sponsors
 */
export async function getAllSponsors(): Promise<Sponsor[]> {
  const response = await debugApiRequest<any>("GET", `${API_BASE}/admin/sponsors`);
  // Handle the nested response format
  return response.sponsors || [];
}

/**
 * Create a new sponsor
 * @param sponsor The sponsor data
 * @returns The created sponsor
 */
export async function createSponsor(sponsor: {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  logoPath?: string | null;
  website?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  active: boolean;
}): Promise<Sponsor> {
  console.log('Creating sponsor with data:', sponsor);
  return debugApiRequest<Sponsor>("POST", `${API_BASE}/admin/sponsors`, sponsor);
}

/**
 * Update a sponsor
 * @param id The sponsor ID
 * @param update The fields to update
 * @returns The updated sponsor
 */
export async function updateSponsor(id: number, update: Partial<Sponsor>): Promise<Sponsor> {
  return debugApiRequest<Sponsor>("PATCH", `${API_BASE}/admin/sponsors/${id}`, update);
}

/**
 * Delete a sponsor
 * @param id The sponsor ID
 */
export async function deleteSponsor(id: number): Promise<void> {
  return debugApiRequest<void>("DELETE", `${API_BASE}/admin/sponsors/${id}`);
}

// Client-side aliases for better naming in admin interface
export const getGoldenTickets = getAllGoldenTickets;
export const getClaims = getAllClaims;
export const getSponsors = getAllSponsors;
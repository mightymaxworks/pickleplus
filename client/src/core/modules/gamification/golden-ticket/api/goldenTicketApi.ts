/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket API Service
 * 
 * API service for interacting with the Golden Ticket backend.
 */

import { apiRequest } from '@/lib/queryClient';
import { GoldenTicket, GoldenTicketClaim, Sponsor } from '@shared/golden-ticket.schema';

const API_BASE = '/api/golden-ticket';

// Ticket Management API

/**
 * Fetch all available golden tickets
 * @returns List of golden tickets
 */
export async function getAllGoldenTickets(): Promise<GoldenTicket[]> {
  const response = await apiRequest(`${API_BASE}/admin/tickets`);
  // Handle the nested response format
  return response.tickets || [];
}

/**
 * Fetch golden tickets that are available to the current user
 * @returns List of golden tickets
 */
export async function getMyGoldenTickets(): Promise<GoldenTicket[]> {
  return apiRequest(`${API_BASE}/tickets`);
}

/**
 * Create a new golden ticket
 * @param ticket The ticket data
 * @returns The created ticket
 */
export async function createGoldenTicket(ticket: Omit<GoldenTicket, 'id' | 'createdAt' | 'updatedAt' | 'currentClaims'>): Promise<GoldenTicket> {
  return apiRequest(`${API_BASE}/admin/tickets`, {
    method: 'POST',
    body: JSON.stringify(ticket),
  });
}

/**
 * Update an existing golden ticket
 * @param id The ticket ID
 * @param update The fields to update
 * @returns The updated ticket
 */
export async function updateGoldenTicket(id: number, update: Partial<GoldenTicket>): Promise<GoldenTicket> {
  return apiRequest(`${API_BASE}/admin/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
}

/**
 * Delete a golden ticket
 * @param id The ticket ID
 */
export async function deleteGoldenTicket(id: number): Promise<void> {
  return apiRequest(`${API_BASE}/admin/tickets/${id}`, {
    method: 'DELETE',
  });
}

// Ticket Claims API

/**
 * Claim a golden ticket
 * @param ticketId The ticket ID to claim
 * @returns The claim record
 */
export async function claimGoldenTicket(ticketId: number): Promise<GoldenTicketClaim> {
  return apiRequest(`${API_BASE}/tickets/${ticketId}/claim`, {
    method: 'POST',
  });
}

/**
 * Get all claims for the current user
 * @returns List of claims
 */
export async function getMyTicketClaims(): Promise<GoldenTicketClaim[]> {
  return apiRequest(`${API_BASE}/claims`);
}

/**
 * Get all ticket claims (admin only)
 * @returns List of all claims
 */
export async function getAllClaims(): Promise<GoldenTicketClaim[]> {
  const response = await apiRequest(`${API_BASE}/admin/claims`);
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
  return apiRequest(`${API_BASE}/admin/claims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Sponsor Management API

/**
 * Get all sponsors
 * @returns List of sponsors
 */
export async function getAllSponsors(): Promise<Sponsor[]> {
  const response = await apiRequest(`${API_BASE}/admin/sponsors`);
  // Handle the nested response format
  return response.sponsors || [];
}

/**
 * Create a new sponsor
 * @param sponsor The sponsor data
 * @returns The created sponsor
 */
export async function createSponsor(sponsor: Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sponsor> {
  return apiRequest(`${API_BASE}/admin/sponsors`, {
    method: 'POST',
    body: JSON.stringify(sponsor),
  });
}

/**
 * Update a sponsor
 * @param id The sponsor ID
 * @param update The fields to update
 * @returns The updated sponsor
 */
export async function updateSponsor(id: number, update: Partial<Sponsor>): Promise<Sponsor> {
  return apiRequest(`${API_BASE}/admin/sponsors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
}

/**
 * Delete a sponsor
 * @param id The sponsor ID
 */
export async function deleteSponsor(id: number): Promise<void> {
  return apiRequest(`${API_BASE}/admin/sponsors/${id}`, {
    method: 'DELETE',
  });
}

// Client-side aliases for better naming in admin interface
export const getGoldenTickets = getAllGoldenTickets;
export const getClaims = getAllClaims;
export const getSponsors = getAllSponsors;
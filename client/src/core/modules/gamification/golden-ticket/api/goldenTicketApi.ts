/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket API Service
 * 
 * Client-side service for interacting with the golden ticket API endpoints.
 */

import { apiRequest } from '@/lib/queryClient';
import type { 
  GoldenTicket, 
  GoldenTicketClaim, 
  Sponsor,
  InsertGoldenTicket,
  InsertSponsor
} from '@shared/golden-ticket.schema';

/**
 * Types for additional API responses
 */
export interface TicketCheckResponse {
  result: 'show-ticket' | 'no-ticket';
  ticketId?: number;
}

export interface TicketClaimResponse {
  success: boolean;
  claim: GoldenTicketClaim;
}

/**
 * Check if a golden ticket should be shown
 */
export async function checkForGoldenTicket(): Promise<TicketCheckResponse> {
  try {
    const response = await apiRequest(
      'GET',
      '/api/golden-ticket/check'
    );
    
    if (!response.ok) {
      throw new Error(`Error checking for golden ticket: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to check for golden ticket:', error);
    return { result: 'no-ticket' };
  }
}

/**
 * Get a specific golden ticket by ID
 */
export async function getGoldenTicketById(id: number): Promise<GoldenTicket & { 
  sponsorName?: string; 
  sponsorLogoUrl?: string;
  sponsorWebsite?: string;
} | null> {
  try {
    const response = await apiRequest(
      'GET',
      `/api/golden-ticket/${id}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching golden ticket: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error(`Failed to fetch golden ticket ${id}:`, error);
    return null;
  }
}

/**
 * Claim a golden ticket
 */
export async function claimGoldenTicket(ticketId: number): Promise<GoldenTicketClaim | null> {
  try {
    const response = await apiRequest(
      'POST',
      '/api/golden-ticket/claim',
      { ticketId }
    );
    
    if (!response.ok) {
      throw new Error(`Error claiming golden ticket: ${response.status}`);
    }
    
    const text = await response.text();
    const data = JSON.parse(text) as TicketClaimResponse;
    return data.claim;
  } catch (error) {
    console.error(`Failed to claim golden ticket ${ticketId}:`, error);
    return null;
  }
}

/**
 * Get all golden tickets claimed by current user
 */
export async function getMyGoldenTickets(): Promise<GoldenTicketClaim[]> {
  try {
    const response = await apiRequest(
      'GET',
      '/api/golden-ticket/my-tickets'
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching my golden tickets: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to fetch my golden tickets:', error);
    return [];
  }
}

/**
 * Admin API functions
 */

/**
 * Get all golden tickets (admin only)
 */
export async function getAllGoldenTickets(): Promise<GoldenTicket[]> {
  try {
    const response = await apiRequest(
      'GET',
      '/api/admin/golden-tickets'
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching all golden tickets: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to fetch all golden tickets:', error);
    return [];
  }
}

/**
 * Create a new golden ticket (admin only)
 */
export async function createGoldenTicket(ticket: InsertGoldenTicket): Promise<GoldenTicket | null> {
  try {
    const response = await apiRequest(
      'POST',
      '/api/admin/golden-tickets',
      ticket
    );
    
    if (!response.ok) {
      throw new Error(`Error creating golden ticket: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to create golden ticket:', error);
    return null;
  }
}

/**
 * Update a golden ticket (admin only)
 */
export async function updateGoldenTicket(id: number, data: Partial<GoldenTicket>): Promise<GoldenTicket | null> {
  try {
    const response = await apiRequest(
      'PUT',
      `/api/admin/golden-tickets/${id}`,
      data
    );
    
    if (!response.ok) {
      throw new Error(`Error updating golden ticket: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error(`Failed to update golden ticket ${id}:`, error);
    return null;
  }
}

/**
 * Get all sponsors (admin only)
 */
export async function getAllSponsors(): Promise<Sponsor[]> {
  try {
    const response = await apiRequest(
      'GET',
      '/api/admin/sponsors'
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching sponsors: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to fetch sponsors:', error);
    return [];
  }
}

/**
 * Create a new sponsor (admin only)
 */
export async function createSponsor(sponsor: InsertSponsor): Promise<Sponsor | null> {
  try {
    const response = await apiRequest(
      'POST',
      '/api/admin/sponsors',
      sponsor
    );
    
    if (!response.ok) {
      throw new Error(`Error creating sponsor: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to create sponsor:', error);
    return null;
  }
}

/**
 * Get all ticket claims (admin only)
 */
export async function getTicketClaims(): Promise<GoldenTicketClaim[]> {
  try {
    const response = await apiRequest(
      'GET',
      '/api/admin/ticket-claims'
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching ticket claims: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to fetch ticket claims:', error);
    return [];
  }
}

/**
 * Update claim status (admin only)
 */
export async function updateClaimStatus(id: number, status: string): Promise<GoldenTicketClaim | null> {
  try {
    const response = await apiRequest(
      'PUT',
      `/api/admin/ticket-claims/${id}`,
      { status }
    );
    
    if (!response.ok) {
      throw new Error(`Error updating claim status: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error(`Failed to update claim status for ${id}:`, error);
    return null;
  }
}
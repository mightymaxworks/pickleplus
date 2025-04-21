/**
 * PKL-278651-BOUNCE-0005-AUTO-API - Bounce API Client
 * 
 * This module provides client-side API functions for interacting
 * with the Bounce automation system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { apiRequest } from '@/lib/queryClient';

/**
 * Fetch all test templates
 */
export async function getTestTemplates() {
  return apiRequest('/api/admin/bounce/templates');
}

/**
 * Create a new test template
 */
export async function createTestTemplate(data: any) {
  return apiRequest('/api/admin/bounce/templates', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Update an existing test template
 */
export async function updateTestTemplate(id: number, data: any) {
  return apiRequest(`/api/admin/bounce/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Delete a test template
 */
export async function deleteTestTemplate(id: number) {
  return apiRequest(`/api/admin/bounce/templates/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Fetch all test schedules
 */
export async function getTestSchedules() {
  return apiRequest('/api/admin/bounce/schedules');
}

/**
 * Create a new test schedule
 */
export async function createTestSchedule(data: any) {
  return apiRequest('/api/admin/bounce/schedules', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Update an existing test schedule
 */
export async function updateTestSchedule(id: number, data: any) {
  return apiRequest(`/api/admin/bounce/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Delete a test schedule
 */
export async function deleteTestSchedule(id: number) {
  return apiRequest(`/api/admin/bounce/schedules/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Trigger a test schedule manually
 */
export async function triggerTestSchedule(id: number) {
  return apiRequest(`/api/admin/bounce/schedules/${id}/trigger`, {
    method: 'POST'
  });
}

/**
 * Pause a test schedule
 */
export async function pauseTestSchedule(id: number) {
  return apiRequest(`/api/admin/bounce/schedules/${id}/pause`, {
    method: 'POST'
  });
}

/**
 * Resume a test schedule
 */
export async function resumeTestSchedule(id: number) {
  return apiRequest(`/api/admin/bounce/schedules/${id}/resume`, {
    method: 'POST'
  });
}

/**
 * Fetch all test runs
 */
export async function getTestRuns() {
  return apiRequest('/api/admin/bounce/runs');
}

/**
 * Fetch a specific test run's details
 */
export async function getTestRunDetails(id: number) {
  return apiRequest(`/api/admin/bounce/runs/${id}`);
}

/**
 * Fetch system status information
 */
export async function getBounceSystemStatus() {
  return apiRequest('/api/admin/bounce/status');
}
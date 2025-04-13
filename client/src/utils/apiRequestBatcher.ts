/**
 * PKL-278651-PERF-0001.4-API
 * API Request Batcher
 * 
 * This utility consolidates multiple API requests into batched requests when possible,
 * reducing the number of network calls and improving performance.
 */

import { queryClient } from '@/lib/queryClient';

// Batch request types
type BatchRequest = {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
};

type BatchResponse = {
  id: string;
  status: number;
  data: any;
  error?: string;
};

// Timeout for collecting batch requests
const BATCH_TIMEOUT = 50; // ms

// Map to store pending requests
const pendingRequests = new Map<string, {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  request: BatchRequest;
}>();

// Map to store current batch timeouts by endpoint group
const batchTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Creates a key for the batch endpoint group
 */
function getBatchEndpointGroup(endpoint: string): string {
  // Group similar endpoints together
  // e.g., /api/users/1 and /api/users/2 would be in the same group: "/api/users"
  const parts = endpoint.split('/');
  return parts.slice(0, 3).join('/');
}

/**
 * Executes a batch of requests to the server
 */
async function executeBatch(endpointGroup: string): Promise<void> {
  // Get all pending requests for this group
  const groupRequests = Array.from(pendingRequests.entries())
    .filter(([, { request }]) => getBatchEndpointGroup(request.endpoint) === endpointGroup)
    .map(([id, { request }]) => request);

  // If no requests, return early
  if (groupRequests.length === 0) return;

  try {
    // Make the batch request
    const response = await fetch('/api/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ requests: groupRequests }),
    });

    // Handle response
    if (!response.ok) {
      throw new Error(`Batch request failed: ${response.statusText}`);
    }

    const batchResponses: BatchResponse[] = await response.json();

    // Resolve individual promises
    for (const batchResponse of batchResponses) {
      const pendingRequest = pendingRequests.get(batchResponse.id);
      if (pendingRequest) {
        if (batchResponse.status >= 200 && batchResponse.status < 300) {
          pendingRequest.resolve(batchResponse.data);
        } else {
          pendingRequest.reject(new Error(batchResponse.error || 'Unknown error'));
        }
        pendingRequests.delete(batchResponse.id);
      }
    }
  } catch (error) {
    // If the batch request fails, reject all pending requests
    const affectedRequests = Array.from(pendingRequests.entries())
      .filter(([, { request }]) => getBatchEndpointGroup(request.endpoint) === endpointGroup);

    for (const [id, { reject }] of affectedRequests) {
      reject(error);
      pendingRequests.delete(id);
    }
  }
}

/**
 * Adds a request to the batch and returns a promise that resolves when
 * the request is complete
 */
export function batchRequest<T = any>(request: Omit<BatchRequest, 'id'>): Promise<T> {
  return new Promise((resolve, reject) => {
    // Generate a unique ID for this request
    const id = Math.random().toString(36).substr(2, 9);
    
    // Add to pending requests
    pendingRequests.set(id, {
      resolve,
      reject,
      request: { ...request, id },
    });

    // Get the endpoint group
    const endpointGroup = getBatchEndpointGroup(request.endpoint);
    
    // Clear existing timeout for this group
    if (batchTimeouts.has(endpointGroup)) {
      clearTimeout(batchTimeouts.get(endpointGroup)!);
    }
    
    // Set a new timeout
    const timeout = setTimeout(() => {
      batchTimeouts.delete(endpointGroup);
      executeBatch(endpointGroup);
    }, BATCH_TIMEOUT);
    
    batchTimeouts.set(endpointGroup, timeout);
  });
}

/**
 * Wrap TanStack Query's fetcher to use batched requests when appropriate
 */
export function createBatchedQueryFetcher() {
  return async function batchedQueryFetcher<T>(url: string): Promise<T> {
    // Check if it's a GET request (Query) and should be batched
    if (url.startsWith('/api/')) {
      return batchRequest<T>({
        endpoint: url,
        method: 'GET',
      });
    }
    
    // Fall back to the default fetcher for non-API requests
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }
    
    return response.json();
  };
}

/**
 * Create a batched mutation function
 */
export function createBatchedMutation<TData = unknown, TError = unknown, TVariables = void>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  return async (variables: TVariables): Promise<TData> => {
    return batchRequest<TData>({
      endpoint: url,
      method,
      body: variables,
    });
  };
}

// Initialize the query client with the batched fetcher
export function initializeBatchedQueryClient() {
  // Set the default fetcher to use batching
  queryClient.setDefaultOptions({
    queries: {
      queryFn: createBatchedQueryFetcher(),
    },
  });
  
  return queryClient;
}
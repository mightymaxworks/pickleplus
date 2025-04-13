/**
 * PKL-278651-PERF-0001.4-API
 * API Request Batcher
 * 
 * This utility consolidates multiple API requests into a single batch request,
 * reducing network overhead and improving performance.
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Types for batch requests
type BatchRequestItem = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, any>;
  body?: Record<string, any>;
};

type BatchResponse = {
  results: Array<{
    status: 'success' | 'error';
    data?: any;
    error?: string;
    originalRequest: BatchRequestItem;
  }>;
};

// Configuration
const BATCH_DELAY = 50; // ms to wait before sending batch request
const MAX_BATCH_SIZE = 20; // maximum number of requests in a batch

// Pending requests queue
let pendingRequests: Array<{
  request: BatchRequestItem;
  resolve: (data: any) => void;
  reject: (error: Error) => void;
}> = [];

// Timer for batching
let batchTimer: ReturnType<typeof setTimeout> | null = null;

// Flag to track if batching is disabled (for testing or development)
let batchingEnabled = true;

/**
 * Toggle API request batching on/off
 */
export function toggleBatching(enabled: boolean): void {
  batchingEnabled = enabled;
  console.log(`[API] Request batching ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Make a batched API request
 * Adds the request to a queue and sends all queued requests in a single batch
 */
export async function batchedApiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  // If batching is disabled, make a regular request
  if (!batchingEnabled) {
    return regularApiRequest<T>(url, options);
  }
  
  // Extract method and body from options
  const method = (options.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  const body = options.body ? JSON.parse(options.body as string) : undefined;
  
  // Parse query parameters from URL
  const [baseUrl, queryString] = url.split('?');
  const params: Record<string, any> = {};
  
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      // Try to parse numbers and booleans
      if (value === 'true') params[key] = true;
      else if (value === 'false') params[key] = false;
      else if (!isNaN(Number(value))) params[key] = Number(value);
      else params[key] = value;
    });
  }
  
  // Create a promise that will be resolved when the batch request completes
  return new Promise<T>((resolve, reject) => {
    // Add this request to the pending queue
    pendingRequests.push({
      request: {
        url: baseUrl,
        method,
        params: Object.keys(params).length > 0 ? params : undefined,
        body,
      },
      resolve,
      reject,
    });
    
    // If we have too many requests, process the batch immediately
    if (pendingRequests.length >= MAX_BATCH_SIZE) {
      if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
      }
      processBatch();
      return;
    }
    
    // Set a timer to process the batch after a delay
    if (!batchTimer) {
      batchTimer = setTimeout(() => {
        batchTimer = null;
        processBatch();
      }, BATCH_DELAY);
    }
  });
}

/**
 * Process all pending requests as a batch
 */
async function processBatch(): Promise<void> {
  // Get all pending requests
  const requests = [...pendingRequests];
  pendingRequests = [];
  
  if (requests.length === 0) return;
  
  try {
    console.log(`[API] Processing batch of ${requests.length} requests`);
    
    // Make the batch request
    const response = await fetch('/api/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: requests.map(r => r.request),
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Batch request failed: ${response.status} ${errorText}`);
    }
    
    const batchResponse: BatchResponse = await response.json();
    
    // Process each result
    batchResponse.results.forEach((result, index) => {
      const { resolve, reject } = requests[index];
      
      if (result.status === 'success') {
        resolve(result.data);
      } else {
        reject(new Error(result.error || 'Unknown error'));
      }
    });
  } catch (error) {
    console.error('[API] Batch request failed:', error);
    
    // If the entire batch fails, reject all promises with individual errors
    requests.forEach(({ reject }) => {
      reject(error instanceof Error ? error : new Error(String(error)));
    });
  }
}

/**
 * Make a regular (non-batched) API request
 */
async function regularApiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

/**
 * Configure React Query to use batched API requests
 */
export function configureBatchedQueries(queryClient: QueryClient): void {
  // Set default options for all queries
  const defaultOptions: DefaultOptions = {
    queries: {
      queryFn: async ({ queryKey }) => {
        // The first item in the queryKey array is the URL
        const url = Array.isArray(queryKey) ? queryKey[0] as string : queryKey as string;
        
        if (url.startsWith('/api/')) {
          return batchedApiRequest(url);
        }
        
        // For non-API URLs, use the default behavior
        return regularApiRequest(url);
      },
    },
  };
  
  queryClient.setDefaultOptions(defaultOptions);
}

/**
 * Create a custom React Query fetcher that uses batched API requests
 */
export function createBatchedFetcher<T>() {
  return async (url: string): Promise<T> => {
    return batchedApiRequest<T>(url);
  };
}

// Export a standalone function for API requests outside of React Query
export const apiRequest = batchedApiRequest;
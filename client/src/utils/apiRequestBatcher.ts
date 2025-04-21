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
 * Process all pending requests as a batch with retries and enhanced error handling
 */
async function processBatch(retryCount = 0): Promise<void> {
  // Get all pending requests
  const requests = [...pendingRequests];
  pendingRequests = [];
  
  if (requests.length === 0) return;
  
  try {
    console.log(`[API] Processing batch of ${requests.length} requests`);
    
    // Make the batch request
    let response: Response;
    try {
      response = await fetch('/api/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: requests.map(r => r.request),
        }),
      });
    } catch (fetchError) {
      // Handle network errors for the batch request
      console.error('[API] Network error during batch request:', fetchError);
      
      // If we have retries left, try again with exponential backoff
      if (retryCount < 2) {
        console.warn(`[API] Retrying batch request (${retryCount + 1}/2)...`);
        // Add the requests back to the queue
        pendingRequests = [...requests, ...pendingRequests];
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return processBatch(retryCount + 1);
      }
      
      // If we're out of retries, reject all requests
      const error = new Error('Network error: Could not connect to server. Please check your connection.');
      requests.forEach(({ reject }) => reject(error));
      return;
    }
    
    // Handle server errors (502, 503, 504) with retries
    if (response.status >= 502 && response.status <= 504) {
      if (retryCount < 2) {
        console.warn(`[API] Server error (${response.status}) for batch request, retrying... (${retryCount + 1}/2)`);
        // Add the requests back to the queue
        pendingRequests = [...requests, ...pendingRequests];
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return processBatch(retryCount + 1);
      }
    }
    
    if (!response.ok) {
      let errorMessage: string;
      try {
        // Try to parse as JSON first
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP error ${response.status}`;
      } catch {
        // If not JSON, get as text
        const errorText = await response.text();
        errorMessage = errorText || `HTTP error ${response.status}`;
      }
      
      throw new Error(`Batch request failed: ${response.status} ${errorMessage}`);
    }
    
    // Parse the response
    let batchResponse: BatchResponse;
    try {
      batchResponse = await response.json();
    } catch (parseError) {
      console.error('[API] Failed to parse batch response:', parseError);
      
      // If we have retries left, try again
      if (retryCount < 1) {
        console.warn('[API] Invalid JSON in batch response, retrying...');
        // Add the requests back to the queue
        pendingRequests = [...requests, ...pendingRequests];
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        return processBatch(retryCount + 1);
      }
      
      // If we're out of retries, reject all requests
      const error = new Error(`Failed to parse batch response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      requests.forEach(({ reject }) => reject(error));
      return;
    }
    
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
 * Make a regular (non-batched) API request with enhanced error handling and retries
 */
async function regularApiRequest<T>(url: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    // Handle server errors (502, 503, 504) with retries
    if (response.status >= 502 && response.status <= 504) {
      if (retryCount < 2) { // Maximum 2 retries
        console.warn(`[API] Server error (${response.status}) for ${url}, retrying... (${retryCount + 1}/2)`);
        // Exponential backoff: 500ms, then 1500ms
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(3, retryCount)));
        return regularApiRequest<T>(url, options, retryCount + 1);
      }
    }
    
    if (!response.ok) {
      let errorMessage: string;
      try {
        // Try to parse as JSON first
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP error ${response.status}`;
      } catch {
        // If not JSON, get as text
        const errorText = await response.text();
        errorMessage = errorText || `HTTP error ${response.status}`;
      }
      
      console.error(`[API] Request to ${url} failed with status ${response.status}: ${errorMessage}`);
      throw new Error(`API request failed: ${response.status} ${errorMessage}`);
    }
    
    // Parse the response
    try {
      return await response.json();
    } catch (error) {
      console.error(`[API] Failed to parse JSON response from ${url}:`, error);
      throw new Error(`Failed to parse API response as JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`[API] Network error when requesting ${url}:`, error);
      throw new Error(`Network error: Could not connect to server. Please check your connection.`);
    }
    throw error;
  }
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
import { QueryClient } from "@tanstack/react-query";

/**
 * PKL-278651-ADMIN-0012-PERF
 * Optimized QueryClient configuration
 * 
 * This configuration enhances the caching behavior of TanStack Query
 * with performance improvements for the admin dashboard.
 */

// Create a client with optimized caching settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Performance optimizations
      staleTime: 60 * 1000, // Consider data fresh for 1 minute
      gcTime: 10 * 60 * 1000, // Cache for 10 minutes (gcTime replaces cacheTime in v5)
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

/**
 * PKL-278651-ADMIN-0012-PERF
 * Enhanced API request function with optimized caching
 */

// Helper function to make API requests
type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Dictionary of cache-friendly endpoints that can use browser caching
const CACHEABLE_ENDPOINTS = [
  '/api/admin/dashboard',
  '/api/user/profile',
  '/api/match/history',
  '/api/tournament/list',
  '/api/event/upcoming'
];

// Store CSRF token
let csrfToken: string | null = null;

/**
 * PKL-278651-ADMIN-0013-SEC
 * CSRF token management for security
 */
export async function fetchCSRFToken(): Promise<string | null> {
  if (csrfToken) {
    return csrfToken;
  }
  
  try {
    const response = await fetch('/api/security/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    const data = await response.json();
    csrfToken = data.csrfToken || null;
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}

/**
 * Enhanced API request function with improved error handling and retries
 * 
 * PKL-278651-API-0002-ADAPT - Framework5.2 compliance update
 * This function supports two calling methods for backward compatibility:
 * 1. apiRequest(method, url, data, cacheOptions, retryCount)
 * 2. apiRequest(url, options) - For React Query and other legacy code
 */
export async function apiRequest(
  methodOrUrl: RequestMethod | string,
  urlOrOptions?: string | RequestInit,
  data?: any,
  cacheOptions?: {
    forceFresh?: boolean;
    cacheDuration?: number; // in seconds
  },
  retryCount = 0
): Promise<Response> {
  // Handle both calling conventions
  let method: RequestMethod;
  let url: string;
  let options: RequestInit | undefined;
  
  // Determine which calling convention is being used
  if (typeof methodOrUrl === 'string' && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(methodOrUrl)) {
    // First param is URL (legacy React Query style)
    url = methodOrUrl;
    options = urlOrOptions as RequestInit;
    method = options?.method as RequestMethod || 'GET';
    data = options?.body ? 
      (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : 
      undefined;
    retryCount = 0; // Reset retry count for this calling pattern
  } else {
    // First param is method (new style)
    method = methodOrUrl as RequestMethod;
    url = urlOrOptions as string;
    options = undefined;
  }
  try {
    // Determine if we should use caching based on the URL and method
    const isCacheable = 
      method === "GET" && 
      CACHEABLE_ENDPOINTS.some(endpoint => url.startsWith(endpoint)) &&
      !(cacheOptions?.forceFresh);
      
    // Create or update options
    options = options || {};
    options.method = method;
    options.headers = options.headers || {
      "Content-Type": "application/json",
    };
    options.credentials = "include"; // Critical for cookie-based auth
    
    // Apply different cache settings based on the request type
    if (isCacheable) {
      // For GET requests to cacheable endpoints, allow browser caching
      const maxAge = cacheOptions?.cacheDuration || 60; // 60 seconds default
      options.headers = {
        ...options.headers,
        "Cache-Control": `max-age=${maxAge}`,
      };
      options.cache = "default";
      
      console.log(`[PERF] Using cacheable request for ${url} with max-age=${maxAge}`);
    } else {
      // For all other requests, use no-cache approach
      options.headers = {
        ...options.headers,
        "Cache-Control": "no-cache, no-store",
        "Pragma": "no-cache",
      };
      options.cache = "no-store";
    }
    
    // For non-GET requests, add CSRF token
    if (method !== "GET") {
      try {
        // Always get a fresh CSRF token for mutation requests
        csrfToken = null; // Reset to force fetch
        const token = await fetchCSRFToken();
        if (token) {
          // Cast to string to satisfy TypeScript
          const csrfHeaderValue: string = token;
          options.headers = {
            ...options.headers,
            "X-CSRF-Token": csrfHeaderValue,
          };
          console.log(`[SEC] Adding CSRF token to ${method} request`);
        }
      } catch (error) {
        console.error("Failed to add CSRF token to request:", error);
      }
    }
  
    // Prepare body data with token
    if (data || method !== "GET") {
      const dataWithToken = data ? { ...data } : {};
      
      // Always include CSRF token if this is a non-GET request
      if (method !== "GET" && csrfToken) {
        dataWithToken._csrf = csrfToken;
      }
      
      options.body = JSON.stringify(dataWithToken);
    }
  
    console.log(`Making ${method} request to ${url} with credentials included`);
    
    // Make the actual fetch request
    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (fetchError) {
      // Handle network errors
      console.error(`[API] Network error when requesting ${url}:`, fetchError);
      
      // If we have retries left, try again with exponential backoff
      if (retryCount < 2) {
        console.warn(`[API] Retrying ${method} request to ${url} (${retryCount + 1}/2)...`);
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        // Use the same calling convention for retry
        if (typeof methodOrUrl === 'string' && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(methodOrUrl)) {
          return apiRequest(methodOrUrl, urlOrOptions);
        } else {
          return apiRequest(method, url, data, cacheOptions, retryCount + 1);
        }
      }
      
      // If we're out of retries, throw a user-friendly error
      throw new Error('Network error: Could not connect to server. Please check your connection.');
    }
    
    // Handle server errors (502, 503, 504) with retries
    if (response.status >= 502 && response.status <= 504) {
      if (retryCount < 2) {
        console.warn(`[API] Server error (${response.status}) for ${url}, retrying... (${retryCount + 1}/2)`);
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        // Use the same calling convention for retry
        if (typeof methodOrUrl === 'string' && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(methodOrUrl)) {
          return apiRequest(methodOrUrl, urlOrOptions);
        } else {
          return apiRequest(method, url, data, cacheOptions, retryCount + 1);
        }
      }
    }
    
    // Log the cookies that were sent with the request (will show in browser console for debugging)
    console.log(`${method} ${url} response status:`, response.status);
    console.log("Response cookies present:", document.cookie ? "Yes" : "No");
    
    return response;
  } catch (error) {
    // Log the error for debugging 
    console.error(`[API] Error in apiRequest for ${method} ${url}:`, error);
    // Rethrow the error to be handled by the caller
    throw error;
  }
}

/**
 * PKL-278651-ADMIN-0012-PERF
 * Enhanced query function with caching support
 */

// Default fetcher function for useQuery
type GetQueryFnOptions = {
  on401?: "throwError" | "returnNull";
  handleHTMLResponse?: boolean;
  cacheDuration?: number; // in seconds
  forceFresh?: boolean; // force a fresh fetch bypassing cache
};

export function getQueryFn(options: GetQueryFnOptions = {}) {
  const { 
    on401 = "throwError", 
    handleHTMLResponse = true,
    cacheDuration,
    forceFresh = false
  } = options;
  
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [url] = queryKey;
    let retryCount = 0;
    const maxRetries = 2;
    
    // Enhanced retry logic with exponential backoff
    const executeWithRetry = async (): Promise<any> => {
      try {
        // Use cache-aware apiRequest with built-in retry for network/server errors
        const response = await apiRequest("GET", url, undefined, { 
          cacheDuration, 
          forceFresh 
        });
        
        // Handle specific status codes with custom behavior
        if (response.status === 401) {
          if (on401 === "returnNull") {
            console.log(`[API] Unauthorized access to ${url}, returning null as configured`);
            return null;
          }
          throw new Error("Unauthorized: You need to log in to access this resource");
        }
        
        if (response.status === 403) {
          throw new Error("Forbidden: You don't have permission to access this resource");
        }
        
        if (response.status === 404) {
          console.warn(`[API] Resource not found: ${url}`);
          return null; // Return null for not found resources instead of throwing
        }
        
        if (response.status === 429) {
          if (retryCount < maxRetries) {
            console.warn(`[API] Rate limited (429), retrying in ${Math.pow(2, retryCount + 1)}s...`);
            retryCount++;
            // Exponential backoff with jitter for rate limiting
            const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
            await new Promise(resolve => setTimeout(resolve, delay));
            return executeWithRetry(); // Recursive retry
          }
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        
        // Handle other non-2xx responses
        if (!response.ok) {
          // Try to extract error message from response
          let errorMessage: string;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP error ${response.status}`;
          } catch {
            errorMessage = `API Error: ${response.status}`;
          }
          throw new Error(errorMessage);
        }
        
        // Get the text first so we can inspect it
        const text = await response.text();
        
        // Check if it's HTML instead of expected JSON
        if (handleHTMLResponse && 
            (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html'))) {
          console.warn(`[API] Received HTML response for ${url} instead of expected JSON`);
          
          // For API endpoints, return empty array or object rather than throwing
          // This prevents UI crashes while still showing empty state
          if (url.startsWith('/api/')) {
            // Check if endpoint typically returns an array
            if (
              url.includes('/list') || 
              url.includes('/all') || 
              url.includes('history') || 
              url.endsWith('s') // Plurals often indicate arrays
            ) {
              return [];
            }
            return {};
          }
          
          return null;
        }
        
        // Try to parse the text as JSON
        try {
          const result = JSON.parse(text);
          return result;
        } catch (err) {
          console.error(`[API] Failed to parse JSON from ${url}:`, err);
          
          // If we still have retries left and this might be a temporary issue, retry
          if (retryCount < maxRetries) {
            console.warn(`[API] Invalid JSON, retrying (${retryCount + 1}/${maxRetries})...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
            return executeWithRetry();
          }
          
          throw new Error(`Invalid JSON response from ${url}`);
        }
      } catch (error) {
        // Check if this is a network/connection error that hasn't been handled by apiRequest retries
        if (
          error instanceof Error && 
          (error.message.includes('NetworkError') || 
           error.message.includes('network') || 
           error.message.includes('connection'))
        ) {
          if (retryCount < maxRetries) {
            console.warn(`[API] Network issue, retrying ${url} (${retryCount + 1}/${maxRetries})...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            return executeWithRetry();
          }
        }
        
        console.error(`[API] Error fetching ${url}:`, error);
        throw error;
      }
    };
    
    // Start the retry logic
    return executeWithRetry();
  };
}
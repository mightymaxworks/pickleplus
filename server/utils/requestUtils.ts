/**
 * PKL-278651-OAUTH-0004: Request Utilities
 * 
 * Utility functions for handling HTTP requests.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

/**
 * Converts URLSearchParams to a JavaScript object
 * @param urlSearchParams URLSearchParams instance or string
 * @returns Plain JavaScript object with key-value pairs
 */
export function urlSearchParamsToObject(urlSearchParams: URLSearchParams | string): Record<string, string> {
  const params = typeof urlSearchParams === 'string' 
    ? new URLSearchParams(urlSearchParams) 
    : urlSearchParams;
    
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Gets a clean base URL (protocol + host) from request
 * @param req Express request object
 * @returns Base URL string (e.g. "https://pickle.plus")
 */
export function getBaseUrl(req: any): string {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  
  return `${protocol}://${host}`;
}

/**
 * Checks if a URL is allowed based on a list of allowed origins
 * @param url URL to check
 * @param allowedOrigins List of allowed origins (can use wildcards)
 * @returns Boolean indicating if the URL is allowed
 */
export function isUrlAllowed(url: string, allowedOrigins: string[]): boolean {
  try {
    const urlObj = new URL(url);
    
    return allowedOrigins.some(origin => {
      // Handle wildcard subdomains
      if (origin.startsWith('*.')) {
        const domain = origin.substring(2);
        return urlObj.hostname.endsWith(domain) && urlObj.hostname !== domain;
      }
      
      // Handle exact matches
      return urlObj.origin === origin || urlObj.hostname === origin;
    });
  } catch (error) {
    return false;
  }
}
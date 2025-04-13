/**
 * PKL-278651-PERF-0001.4-API
 * Batched Queries Hook
 * 
 * This hook provides an easy way to access the batched API request functionality
 * within React components.
 */

import { useQueryClient } from '@tanstack/react-query';
import { batchedApiRequest } from '@/utils/apiRequestBatcher';

/**
 * Hook to access batched API requests
 * @returns An object with utility functions for making batched API requests
 */
export function useBatchedQueries() {
  const queryClient = useQueryClient();
  
  /**
   * Make a GET request using the batched API
   */
  const get = async <T>(url: string, params?: Record<string, any>): Promise<T> => {
    // Append query parameters to URL if provided
    const fullUrl = params 
      ? `${url}${url.includes('?') ? '&' : '?'}${new URLSearchParams(params as any).toString()}`
      : url;
    
    return batchedApiRequest<T>(fullUrl);
  };
  
  /**
   * Make a POST request using the batched API
   */
  const post = async <T>(url: string, data?: any): Promise<T> => {
    return batchedApiRequest<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };
  
  /**
   * Make a PUT request using the batched API
   */
  const put = async <T>(url: string, data?: any): Promise<T> => {
    return batchedApiRequest<T>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };
  
  /**
   * Make a PATCH request using the batched API
   */
  const patch = async <T>(url: string, data?: any): Promise<T> => {
    return batchedApiRequest<T>(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };
  
  /**
   * Make a DELETE request using the batched API
   */
  const del = async <T>(url: string): Promise<T> => {
    return batchedApiRequest<T>(url, {
      method: 'DELETE',
    });
  };
  
  /**
   * Invalidate queries after a mutation
   */
  const invalidateQueries = (queryKeys: string | string[]) => {
    const keys = Array.isArray(queryKeys) ? queryKeys : [queryKeys];
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };
  
  /**
   * Prefetch data and store it in the query cache
   */
  const prefetchQuery = async (queryKey: string, fetcher?: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: [queryKey],
      queryFn: fetcher ? fetcher : () => get(queryKey)
    });
  };
  
  return {
    get,
    post,
    put,
    patch,
    delete: del, // 'delete' is a reserved keyword
    invalidateQueries,
    prefetchQuery,
    queryClient,
  };
}

export default useBatchedQueries;
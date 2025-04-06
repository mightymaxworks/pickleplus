import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Helper function to make API requests
type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest(
  method: RequestMethod,
  url: string,
  data?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      // Make sure cache control headers are consistent with server
      "Cache-Control": "no-cache, no-store",
      "Pragma": "no-cache",
    },
    credentials: "include", // Critical for cookie-based auth
    cache: "no-store", // Prevent caching of authenticated requests
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  console.log(`Making ${method} request to ${url} with credentials included`);
  const response = await fetch(url, options);
  
  // Log the cookies that were sent with the request (will show in browser console for debugging)
  console.log(`${method} ${url} response status:`, response.status);
  console.log("Response cookies present:", document.cookie ? "Yes" : "No");
  
  return response;
}

// Default fetcher function for useQuery
type GetQueryFnOptions = {
  on401?: "throwError" | "returnNull";
};

export function getQueryFn(options: GetQueryFnOptions = {}) {
  const { on401 = "throwError" } = options;
  
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [url] = queryKey;
    const response = await apiRequest("GET", url);
    
    if (response.status === 401) {
      if (on401 === "returnNull") {
        return null;
      }
      throw new Error("Unauthorized");
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  };
}
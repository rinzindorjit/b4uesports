import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure the URL is correctly formatted
  // Fallback to empty string if VITE_API_URL is not available
  const isVercel = typeof window !== 'undefined' && (window as any).__env__?.VERCEL === '1';
  const apiUrl = typeof window !== 'undefined' ? (window as any).__env__?.VITE_API_URL || '' : '';
  
  // For relative URLs, when deployed to the same domain as the API
  let fullUrl = url;
  
  // On Vercel, use relative URLs as the frontend and backend are on the same domain
  if (!isVercel && apiUrl) {
    // When using a separate API URL (local development), use the full path
    fullUrl = url.startsWith('/api') ? `${apiUrl}${url}` : `${apiUrl}/api/${url}`;
  } else {
    // When deployed to the same domain (Vercel) or no API URL is set, keep the URL as is
    // For relative URLs starting with /api, they'll work correctly on Vercel
    fullUrl = url;
  }
  
  console.log(`API Request: ${method} ${url} -> ${fullUrl}`);
  
  // Get token from localStorage
  const token = localStorage.getItem('pi_token');
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    // Fallback to empty string if VITE_API_URL is not available
    const isVercel = typeof window !== 'undefined' && (window as any).__env__?.VERCEL === '1';
    const apiUrl = typeof window !== 'undefined' ? (window as any).__env__?.VITE_API_URL || '' : '';
    
    // For relative URLs, when deployed to the same domain as the API
    let fullUrl = url;
    
    // On Vercel, use relative URLs as the frontend and backend are on the same domain
    if (!isVercel && apiUrl) {
      // When using a separate API URL (local development), use the full path
      fullUrl = url.startsWith('/api') ? `${apiUrl}${url}` : `${apiUrl}/api/${url}`;
    } else {
      // When deployed to the same domain (Vercel) or no API URL is set, keep the URL as is
      // For relative URLs starting with /api, they'll work correctly on Vercel
      fullUrl = url;
    }
    
    // Get token from localStorage
    const token = localStorage.getItem('pi_token');
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
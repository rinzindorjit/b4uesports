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
  const apiUrl = import.meta.env.VITE_API_URL || '';
  // For relative URLs, when deployed to the same domain as the API, Vercel strips the /api prefix
  // So we need to remove it from the URL when apiUrl is not set
  let fullUrl = url;
  if (apiUrl) {
    // When using a separate API URL, use the full path
    fullUrl = url.startsWith('/api') ? `${apiUrl}${url}` : `${apiUrl}/api/${url}`;
  } else {
    // When deployed to the same domain, Vercel strips /api prefix, so we should too
    fullUrl = url.startsWith('/api/') ? url.substring(4) : url;
  }
  
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
    const apiUrl = import.meta.env.VITE_API_URL || '';
    // For relative URLs, when deployed to the same domain as the API, Vercel strips the /api prefix
    // So we need to remove it from the URL when apiUrl is not set
    let fullUrl = url;
    if (apiUrl) {
      // When using a separate API URL, use the full path
      fullUrl = url.startsWith('/api') ? `${apiUrl}${url}` : `${apiUrl}/api/${url}`;
    } else {
      // When deployed to the same domain, Vercel strips /api prefix, so we should too
      fullUrl = url.startsWith('/api/') ? url.substring(4) : url;
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
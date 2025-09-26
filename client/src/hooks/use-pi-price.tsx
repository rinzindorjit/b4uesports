import { useQuery } from '@tanstack/react-query';
import type { PiPrice } from '@/types/pi-network';

export function usePiPrice() {
  return useQuery<PiPrice>({
    queryKey: ['/api/pi-price'],
    refetchInterval: 60000, // Update every 60 seconds
    staleTime: 50000, // Consider data stale after 50 seconds
    retry: 3, // Retry up to 3 times on failure
    retryDelay: 1000, // Wait 1 second between retries
    // Ensure we properly parse the date string from the API
    select: (data) => ({
      ...data,
      lastUpdated: new Date(data.lastUpdated) // Convert string to Date object
    }),
  });
}
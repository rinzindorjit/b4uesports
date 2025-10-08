import { useQuery } from '@tanstack/react-query';
import type { PiPrice } from '@/types/pi-network';

export function usePiPrice() {
  return useQuery<PiPrice>({
    queryKey: ['pi-price'],
    queryFn: async () => {
      const response = await fetch('/api/pi-price');
      if (!response.ok) {
        throw new Error(`Failed to fetch Pi price: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    refetchInterval: 60000, // Update every 60 seconds
    staleTime: 50000, // Consider data stale after 50 seconds
    retry: 3, // Retry up to 3 times on failure
  });
}
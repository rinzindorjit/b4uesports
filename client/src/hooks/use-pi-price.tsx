import { useQuery } from '@tanstack/react-query';
import type { PiPrice } from '@/types/pi-network';

export function usePiPrice() {
  return useQuery<PiPrice>({
    queryKey: ['pi-price'],
    queryFn: async () => {
      try {
        console.log('Fetching Pi price from /api/pi-price');
        const response = await fetch('/api/pi-price');
        console.log('Pi price response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Pi price fetch failed:', response.status, response.statusText, errorText);
          throw new Error(`Failed to fetch Pi price: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Pi price data received:', data);
        return data;
      } catch (error) {
        console.error('Error fetching Pi price:', error);
        throw error;
      }
    },
    refetchInterval: 60000, // Update every 60 seconds
    staleTime: 50000, // Consider data stale after 50 seconds
    retry: 3, // Retry up to 3 times on failure
    retryDelay: 1000, // Wait 1 second between retries
  });
}
import { useQuery } from '@tanstack/react-query';
import type { PiBalance } from '@/types/pi-network';

export function usePiBalance() {
  return useQuery<PiBalance>({
    queryKey: ['api/pi-balance'], // Remove the leading slash
    queryFn: async () => {
      const res = await fetch('/api/pi-balance');
      if (!res.ok) {
        throw new Error(`Failed to fetch balance: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });
}
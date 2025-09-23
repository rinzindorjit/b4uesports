import { useQuery } from '@tanstack/react-query';
import type { PiBalance } from '@/types/pi-network';

export function usePiBalance() {
  return useQuery<PiBalance>({
    queryKey: ['/api/pi-balance'],
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });
}
import { BRAND_LOGOS } from '@/lib/constants';
import { usePiNetwork } from '@/hooks/use-pi-network';

interface NavigationProps {
  isTestnet?: boolean;
}

export default function Navigation({ isTestnet = true }: NavigationProps) {
  return (
    <nav className="relative z-10 border-b border-border bg-card/80 backdrop-blur-lg" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center" data-testid="nav-brand">
            <img 
              src={BRAND_LOGOS.B4U} 
              alt="B4U Esports Logo" 
              className="h-10 w-auto"
              data-testid="brand-logo"
            />
          </div>
          
          {isTestnet && (
            <div className="testnet-badge bg-amber-500 text-amber-900 px-2 py-1 rounded-full text-xs font-semibold" data-testid="testnet-badge">
              🚧 TESTNET
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

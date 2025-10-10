import { BRAND_LOGOS } from '@/lib/constants';
import { usePiNetwork } from '@/hooks/use-pi-network';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface NavigationProps {
  isTestnet?: boolean;
}

export default function Navigation({ isTestnet = true }: NavigationProps) {
  const { isAuthenticated, logout } = usePiNetwork();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

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
          
          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="text-xs sm:text-sm"
              data-testid="logout-button"
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
              Logout
            </Button>
          )}
          
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
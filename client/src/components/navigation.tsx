import { BRAND_LOGOS } from '@/lib/constants';
import { usePiNetwork } from '@/hooks/use-pi-network';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  isTestnet?: boolean;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export default function Navigation({ isTestnet = true, onProfileClick, onLogout }: NavigationProps) {
  const { user } = usePiNetwork();

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
          
          {user && (
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onProfileClick}
                className="text-foreground hover:text-primary"
              >
                <i className="fas fa-user mr-2"></i>
                {user.username}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="text-foreground hover:text-primary"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
          )}
          
          {isTestnet && (
            <div className="testnet-badge bg-amber-500 text-amber-900 px-2 py-1 rounded-full text-xs font-semibold" data-testid="testnet-badge">
              🚧 TESTNET
            </div>
          )}

          {/* Removed social media icons from header */}
        </div>
      </div>
    </nav>
  );
}
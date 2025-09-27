import { usePiNetwork } from '@/hooks/use-pi-network';
import { usePiPrice } from '@/hooks/use-pi-price';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import ParticleBackground from '@/components/particle-background';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { BRAND_LOGOS, GAME_LOGOS, DEFAULT_PACKAGES } from '@/lib/constants';
import { shouldUseMockAuth } from '@/lib/auth-mode';
import type { Package } from '@/types/pi-network';
import { useMemo, useEffect } from 'react';

export default function Landing() {
  const { authenticate, isAuthenticated, isLoading: piLoading } = usePiNetwork();
  const { data: piPrice, error, isLoading } = usePiPrice();
  const [, setLocation] = useLocation();

  // Log piPrice data for debugging
  console.log('Landing PiPrice data:', piPrice);
  console.log('Landing PiPrice error:', error);
  console.log('Landing PiPrice loading:', isLoading);
  console.log('Landing auth loading:', piLoading);
  console.log('Landing isAuthenticated:', isAuthenticated);
  
  // Log price source for debugging
  if (piPrice?.source) {
    console.log('Landing Pi price source:', piPrice.source);
  }

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    console.log('Landing useEffect running:', { isAuthenticated });
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const handlePiLogin = async () => {
    try {
      console.log('=== STARTING PI NETWORK AUTHENTICATION ===');
      console.log('Current loading state:', piLoading);
      console.log('Window location:', window.location);
      console.log('User agent:', window.navigator.userAgent);
      console.log('Should use mock auth:', shouldUseMockAuth());
      console.log('Pi SDK available:', typeof window !== 'undefined' && window.Pi);
      
      // This will now use mock authentication in Pi Browser/preview/sandbox mode
      await authenticate();
      
      console.log('Pi Network authentication completed');
      console.log('New loading state:', piLoading);
    } catch (error) {
      console.error('Login failed:', error);
      // Ensure we reset loading state on error
      // The authenticate function should handle this, but we'll add a fallback
      setTimeout(() => {
        console.log('Checking if still loading after error...');
        if (piLoading) {
          console.log('Still loading, attempting to reset state');
          // Force update the context if still loading
          window.location.reload();
        }
      }, 2000);
      
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('=== PI NETWORK AUTHENTICATION FINISHED ===');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="landing-page">
      <ParticleBackground />
      <Navigation isTestnet={process.env.NODE_ENV !== 'production'} />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" data-testid="hero-section">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="hero-title">
              Gaming Currency
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-foreground" data-testid="hero-subtitle">
              Powered by Pi Network
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto" data-testid="hero-description">
              Purchase PUBG UC and Mobile Legends Diamonds using Pi coins. Fast, secure, and integrated with Pi Network's revolutionary payment system.
            </p>

            {/* Pi Network Login Button - Reduced size */}
            <div className="mb-8">
              <Button
                onClick={handlePiLogin}
                disabled={piLoading}
                className="inline-block p-0 h-auto bg-transparent hover:bg-transparent transform hover:scale-105 transition-transform duration-300"
                data-testid="pi-login-button"
              >
                <div className="px-4 py-2 flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg hover:shadow-xl">
                  <img 
                    src={BRAND_LOGOS.PI} 
                    alt="Pi Network Logo" 
                    className="w-6 h-6 rounded-full border border-white"
                    data-testid="pi-logo-button"
                  />
                  <span className="text-base font-bold text-white">
                    {piLoading ? 'Connecting...' : 'Sign In with Pi Network'}
                  </span>
                </div>
              </Button>
              
              {/* Testnet Disclaimer */}
              <p className="text-sm text-amber-400 mt-4 max-w-2xl mx-auto" data-testid="testnet-disclaimer">
                <i className="fas fa-info-circle mr-2"></i>
                Note: Transactions are currently processed on the Pi Testnet. No real Pi coins will be deducted from your mainnet wallet during purchases.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
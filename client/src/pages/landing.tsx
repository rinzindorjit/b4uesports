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
import { useMemo } from 'react';

export default function Landing() {
  const { authenticate, isAuthenticated, isLoading: piLoading } = usePiNetwork();
  const { data: piPrice } = usePiPrice();
  const [, setLocation] = useLocation();

  // Create mock packages for preview
  const mockPackages = useMemo(() => {
    if (!piPrice) return [];
    
    // PUBG Packages
    const pubgPackages: Package[] = DEFAULT_PACKAGES.PUBG.map((pkg, index) => ({
      id: `pubg-${index}`,
      game: 'PUBG',
      name: `${pkg.amount} UC`,
      inGameAmount: pkg.amount,
      usdtValue: pkg.usdtValue.toString(),
      image: GAME_LOGOS.PUBG,
      isActive: true,
      piPrice: pkg.usdtValue / piPrice.price,
      currentPiPrice: piPrice.price
    }));
    
    // MLBB Packages
    const mlbbPackages: Package[] = DEFAULT_PACKAGES.MLBB.map((pkg, index) => ({
      id: `mlbb-${index}`,
      game: 'MLBB',
      name: `${pkg.amount} Diamonds`,
      inGameAmount: pkg.amount,
      usdtValue: pkg.usdtValue.toString(),
      image: GAME_LOGOS.MLBB,
      isActive: true,
      piPrice: pkg.usdtValue / piPrice.price,
      currentPiPrice: piPrice.price
    }));
    
    return [...pubgPackages, ...mlbbPackages];
  }, [piPrice]);

  // Use mock data for preview instead of API
  const { data: packages, isLoading: packagesLoading } = {
    data: mockPackages,
    isLoading: !piPrice
  } as { data: Package[]; isLoading: boolean };

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    setLocation('/dashboard');
    return null;
  }

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

  const featuredPubgPackages = packages?.filter(pkg => pkg.game === 'PUBG').slice(0, 2) || [];
  const featuredMlbbPackages = packages?.filter(pkg => pkg.game === 'MLBB').slice(0, 2) || [];

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

          {/* Why Choose Us Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20" data-testid="features-section">
            <div className="game-card p-8 rounded-xl text-center" data-testid="feature-pricing">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Pricing</h3>
              <p className="text-muted-foreground">Real-time Pi/USD conversion rates updated every 60 seconds for accurate pricing.</p>
            </div>
            
            <div className="game-card p-8 rounded-xl text-center" data-testid="feature-security">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
              <p className="text-muted-foreground">Protected by Pi Network's advanced cryptographic payment system.</p>
            </div>
            
            <div className="game-card p-8 rounded-xl text-center" data-testid="feature-support">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headset text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
              <p className="text-muted-foreground">Round-the-clock customer support for all your gaming needs.</p>
            </div>
          </div>

          {/* Available Games Section */}
          <div className="text-center mb-12" data-testid="available-games">
            <h3 className="text-3xl font-bold mb-8">Available Games</h3>
            
            {/* Live Pi Price Display */}
            {piPrice && (
              <div className="mb-8">
                <div className="pi-price-ticker px-6 py-3 rounded-lg inline-block" data-testid="pi-price-ticker">
                  <div className="text-center">
                    <p className="text-sm text-white/80">Live Pi Price</p>
                    <p className="text-2xl font-bold text-white">1 π = ${piPrice.price.toFixed(4)} USD</p>
                    <p className="text-xs text-white/60">Updated 60s ago</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* PUBG Description */}
              <div className="game-card p-8 rounded-xl" data-testid="pubg-description">
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src={GAME_LOGOS.PUBG} 
                    alt="PUBG Mobile Logo" 
                    className="w-16 h-16 mr-4"
                    data-testid="pubg-logo"
                  />
                  <h4 className="text-2xl font-bold">PUBG Mobile</h4>
                </div>
                <div className="text-left space-y-4">
                  <p className="text-muted-foreground">
                    Purchase UC (Unknown Cash) for PUBG Mobile directly with Pi coins. 
                    Get the best deals on in-game currency to enhance your battle royale experience.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Instant delivery to your game account</li>
                    <li>Competitive Pi pricing</li>
                    <li>Secure Pi Network transactions</li>
                    <li>24/7 customer support</li>
                  </ul>
                </div>
              </div>

              {/* MLBB Description */}
              <div className="game-card p-8 rounded-xl" data-testid="mlbb-description">
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src={GAME_LOGOS.MLBB} 
                    alt="Mobile Legends Logo" 
                    className="w-16 h-16 mr-4"
                    data-testid="mlbb-logo"
                  />
                  <h4 className="text-2xl font-bold">Mobile Legends</h4>
                </div>
                <div className="text-left space-y-4">
                  <p className="text-muted-foreground">
                    Buy Diamonds for Mobile Legends using Pi coins. 
                    Power up your heroes and dominate the battlefield with our fast and secure payment system.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Direct to game account delivery</li>
                    <li>Real-time Pi conversion rates</li>
                    <li>Protected by Pi Network security</li>
                    <li>Global availability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
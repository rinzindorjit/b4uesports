import { usePiNetwork } from '@/hooks/use-pi-network';
import { usePiPrice } from '@/hooks/use-pi-price';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useState } from 'react';
import ParticleBackground from '@/components/particle-background';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import PiAuthModal from '@/components/pi-auth-modal';
import { Button } from '@/components/ui/button';
import { BRAND_LOGOS, GAME_LOGOS } from '@/lib/constants';
import type { Package } from '@/types/pi-network';

export default function Landing() {
  const { authenticate, isAuthenticated, isLoading: piLoading } = usePiNetwork();
  const { data: piPrice } = usePiPrice();
  const [, setLocation] = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    setLocation('/dashboard');
    return null;
  }

  const handlePiLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthenticate = async () => {
    try {
      await authenticate();
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthModalOpen(false);
    }
  };

  const { data: packages, isLoading: packagesLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="landing-page">
      <ParticleBackground />
      <Navigation isTestnet={true} />
      
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

            {/* Pi Network Login Button */}
            <div className="mb-8">
              <Button
                onClick={handlePiLogin}
                disabled={piLoading}
                className="gradient-border inline-block p-0 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="pi-login-button"
              >
                <div className="px-12 py-4 flex items-center space-x-4">
                  <img 
                    src={BRAND_LOGOS.PI} 
                    alt="Pi Network Logo" 
                    className="w-8 h-8 rounded-full"
                    data-testid="pi-logo-button"
                  />
                  <span className="text-xl font-semibold text-white">
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

          {/* In-Game Tokens Section */}
          <div className="text-center mb-12" data-testid="featured-packages">
            <h3 className="text-3xl font-bold mb-8">In-Game Tokens</h3>
            
            {/* Live Pi Price Display */}
            {piPrice && (
              <div className="mb-8">
                <div className="pi-price-ticker px-6 py-3 rounded-lg inline-block" data-testid="pi-price-ticker">
                  <div className="text-center">
                    <p className="text-sm text-white/80">Live Pi Price</p>
                    <p className="text-2xl font-bold text-white">1 π = ${piPrice.price.toFixed(3)} USD</p>
                    <p className="text-xs text-white/60">Updated 60s ago</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* PUBG Tokens */}
              <div className="game-card p-6 rounded-xl" data-testid="featured-pubg">
                <div className="flex flex-col items-center justify-center mb-4">
                  <img 
                    src={GAME_LOGOS.PUBG} 
                    alt="PUBG Mobile" 
                    className="w-20 h-20 object-contain mb-3"
                    data-testid="pubg-logo"
                  />
                  <h4 className="text-xl font-bold mb-2">PUBG Mobile UC</h4>
                  <p className="text-muted-foreground text-sm mb-4 text-center max-w-xs">
                    Purchase UC (Unknown Cash) for PUBG Mobile to unlock crates, outfits, and other in-game items.
                  </p>
                </div>
                
                {/* PUBG Packages */}
                {packagesLoading ? (
                  <div className="text-center py-4">Loading packages...</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {packages
                      ?.filter(pkg => pkg.game === 'PUBG')
                      .map(pkg => (
                        <div 
                          key={pkg.id} 
                          className="flex justify-between items-center p-3 bg-card rounded-lg border border-border"
                        >
                          <div className="flex items-center space-x-3">
                            <img 
                              src={pkg.image} 
                              alt={pkg.name} 
                              className="w-10 h-10 object-contain"
                            />
                            <span className="font-medium">{pkg.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">
                              {pkg.piPrice ? `${pkg.piPrice.toFixed(2)} π` : 'N/A'}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>

              {/* MLBB Tokens */}
              <div className="game-card p-6 rounded-xl" data-testid="featured-mlbb">
                <div className="flex flex-col items-center justify-center mb-4">
                  <img 
                    src={GAME_LOGOS.MLBB} 
                    alt="Mobile Legends" 
                    className="w-20 h-20 object-contain mb-3"
                    data-testid="mlbb-logo"
                  />
                  <h4 className="text-xl font-bold mb-2">Mobile Legends Diamonds</h4>
                  <p className="text-muted-foreground text-sm mb-4 text-center max-w-xs">
                    Buy Diamonds for Mobile Legends to purchase heroes, skins, battle emblems, and other premium items.
                  </p>
                </div>
                
                {/* MLBB Packages */}
                {packagesLoading ? (
                  <div className="text-center py-4">Loading packages...</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {packages
                      ?.filter(pkg => pkg.game === 'MLBB')
                      .map(pkg => (
                        <div 
                          key={pkg.id} 
                          className="flex justify-between items-center p-3 bg-card rounded-lg border border-border"
                        >
                          <div className="flex items-center space-x-3">
                            <img 
                              src={pkg.image} 
                              alt={pkg.name} 
                              className="w-10 h-10 object-contain"
                            />
                            <span className="font-medium">{pkg.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">
                              {pkg.piPrice ? `${pkg.piPrice.toFixed(2)} π` : 'N/A'}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pi Authentication Modal */}
      <PiAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleAuthenticate}
        isLoading={piLoading}
      />

      <Footer />
    </div>
  );
}
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
      // The modal will be closed by the isLoading state change in the hook
    } catch (error) {
      console.error('Login failed:', error);
      // Keep the modal open to show the error
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
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8" data-testid="hero-subtitle">
              Purchase PUBG UC and Mobile Legends Diamonds using Pi coins
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={handlePiLogin}
                disabled={piLoading}
                data-testid="hero-cta"
              >
                {piLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Connecting...
                  </>
                ) : (
                  <>
                    <img src={BRAND_LOGOS.PI} alt="Pi Network" className="w-6 h-6 mr-2 rounded-full" />
                    Connect with Pi Network
                  </>
                )}
              </Button>
            </div>
            
            {piPrice && (
              <div className="mt-8 inline-block bg-primary/10 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/20">
                <span className="text-primary font-bold">Live Pi Price: </span>
                <span className="font-mono">${piPrice.price.toFixed(5)}</span>
              </div>
            )}
          </div>

          {/* Featured Packages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* PUBG Mobile */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-lg" data-testid="pubg-section">
              <div className="flex items-center mb-6">
                <img src={GAME_LOGOS.PUBG} alt="PUBG Mobile" className="w-12 h-12 mr-4" />
                <h2 className="text-2xl font-bold">PUBG Mobile UC</h2>
              </div>
              
              {packagesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
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

            {/* Mobile Legends */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-lg" data-testid="mlbb-section">
              <div className="flex items-center mb-6">
                <img src={GAME_LOGOS.MLBB} alt="Mobile Legends" className="w-12 h-12 mr-4" />
                <h2 className="text-2xl font-bold">Mobile Legends Diamonds</h2>
              </div>
              
              {packagesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
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
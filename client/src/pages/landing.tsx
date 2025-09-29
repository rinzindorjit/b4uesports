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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

          {/* Key Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
            <Card className="text-center bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lock text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Protected by Pi Network's advanced cryptographic security and our robust infrastructure.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clock text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Live Pi/USD conversion rates updated every 60 seconds for accurate pricing.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-headset text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Round-the-clock customer support to assist with any questions or issues.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* In-Game Tokens Description */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  <i className="fas fa-coins text-primary mr-2"></i>
                  In-Game Currency Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p className="text-center text-muted-foreground mb-6">
                  Purchase premium in-game currencies for the world's most popular mobile games using Pi coins.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <img 
                        src={GAME_LOGOS.PUBG} 
                        alt="PUBG Mobile" 
                        className="w-10 h-10 mr-3"
                      />
                      <h4 className="text-lg font-semibold">PUBG Mobile UC</h4>
                    </div>
                    <p className="text-sm">
                      UC (Unknown Cash) is the premium currency in PUBG Mobile that allows you to purchase crates, 
                      outfits, and other premium items. Enhance your battle royale experience with our convenient 
                      Pi Network payment system.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <img 
                        src={GAME_LOGOS.MLBB} 
                        alt="Mobile Legends" 
                        className="w-10 h-10 mr-3"
                      />
                      <h4 className="text-lg font-semibold">Mobile Legends Diamonds</h4>
                    </div>
                    <p className="text-sm">
                      Diamonds are the premium currency in Mobile Legends: Bang Bang that unlock heroes, skins, 
                      and other exclusive content. Get the most out of your MOBA experience with our secure 
                      Pi Network transactions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
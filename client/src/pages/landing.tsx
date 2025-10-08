import { usePiNetwork } from '@/hooks/use-pi-network';
import { usePiPrice } from '@/hooks/use-pi-price';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
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
  const [authError, setAuthError] = useState<string | null>(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const handlePiLogin = () => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const handleAuthenticate = async () => {
    try {
      await authenticate();
      // The modal will be closed by the isLoading state change in the hook
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
      // Keep the modal open to show the error
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="landing-page">
      <ParticleBackground />
      <Navigation isTestnet={true} />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" data-testid="hero-section">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="hero-title">
              Gaming Currency
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8" data-testid="hero-subtitle">
              Purchase PUBG UC and Mobile Legends Diamonds using Pi coins
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
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
                    <img src={BRAND_LOGOS.PI} alt="Pi Network" className="w-5 h-5 sm:w-6 sm:h-6 mr-2 rounded-full" />
                    Connect with Pi Network
                  </>
                )}
              </Button>
            </div>
            
            {/* Important Notice for Pi Browser Users */}
            <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-amber-300">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <strong>Important:</strong> Please use the official Pi Browser app for authentication. 
                On mobile, check for notification banners during authentication. 
                Authentication may take up to 3 minutes on slower networks.
              </p>
            </div>
            
            {authError && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-red-300">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {authError}
                </p>
                {authError.includes('timeout') && (
                  <p className="text-xs mt-2 text-red-200">
                    Authentication may take up to 3 minutes on mobile networks. Please check your Pi Browser for pending requests and approve them.
                  </p>
                )}
              </div>
            )}
            
            {piPrice && (
              <div className="mt-6 sm:mt-8 inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-primary/20">
                <span className="text-primary font-bold text-sm sm:text-base">Live Pi Price: </span>
                <span className="font-mono text-sm sm:text-base">${piPrice.price.toFixed(5)}</span>
              </div>
            )}
          </div>

          {/* Key Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 max-w-5xl mx-auto">
            <Card className="text-center bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="fas fa-lock text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Transactions</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Protected by Pi Network's advanced cryptographic security and our robust infrastructure.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="fas fa-clock text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Pricing</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Live Pi/USD conversion rates updated every 60 seconds for accurate pricing.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="fas fa-headset text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Round-the-clock customer support to assist with any questions or issues.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* In-Game Tokens Description */}
          <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-center">
                  <i className="fas fa-coins text-primary mr-2"></i>
                  In-Game Currency Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p className="text-center text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  Purchase premium in-game currencies for the world's most popular mobile games using Pi coins.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <img 
                        src={GAME_LOGOS.PUBG} 
                        alt="PUBG Mobile" 
                        className="w-8 h-8 sm:w-10 sm:h-10 mr-3"
                      />
                      <h4 className="text-base sm:text-lg font-semibold">PUBG Mobile UC</h4>
                    </div>
                    <p className="text-xs sm:text-sm">
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
                        className="w-8 h-8 sm:w-10 sm:h-10 mr-3"
                      />
                      <h4 className="text-base sm:text-lg font-semibold">Mobile Legends Diamonds</h4>
                    </div>
                    <p className="text-xs sm:text-sm">
                      Diamonds are the premium currency in Mobile Legends: Bang Bang that unlock heroes, skins, 
                      and other exclusive content. Get the most out of your MOBA experience with our secure 
                      Pi Network transactions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
      
      <PiAuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthError(null);
        }}
        onAuthenticate={handleAuthenticate}
        isLoading={piLoading}
      />
    </div>
  );
}
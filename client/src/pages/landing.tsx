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
  const { data: piPrice, error: piPriceError, isLoading: piPriceLoading } = usePiPrice();
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
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="hero-title">
              Gaming Currency
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-8" data-testid="hero-subtitle">
              Purchase PUBG UC and Mobile Legends Diamonds using Pi coins
            </p>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-8 bg-yellow-400/20 border border-yellow-400 rounded-lg p-2 sm:p-4 font-bold text-yellow-300">
              Welcome to B4U Esports Marketplace, your premier destination to seamlessly purchase PUBG UC and Mobile Legends Diamonds using Pi Coins. Experience fast, secure, and transparent transactions tailored for gamers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
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
            <div className="mt-4 p-3 sm:p-4 bg-amber-500/20 border border-amber-500 rounded-lg max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm text-amber-300">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <strong>Important:</strong> Please use the official Pi Browser app for authentication. 
                On mobile, check for notification banners during authentication.
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
                    Authentication may take up to 2 minutes on mobile networks. Please check your Pi Browser for pending requests and approve them.
                  </p>
                )}
              </div>
            )}
            
            {/* Pi Price Display */}
            <div className="mt-4 sm:mt-6">
              {piPriceLoading && (
                <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-3 sm:px-6 py-1.5 sm:py-3 border border-primary/20">
                  <span className="text-primary font-bold text-sm sm:text-base">Loading Pi Price...</span>
                </div>
              )}
              
              {piPriceError && (
                <div className="inline-block bg-red-500/20 backdrop-blur-sm rounded-full px-3 sm:px-6 py-1.5 sm:py-3 border border-red-500/30">
                  <span className="text-red-300 font-bold text-sm sm:text-base">Price Error: {piPriceError.message}</span>
                </div>
              )}
              
              {piPrice && !piPriceLoading && !piPriceError && (
                <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-3 sm:px-6 py-1.5 sm:py-3 border border-primary/20">
                  <span className="text-primary font-bold text-sm sm:text-base">Live Pi Price: </span>
                  <span className="font-mono text-sm sm:text-base">${piPrice.price.toFixed(5)}</span>
                </div>
              )}
              
              {!piPrice && !piPriceLoading && !piPriceError && (
                <div className="inline-block bg-yellow-500/20 backdrop-blur-sm rounded-full px-3 sm:px-6 py-1.5 sm:py-3 border border-yellow-500/30">
                  <span className="text-yellow-300 font-bold text-sm sm:text-base">Price not available</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12 max-w-5xl mx-auto">
            <Card className="text-center bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-3 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <i className="fas fa-lock text-white text-base sm:text-xl"></i>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Secure Transactions</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Protected by Pi Network's advanced cryptographic security and our robust infrastructure.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-3 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <i className="fas fa-clock text-white text-base sm:text-xl"></i>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Real-Time Pricing</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Live Pi/USD conversion rates updated every 60 seconds for accurate pricing.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-3 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <i className="fas fa-headset text-white text-base sm:text-xl"></i>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">24/7 Support</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Round-the-clock customer support to assist with any questions or issues.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* In-Game Tokens Description */}
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-2xl text-center bg-yellow-400/20 border border-yellow-400 rounded-lg p-2 sm:p-4 font-bold text-yellow-300">
                  <i className="fas fa-coins text-primary mr-2"></i>
                  Welcome to B4U Esports Marketplace, your premier destination to seamlessly purchase PUBG UC and Mobile Legends Diamonds using Pi Coins. Experience fast, secure, and transparent transactions tailored for gamers worldwide.
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p className="text-center text-muted-foreground mb-3 sm:mb-6 text-sm sm:text-base">
                  Easily purchase premium in-game currencies for the world's most popular mobile games using Pi coins. 
                  Our secure payment system ensures fast delivery and reliable transactions on the Pi Network Testnet.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <img 
                        src="https://cdn.midasbuy.com/images/pubgm_app-icon_512x512%281%29.e9f7efc0.png" 
                        alt="PUBG Mobile" 
                        className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3"
                      />
                      <h4 className="text-sm sm:text-lg font-semibold">PUBG Mobile UC</h4>
                    </div>
                    <p className="text-xs sm:text-sm">
                      UC (Unknown Cash) is the premium currency in PUBG Mobile that allows you to purchase crates, 
                      outfits, and other premium items. Enhance your battle royale experience with our convenient 
                      Pi Network payment system. Get the competitive edge with our wide selection of UC packages, 
                      from small 60 UC bundles to massive 40,500 UC packages for serious players.
                    </p>
                    <div className="mt-2 sm:mt-3 text-xs sm:text-sm">
                      <strong>Popular Uses:</strong>
                      <ul className="list-disc list-inside ml-2 sm:ml-4 mt-1">
                        <li>Unlock exclusive skins and outfits</li>
                        <li>Purchase battle passes and premium crates</li>
                        <li>Buy limited edition items</li>
                        <li>Access special events and tournaments</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <img 
                        src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTT-Neggt-JpAh4eDx84JswmFwJMOa4pcfhqtcTcxtywIGC4IfB" 
                        alt="Mobile Legends" 
                        className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3"
                      />
                      <h4 className="text-sm sm:text-lg font-semibold">Mobile Legends Diamonds</h4>
                    </div>
                    <p className="text-xs sm:text-sm">
                      Diamonds are the premium currency in Mobile Legends: Bang Bang that unlock heroes, skins, 
                      and other exclusive content. Get the most out of your MLBB experience with our secure 
                      Pi Network transactions. Choose from various diamond packages to suit your gameplay style, 
                      whether you're a casual player or a competitive esports enthusiast.
                    </p>
                    <div className="mt-2 sm:mt-3 text-xs sm:text-sm">
                      <strong>Popular Uses:</strong>
                      <ul className="list-disc list-inside ml-2 sm:ml-4 mt-1">
                        <li>Unlock new heroes and their skills</li>
                        <li>Purchase epic and legendary skins</li>
                        <li>Buy battle emblems and effects</li>
                        <li>Access seasonal events and challenges</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2 flex items-center">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Secure Pi Network Transactions
                  </h4>
                  <p className="text-xs sm:text-sm">
                    All transactions are processed securely through the Pi Network Testnet environment. 
                    Your payments are protected with end-to-end encryption, and all purchases are delivered 
                    instantly to your game account. Enjoy peace of mind with our 24/7 customer support 
                    and secure payment processing.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-3">
                    <div className="flex items-center text-xs sm:text-sm">
                      <i className="fas fa-bolt text-primary mr-2"></i>
                      Instant Delivery
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                      <i className="fas fa-lock text-primary mr-2"></i>
                      Secure Payments
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                      <i className="fas fa-sync-alt text-primary mr-2"></i>
                      24/7 Support
                    </div>
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
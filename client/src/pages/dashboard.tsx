import { usePiNetwork } from '@/hooks/use-pi-network';
import { usePiPrice } from '@/hooks/use-pi-price';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import ParticleBackground from '@/components/particle-background';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ProfileModal from '@/components/profile-modal';
import PurchaseModal from '@/components/purchase-modal';
import PackageCard from '@/components/package-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GAME_LOGOS } from '@/lib/constants';
import type { Package, Transaction } from '@/types/pi-network';

export default function Dashboard() {
  const { user, isAuthenticated, logout, token, isLoading } = usePiNetwork();
  const { data: piPrice, error: piPriceError, isLoading: piPriceLoading } = usePiPrice();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing if not authenticated
  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const { data: packages, isLoading: packagesLoading, error: packagesError } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: async () => {
      const response = await fetch('/api/packages');
      if (!response.ok) {
        throw new Error(`Failed to fetch packages: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Packages fetched:', data); // Debug log
      return data;
    },
    retry: 3, // Retry up to 3 times on failure
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    },
    enabled: !!token,
  });

  // Refetch transactions when payment is completed
  useEffect(() => {
    const handlePaymentCompleted = () => {
      // Refetch transactions and user data after payment completion
      refetchTransactions();
      // The user data will be refreshed in the payment callback
    };

    // Listen for payment completion events
    window.addEventListener('paymentCompleted', handlePaymentCompleted);
    
    return () => {
      window.removeEventListener('paymentCompleted', handlePaymentCompleted);
    };
  }, [refetchTransactions]);

  const pubgPackages = packages?.filter(pkg => pkg.game === 'PUBG') || [];
  const mlbbPackages = packages?.filter(pkg => pkg.game === 'MLBB') || [];
  const recentTransactions = Array.isArray(transactions) ? transactions.slice(0, 5) : [];

  // Filter packages based on selected game - ensure we always have an array
  const filteredPackages = selectedGame 
    ? (Array.isArray(packages) ? packages.filter(pkg => pkg.game === selectedGame) : []) 
    : (Array.isArray(packages) ? packages : []);

  console.log('Packages state:', { packages, packagesLoading, packagesError }); // Debug log
  console.log('Selected game:', selectedGame); // Debug log
  console.log('Filtered packages:', filteredPackages); // Debug log

  const handlePurchaseClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsPurchaseModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const formatWalletAddress = (address: string) => {
    if (!address || typeof address !== 'string') return 'Not set';
    if (address.length <= 8) return address; // Don't slice if address is too short
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const totalSpent = Array.isArray(transactions) 
    ? transactions.reduce((sum, tx) => 
        tx.status === 'completed' ? sum + parseFloat(tx.piAmount) : sum, 0
      ) || 0
    : 0;

  const completedTransactions = Array.isArray(transactions) 
    ? transactions.filter(tx => tx.status === 'completed').length || 0
    : 0;

  // Calculate current balance (this would typically come from the backend)
  const currentBalance = (user?.walletAddress && Array.isArray(transactions)) ? 1000 - totalSpent : 0; // Placeholder calculation

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Navigation 
        isTestnet={import.meta.env.DEV} 
      />
      
      {/* Dashboard Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, <span className="text-primary">{user.username}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Welcome to the Pi Network Testnet environment
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              {/* Pi Price Display */}
              {piPriceLoading && (
                <div className="bg-primary/10 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/20">
                  <span className="text-primary font-bold">Loading Pi Price...</span>
                </div>
              )}
              
              {piPriceError && (
                <div className="bg-red-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-red-500/30">
                  <span className="text-red-300 font-bold">Price Error: {piPriceError.message}</span>
                </div>
              )}
              
              {piPrice && !piPriceLoading && !piPriceError && (
                <div className="bg-primary/10 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/20">
                  <span className="text-primary font-bold">Live Pi Price: </span>
                  <span className="font-mono">${piPrice.price.toFixed(5)}</span>
                </div>
              )}
              
              {!piPrice && !piPriceLoading && !piPriceError && (
                <div className="bg-yellow-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-yellow-500/30">
                  <span className="text-yellow-300 font-bold">Price not available</span>
                </div>
              )}
              
              <div className="flex gap-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-primary">{currentBalance.toFixed(2)} π</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-primary">{totalSpent.toFixed(2)} π</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold text-primary">{completedTransactions}</p>
                </div>
              </div>
            </div>
            
            {/* Profile Actions - Moved to a more accessible location */}
            <div className="mb-8 flex justify-center gap-4">
              <Button 
                onClick={() => setIsProfileModalOpen(true)} 
                variant="outline"
              >
                <i className="fas fa-user-edit mr-2"></i>
                Edit Profile
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
          </div>

          {/* Game Packages */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Game Package Shop</h2>
            
            {/* Game Titles in Same Row - Fixed for mobile */}
            <div className="flex flex-row justify-center items-center gap-2 md:gap-4 mb-8 flex-wrap">
              <button 
                className={`flex items-center p-2 rounded-lg transition-all ${selectedGame === 'PUBG' ? 'bg-primary/20 border-2 border-primary' : 'bg-card border border-border hover:bg-muted'}`}
                onClick={() => setSelectedGame(selectedGame === 'PUBG' ? null : 'PUBG')}
              >
                <img src={GAME_LOGOS.PUBG} alt="PUBG Mobile" className="w-8 h-8 mr-2" />
                <h3 className="text-sm font-bold md:text-base whitespace-nowrap">PUBG UC</h3>
              </button>
              <button 
                className={`flex items-center p-2 rounded-lg transition-all ${selectedGame === 'MLBB' ? 'bg-primary/20 border-2 border-primary' : 'bg-card border border-border hover:bg-muted'}`}
                onClick={() => setSelectedGame(selectedGame === 'MLBB' ? null : 'MLBB')}
              >
                <img src={GAME_LOGOS.MLBB} alt="Mobile Legends" className="w-8 h-8 mr-2" />
                <h3 className="text-sm font-bold md:text-base whitespace-nowrap">MLBB Diamonds</h3>
              </button>
            </div>
            
            {/* Packages Display */}
            <div className="bg-card rounded-2xl p-4 md:p-6 border border-border shadow-lg">
              {packagesLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : packagesError ? (
                <div className="text-center py-8 text-red-500">
                  <p>Error loading packages: {(packagesError as Error).message}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Retry
                  </button>
                </div>
              ) : packages && packages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredPackages.map(pkg => (
                    <PackageCard 
                      key={pkg.id} 
                      package={pkg} 
                      onPurchase={() => handlePurchaseClick(pkg)}
                      data-testid={`package-${pkg.id}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No packages available</p>
                  {/* Debug information */}
                  <div className="mt-4 text-left text-xs">
                    <p>Packages loaded: {packages ? packages.length : 'null'}</p>
                    <p>Filtered packages: {filteredPackages ? filteredPackages.length : 'null'}</p>
                    <p>Selected game: {selectedGame || 'none'}</p>
                    {packagesError && <p className="text-red-500">Error: {(packagesError as Error).message}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-lg mb-12">
            <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
            
            {transactionsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Purchase some packages to see your transaction history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(recentTransactions) && recentTransactions.map(tx => {
                  // Ensure packages is an array before trying to find
                  const pkg = Array.isArray(packages) ? packages.find(p => p.id === tx.packageId) : null;
                  return (
                    <div key={tx.id} className="flex justify-between items-center p-4 bg-muted rounded-lg border border-border">
                      <div>
                        <div className="font-medium">{pkg?.name || 'Unknown Package'}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{parseFloat(tx.piAmount).toFixed(2)} π</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      
      {selectedPackage && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          package={selectedPackage}
        />
      )}

      <Footer />
    </div>
  );
}
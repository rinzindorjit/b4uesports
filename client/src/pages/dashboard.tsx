import { usePiNetwork } from '@/hooks/use-pi-network';
import { usePiPrice } from '@/hooks/use-pi-price';
import { useQuery } from '@tanstack/react-query';
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
  const { data: piPrice } = usePiPrice();
  const [, setLocation] = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

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

  const { data: packages, isLoading: packagesLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!token,
  });

  const pubgPackages = packages?.filter(pkg => pkg.game === 'PUBG') || [];
  const mlbbPackages = packages?.filter(pkg => pkg.game === 'MLBB') || [];
  const recentTransactions = transactions?.slice(0, 5) || [];

  const handlePurchaseClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsPurchaseModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return 'Not set';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const totalSpent = transactions?.reduce((sum, tx) => 
    tx.status === 'completed' ? sum + parseFloat(tx.piAmount) : sum, 0
  ) || 0;

  const completedTransactions = transactions?.filter(tx => tx.status === 'completed').length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Navigation 
        isTestnet={import.meta.env.DEV} 
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />
      
      {/* Dashboard Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, <span className="text-primary">{user.username}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your Pi wallet: <span className="font-mono">{formatWalletAddress(user.walletAddress)}</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              {piPrice && (
                <div className="bg-primary/10 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/20">
                  <span className="text-primary font-bold">Live Pi Price: </span>
                  <span className="font-mono">${piPrice.price.toFixed(5)}</span>
                </div>
              )}
              
              <div className="flex gap-4">
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
            
            {/* Profile Actions */}
            <div className="mb-8">
              <Button 
                onClick={() => setIsProfileModalOpen(true)} 
                variant="outline"
                className="mr-4"
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PUBG Mobile Packages */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <img src={GAME_LOGOS.PUBG} alt="PUBG Mobile" className="w-16 h-16 mr-4 rounded-lg" />
                  <h2 className="text-2xl font-bold">PUBG Mobile UC</h2>
                </div>
                
                {packagesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : pubgPackages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No PUBG Mobile packages available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pubgPackages.map(pkg => (
                      <PackageCard 
                        key={pkg.id} 
                        package={pkg} 
                        onPurchase={() => handlePurchaseClick(pkg)}
                        data-testid={`pubg-package-${pkg.id}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Legends Packages */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <img src={GAME_LOGOS.MLBB} alt="Mobile Legends" className="w-16 h-16 mr-4 rounded-lg" />
                  <h2 className="text-2xl font-bold">Mobile Legends Diamonds</h2>
                </div>
                
                {packagesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : mlbbPackages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No Mobile Legends packages available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mlbbPackages.map(pkg => (
                      <PackageCard 
                        key={pkg.id} 
                        package={pkg} 
                        onPurchase={() => handlePurchaseClick(pkg)}
                        data-testid={`mlbb-package-${pkg.id}`}
                      />
                    ))}
                  </div>
                )}
              </div>
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
                {recentTransactions.map(tx => {
                  const pkg = packages?.find(p => p.id === tx.packageId);
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

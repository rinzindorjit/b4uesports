import { usePiNetwork } from '@/hooks/use-pi-network';
import { usePiPrice } from '@/hooks/use-pi-price';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useState } from 'react';
import ParticleBackground from '@/components/particle-background';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ProfileModal from '@/components/profile-modal';
import PurchaseModal from '@/components/purchase-modal';
import PackageCard from '@/components/package-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Package, Transaction } from '@/types/pi-network';

export default function Dashboard() {
  const { user, isAuthenticated, logout, token } = usePiNetwork();
  const { data: piPrice } = usePiPrice();
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground" data-testid="dashboard-page">
      <ParticleBackground />
      <Navigation isTestnet={true} />
      
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border" data-testid="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.username} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <i className="fas fa-user text-2xl text-muted-foreground"></i>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="user-greeting">
                  Welcome back, {user.username}!
                </h1>
                <p className="text-muted-foreground font-mono" data-testid="user-wallet">
                  Wallet: {formatWalletAddress(user.walletAddress)}
                </p>
              </div>
            </div>
            
            {/* Live Pi Price Ticker */}
            {piPrice && (
              <div className="pi-price-ticker px-6 py-3 rounded-lg" data-testid="pi-price-dashboard">
                <div className="text-center">
                  <p className="text-sm text-white/80">Live Pi Price</p>
                  <p className="text-2xl font-bold text-white">1 π = ${piPrice.price.toFixed(3)} USD</p>
                  <p className="text-xs text-white/60">Updated 60s ago</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-testid="user-stats">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm text-muted-foreground">Total Spent</h3>
                <p className="text-2xl font-bold text-green-400 font-mono" data-testid="stat-total-spent">
                  {totalSpent.toFixed(1)} π
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm text-muted-foreground">Transactions</h3>
                <p className="text-2xl font-bold" data-testid="stat-transaction-count">
                  {completedTransactions}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm text-muted-foreground">Country</h3>
                <p className="text-2xl font-bold text-blue-400" data-testid="stat-country">
                  {user.country}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm text-muted-foreground">Status</h3>
                <p className="text-2xl font-bold text-green-400" data-testid="stat-status">
                  Active
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Package Shop */}
          <div className="lg:col-span-2" data-testid="package-shop">
            <h2 className="text-2xl font-bold mb-6">Package Shop</h2>
            
            <Tabs defaultValue="pubg" className="w-full">
              <TabsList className="grid w-full grid-cols-2" data-testid="game-tabs">
                <TabsTrigger value="pubg" data-testid="tab-pubg">PUBG Mobile</TabsTrigger>
                <TabsTrigger value="mlbb" data-testid="tab-mlbb">Mobile Legends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pubg" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="pubg-packages">
                  {packagesLoading ? (
                    <div className="col-span-2 text-center text-muted-foreground" data-testid="loading-packages">
                      Loading packages...
                    </div>
                  ) : (
                    pubgPackages.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        package={pkg}
                        onPurchase={() => handlePurchaseClick(pkg)}
                        data-testid={`package-card-${pkg.id}`}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="mlbb" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="mlbb-packages">
                  {packagesLoading ? (
                    <div className="col-span-2 text-center text-muted-foreground" data-testid="loading-packages">
                      Loading packages...
                    </div>
                  ) : (
                    mlbbPackages.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        package={pkg}
                        onPurchase={() => handlePurchaseClick(pkg)}
                        data-testid={`package-card-${pkg.id}`}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-8" data-testid="dashboard-sidebar">
            {/* Quick Actions */}
            <Card data-testid="quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  data-testid="button-edit-profile"
                >
                  <i className="fas fa-user mr-2"></i>Edit Profile
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  data-testid="button-view-history"
                >
                  <i className="fas fa-history mr-2"></i>View History
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                  data-testid="button-logout"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>Logout
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card data-testid="recent-transactions">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-muted-foreground" data-testid="loading-transactions">Loading...</div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-muted-foreground" data-testid="no-transactions">No transactions yet</div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction, index) => (
                      <div 
                        key={transaction.id} 
                        className="border-b border-border pb-3 last:border-b-0"
                        data-testid={`transaction-${index}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">
                              {packages?.find(p => p.id === transaction.packageId)?.name || 'Unknown Package'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-green-400 text-sm">
                              -{transaction.piAmount} π
                            </p>
                            <p className="text-xs capitalize text-green-400">
                              {transaction.status === 'completed' ? '✅ Completed' : 
                               transaction.status === 'pending' ? '🔄 Pending' : 
                               transaction.status === 'failed' ? '❌ Failed' : transaction.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
      
      {selectedPackage && (
        <PurchaseModal 
          isOpen={isPurchaseModalOpen} 
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setSelectedPackage(null);
          }}
          package={selectedPackage}
        />
      )}

      <Footer />
    </div>
  );
}
import { usePiNetwork } from '@/hooks/use-pi-network';
import { usePiPrice } from '@/hooks/use-pi-price';
import { usePiBalance } from '@/hooks/use-pi-balance';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Package, Transaction, User } from '@/types/pi-network';
import { DEFAULT_PACKAGES, GAME_LOGOS } from '@/lib/constants';
import { useMemo } from 'react';

export default function Dashboard() {
  const { user, isAuthenticated, logout, token } = usePiNetwork();
  const { data: piPrice, error, isLoading } = usePiPrice();
  const { data: piBalance, refetch: refetchBalance } = usePiBalance();
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Log piPrice data for debugging
  console.log('Dashboard PiPrice data:', piPrice);
  console.log('Dashboard PiPrice error:', error);
  console.log('Dashboard PiPrice loading:', isLoading);

  // Create mock packages for preview with all the specified packages
  const mockPackages = useMemo(() => {
    // Always return packages even if piPrice is not available yet
    // Use a default price of 0.01 if piPrice is not available
    const price = piPrice?.price || 0.01;
    
    // PUBG Packages with all specified values
    const pubgPackages: Package[] = [
      { id: 'pubg-1', game: 'PUBG', name: '60 UC', inGameAmount: 60, usdtValue: '1.5000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 1.5 / price, currentPiPrice: price },
      { id: 'pubg-2', game: 'PUBG', name: '325 UC', inGameAmount: 325, usdtValue: '6.5000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 6.5 / price, currentPiPrice: price },
      { id: 'pubg-3', game: 'PUBG', name: '660 UC', inGameAmount: 660, usdtValue: '12.0000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 12.0 / price, currentPiPrice: price },
      { id: 'pubg-4', game: 'PUBG', name: '1800 UC', inGameAmount: 1800, usdtValue: '25.0000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 25.0 / price, currentPiPrice: price },
      { id: 'pubg-5', game: 'PUBG', name: '3850 UC', inGameAmount: 3850, usdtValue: '49.0000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 49.0 / price, currentPiPrice: price },
      { id: 'pubg-6', game: 'PUBG', name: '8100 UC', inGameAmount: 8100, usdtValue: '96.0000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 96.0 / price, currentPiPrice: price },
      { id: 'pubg-7', game: 'PUBG', name: '16200 UC', inGameAmount: 16200, usdtValue: '186.0000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 186.0 / price, currentPiPrice: price },
      { id: 'pubg-8', game: 'PUBG', name: '24300 UC', inGameAmount: 24300, usdtValue: '278.0000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 278.0 / price, currentPiPrice: price },
      { id: 'pubg-9', game: 'PUBG', name: '32400 UC', inGameAmount: 32400, usdtValue: '369.0000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 369.0 / price, currentPiPrice: price },
      { id: 'pubg-10', game: 'PUBG', name: '40500 UC', inGameAmount: 40500, usdtValue: '459.0000', image: GAME_LOGOS.PUBG, isActive: true, piPrice: 459.0 / price, currentPiPrice: price },
    ];
    
    // MLBB Packages with all specified values
    const mlbbPackages: Package[] = [
      { id: 'mlbb-1', game: 'MLBB', name: '56 Diamonds', inGameAmount: 56, usdtValue: '3.0000', image: GAME_LOGOS.MLBB, isActive: true, piPrice: 3.0 / price, currentPiPrice: price },
      { id: 'mlbb-2', game: 'MLBB', name: '278 Diamonds', inGameAmount: 278, usdtValue: '6.0000', image: GAME_LOGOS.MLBB, isActive: true, piPrice: 6.0 / price, currentPiPrice: price },
      { id: 'mlbb-3', game: 'MLBB', name: '571 Diamonds', inGameAmount: 571, usdtValue: '11.0000', image: GAME_LOGOS.MLBB, isActive: true, piPrice: 11.0 / price, currentPiPrice: price },
      { id: 'mlbb-4', game: 'MLBB', name: '1783 Diamonds', inGameAmount: 1783, usdtValue: '33.0000', image: GAME_LOGOS.MLBB, isActive: true, piPrice: 33.0 / price, currentPiPrice: price },
      { id: 'mlbb-5', game: 'MLBB', name: '3005 Diamonds', inGameAmount: 3005, usdtValue: '52.0000', image: GAME_LOGOS.MLBB, isActive: true, piPrice: 52.0 / price, currentPiPrice: price },
      { id: 'mlbb-6', game: 'MLBB', name: '6012 Diamonds', inGameAmount: 6012, usdtValue: '99.0000', image: GAME_LOGOS.MLBB, isActive: true, piPrice: 99.0 / price, currentPiPrice: price },
      { id: 'mlbb-7', game: 'MLBB', name: '12000 Diamonds', inGameAmount: 12000, usdtValue: '200.0000', image: GAME_LOGOS.MLBB, isActive: true, piPrice: 200.0 / price, currentPiPrice: price },
    ];
    
    return [...pubgPackages, ...mlbbPackages];
  }, [piPrice]);

  // Create mock transactions for preview
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      userId: 'preview-user',
      packageId: 'pubg-0',
      paymentId: 'payment-1',
      piAmount: '150.0',
      usdAmount: '1.5',
      piPriceAtTime: '0.01',
      status: 'completed',
      gameAccount: { ign: 'PreviewPlayer', uid: '123456789' },
      emailSent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: 'preview-user',
      packageId: 'mlbb-1',
      paymentId: 'payment-2',
      piAmount: '600.0',
      usdAmount: '6.0',
      piPriceAtTime: '0.01',
      status: 'completed',
      gameAccount: { userId: '987654321', zoneId: '1234' },
      emailSent: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // For preview, use mock data instead of API
  const isPreviewMode = window.location.hostname.includes('vercel.app') || 
                       (window.location.hostname === 'localhost' && window.location.port === '5173');
  
  // Get current user with proper profile verification status
  const currentUser = useMemo(() => {
    if (isPreviewMode) {
      // In preview mode, check localStorage for updated profile
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('pi_user');
        if (savedUser) {
          try {
            return JSON.parse(savedUser);
          } catch (e) {
            console.error('Error parsing saved user data:', e);
          }
        }
      }
      
      // Default mock user
      return {
        id: 'preview-user',
        username: 'preview_user',
        email: 'preview@example.com',
        phone: '+1234567890',
        country: 'US',
        language: 'en',
        walletAddress: 'GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        gameAccounts: {
          pubg: { ign: 'PreviewPlayer', uid: '123456789' },
          mlbb: { userId: '987654321', zoneId: '1234' }
        },
        isProfileVerified: false
      };
    }
    
    return user;
  }, [user, isPreviewMode]);

  const { data: packages, isLoading: packagesLoading } = isPreviewMode ? 
    { data: mockPackages, isLoading: false } as { data: Package[]; isLoading: boolean } : 
    useQuery<Package[]>({ queryKey: ['/api/packages'] });

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = isPreviewMode ? 
    { data: mockTransactions, isLoading: false, refetch: () => {} } as { data: Transaction[]; isLoading: boolean; refetch: () => void } : 
    useQuery<Transaction[]>({ queryKey: ['/api/transactions'], enabled: !!token });

  // Add effect to refresh data after purchase
  useEffect(() => {
    if (!isPurchaseModalOpen && !isPreviewMode) {
      // Refresh balance and transactions when modal closes
      refetchBalance();
      refetchTransactions();
    }
  }, [isPurchaseModalOpen, isPreviewMode, refetchBalance, refetchTransactions]);

  // Redirect to landing if not authenticated
  if (!isAuthenticated && !isPreviewMode) {
    setLocation('/');
    return null;
  }

  // Fix the package filtering to ensure it works correctly
  const pubgPackages = useMemo(() => {
    // Always return packages even if packages is undefined
    return packages?.filter(pkg => pkg.game === 'PUBG') || mockPackages.filter(pkg => pkg.game === 'PUBG');
  }, [packages, mockPackages]);

  const mlbbPackages = useMemo(() => {
    // Always return packages even if packages is undefined
    return packages?.filter(pkg => pkg.game === 'MLBB') || mockPackages.filter(pkg => pkg.game === 'MLBB');
  }, [packages, mockPackages]);

  const recentTransactions = transactions?.slice(0, 5) || [];

  const handlePurchaseClick = (pkg: Package) => {
    if (isPreviewMode) {
      // In preview mode, show the alert but also open the modal
      alert(`In the full application, this would initiate a Pi Network payment for ${pkg.name} (${pkg.piPrice?.toFixed(1)} π). This is a preview only.`);
    }
    // Always open the modal in both preview and production modes
    setSelectedPackage(pkg);
    setIsPurchaseModalOpen(true);
  };

  const handleLogout = () => {
    // Always call logout regardless of preview mode
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
      <Navigation isTestnet={process.env.NODE_ENV !== 'production'} />
      
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border" data-testid="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl font-bold text-foreground" data-testid="user-greeting">
                Welcome back, <span className="text-primary">{currentUser?.username || 'User'}!</span>
              </h1>
              <p className="text-muted-foreground font-mono" data-testid="user-wallet">
                Wallet: {formatWalletAddress(currentUser?.walletAddress || '')}
              </p>
              {/* Profile Verification Notice */}
              {currentUser && (
                <div className="mt-2">
                  {currentUser.isProfileVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <i className="fas fa-check-circle mr-1"></i>
                      Profile Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      Profile Incomplete - <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="ml-1 underline hover:no-underline"
                      >
                        Complete Now
                      </button>
                    </span>
                  )}
                </div>
              )}
              {/* Pi Balance Display */}
              {piBalance && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <i className="fas fa-wallet mr-1"></i>
                    Balance: {piBalance.balance.toFixed(2)} π
                    {piBalance.isTestnet && <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded">Testnet</span>}
                  </span>
                </div>
              )}
            </div>
            
            {/* Live Pi Price Ticker */}
            {piPrice && (
              <div className="pi-price-ticker px-4 py-2 rounded-lg w-full sm:w-auto sticky top-0 z-10 sm:static sm:z-auto bg-card/90 backdrop-blur sm:bg-transparent" data-testid="pi-price-dashboard">
                <div className="text-center">
                  <p className="text-xs text-white/80">Live Pi Price</p>
                  <p className="text-lg font-bold text-white">1 π = ${piPrice.price.toFixed(4)} USD</p>
                  <p className="text-xs text-white/60">Updated 60s ago</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats - Two columns on mobile */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" data-testid="user-stats">
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
                  {currentUser?.country || 'N/A'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm text-muted-foreground">Status</h3>
                <p className="text-2xl font-bold text-green-400" data-testid="stat-status">
                  {isPreviewMode ? 'Preview Mode' : 'Active'}
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
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold">Package Shop</h2>
            </div>
            
            <Tabs defaultValue="pubg" className="w-full">
              <TabsList className="grid w-full grid-cols-2" data-testid="game-tabs">
                <TabsTrigger value="pubg" className="flex items-center justify-center" data-testid="tab-pubg">
                  <img src={GAME_LOGOS.PUBG} alt="PUBG Mobile" className="w-6 h-6 mr-2" />
                  PUBG Mobile
                </TabsTrigger>
                <TabsTrigger value="mlbb" className="flex items-center justify-center" data-testid="tab-mlbb">
                  <img src={GAME_LOGOS.MLBB} alt="Mobile Legends" className="w-6 h-6 mr-2" />
                  Mobile Legends
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pubg" className="mt-8">
                <div className="grid grid-cols-2 gap-6" data-testid="pubg-packages">
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
                <div className="grid grid-cols-2 gap-6" data-testid="mlbb-packages">
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
                  onClick={() => {
                    // In a real implementation, this would navigate to a transaction history page
                    // For now, we'll just show an alert with transaction count
                    const completedCount = transactions?.filter(tx => tx.status === 'completed').length || 0;
                    alert(`You have ${completedCount} completed transactions. In the full application, this would navigate to a detailed transaction history page.`);
                  }}
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

      {/* Floating Pi Price for Mobile */}
      {piPrice && (
        <div className="fixed bottom-4 right-4 sm:hidden pi-price-ticker px-3 py-2 rounded-full shadow-lg z-50 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="text-center">
            <p className="text-xs text-white font-medium">1 π = ${piPrice.price.toFixed(4)}</p>
          </div>
        </div>
      )}

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
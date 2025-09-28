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
  const { data: piPriceData, isLoading: piPriceLoading, error: piPriceError } = usePiPrice();
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
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
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
                <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="user-greeting">
                  Welcome back, <span className="text-primary">{user.username}</span>!
                </h1>
                <p className="text-muted-foreground font-mono text-sm md:text-base" data-testid="user-wallet">
                  Wallet: {formatWalletAddress(user.walletAddress)}
                </p>
              </div>
            </div>
            
            {/* Live Pi Price Ticker */}
            <div className="pi-price-ticker px-4 py-3 rounded-lg w-full md:w-auto text-center md:text-left" data-testid="pi-price-dashboard">
              <div>
                <p className="text-xs text-white/80 mb-1">Live Pi Price</p>
                {piPriceLoading ? (
                  <p className="text-lg font-bold text-white">Loading...</p>
                ) : piPriceError ? (
                  <div>
                    <p className="text-lg font-bold text-white">Price unavailable</p>
                    <p className="text-xs text-white/60">Retrying in 60s</p>
                  </div>
                ) : piPriceData && piPriceData.price > 0 ? (
                  <div>
                    <p className="text-lg font-bold text-white">1 π = ${piPriceData.price.toFixed(4)} USD</p>
                    <p className="text-xs text-white/60">
                      Updated {Math.floor((Date.now() - new Date(piPriceData.lastUpdated).getTime()) / 1000)}s ago
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-bold text-white">Price unavailable</p>
                    <p className="text-xs text-white/60">Retrying in 60s</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" data-testid="user-stats">
            <Card>
              <CardContent className="p-3 md:p-4">
                <h3 className="text-xs md:text-sm text-muted-foreground">Total Spent</h3>
                <p className="text-lg md:text-2xl font-bold text-green-400 font-mono" data-testid="stat-total-spent">
                  {totalSpent.toFixed(1)} π
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <h3 className="text-xs md:text-sm text-muted-foreground">Transactions</h3>
                <p className="text-lg md:text-2xl font-bold" data-testid="stat-transaction-count">
                  {completedTransactions}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <h3 className="text-xs md:text-sm text-muted-foreground">Country</h3>
                <p className="text-lg md:text-2xl font-bold text-blue-400" data-testid="stat-country">
                  {user.country}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <h3 className="text-xs md:text-sm text-muted-foreground">Status</h3>
                <p className="text-lg md:text-2xl font-bold text-green-400" data-testid="stat-status">
                  Active
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Package Shop */}
          <div className="lg:col-span-2" data-testid="package-shop">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Package Shop</h2>
            
            <Tabs defaultValue="pubg" className="w-full">
              <TabsList className="grid w-full grid-cols-2" data-testid="game-tabs">
                <TabsTrigger value="pubg" data-testid="tab-pubg" className="flex items-center justify-center">
                  <img 
                    src="https://cdn.midasbuy.com/images/pubgm_app-icon_512x512%281%29.e9f7efc0.png" 
                    alt="PUBG Mobile" 
                    className="w-6 h-6 mr-2 object-contain"
                  />
                  PUBG Mobile
                </TabsTrigger>
                <TabsTrigger value="mlbb" data-testid="tab-mlbb" className="flex items-center justify-center">
                  <img 
                    src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTT-Neggt-JpAh4eDx84JswmFwJMOa4pcfhqtcTcxtywIGC4IfB" 
                    alt="Mobile Legends" 
                    className="w-6 h-6 mr-2 object-contain"
                  />
                  Mobile Legends
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pubg" className="mt-6 md:mt-8">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">PUBG Mobile UC Packages</h3>
                  <p className="text-sm text-muted-foreground">Purchase UC (Unknown Cash) to unlock crates, outfits, and other in-game items.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" data-testid="pubg-packages">
                  {packagesLoading ? (
                    <div className="col-span-2 text-center text-muted-foreground" data-testid="loading-packages">
                      Loading packages...
                    </div>
                  ) : pubgPackages.length === 0 ? (
                    // Display default PUBG packages when none are loaded
                    <>
                      {[
                        { id: 'pubg-60', name: '60 UC', usdtValue: '1.5000', inGameAmount: 60 },
                        { id: 'pubg-325', name: '325 UC', usdtValue: '6.5000', inGameAmount: 325 },
                        { id: 'pubg-660', name: '660 UC', usdtValue: '12.0000', inGameAmount: 660 },
                        { id: 'pubg-1800', name: '1800 UC', usdtValue: '25.0000', inGameAmount: 1800 },
                        { id: 'pubg-3850', name: '3850 UC', usdtValue: '49.0000', inGameAmount: 3850 },
                        { id: 'pubg-8100', name: '8100 UC', usdtValue: '96.0000', inGameAmount: 8100 },
                        { id: 'pubg-16200', name: '16200 UC', usdtValue: '186.0000', inGameAmount: 16200 },
                        { id: 'pubg-24300', name: '24300 UC', usdtValue: '278.0000', inGameAmount: 24300 },
                        { id: 'pubg-32400', name: '32400 UC', usdtValue: '369.0000', inGameAmount: 32400 },
                        { id: 'pubg-40500', name: '40500 UC', usdtValue: '459.0000', inGameAmount: 40500 },
                      ].map((pkg) => {
                        // Calculate Pi price based on current Pi price or fallback
                        const piPrice = piPriceData?.price ? parseFloat(pkg.usdtValue) / piPriceData.price : 0;
                        
                        return (
                          <div 
                            key={pkg.id} 
                            className="game-card p-4 md:p-6 rounded-lg border border-border bg-card hover:transform hover:-translate-y-1 transition-all duration-300"
                          >
                            <div className="flex items-center mb-3 md:mb-4">
                              <img 
                                src="https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png" 
                                alt="PUBG Mobile" 
                                className="w-10 h-10 md:w-12 md:h-12 mr-2 md:mr-3 object-contain"
                              />
                              <div>
                                <h3 className="text-lg md:text-xl font-bold">{pkg.name}</h3>
                                <p className="text-muted-foreground text-xs md:text-sm">
                                  UC Package
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-xl md:text-2xl font-bold text-green-400 font-mono">
                                {piPrice > 0 ? `${piPrice.toFixed(1)} π` : 'Price unavailable'}
                              </span>
                              {/* Hidden USDT value for internal calculation only */}
                              <span className="text-xs md:text-sm text-muted-foreground hidden">
                                ≈ ${pkg.usdtValue}
                              </span>
                            </div>
                            
                            <Button 
                              onClick={() => {
                                // Create a mock package object for the purchase modal
                                const mockPackage = {
                                  id: pkg.id,
                                  game: 'PUBG',
                                  name: pkg.name,
                                  inGameAmount: pkg.inGameAmount,
                                  usdtValue: pkg.usdtValue,
                                  image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png",
                                  isActive: true,
                                  piPrice: piPrice > 0 ? piPrice : undefined
                                };
                                handlePurchaseClick(mockPackage);
                              }}
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base"
                            >
                              Buy Now
                            </Button>
                          </div>
                        );
                      })}
                    </>
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
              
              <TabsContent value="mlbb" className="mt-6 md:mt-8">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Mobile Legends Diamonds</h3>
                  <p className="text-sm text-muted-foreground">Buy Diamonds to purchase heroes, skins, battle emblems, and other premium items.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" data-testid="mlbb-packages">
                  {packagesLoading ? (
                    <div className="col-span-2 text-center text-muted-foreground" data-testid="loading-packages">
                      Loading packages...
                    </div>
                  ) : mlbbPackages.length === 0 ? (
                    // Display default MLBB packages when none are loaded
                    <>
                      {[
                        { id: 'mlbb-56', name: '56 Diamonds', usdtValue: '3.0000', inGameAmount: 56 },
                        { id: 'mlbb-278', name: '278 Diamonds', usdtValue: '6.0000', inGameAmount: 278 },
                        { id: 'mlbb-571', name: '571 Diamonds', usdtValue: '11.0000', inGameAmount: 571 },
                        { id: 'mlbb-1783', name: '1783 Diamonds', usdtValue: '33.0000', inGameAmount: 1783 },
                        { id: 'mlbb-3005', name: '3005 Diamonds', usdtValue: '52.0000', inGameAmount: 3005 },
                        { id: 'mlbb-6012', name: '6012 Diamonds', usdtValue: '99.0000', inGameAmount: 6012 },
                        { id: 'mlbb-12000', name: '12000 Diamonds', usdtValue: '200.0000', inGameAmount: 12000 },
                      ].map((pkg) => {
                        // Calculate Pi price based on current Pi price or fallback
                        const piPrice = piPriceData?.price ? parseFloat(pkg.usdtValue) / piPriceData.price : 0;
                        
                        return (
                          <div 
                            key={pkg.id} 
                            className="game-card p-4 md:p-6 rounded-lg border border-border bg-card hover:transform hover:-translate-y-1 transition-all duration-300"
                          >
                            <div className="flex items-center mb-3 md:mb-4">
                              <img 
                                src="https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png" 
                                alt="Mobile Legends" 
                                className="w-10 h-10 md:w-12 md:h-12 mr-2 md:mr-3 object-contain"
                              />
                              <div>
                                <h3 className="text-lg md:text-xl font-bold">{pkg.name}</h3>
                                <p className="text-muted-foreground text-xs md:text-sm">
                                  Diamonds Package
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-xl md:text-2xl font-bold text-green-400 font-mono">
                                {piPrice > 0 ? `${piPrice.toFixed(1)} π` : 'Price unavailable'}
                              </span>
                              {/* Hidden USDT value for internal calculation only */}
                              <span className="text-xs md:text-sm text-muted-foreground hidden">
                                ≈ ${pkg.usdtValue}
                              </span>
                            </div>
                            
                            <Button 
                              onClick={() => {
                                // Create a mock package object for the purchase modal
                                const mockPackage = {
                                  id: pkg.id,
                                  game: 'MLBB',
                                  name: pkg.name,
                                  inGameAmount: pkg.inGameAmount,
                                  usdtValue: pkg.usdtValue,
                                  image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png",
                                  isActive: true,
                                  piPrice: piPrice > 0 ? piPrice : undefined
                                };
                                handlePurchaseClick(mockPackage);
                              }}
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base"
                            >
                              Buy Now
                            </Button>
                          </div>
                        );
                      })}
                    </>
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
          <div className="space-y-6 md:space-y-8" data-testid="dashboard-sidebar">
            {/* Quick Actions */}
            <Card data-testid="quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm md:text-base"
                  data-testid="button-edit-profile"
                >
                  <i className="fas fa-user mr-2"></i>Edit Profile
                </Button>
                <Button 
                  variant="outline"
                  className="w-full text-sm md:text-base"
                  data-testid="button-view-history"
                >
                  <i className="fas fa-history mr-2"></i>View History
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full text-sm md:text-base"
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
                  <div className="space-y-3 md:space-y-4">
                    {recentTransactions.map((transaction, index) => (
                      <div 
                        key={transaction.id} 
                        className="border-b border-border pb-2 md:pb-3 last:border-b-0"
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
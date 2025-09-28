import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AdminLoginModal from '@/components/admin-login-modal';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { apiRequest } from '@/lib/queryClient';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  totalSpent: number;
  transactionCount: number;
  isActive: boolean;
}

interface AdminTransaction {
  id: string;
  user: { username: string; email: string };
  package: { name: string; game: string };
  piAmount: string;
  usdAmount: string;
  status: string;
  createdAt: string;
  paymentId: string;
  txid?: string;
}

interface AdminPackage {
  id: string;
  game: string;
  name: string;
  inGameAmount: number;
  usdtValue: string;
  isActive: boolean;
}

interface Analytics {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  successRate: number;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/admin/analytics'],
    enabled: isAuthenticated && !!token,
    meta: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  });

  const { data: users } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated && !!token,
    meta: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  });

  const { data: transactions } = useQuery<AdminTransaction[]>({
    queryKey: ['/api/admin/transactions'],
    enabled: isAuthenticated && !!token,
    meta: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  });

  const { data: packages } = useQuery<AdminPackage[]>({
    queryKey: ['/api/admin/packages'],
    enabled: isAuthenticated && !!token,
    meta: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminPackage> }) => {
      const response = await apiRequest('PUT', `/api/admin/packages/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/packages'] });
      toast({
        title: "Success",
        description: "Package updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive",
      });
    }
  });

  const handleLogin = (adminToken: string) => {
    setToken(adminToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
  };

  const togglePackageStatus = (pkg: AdminPackage) => {
    updatePackageMutation.mutate({
      id: pkg.id,
      data: { isActive: !pkg.isActive }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-background text-foreground">
          <ParticleBackground />
          <Navigation isTestnet={import.meta.env.DEV} />
          <div className="flex items-center justify-center min-h-[80vh]">
            <AdminLoginModal onLogin={handleLogin} />
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="admin-panel">
      <ParticleBackground />
      <Navigation isTestnet={import.meta.env.DEV} />
      
      {/* Admin Header */}
      <div className="bg-red-900/20 border-b border-red-500/30" data-testid="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">B4U Esports Management Panel</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg">
                <i className="fas fa-shield-alt mr-2"></i>Admin Mode
              </div>
              <Button onClick={handleLogout} variant="outline" data-testid="admin-logout">
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-testid="admin-stats">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-users text-white"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-users">{analytics.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-exchange-alt text-white"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-transactions">{analytics.totalTransactions}</p>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-coins text-white"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-revenue">{analytics.totalRevenue.toFixed(1)} π</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-percentage text-white"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-success-rate">{analytics.successRate}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4" data-testid="admin-tabs">
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
            <TabsTrigger value="packages" data-testid="tab-packages">Packages</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card data-testid="users-management">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                      data-testid="search-users"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                          <TableCell className="font-semibold">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.country}</TableCell>
                          <TableCell className="font-mono text-green-400">{user.totalSpent.toFixed(1)} π</TableCell>
                          <TableCell>{user.transactionCount}</TableCell>
                          <TableCell>
                            <Badge className={user.isActive ? 'bg-green-500' : 'bg-red-500'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <Card data-testid="transactions-management">
              <CardHeader>
                <CardTitle>Transaction Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions?.map((transaction) => (
                        <TableRow key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-semibold">{transaction.user.username}</div>
                              <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold">{transaction.package.name}</div>
                              <div className="text-sm text-muted-foreground">{transaction.package.game}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-green-400">
                            {transaction.piAmount} π
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {transaction.paymentId.slice(0, 8)}...
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages */}
          <TabsContent value="packages">
            <Card data-testid="packages-management">
              <CardHeader>
                <CardTitle>Package Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>USDT Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages?.map((pkg) => (
                        <TableRow key={pkg.id} data-testid={`package-row-${pkg.id}`}>
                          <TableCell>
                            <Badge variant={pkg.game === 'PUBG' ? 'default' : 'secondary'}>
                              {pkg.game}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{pkg.name}</TableCell>
                          <TableCell>{pkg.inGameAmount}</TableCell>
                          <TableCell>${pkg.usdtValue}</TableCell>
                          <TableCell>
                            <Badge className={pkg.isActive ? 'bg-green-500' : 'bg-red-500'}>
                              {pkg.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={pkg.isActive ? 'destructive' : 'default'}
                              onClick={() => togglePackageStatus(pkg)}
                              disabled={updatePackageMutation.isPending}
                              data-testid={`toggle-package-${pkg.id}`}
                            >
                              {pkg.isActive ? 'Disable' : 'Enable'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="analytics-dashboard">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-400 mb-2">
                      {analytics?.totalRevenue.toFixed(1)} π
                    </p>
                    <p className="text-muted-foreground">Total Platform Revenue</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-400 mb-2">
                      {analytics?.successRate}%
                    </p>
                    <p className="text-muted-foreground">Success Rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-400 mb-2">
                      {analytics?.totalUsers}
                    </p>
                    <p className="text-muted-foreground">Registered Users</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-orange-400 mb-2">
                      {analytics?.totalTransactions}
                    </p>
                    <p className="text-muted-foreground">All Time</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

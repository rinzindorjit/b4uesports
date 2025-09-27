import { usePiNetwork } from '@/hooks/use-pi-network';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function MinimalDashboard() {
  const { user, isAuthenticated, logout, isLoading } = usePiNetwork();
  const [, setLocation] = useLocation();

  console.log('MinimalDashboard render:', { user, isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader>
          <CardTitle>Minimal Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
            <p>isLoading: {isLoading ? 'true' : 'false'}</p>
            {user && <p>Username: {user.username}</p>}
            <Button onClick={() => setLocation('/')}>Go to Home</Button>
            <Button onClick={logout} variant="destructive">Logout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
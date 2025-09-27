import { usePiNetwork } from '@/hooks/use-pi-network';
import { Button } from '@/components/ui/button';

export default function AuthDebug() {
  const { user, isAuthenticated, logout, authenticate, isLoading } = usePiNetwork();

  console.log('AuthDebug render:', { user, isAuthenticated, isLoading });

  const handleLogin = async () => {
    console.log('Login button clicked');
    try {
      await authenticate();
      console.log('Authentication completed');
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleLogout = () => {
    console.log('Logout button clicked');
    logout();
  };

  const handleCheckStorage = () => {
    console.log('Checking localStorage:');
    console.log('pi_token:', localStorage.getItem('pi_token'));
    console.log('pi_user:', localStorage.getItem('pi_user'));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="bg-card rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
            <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
            {user && (
              <div>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email || 'Not set'}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleLogin} disabled={isLoading || isAuthenticated}>
            {isLoading ? 'Authenticating...' : isAuthenticated ? 'Already Authenticated' : 'Login'}
          </Button>
          <Button onClick={handleLogout} variant="destructive" disabled={!isAuthenticated}>
            Logout
          </Button>
          <Button onClick={handleCheckStorage} variant="outline">
            Check Storage
          </Button>
        </div>
        
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
          <p>Check the browser console for detailed logs.</p>
        </div>
      </div>
    </div>
  );
}
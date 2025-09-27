import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { Button } from '@/components/ui/button';

export default function SimpleAuthTest() {
  const { user, isAuthenticated, logout, authenticate, isLoading } = useSimpleAuth();

  console.log('SimpleAuthTest render:', { user, isAuthenticated, isLoading });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Authentication Test</h1>
        
        <div className="bg-card rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
            <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
            {user && (
              <div>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button onClick={authenticate} disabled={isLoading || isAuthenticated}>
            {isLoading ? 'Authenticating...' : isAuthenticated ? 'Already Authenticated' : 'Login'}
          </Button>
          <Button onClick={logout} variant="destructive" disabled={!isAuthenticated}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
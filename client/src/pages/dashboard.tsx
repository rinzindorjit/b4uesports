import { usePiNetwork } from '@/hooks/use-pi-network';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = usePiNetwork();
  const [, setLocation] = useLocation();

  console.log('Dashboard render:', { user, isAuthenticated, authLoading });

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message if not authenticated
  const isPreviewMode = window.location.hostname.includes('vercel.app') || 
                       (window.location.hostname === 'localhost' && window.location.port === '5173');
                       
  console.log('Dashboard auth check:', { isAuthenticated, isPreviewMode });

  // Main dashboard content - always render, but show different content based on auth state
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="bg-card rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
            <p><strong>isPreviewMode:</strong> {isPreviewMode ? 'true' : 'false'}</p>
            <p><strong>isLoading:</strong> {authLoading ? 'true' : 'false'}</p>
            {user && (
              <div>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email || 'Not set'}</p>
              </div>
            )}
          </div>
        </div>
        
        {!isAuthenticated && !isPreviewMode && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-300">
              You are not authenticated and not in preview mode. In a real application, you would be redirected to the login page.
            </p>
          </div>
        )}
        
        <div className="flex gap-4">
          <button 
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Go to Home
          </button>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
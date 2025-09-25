import { useEffect, useState } from 'react';
import { getAuthMode, shouldUseMockAuth, shouldInitializePiSDK, getPiSDKSandboxMode } from '@/lib/auth-mode';

export default function AuthTest() {
  const [authInfo, setAuthInfo] = useState<any>(null);

  useEffect(() => {
    setAuthInfo({
      authMode: getAuthMode(),
      shouldUseMockAuth: shouldUseMockAuth(),
      shouldInitializePiSDK: shouldInitializePiSDK(),
      getPiSDKSandboxMode: getPiSDKSandboxMode(),
      location: window.location,
      userAgent: window.navigator.userAgent,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Mode Test</h1>
      
      {authInfo && (
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Current Environment Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded">
              <h3 className="font-semibold mb-2">Authentication Mode</h3>
              <p className="text-lg font-mono bg-background p-2 rounded">{authInfo.authMode}</p>
            </div>
            
            <div className="bg-muted p-4 rounded">
              <h3 className="font-semibold mb-2">Use Mock Authentication</h3>
              <p className="text-lg font-mono bg-background p-2 rounded">{authInfo.shouldUseMockAuth.toString()}</p>
            </div>
            
            <div className="bg-muted p-4 rounded">
              <h3 className="font-semibold mb-2">Initialize Pi SDK</h3>
              <p className="text-lg font-mono bg-background p-2 rounded">{authInfo.shouldInitializePiSDK.toString()}</p>
            </div>
            
            <div className="bg-muted p-4 rounded">
              <h3 className="font-semibold mb-2">Pi SDK Sandbox Mode</h3>
              <p className="text-lg font-mono bg-background p-2 rounded">{authInfo.getPiSDKSandboxMode.toString()}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Location Information</h3>
            <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(authInfo.location, null, 2)}
            </pre>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">User Agent</h3>
            <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
              {authInfo.userAgent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
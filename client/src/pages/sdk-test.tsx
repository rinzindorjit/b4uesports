import { useEffect, useState } from 'react';

export default function SDKTest() {
  const [sdkStatus, setSdkStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkSDK = () => {
      const isVercel = window.location.hostname.includes('vercel.app');
      const isPiBrowser = navigator.userAgent.includes('PiBrowser') || navigator.userAgent.includes('Pi Network');
      const isPiSDKLoaded = typeof window !== 'undefined' && window.Pi;
      
      setSdkStatus(`
        Hostname: ${window.location.hostname}
        User Agent: ${navigator.userAgent}
        Is Vercel: ${isVercel}
        Is Pi Browser: ${isPiBrowser}
        Pi SDK Loaded: ${isPiSDKLoaded ? 'Yes' : 'No'}
        Should Load SDK: ${isPiBrowser || !isVercel ? 'Yes' : 'No'}
      `);
    };

    // Check immediately
    checkSDK();
    
    // Check again after a short delay to allow for async loading
    const timer = setTimeout(checkSDK, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-6">Pi SDK Test</h1>
      
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">SDK Status</h2>
        <pre className="bg-background p-4 rounded overflow-x-auto">
          {sdkStatus}
        </pre>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Window.Pi Object</h3>
          <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
            {typeof window !== 'undefined' && window.Pi 
              ? JSON.stringify(Object.keys(window.Pi), null, 2)
              : 'Pi SDK not loaded'}
          </pre>
        </div>
      </div>
    </div>
  );
}
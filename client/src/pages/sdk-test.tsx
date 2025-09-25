import { useState, useEffect } from 'react';
import { usePiNetwork } from '@/hooks/use-pi-network';

export default function SDKTest() {
  const { isAuthenticated, user, isLoading, authenticate, createPayment } = usePiNetwork();
  const [paymentStatus, setPaymentStatus] = useState('');
  const [authStatus, setAuthStatus] = useState('');

  const handleAuth = async () => {
    try {
      setAuthStatus('Authenticating...');
      await authenticate();
      setAuthStatus('Authentication successful!');
    } catch (error) {
      setAuthStatus(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePayment = () => {
    try {
      setPaymentStatus('Creating payment...');
      createPayment(
        {
          amount: 1,
          memo: 'Test payment',
          metadata: { test: true }
        },
        {
          onReadyForServerApproval: (paymentId) => {
            console.log('Payment ready for approval:', paymentId);
            setPaymentStatus(`Payment ${paymentId} ready for approval`);
          },
          onReadyForServerCompletion: (paymentId, txid) => {
            console.log('Payment completed:', paymentId, txid);
            setPaymentStatus(`Payment ${paymentId} completed with txid: ${txid}`);
          },
          onCancel: (paymentId) => {
            console.log('Payment cancelled:', paymentId);
            setPaymentStatus(`Payment ${paymentId} cancelled`);
          },
          onError: (error, payment) => {
            console.error('Payment error:', error, payment);
            setPaymentStatus(`Payment error: ${error.message}`);
          }
        }
      );
    } catch (error) {
      setPaymentStatus(`Payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pi Network SDK Test</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Authentication</h2>
        <p className="mb-2">Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
        {user && (
          <div className="mb-2">
            <p>User ID: {user.id}</p>
            <p>Username: {user.username}</p>
          </div>
        )}
        <button 
          onClick={handleAuth}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md"
          disabled={isAuthenticated}
        >
          {isAuthenticated ? 'Already Authenticated' : 'Authenticate with Pi Network'}
        </button>
        {authStatus && <p className="mt-2 text-sm">{authStatus}</p>}
      </div>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Payment Test</h2>
        <button 
          onClick={handlePayment}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          disabled={!isAuthenticated}
        >
          Make Test Payment
        </button>
        {paymentStatus && <p className="mt-2 text-sm">{paymentStatus}</p>}
      </div>

      <div className="p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
        <p>Window location: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
        <p>User agent: {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
        <p>Pi SDK available: {typeof window !== 'undefined' && window.Pi ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
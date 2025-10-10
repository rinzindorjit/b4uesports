// Frontend Side Payment Function Example

// Utility function to wait for Pi SDK to be ready
function waitForPiSDK(timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkPi = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Pi SDK not found or not loaded in time'));
      } else {
        setTimeout(checkPi, 100);
      }
    };
    
    checkPi();
  });
}

// Example of proper Pi Network payment flow with server-side approval
function handlePayment(amount, memo, metadata) {
  // Ensure Pi SDK is available
  if (!window.Pi || !window.Pi.createPayment) {
    console.error('Pi SDK not available');
    return;
  }

  // Create payment with proper callbacks
  window.Pi.createPayment({
    amount: amount,
    memo: memo,
    metadata: metadata
  }, {
    onReadyForServerApproval: (paymentId) => {
      // Send paymentId to your server for approval
      fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          data: { paymentId }
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Payment approved:', data);
      })
      .catch(error => {
        console.error('Approval failed:', error);
      });
    },
    onReadyForServerCompletion: (paymentId, txid) => {
      console.log('Payment completed:', paymentId, txid);
      // Handle payment completion (update UI, etc.)
    },
    onCancel: (paymentId) => {
      console.log('Payment cancelled:', paymentId);
      // Handle payment cancellation
    },
    onError: (error, payment) => {
      console.error('Payment error:', error, payment);
      // Handle payment error
    }
  });
}

// Example usage:
// handlePayment(1.0, "Purchase of Premium Package", { packageId: "premium_1" });
// Pi Network payments endpoint for Vercel
import { withCORS, setCORSHeaders, handlePreflight } from '../utils/cors.js';

export default withCORS(paymentsHandler);

async function paymentsHandler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  try {
    if (request.method === 'POST') {
      // Handle payment creation
      // In Vercel, the request body is already parsed as JSON
      const body = request.body || {};
      
      const { paymentData } = body;
      
      // For mock purposes, we'll return a mock payment
      const mockPayment = {
        identifier: 'mock-payment-' + Date.now(),
        user_uid: 'mock-user-uid',
        amount: paymentData?.amount || 1,
        memo: paymentData?.memo || 'Mock payment',
        metadata: paymentData?.metadata || {},
        from_address: 'mock-from-address',
        to_address: 'mock-to-address',
        direction: 'user_to_app',
        created_at: new Date().toISOString(),
        network: 'Pi Testnet',
        status: {
          developer_approved: false,
          transaction_verified: false,
          developer_completed: false,
          cancelled: false,
          user_cancelled: false
        },
        transaction: null
      };

      response.status(200).json(mockPayment);
    } else if (request.method === 'PUT') {
      // Handle payment approval/completion
      // In Vercel, the request body is already parsed as JSON
      const body = request.body || {};
      
      const { action, paymentId, txid } = body;
      
      if (action === 'approve') {
        // Mock approval
        // In mock mode, we'll also update our mock transactions
        if (global.mockTransactions) {
          const transaction = global.mockTransactions.find(tx => tx.paymentId === paymentId);
          if (transaction) {
            transaction.status = 'approved';
            transaction.updatedAt = new Date().toISOString();
          }
        }
        
        response.status(200).json({ 
          success: true, 
          message: 'Payment approved',
          paymentId 
        });
      } else if (action === 'complete') {
        // Mock completion
        // In mock mode, we'll also update our mock transactions
        if (global.mockTransactions) {
          const transaction = global.mockTransactions.find(tx => tx.paymentId === paymentId);
          if (transaction) {
            transaction.status = 'completed';
            transaction.txid = txid;
            transaction.updatedAt = new Date().toISOString();
          }
        }
        
        response.status(200).json({ 
          success: true, 
          message: 'Payment completed',
          paymentId,
          txid
        });
      } else {
        response.status(400).json({ message: 'Invalid action' });
      }
    } else {
      response.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Payment handler error:', error);
    response.status(500).json({ message: 'Failed to handle payment request', error: error.message });
  }
}
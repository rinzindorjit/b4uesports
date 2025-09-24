// Pi Network payments endpoint for Vercel
import { piNetworkService } from '../../server/services/pi-network';

export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  if (request.method === 'POST') {
    // Handle payment creation
    try {
      const { paymentData } = request.body;
      
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
    } catch (error) {
      console.error('Payment creation error:', error);
      response.status(500).json({ message: 'Payment creation failed' });
    }
  } else if (request.method === 'PUT') {
    // Handle payment approval/completion
    try {
      const { action, paymentId, txid } = request.body;
      
      if (action === 'approve') {
        // Mock approval
        const result = await piNetworkService.approvePayment(paymentId);
        
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
        const result = await piNetworkService.completePayment(paymentId, txid);
        
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
    } catch (error) {
      console.error('Payment update error:', error);
      response.status(500).json({ message: 'Payment update failed' });
    }
  } else {
    response.status(405).json({ message: 'Method not allowed' });
  }
}
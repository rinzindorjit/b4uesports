// Pi Network webhook endpoint for Vercel
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
  
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // In Vercel, the request body is already parsed as JSON
    const body = request.body || {};
    
    const { action, paymentId, txid } = body;
    
    // Log the webhook event
    console.log('Pi Network webhook received:', { action, paymentId, txid });
    
    // Handle different webhook actions
    switch (action) {
      case 'payment_completed':
        // Handle completed payment
        console.log('Payment completed:', paymentId);
        // In a real implementation, you would update your database here
        // For mock mode, update our mock transactions
        if (global.mockTransactions) {
          const transaction = global.mockTransactions.find(tx => tx.paymentId === paymentId);
          if (transaction) {
            transaction.status = 'completed';
            transaction.txid = txid;
            transaction.updatedAt = new Date().toISOString();
          }
        }
        break;
        
      case 'payment_cancelled':
        // Handle cancelled payment
        console.log('Payment cancelled:', paymentId);
        // In a real implementation, you would update your database here
        // For mock mode, update our mock transactions
        if (global.mockTransactions) {
          const transaction = global.mockTransactions.find(tx => tx.paymentId === paymentId);
          if (transaction) {
            transaction.status = 'cancelled';
            transaction.updatedAt = new Date().toISOString();
          }
        }
        break;
        
      default:
        console.log('Unknown webhook action:', action);
    }
    
    // Acknowledge the webhook
    response.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    response.status(500).json({ message: 'Webhook processing failed', error: error.message });
  }
}
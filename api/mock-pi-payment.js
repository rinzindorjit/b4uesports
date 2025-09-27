// /api/mock-pi-payment.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ 
      error: "Invalid request", 
      message: "Payment ID is required" 
    });
  }

  // For Pi Testnet, we don't need to call the Pi Network API
  // Mock payments are handled entirely on the client-side
  console.log("🔄 Handling mock payment in Testnet mode...");
  console.log("💳 Payment ID:", paymentId);

  // For any payment ID in Testnet mode, return success
  // because we're not actually calling the Pi Network API in Testnet
  const txid = paymentId.startsWith('mock_') ? 
    "mock-tx-" + Date.now() : 
    "testnet-tx-" + Date.now();
    
  return res.status(200).json({
    identifier: paymentId,
    status: 'completed',
    transaction: {
      txid: txid,
      verified: true
    },
    message: 'Payment completed successfully in Testnet mode'
  });
}
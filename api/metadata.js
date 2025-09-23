// Vercel API endpoint for Pi Network metadata
// This file should be placed in the api directory for Vercel deployment

export default function handler(request, response) {
  // Set CORS headers for Pi Network requests
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  
  // Pi Network metadata
  const metadata = {
    // Application metadata
    application: {
      name: "B4U Esports",
      description: "Pi Network Integrated Marketplace for Gaming Currency",
      version: "1.0.0",
      platform: "Pi Network",
      category: "Gaming"
    },
    
    // Payment metadata
    payment: {
      currency: "Pi",
      supported_operations: [
        "buy_gaming_currency",
        "deposit",
        "withdrawal"
      ],
      min_amount: 0.1,
      max_amount: 10000,
      fee_structure: {
        deposit_fee: 0,
        withdrawal_fee: 0,
        transaction_fee: 0
      }
    },
    
    // Security metadata
    security: {
      encryption: "AES-256",
      authentication: "Pi Network OAuth",
      data_protection: "GDPR Compliant",
      ssl_required: true
    },
    
    // API endpoints
    endpoints: {
      authentication: "/api/auth/pi",
      payment_create: "/api/payment/create",
      payment_approve: "/api/payment/approve",
      payment_complete: "/api/payment/complete",
      user_profile: "/api/profile",
      packages: "/api/packages",
      transactions: "/api/transactions"
    },
    
    // Supported games
    supported_games: [
      {
        id: "pubg",
        name: "PUBG Mobile",
        currency: "UC (Unknown Cash)",
        description: "Popular battle royale game"
      },
      {
        id: "mlbb",
        name: "Mobile Legends: Bang Bang",
        currency: "Diamonds",
        description: "MOBA game developed by Moonton"
      }
    ],
    
    // Contact information
    contact: {
      support_email: "info@b4uesports.com",
      website: "https://b4uesports.com",
      phone: "+975 17875099"
    },
    
    // Legal information
    legal: {
      terms_of_service: "/terms-of-service",
      privacy_policy: "/privacy-policy",
      refund_policy: "/refund-policy"
    },
    
    // Timestamp
    last_updated: new Date().toISOString()
  };
  
  // Return metadata as JSON
  response.status(200).json(metadata);
}
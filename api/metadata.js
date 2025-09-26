// API metadata endpoint for Vercel
import { withCORS, setCORSHeaders, handlePreflight } from './utils/cors.js';

export default withCORS(metadataHandler);

async function metadataHandler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
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
        authentication: "/api/pi/auth",
        payment_create: "/api/pi/payments",
        payment_approve: "/api/pi/payments",
        payment_complete: "/api/pi/payments",
        user_profile: "/api/pi/user",
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
    
    response.status(200).json(metadata);
  } catch (error) {
    console.error('Metadata fetch error:', error);
    response.status(500).json({ message: 'Failed to fetch metadata' });
  }
}
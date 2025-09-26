// /api/metadata.js
export default function handler(req, res) {
  // Use the specific Pi Network subdomain for the backend URL
  const backendUrl = 'https://esportshub6671.b4uesports.vercel.app';
  
  res.status(200).json({
    application: {
      name: "B4U Esports",
      description: "Pi Network Integrated Marketplace for Gaming Currency",
      version: "1.0.0",
      platform: "Pi Network",
      category: "Gaming"
    },
    payment: {
      currency: "PI",
      supported_operations: ["buy_gaming_currency", "deposit", "withdrawal"],
      min_amount: 0.1,
      max_amount: 10000
    },
    // For Pi Testnet, we use direct domain access rather than app ID
    // Testnet relies on domain registration in the developer console
    endpoints: {
      authentication: `${backendUrl}/api/pi/auth`,
      payment_create: `${backendUrl}/api/pi-create-payment`,
      payment_complete: `${backendUrl}/api/mock-pi-payment`,
      user_profile: `${backendUrl}/api/pi/user`
    },
    contact: {
      support_email: "info@b4uesports.com",
      website: "https://b4uesports.com"
    },
    last_updated: new Date().toISOString()
  });
}
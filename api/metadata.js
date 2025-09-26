// /api/metadata.js
export default function handler(req, res) {
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
    endpoints: {
      authentication: "/api/pi/auth",
      payment_create: "/api/pi-create-payment",
      payment_complete: "/api/mock-pi-payment",
      user_profile: "/api/pi/user"
    },
    contact: {
      support_email: "info@b4uesports.com",
      website: "https://b4uesports.com"
    },
    last_updated: new Date().toISOString()
  });
}

// /api/pi-create-payment.js
// This endpoint should not be used to create payments directly
// Payments should be created using the client-side Pi SDK
// This file is kept for backward compatibility but should not be used

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Return an error indicating this endpoint should not be used
  return res.status(400).json({ 
    message: "Payments should be created using the client-side Pi SDK",
    error: "Incorrect payment creation method",
    details: "Use the Pi.createPayment() function in the client-side SDK instead of calling this endpoint directly"
  });
}

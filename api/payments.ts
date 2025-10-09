// @ts-nocheck
const { jwtVerify, getStorage } = require("./_utils.js");

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;
  
  if (method === "POST") {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwtVerify(token);
      const body = await readBody(req);

      const payment = {
        id: `pay_${Date.now()}`,
        user: decoded.pi_id,
        amount: body.amount,
        method: "Pi",
        date: new Date(),
      };
      const store = getStorage();
      store.payments.push(payment);
      return res.status(200).json({ message: "Payment recorded", payment });
    } catch (err) {
      console.error("Payment error:", err);
      return res.status(500).json({ 
        message: `Payment failed: ${err.message || 'Unknown error'}` 
      });
    }
  }

  if (method === "GET") {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwtVerify(token);
      const store = getStorage();
      const userPayments = store.payments.filter((p) => p.user === decoded.pi_id);
      return res.status(200).json({ payments: userPayments });
    } catch (err) {
      console.error("Payment retrieval error:", err);
      return res.status(500).json({ 
        message: `Failed to retrieve payments: ${err.message || 'Unknown error'}` 
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

module.exports = handler;
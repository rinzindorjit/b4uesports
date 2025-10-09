// @ts-nocheck
const { getStorage, jwtVerify } = require("./_utils");

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function getToken(req) {
  const auth = req.headers["authorization"];
  if (!auth) throw new Error("Missing Authorization header");
  return auth.replace("Bearer ", "");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const store = getStorage();

  try {
    if (req.method === "POST") {
      const token = getToken(req);
      const decoded = jwtVerify(token);
      const body = await readBody(req);

      const payment = {
        id: `pay_${Date.now()}`,
        user: decoded.pi_id,
        amount: body.amount,
        method: "Pi",
        date: new Date(),
      };

      store.payments.push(payment);
      return res.status(200).json({ message: "Payment recorded", payment });
    }

    if (req.method === "GET") {
      const token = getToken(req);
      const decoded = jwtVerify(token);

      const userPayments = store.payments.filter((p) => p.user === decoded.pi_id);
      return res.status(200).json({ payments: userPayments });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}
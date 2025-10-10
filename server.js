import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PI_API_KEY = process.env.PI_API_KEY; // Your Pi API Key
const PI_SANDBOX = process.env.PI_SANDBOX === 'true';
const PI_SERVER_URL = PI_SANDBOX ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';

app.post("/approve-payment", async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId is required" });
    }

    const response = await fetch(`${PI_SERVER_URL}/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${PI_API_KEY}`
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Approval error:", error);
    return res.status(500).json({ error: "Approval failed", details: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
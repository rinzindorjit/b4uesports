import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_b4u_key";
export const PI_API_URL = process.env.PI_SANDBOX === "true"
  ? "https://sandbox.minepi.com/v2"
  : "https://api.minepi.com/v2";

export const store = {
  users: {},
  transactions: [],
  packages: [
    { id: "pubg-1", game: "PUBG", name: "Small UC Pack", inGameAmount: 100, usdtValue: "10.00", image: "/images/pubg-small.jpg", isActive: true },
    { id: "pubg-2", game: "PUBG", name: "Medium UC Pack", inGameAmount: 250, usdtValue: "25.00", image: "/images/pubg-medium.jpg", isActive: true },
    { id: "pubg-3", game: "PUBG", name: "Large UC Pack", inGameAmount: 500, usdtValue: "50.00", image: "/images/pubg-large.jpg", isActive: true },
    { id: "mlbb-1", game: "MLBB", name: "Small Diamond Pack", inGameAmount: 50, usdtValue: "10.00", image: "/images/mlbb-small.jpg", isActive: true },
    { id: "mlbb-2", game: "MLBB", name: "Medium Diamond Pack", inGameAmount: 125, usdtValue: "25.00", image: "/images/mlbb-medium.jpg", isActive: true },
    { id: "mlbb-3", game: "MLBB", name: "Large Diamond Pack", inGameAmount: 250, usdtValue: "50.00", image: "/images/mlbb-large.jpg", isActive: true },
  ],
  payments: []
};

export function getStorage() {
  return store;
}

export function jwtSign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function jwtVerify(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk.toString());
    req.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch (err) { reject(err); }
    });
    req.on("error", reject);
  });
}

export function getPiNetworkService() {
  return {
    verifyAccessToken: async (accessToken) => {
      if (!accessToken) throw new Error("Missing access token");
      const response = await fetch(`${PI_API_URL}/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        let errorMessage = "Unknown error";
        try { errorMessage = (await response.json()).message || errorMessage; }
        catch (e) { errorMessage = response.statusText || errorMessage; }
        throw new Error(`Pi Network API error: ${response.status} - ${errorMessage}`);
      }
      const userData = await response.json();
      return { username: userData.username, pi_id: userData.uid, email: userData.email || "" };
    }
  };
}
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const metadata = {
    title: "B4U Esports",
    description: "Official PiNet Testnet App for B4U Esports",
    icon: "https://b4uesports.vercel.app/images/pubg-large.jpg",
    authors: [
      {
        name: "Rinzin Dorji",
        twitter: "@b4uesports"
      }
    ]
  };

  res.status(200).json(metadata);
}
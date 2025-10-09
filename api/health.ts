export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    return res.status(200).json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() });
  } catch (err: any) {
    console.error('API Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}
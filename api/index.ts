import { getStorage, getPiNetworkService, jwtSign, jwtVerify } from './_utils';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, method } = req;
  const store = getStorage();
  const piService = getPiNetworkService();

  try {
    // ========= /api/health =========
    if (url.includes('/health')) {
      return res.status(200).json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() });
    }

    // ========= /api/pi-price =========
    if (url.includes('/pi-price')) {
      const price = 0.015; // Example static price
      return res.status(200).json({ pi: price, currency: 'USD' });
    }

    // ========= /api/users =========
    if (url.includes('/users')) {
      if (method === 'POST') {
        const body = await readBody(req);

        if (body.action === 'authenticate') {
          const { accessToken } = body.data;
          const userData = await piService.verifyAccessToken(accessToken);

          if (!store.users[userData.pi_id]) {
            store.users[userData.pi_id] = userData;
          }

          const token = jwtSign({ pi_id: userData.pi_id });
          return res.status(200).json({ message: 'User authenticated', user: userData, token });
        }

        if (body.action === 'getProfile') {
          const token = getToken(req);
          const decoded = jwtVerify(token);
          const user = store.users[decoded.pi_id];
          return res.status(200).json({ user });
        }

        return res.status(400).json({ message: 'Invalid action for /api/users' });
      }
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // ========= /api/packages =========
    if (url.includes('/packages')) {
      if (method === 'GET') {
        return res.status(200).json({ packages: store.packages });
      }
      return res.status(405).json({ message: 'Only GET allowed for /api/packages' });
    }

    // ========= /api/payments =========
    if (url.includes('/payments')) {
      if (method === 'POST') {
        const token = getToken(req);
        const decoded = jwtVerify(token);
        const body = await readBody(req);

        const payment = {
          id: `pay_${Date.now()}`,
          user: decoded.pi_id,
          amount: body.amount,
          method: 'Pi',
          date: new Date(),
        };
        store.payments.push(payment);
        return res.status(200).json({ message: 'Payment recorded', payment });
      }

      if (method === 'GET') {
        const token = getToken(req);
        const decoded = jwtVerify(token);
        const userPayments = store.payments.filter((p: any) => p.user === decoded.pi_id);
        return res.status(200).json({ payments: userPayments });
      }
    }

    // ========= /api/admin (NO LOGIN, just info) =========
    if (url.includes('/admin')) {
      return res.status(200).json({
        message: 'Admin panel data',
        totalUsers: Object.keys(store.users).length,
        totalPayments: store.payments.length,
        totalTransactions: store.transactions.length,
      });
    }

    // ========= /api/transactions =========
    if (url.includes('/transactions')) {
      if (method === 'POST') {
        const token = getToken(req);
        const decoded = jwtVerify(token);
        const body = await readBody(req);

        const txn = {
          id: `txn_${Date.now()}`,
          user: decoded.pi_id,
          amount: body.amount,
          date: new Date(),
        };
        store.transactions.push(txn);
        return res.status(200).json({ message: 'Transaction added', txn });
      }

      if (method === 'GET') {
        const token = getToken(req);
        const decoded = jwtVerify(token);
        const userTxns = store.transactions.filter((t: any) => t.user === decoded.pi_id);
        return res.status(200).json({ transactions: userTxns });
      }
    }

    // ========= /api/data =========
    if (url.includes('/data')) {
      const token = getToken(req);
      jwtVerify(token);
      return res.status(200).json({ message: 'Secure data accessed', timestamp: new Date() });
    }

    // ========= Default route =========
    return res.status(200).json({
      message: 'B4U Esports Unified API Online',
      endpoints: [
        '/api/pi-price',
        '/api/users',
        '/api/packages',
        '/api/payments',
        '/api/admin',
        '/api/transactions',
        '/api/health',
        '/api/data',
      ],
    });

  } catch (err: any) {
    console.error('API Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}

// --- Helpers ---
async function readBody(req: any) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => data += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function getToken(req: any) {
  const auth = req.headers['authorization'];
  if (!auth) throw new Error('Missing Authorization header');
  return auth.replace('Bearer ', '');
}
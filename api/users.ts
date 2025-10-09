const { getStorage, getPiNetworkService, jwtSign, jwtVerify } = require('./_utils');

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { method } = req;
  const store = getStorage();
  const piService = getPiNetworkService();

  try {
    if (method === 'POST') {
      // Log the incoming request for debugging
      console.log('POST request received:', {
        headers: req.headers,
        url: req.url,
        contentType: req.headers['content-type']
      });
      
      const body: any = await readBody(req);
      console.log('Request body parsed:', body);

      if (body.action === 'authenticate') {
        const { accessToken } = body.data;
        console.log('Attempting to verify access token:', accessToken ? 'Token provided' : 'No token');
        
        if (!accessToken) {
          return res.status(400).json({ message: 'Missing access token' });
        }
        
        const userData = await piService.verifyAccessToken(accessToken);
        console.log('User data verified:', userData);

        if (!store.users[userData.pi_id]) {
          store.users[userData.pi_id] = userData;
        }

        const token = jwtSign({ pi_id: userData.pi_id });
        console.log('JWT token generated');
        
        return res.status(200).json({ message: 'User authenticated', user: userData, token });
      }

      if (body.action === 'getProfile') {
        const token = getToken(req);
        const decoded: any = jwtVerify(token);
        const user = store.users[decoded.pi_id];
        return res.status(200).json({ user });
      }

      return res.status(400).json({ message: 'Invalid action for /api/users' });
    }
    
    if (method === 'GET') {
      const token = getToken(req);
      const decoded: any = jwtVerify(token);
      const user = store.users[decoded.pi_id];
      return res.status(200).json({ user });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Error:', err);
    // Return a more detailed error message for debugging
    res.status(500).json({ 
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack,
        name: err.name
      } : undefined
    });
  }
}

// --- Helpers ---
async function readBody(req: any) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
      // Prevent buffer overflow
      if (data.length > 1e6) {
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      try {
        console.log('Raw request data:', data);
        resolve(JSON.parse(data || '{}'));
      } catch (err) {
        console.error('JSON parse error:', err);
        reject(new Error('Invalid JSON in request body'));
      }
    });
    req.on('error', (err: any) => {
      reject(err);
    });
  });
}

function getToken(req: any) {
  const auth = req.headers['authorization'];
  if (!auth) {
    console.log('Missing Authorization header');
    throw new Error('Missing Authorization header');
  }
  console.log('Authorization header found');
  return auth.replace('Bearer ', '');
}
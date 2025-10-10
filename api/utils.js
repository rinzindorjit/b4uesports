import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// Get storage file path
const getStoragePath = () => {
  // In Vercel, we'll use /tmp directory for storage
  const tmpDir = '/tmp';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  return path.join(tmpDir, 'storage.json');
};

// Read storage data
export const getStorage = () => {
  try {
    const storagePath = getStoragePath();
    if (fs.existsSync(storagePath)) {
      const data = fs.readFileSync(storagePath, 'utf8');
      return JSON.parse(data);
    }
    
    // Return default storage structure if file doesn't exist
    return {
      users: [],
      transactions: [],
      packages: [],
      piPrice: null
    };
  } catch (error) {
    console.error('Error reading storage:', error);
    return {
      users: [],
      transactions: [],
      packages: [],
      piPrice: null
    };
  }
};

// Save storage data
export const saveStorage = (data) => {
  try {
    const storagePath = getStoragePath();
    fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving storage:', error);
    return false;
  }
};

// Read request body
export const readBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

// JWT functions
export const jwtSign = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key');
};

export const jwtVerify = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
};
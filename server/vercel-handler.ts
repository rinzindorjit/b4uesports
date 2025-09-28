import express from 'express';
import serverless from 'serverless-http';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes dynamically
(async () => {
  try {
    const { registerRoutes } = await import('./routes');
    await registerRoutes(app);
  } catch (error) {
    console.error('Failed to register routes:', error);
  }
})();

// Create serverless handler
const handler = serverless(app);

// Export the handler for Vercel
export default handler;

// Export individual API endpoints for direct access
export { default as users } from '../api/users';
export { default as packages } from '../api/packages';
export { default as piPrice } from '../api/pi-price';
export { default as payments } from '../api/payments';
export { default as transactions } from '../api/transactions';
export { default as admin } from '../api/admin';
export { default as test } from '../api/test';
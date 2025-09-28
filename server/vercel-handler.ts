import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from './routes.js';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
registerRoutes(app).catch(error => {
  console.error('Failed to register routes:', error);
});

// Create serverless handler
const handler = serverless(app);

// Export the handler for Vercel
export default handler;

// Export individual API endpoints for direct access
export async function usersHandler(req: any, res: any) {
  // This will be handled by the main handler
  return handler(req, res);
}

export async function packagesHandler(req: any, res: any) {
  return handler(req, res);
}

export async function piPriceHandler(req: any, res: any) {
  return handler(req, res);
}

export async function paymentsHandler(req: any, res: any) {
  return handler(req, res);
}

export async function transactionsHandler(req: any, res: any) {
  return handler(req, res);
}

export async function adminHandler(req: any, res: any) {
  return handler(req, res);
}
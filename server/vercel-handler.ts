import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from './routes';

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
import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from './routes/index.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Wrap route registration in an async IIFE
(async () => {
  try {
    await registerRoutes(app);
    console.log('Routes registered successfully');
  } catch (error: any) {
    console.error('Failed to register routes:', error);
    // Optional: basic fallback route
    app.get('*', (_req, res) => {
      res.status(500).json({
        error: 'Failed to initialize routes',
        message: error.message
      });
    });
  }
})();

// Export serverless handler
export default serverless(app);

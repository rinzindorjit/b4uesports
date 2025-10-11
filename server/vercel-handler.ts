import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from './routes/index.js';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes with timeout handling
const registerRoutesWithTimeout = () => {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Route registration timed out after 15 seconds'));
    }, 15000);
    
    registerRoutes(app)
      .then(() => {
        clearTimeout(timeout);
        resolve();
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
};

// Register all routes
registerRoutesWithTimeout()
  .then(() => {
    console.log('Routes registered successfully');
  })
  .catch((error) => {
    console.error('Failed to register routes:', error);
    // In a production environment, you might want to set up a basic error route
    app.get('*', (req, res) => {
      res.status(500).json({ 
        error: 'Failed to initialize routes', 
        message: error.message 
      });
    });
  });

// Create serverless handler
const handler = serverless(app);

// Export the handler for Vercel
export default handler;
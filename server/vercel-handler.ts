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
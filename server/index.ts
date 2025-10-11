import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes.js";
import { serveStatic, log } from "./static.js";
import { initializePackages } from "./utils/initialize-packages.js";
import { updatePackageImages } from "./utils/update-package-images.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Add CORS middleware
app.use((req, res, next) => {
  // Check if we're running on Vercel
  const isVercel = !!process.env.VERCEL;
  const frontendUrl = process.env.FRONTEND_URL || 'https://b4uesports.vercel.app';
  
  // Set CORS headers - restrict in production/Vercel
  const allowedOrigin = isVercel 
    ? frontendUrl 
    : '*';
    
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Only add logging middleware in development
const isDevelopment = process.env.NODE_ENV === "development";
const isVercel = !!process.env.VERCEL;

if (isDevelopment && !isVercel) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });
}

(async () => {
  // Initialize packages on startup (only in development/non-Vercel environments)
  if (!isVercel) {
    await initializePackages();
    await updatePackageImages();
  }
  
  // Register API routes
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    if (!isVercel) {
      throw err;
    }
  });

  // In Vercel environment, we don't need to start the server
  // Vercel will handle the serverless functions directly
  if (!isVercel) {
    // Serve static files
    serveStatic(app);

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`serving on port ${port}`);
    });
  }
})();
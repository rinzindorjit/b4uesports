import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { initializePackages } from "./utils/initialize-packages.js";
import { updatePackageImages } from "./utils/update-package-images.js";
dotenv.config();
const app = express();
const server = createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const isDevelopment = process.env.NODE_ENV === "development";
const isVercel = !!process.env.VERCEL;
if (isDevelopment && !isVercel) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
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
          logLine = logLine.slice(0, 79) + "\u2026";
        }
        log(logLine);
      }
    });
    next();
  });
}
(async () => {
  if (!isVercel) {
    await initializePackages();
    await updatePackageImages();
  }
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    if (!isVercel) {
      throw err;
    }
  });
  if (!isVercel) {
    if (isDevelopment) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen({
      port,
      host: "0.0.0.0"
    }, () => {
      log(`serving on port ${port}`);
    });
  }
})();

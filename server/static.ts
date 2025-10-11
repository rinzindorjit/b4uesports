import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Add logging for static file requests
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/')) {
      log(`Static file request: ${req.method} ${req.path}`);
    }
    next();
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist, but exclude API routes
  app.use("*", (req, res, next) => {
    // Don't handle API routes with the frontend catch-all
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    log(`Serving index.html for: ${req.path}`);
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
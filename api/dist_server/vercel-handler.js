import express from "express";
import serverless from "serverless-http";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
(async () => {
  try {
    const { registerRoutes } = await import("./routes");
    await registerRoutes(app);
  } catch (error) {
    console.error("Failed to register routes:", error);
  }
})();
const handler = serverless(app);
var vercel_handler_default = handler;
export {
  vercel_handler_default as default
};

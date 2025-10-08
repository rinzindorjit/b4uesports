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
import { default as default2 } from "../api/users.js";
import { default as default3 } from "../api/packages.js";
import { default as default4 } from "../api/pi-price.js";
import { default as default5 } from "../api/payments.js";
import { default as default6 } from "../api/transactions.js";
import { default as default7 } from "../api/admin.js";
import { default as default8 } from "../api/test.js";
export {
  default7 as admin,
  vercel_handler_default as default,
  default3 as packages,
  default5 as payments,
  default4 as piPrice,
  default8 as test,
  default6 as transactions,
  default2 as users
};

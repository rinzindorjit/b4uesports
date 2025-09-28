import { Admin } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
    }
  }
}
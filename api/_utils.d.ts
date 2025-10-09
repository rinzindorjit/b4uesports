// TypeScript declaration file for _utils.js

declare module './_utils' {
  import { Jwt, JwtPayload } from 'jsonwebtoken';
  
  interface User {
    username: string;
    pi_id: string;
    email: string;
  }
  
  interface Payment {
    id: string;
    user: string;
    amount: number;
    method: string;
    date: Date;
  }
  
  interface Transaction {
    id: string;
    user: string;
    amount: number;
    date: Date;
  }
  
  interface Store {
    users: Record<string, User>;
    transactions: Transaction[];
    packages: Array<{ id: number; name: string; price: number }>;
    payments: Payment[];
  }
  
  interface PiNetworkService {
    verifyAccessToken: (accessToken: string) => Promise<{
      username: string;
      pi_id: string;
      email: string;
    }>;
  }
  
  export function getStorage(): Store;
  export function getPiNetworkService(): PiNetworkService;
  export function jwtSign(payload: any): string;
  export function jwtVerify(token: string): JwtPayload | string;
  export const jwt: Jwt;
  export const bcrypt: any;
  export const JWT_SECRET: string;
}

export {};
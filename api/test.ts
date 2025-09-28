import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  return response.status(200).json({
    message: 'Serverless function is working!',
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
  });
}
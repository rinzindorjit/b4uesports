# B4U Esports - Pi Network Gaming Marketplace

## Overview
B4U Esports is a Pi Network integrated marketplace for purchasing in-game currencies with Pi coins. This platform provides a secure, fast, and reliable environment for gamers to buy gaming credits.

## Deployment to Vercel

### Prerequisites
- A Vercel account
- This repository

### Deployment Steps
1. Push this repository to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Configure the following environment variables in Vercel:
   - `PI_API_KEY` - Your Pi Network API key
   - `PI_SECRET_KEY` - Your Pi Network secret key
   - `EMAILJS_SERVICE_ID` - Your EmailJS service ID
   - `EMAILJS_TEMPLATE_ID` - Your EmailJS template ID
   - `EMAILJS_PUBLIC_KEY` - Your EmailJS public key
   - `JWT_SECRET` - Secret for JWT token generation
   - `DATABASE_URL` - Connection string for your PostgreSQL database

### Vercel Configuration
The `vercel.json` file in the root directory configures:
- Build process using `@vercel/node`
- Routing for API endpoints and client-side application
- Environment variables

### Build Process
Vercel will automatically:
1. Install dependencies
2. Build the client application with Vite
3. Bundle the server with esbuild
4. Deploy the application

## Development
To run locally:
```bash
npm install
npm run dev
```

For preview mode (without database):
```bash
npm run preview
```

## Project Structure
- `/client` - Frontend React application
- `/server` - Backend API and server logic
- `/api` - API endpoints
- `/shared` - Shared types and utilities
- `/public` - Static assets
- `/uploads` - User uploaded files (in production)

## Features
- Pi Network payment integration
- Profile management with verification
- Gaming currency packages for PUBG and Mobile Legends
- Email notifications via EmailJS
- Responsive design for all devices
- Live Pi price tracking
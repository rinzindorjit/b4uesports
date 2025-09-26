#!/bin/bash

# Deployment script for B4U Esports Pi Network integration

echo "🚀 Starting deployment process..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔍 Checking for syntax errors..."
npm run lint

echo "🧪 Running tests..."
npm test

echo "📤 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "📝 You can now test the Pi Network integration at:"
echo "   https://b4uesports.vercel.app/pi-test.html"

echo "📊 Current Serverless Function count:"
echo "   1. api/diagnose-pi-issue.js"
echo "   2. api/mock-pi-payment.js"
echo "   3. api/pi/auth.js"
echo "   4. api/pi/create-payment.js"
echo "   5. api/pi/payment-approval.js"
echo "   6. api/pi/payment-completion.js"
echo "   7. api/pi/payments.js"
echo "   8. api/pi/user.js"
echo "   9. api/pi/webhook.js"
echo "   (Total: 9 functions within the 12-function limit)"
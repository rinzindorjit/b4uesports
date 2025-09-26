@echo off
echo ========================================
echo B4U Esports - Pi Network API Fix Deployment
echo ========================================

echo.
echo 1. Adding all changes to git...
git add .

echo.
echo 2. Committing changes...
git commit -m "Fix Pi Network API 403 errors: Enhanced error handling and CDN detection"

echo.
echo 3. Pushing to repository...
git push origin main

echo.
echo 4. Triggering Vercel deployment...
echo    Note: Vercel will automatically deploy when you push to main branch

echo.
echo ========================================
echo Deployment completed!
echo ========================================
echo Next steps:
echo 1. Check Vercel dashboard for deployment status
echo 2. Verify environment variables in Vercel:
echo    - PI_SERVER_API_KEY=2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya
echo    - PI_SANDBOX_MODE=true
echo    - NODE_ENV=development
echo 3. Test the fix with:
echo    curl -X POST https://b4uesports.vercel.app/api/pi/create-payment ^
echo    -H "Content-Type: application/json" ^
echo    -d "{\"paymentData\":{\"amount\":1.0,\"memo\":\"Test Payment\",\"metadata\":{\"test\":true}}}"
echo ========================================

pause
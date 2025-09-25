@echo off
echo Adding debug logging to API handlers...
git add .
git commit -m "Add debug logging to API handlers to troubleshoot 404 error"
git push origin main
echo Debug changes pushed to GitHub. Please redeploy on Netlify to see the debug output.
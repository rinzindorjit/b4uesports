@echo off
cd /d "c:\Users\HP\B4U Esports"
git add README.md ENVIRONMENTS.md AUTHENTICATION.md DEPLOYMENT.md package.json vercel.json
git commit -m "docs: Add comprehensive documentation for environments, authentication, and deployment"
git push origin main
echo Changes committed and pushed to GitHub
pause
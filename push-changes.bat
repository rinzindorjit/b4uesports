@echo off
echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Implement Pi SDK testnet support and mock payment system improvements"

echo Pushing to GitHub...
git push origin main

echo Done!
pause
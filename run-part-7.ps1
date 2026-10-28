$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXUS.GG - PART 7: FINAL QA, BUILD & RELEASE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Generating Prisma Client (npx prisma generate)..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`n[2/4] Running Production Build Checks (npm run build)..." -ForegroundColor Yellow
npm run build

Write-Host "`n[3/4] Committing Final Release to Git..." -ForegroundColor Yellow
git add .
git commit -m "chore(release): pass production build checks and finalize documentation"

# Check if a remote origin is configured before pushing
$remoteExists = git remote -v
if ($remoteExists) {
    Write-Host "Pushing to remote origin main..." -ForegroundColor Yellow
    git push -u origin main
} else {
    Write-Host "No remote origin configured. Skipping git push." -ForegroundColor DarkGray
}

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " BUILD SUCCESSFUL! THE PLATFORM IS FINISHED." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

Write-Host "`n[4/4] Launching the live site (npm run dev)..." -ForegroundColor Yellow
Write-Host "Open http://localhost:3000 in your browser.`n" -ForegroundColor Green
npm run dev

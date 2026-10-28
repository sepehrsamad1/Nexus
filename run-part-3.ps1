$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXUS.GG - PART 3: METACRITIC GRADING ENGINE & VOD HUB" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Validating TypeScript compilation (npx tsc --noEmit)..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`n[2/2] Committing Part 3 milestone to Git..." -ForegroundColor Yellow
git add .
git commit -m "feat(reviews): build Metacritic grading engine, score badges, and streamer VOD hub"

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " PART 3 COMPLETE! The Metacritic Engine is live." -ForegroundColor Green
Write-Host " Run 'npm run dev', visit http://localhost:3000/games, and test reviewing as a Streamer!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

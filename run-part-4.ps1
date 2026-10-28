$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXUS.GG - PART 4: REDDIT-STYLE RECURSIVE COMMENTS & VOTING" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Validating TypeScript compilation (npx tsc --noEmit)..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`n[2/2] Committing Part 4 milestone to Git..." -ForegroundColor Yellow
git add .
git commit -m "feat(community): add Reddit-style recursive comment trees, voting, and discussion feed"

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " PART 4 COMPLETE! Reddit discussion threads are active." -ForegroundColor Green
Write-Host " Run 'npm run dev', go to Community, and try replying to nested comments!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

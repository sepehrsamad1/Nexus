$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXUS.GG - PART 5: E-COMMERCE STOREFRONT & ZUSTAND CART" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Validating TypeScript compilation (npx tsc --noEmit)..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`n[2/2] Committing Part 5 milestone to Git..." -ForegroundColor Yellow
git add .
git commit -m "feat(store): implement gaming gear storefront, persistent cart, and streamer gear cross-sell"

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " PART 5 COMPLETE! The Storefront and Cart Drawer are active." -ForegroundColor Green
Write-Host " Run 'npm run dev' and try buying a Game Key or Pro Mouse!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

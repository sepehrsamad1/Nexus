$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXUS.GG - PART 6: CHECKOUT, KEY DELIVERY & ADMIN PORTAL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Validating TypeScript compilation (npx tsc --noEmit)..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`n[2/2] Committing Part 6 milestone to Git..." -ForegroundColor Yellow
git add .
git commit -m "feat(checkout-admin): add checkout flow, automated game key delivery, and admin portal"

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " PART 6 COMPLETE! Checkout and Admin Dashboard are live." -ForegroundColor Green
Write-Host " Run 'npm run dev', test the simulated checkout, and visit /admin!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

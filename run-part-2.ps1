$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXUS.GG - PART 2: RBAC AUTH & DATABASE SEEDING" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Ensuring Prisma Client is up-to-date (npx prisma db push)..." -ForegroundColor Yellow
npx prisma db push

Write-Host "`n[2/4] Running Database Seed Script (npx tsx prisma/seed.ts)..." -ForegroundColor Yellow
npx tsx prisma/seed.ts

Write-Host "`n[3/4] Validating TypeScript compilation (npx tsc --noEmit)..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`n[4/4] Committing Part 2 milestone to Git..." -ForegroundColor Yellow
git add .
git commit -m "feat(auth-seed): implement RBAC role switcher, global navbar, and rich database seed"

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " PART 2 COMPLETE! Your database is seeded and Navbar is active." -ForegroundColor Green
Write-Host " You can run 'npm run dev' to view the UI, or proceed to Prompt 3." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

$ErrorActionPreference = "Stop"

# The university demo intentionally uses a local SQLite database.
# Setting the value explicitly makes the launcher work on a fresh laptop even when .env is absent,
# and prevents a temporary QA DATABASE_URL override from leaking into the demo.
$env:DATABASE_URL = "file:./dev.db"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXUS UNIVERSITY DEMO LAUNCHER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "[1/4] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "[2/4] Synchronizing local demo database..." -ForegroundColor Yellow
npx prisma db push

Write-Host "[3/4] Seeding deterministic demo data..." -ForegroundColor Yellow
npx tsx prisma/seed.ts

Write-Host "[4/4] Starting Nexus..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Control Center: http://localhost:3000/demo-control.html" -ForegroundColor Green
Write-Host "Demo Sign-In:   http://localhost:3000/demo-login" -ForegroundColor Green
Write-Host "Press Ctrl+C in this window to stop Nexus." -ForegroundColor Yellow
Write-Host ""

Start-Process "http://localhost:3000/demo-control.html"
npm run dev

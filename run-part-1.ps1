$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXUS.GG - PART 1: INITIALIZATION, PRISMA & GIT MILESTONE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`n[1/5] Installing Node.js dependencies (npm install)..." -ForegroundColor Yellow
npm install

Write-Host "`n[2/5] Generating Prisma Client (npx prisma generate)..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`n[3/5] Creating local SQLite database & pushing schema (npx prisma db push)..." -ForegroundColor Yellow
npx prisma db push

Write-Host "`n[4/5] Validating TypeScript compilation (npx tsc --noEmit)..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`n[5/5] Initializing Git repository and committing Part 1 milestone..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
}
git branch -M main
git add .
git commit -m "feat(init): scaffold Next.js 15 app and unified Prisma SQLite schema"

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " PART 1 COMPLETE! Ready for Prompt 2." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

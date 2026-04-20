# apply-vercel-log-fix.ps1
# ------------------------------------------------------------------
# Applies the root vercel.json log-dump change, commits, pushes.
# Run from the repo root:  .\apply-vercel-log-fix.ps1
# ------------------------------------------------------------------

$ErrorActionPreference = 'Stop'

Write-Host "[1/6] Ensuring clean git state..." -ForegroundColor Cyan
git am --abort 2>$null
git rebase --abort 2>$null
Remove-Item .git\index.lock -Force -ErrorAction SilentlyContinue

Write-Host "[2/6] Syncing with origin/main..." -ForegroundColor Cyan
git fetch origin main
git reset --hard origin/main

Write-Host "[3/6] Writing new root vercel.json..." -ForegroundColor Cyan
$json = @'
{
    "version": 2,
    "installCommand": "npm install --include=dev --loglevel=verbose || (echo === NPM DEBUG LOG === ; tail -n 2000 /vercel/.npm/_logs/*-debug-*.log ; exit 1)",
    "buildCommand": "npm run build --workspace=frontend",
    "outputDirectory": "frontend/dist",
    "functions": {
        "api/index.js": {
            "maxDuration": 10,
            "memory": 256,
            "includeFiles": "backend/**"
        }
    },
    "rewrites": [
        { "source": "/health", "destination": "/api/index.js" },
        { "source": "/api/(.*)", "destination": "/api/index.js" },
        { "source": "/(.*)", "destination": "/index.html" }
    ]
}
'@
Set-Content -Path vercel.json -Value $json -Encoding utf8

Write-Host "[4/6] Staging..." -ForegroundColor Cyan
git add vercel.json

Write-Host "[5/6] Committing..." -ForegroundColor Cyan
git commit -m "ci(vercel): wrap root installCommand to dump npm debug log on failure"

Write-Host "[6/6] Pushing to origin/main..." -ForegroundColor Cyan
git push origin main

Write-Host ""
Write-Host "Done. Now on Vercel:" -ForegroundColor Green
Write-Host "  Deployments -> latest -> ... -> Redeploy" -ForegroundColor Green
Write-Host "  Uncheck 'Use existing Build Cache'" -ForegroundColor Green

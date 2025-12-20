# PowerShell version - Quick commands untuk PWA FireGuard

Write-Host "🔥 FireGuard PWA - Quick Commands" -ForegroundColor Red
Write-Host ""

# Menu
Write-Host "Pilih action:" -ForegroundColor Yellow
Write-Host "1. Build production"
Write-Host "2. Start production server"
Write-Host "3. Test dengan ngrok (untuk testing di HP)"
Write-Host "4. Generate icons baru"
Write-Host "5. Clear cache dan rebuild"
Write-Host "6. Check PWA status"
Write-Host ""

$choice = Read-Host "Pilih (1-6)"

switch ($choice) {
    "1" {
        Write-Host "Building production..." -ForegroundColor Green
        npm run build
    }
    "2" {
        Write-Host "Starting production server..." -ForegroundColor Green
        npm start
    }
    "3" {
        Write-Host "Starting server dengan ngrok..." -ForegroundColor Green
        Start-Process npm -ArgumentList "start" -NoNewWindow
        Start-Sleep -Seconds 3
        .\ngrok.exe http 3000
    }
    "4" {
        $icon_path = Read-Host "Path ke icon (kosongkan untuk placeholder)"
        if ([string]::IsNullOrWhiteSpace($icon_path)) {
            python scripts\generate-icons.py
        }
        else {
            python scripts\generate-icons.py $icon_path
        }
    }
    "5" {
        Write-Host "Clearing cache..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
        Write-Host "Rebuilding..." -ForegroundColor Green
        npm run build
    }
    "6" {
        Write-Host "`nChecking PWA files..." -ForegroundColor Cyan
        
        # Check manifest
        if (Test-Path "public\manifest.json") {
            Write-Host "✅ manifest.json exists" -ForegroundColor Green
        }
        else {
            Write-Host "❌ manifest.json missing" -ForegroundColor Red
        }
        
        # Check service worker
        if (Test-Path "public\sw.js") {
            Write-Host "✅ sw.js exists" -ForegroundColor Green
        }
        else {
            Write-Host "❌ sw.js missing" -ForegroundColor Red
        }
        
        # Check icons
        $iconCount = (Get-ChildItem "public\icons\icon-*.png" -ErrorAction SilentlyContinue).Count
        Write-Host "✅ $iconCount icons found" -ForegroundColor Green
        
        # Check offline page
        if (Test-Path "public\offline.html") {
            Write-Host "✅ offline.html exists" -ForegroundColor Green
        }
        else {
            Write-Host "❌ offline.html missing" -ForegroundColor Red
        }
        
        # Check PWA component
        if (Test-Path "src\components\PWAInstallPrompt.tsx") {
            Write-Host "✅ PWAInstallPrompt component exists" -ForegroundColor Green
        }
        else {
            Write-Host "❌ PWAInstallPrompt component missing" -ForegroundColor Red
        }
        
        Write-Host "`nPWA is ready! Run 'npm start' to test." -ForegroundColor Cyan
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

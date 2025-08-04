param([string]$Action)

if ($Action -eq "install") {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Green
    composer install
}
elseif ($Action -eq "quality") {
    Write-Host "🔍 Running quality checks..." -ForegroundColor Green
    composer quality
}
elseif ($Action -eq "cs-fix") {
    Write-Host "🎨 Fixing code style..." -ForegroundColor Green
    composer cs-fix
}
elseif ($Action -eq "phpstan") {
    Write-Host "🔬 Running static analysis..." -ForegroundColor Green
    composer phpstan
}
elseif ($Action -eq "test") {
    Write-Host "🧪 Running tests..." -ForegroundColor Green
    php bin/phpunit
}
elseif ($Action -eq "dev") {
    Write-Host "🚀 Starting development server..." -ForegroundColor Green
    symfony server:start -d
}
elseif ($Action -eq "stop") {
    Write-Host "🛑 Stopping development server..." -ForegroundColor Green
    symfony server:stop
}
else {
    Write-Host "Usage: .\scripts.ps1 [install|quality|cs-fix|phpstan|test|dev|stop]" -ForegroundColor Yellow
}

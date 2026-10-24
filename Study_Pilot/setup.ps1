$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Test-Path package.json)) { Write-Host "Palaid so skriptu Study_Pilot mape"; exit 1 }
Write-Host "== 2. solis: tiru Supabase =="
npm uninstall @supabase/supabase-js
Remove-Item -ErrorAction SilentlyContinue src/services/supabaseClient.js, src/services/examService.js, src/services/api.js
Write-Host "== 3. solis: datubaze =="
if (-not (Test-Path .env)) {
  $pw = -join ((48..57 + 97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
  "POSTGRES_PASSWORD=$pw" | Out-File -Encoding ascii .env
}
$pw = (Get-Content .env | Where-Object { $_ -match '^POSTGRES_PASSWORD=' }) -replace '^POSTGRES_PASSWORD=',''
"DATABASE_URL=postgres://sp:$pw@localhost:5432/sp" | Out-File -Encoding ascii .env.local
npm install pg
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
Start-Sleep -Seconds 5
docker compose exec db psql -U sp -c "\dt"
Write-Host "Gatavs: jabut tabulam users un sessions."

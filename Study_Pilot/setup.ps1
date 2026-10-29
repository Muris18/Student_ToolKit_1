# Lokala uzstadisana (Windows PowerShell). Palaid mape Study_Pilot:
#   powershell -ExecutionPolicy Bypass -File setup.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Test-Path package.json)) { Write-Host "Palaid so skriptu Study_Pilot mape"; exit 1 }

Write-Host "== 1. .env un .env.local =="
if (-not (Test-Path .env)) {
  $pw = -join ((48..57 + 97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
  "POSTGRES_PASSWORD=$pw" | Out-File -Encoding ascii .env
  "# Ja ports 5432 ir aiznemts, nomaini uz DB_PORT=5433 (un palaid skriptu velreiz pec .env.local dzesanas)" | Out-File -Encoding ascii -Append .env
  "DB_PORT=5432" | Out-File -Encoding ascii -Append .env
}
$pw = (Get-Content .env | Where-Object { $_ -match '^POSTGRES_PASSWORD=' }) -replace '^POSTGRES_PASSWORD=',''
$port = ((Get-Content .env | Where-Object { $_ -match '^DB_PORT=' }) -replace '^DB_PORT=','')
if (-not $port) { $port = "5432" }
if (-not (Test-Path .env.local)) {
  "DATABASE_URL=postgres://sp:$pw@localhost:$port/sp" | Out-File -Encoding ascii .env.local
} else {
  Write-Host ".env.local jau ir, to nepararstu (parbaudi, ka DATABASE_URL ports ir $port)"
}

Write-Host "== 2. pakotnes =="
npm install

Write-Host "== 3. datubaze (Docker) =="
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
Start-Sleep -Seconds 5

Write-Host "== 4. migracijas un eksameni =="
npm run migrate
npm run import:exams

Write-Host "Gatavs. Palaid: npm run dev  ->  http://localhost:3000"

#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
[ -f package.json ] || { echo "Palaid so skriptu Study_Pilot mape"; exit 1; }
echo "== 2. solis: tiru Supabase =="
npm uninstall @supabase/supabase-js
rm -f src/services/supabaseClient.js src/services/examService.js src/services/api.js
echo "== 3. solis: datubaze =="
if [ ! -f .env ]; then
  PW=$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')
  echo "POSTGRES_PASSWORD=$PW" > .env
fi
PW=$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2)
echo "DATABASE_URL=postgres://sp:$PW@localhost:5432/sp" > .env.local
npm install pg
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
sleep 5
docker compose exec db psql -U sp -c "\dt"
echo "Gatavs: jabut tabulam users un sessions."

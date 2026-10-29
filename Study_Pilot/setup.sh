#!/usr/bin/env bash
# Lokala uzstadisana (Linux/macOS/Git Bash). Palaid mape Study_Pilot: bash setup.sh
set -e
cd "$(dirname "$0")"
[ -f package.json ] || { echo "Palaid so skriptu Study_Pilot mape"; exit 1; }

echo "== 1. .env un .env.local =="
if [ ! -f .env ]; then
  PW=$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')
  printf 'POSTGRES_PASSWORD=%s\n# Ja ports 5432 ir aiznemts, nomaini uz DB_PORT=5433\nDB_PORT=5432\n' "$PW" > .env
fi
PW=$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2)
PORT=$(grep '^DB_PORT=' .env | cut -d= -f2); PORT=${PORT:-5432}
if [ ! -f .env.local ]; then
  echo "DATABASE_URL=postgres://sp:$PW@localhost:$PORT/sp" > .env.local
else
  echo ".env.local jau ir, to nepararstu (parbaudi, ka DATABASE_URL ports ir $PORT)"
fi

echo "== 2. pakotnes =="
npm install

echo "== 3. datubaze (Docker) =="
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
sleep 5

echo "== 4. migracijas un eksameni =="
npm run migrate
npm run import:exams

echo "Gatavs. Palaid: npm run dev  ->  http://localhost:3000"

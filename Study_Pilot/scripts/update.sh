#!/usr/bin/env bash
# Atjaunina Study Pilot serverī uz jaunāko versiju no GitHub (dati un .env paliek).
#   sudo bash scripts/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."
echo "== Rezerves kopija pirms atjaunināšanas"
mkdir -p backups
docker compose exec -T db pg_dump -U sp -Fc sp > "backups/sp-pirms-atjauninasanas-$(date +%Y-%m-%d_%H%M).dump" && echo "✔ kopija backups/ mapē"
echo "== Lejupielādē jaunāko kodu"
git pull --ff-only
echo "== Būvē un pārstartē (migrācijas izpildās automātiski)"
docker compose up -d --build
docker compose exec -T app npm run -s import:exams || true
docker image prune -f >/dev/null
echo "✔ Gatavs. Žurnāli: docker compose logs -f app"

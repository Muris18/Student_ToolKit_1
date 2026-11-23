#!/usr/bin/env bash
# Slēgta beta: nodrošina, ka .env ir paroles aizsardzības hash (Caddy basic_auth).
# Ja BASIC_AUTH_HASH jau ir, neko nemaina. Ja nav, ģenerē jaunu paroli, ieraksta .env TIKAI hash
# (vienpēdiņās, lai "$" netiktu interpretēti) un parāda paroli vienreiz.
# Izsauc: scripts/server-setup.sh un scripts/update.sh (compose bez hash neiet). Skat. DEPLOY.md, sadaļa 5a.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "! Nav .env (vispirms palaid scripts/server-setup.sh)" >&2; exit 1; }
if grep -q '^BASIC_AUTH_HASH=.\+' .env; then
  exit 0
fi

PASS="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-16)"
HASH="$(docker run --rm caddy:2 caddy hash-password --plaintext "$PASS")"
[ -n "$HASH" ] || { echo "! Neizdevās izveidot paroles hash" >&2; exit 1; }
{
  echo ""
  echo "# Slēgta beta (Caddy paroles aizsardzība). Atvērt publiski: skat. DEPLOY.md"
  echo "BASIC_AUTH_USER=beta"
  echo "BASIC_AUTH_HASH='$HASH'"
} >> .env

printf '\033[1;32m✔ Ģenerēta paroles aizsardzība vietnei\033[0m\n'
echo "   Lietotājs: beta"
echo "   Parole:    $PASS"
printf '\033[1;31m! Pieraksti šo paroli: tā vairs netiks rādīta (serverī glabājas tikai hash).\033[0m\n'

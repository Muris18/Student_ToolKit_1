#!/bin/sh
# Automātiskas datubāzes rezerves kopijas (docker-compose servisā "backup").
# Reizi BACKUP_INTERVAL sekundēs (noklusēti 24 h) izveido /backups/sp-<laiks>.dump
# un izdzēš kopijas, kas vecākas par BACKUP_KEEP_DAYS dienām (noklusēti 7).
# Termiņam jāsakrīt ar content/privacy.md 6. sadaļu.
# Savienojums: PGHOST, PGUSER, PGPASSWORD, PGDATABASE (no docker-compose.yml).
set -u
KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"
INTERVAL="${BACKUP_INTERVAL:-86400}"
DIR="${BACKUP_DIR:-/backups}"
mkdir -p "$DIR"

until pg_isready -q; do
  echo "Gaidu datubāzi…"
  sleep 5
done

while true; do
  f="$DIR/sp-$(date -u +%Y-%m-%d_%H%M%S).dump"
  # Vispirms raksta .tmp failā, lai nepabeigta kopija nekad neizskatītos pēc gatavas
  if pg_dump -Fc -f "$f.tmp"; then
    mv "$f.tmp" "$f"
    chmod 600 "$f"
    echo "Rezerves kopija izveidota: $(basename "$f") ($(du -h "$f" | cut -f1))"
  else
    rm -f "$f.tmp"
    echo "KĻŪDA: rezerves kopiju neizdevās izveidot" >&2
  fi
  # Dzēš kopijas, kas vecākas par KEEP_DAYS dienām
  find "$DIR" -maxdepth 1 -name 'sp-*.dump' -type f -mmin +$((KEEP_DAYS * 1440)) -print -delete | sed 's#.*/#Dzēsta vecā kopija: #'
  sleep "$INTERVAL"
done

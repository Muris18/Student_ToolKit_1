#!/usr/bin/env bash
# =====================================================================
# Study Pilot servera iestatīšana ar vienu komandu (Ubuntu 22.04 / 24.04, piem. Hetzner Cloud).
#
#   git clone https://github.com/Muris18/Student_ToolKit_1.git
#   cd Student_ToolKit_1/Study_Pilot
#   sudo bash scripts/server-setup.sh
#
# Skripts: uzinstalē Docker, ieslēdz ugunsmūri, izveido .env (prasa domēnu un atslēgas),
# palaiž datubāzi + lietotni + HTTPS, ielādē eksāmenus un izveido administratora kontu.
# Drīkst palaist atkārtoti — esošo .env un datus tas nemaina.
# =====================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

say()  { printf '\n\033[1;33m== %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;31m! %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { warn "Palaid ar sudo: sudo bash scripts/server-setup.sh"; exit 1; }
[ -f docker-compose.yml ] || { warn "Palaid skriptu no mapes Study_Pilot"; exit 1; }

say "1/7 Sistēmas pakotnes"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl git ufw openssl dnsutils unattended-upgrades >/dev/null
ok "Pakotnes gatavas (drošības atjauninājumi instalēsies automātiski)"

say "2/7 Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh >/dev/null
fi
systemctl enable --now docker >/dev/null 2>&1 || true
docker compose version >/dev/null || { warn "docker compose nav pieejams"; exit 1; }
ok "$(docker --version)"

say "3/7 Ugunsmūris (atļauti tikai SSH, HTTP, HTTPS)"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null
ok "Ugunsmūris ieslēgts"

say "3b/7 SSH nostiprināšana (fail2ban un paroles pieteikšanās)"
# fail2ban: noklusējuma SSH jail (Ubuntu to ieslēdz pēc noklusējuma) bloķē IP adreses ar daudziem nepareiziem mēģinājumiem
if apt-get install -y -qq fail2ban >/dev/null 2>&1 && systemctl enable --now fail2ban >/dev/null 2>&1; then
  ok "fail2ban ieslēgts"
else
  warn "fail2ban neizdevās uzstādīt (turpinu bez tā)"
fi

# SSH paroles pieteikšanos izslēdz TIKAI tad, ja serverī jau ir vismaz viena SSH atslēga (root vai sudo lietotājam).
# Citādi neko nemaina, jo tā var sevi izslēgt no servera.
harden_ssh() {
  local conf=/etc/ssh/sshd_config.d/99-studypilot.conf f home has_key=0
  home="$(getent passwd "${SUDO_USER:-root}" | cut -d: -f6 || true)"
  for f in /root/.ssh/authorized_keys "${home:+$home/.ssh/authorized_keys}"; do
    [ -n "$f" ] && [ -s "$f" ] || continue
    # derīga rinda: nav komentārs un satur atslēgas veidu (ssh-ed25519, ssh-rsa, ecdsa-sha2-*, sk-*)
    if grep -Ev '^[[:space:]]*(#|$)' "$f" | grep -Eq '(^|[[:space:]])(ssh-(rsa|ed25519|dss)|ecdsa-sha2-[a-z0-9]+|sk-[a-z0-9@.-]+) '; then has_key=1; fi
  done
  if [ "$has_key" -ne 1 ]; then
    warn "Serverī nav nevienas SSH atslēgas (/root/.ssh/authorized_keys vai sudo lietotāja), tāpēc SSH paroles pieteikšanos NEIZSLĒDZU."
    warn "Pievieno atslēgu (ssh-copy-id), pārbaudi, ka ieej ar to, un palaid šo skriptu vēlreiz."
    return 0
  fi
  mkdir -p /etc/ssh/sshd_config.d
  printf '# Study Pilot: tikai SSH atslēgas (skat. scripts/server-setup.sh)\nPasswordAuthentication no\nPermitRootLogin prohibit-password\n' > "$conf"
  if sshd -t 2>/dev/null; then
    systemctl reload ssh >/dev/null 2>&1 || systemctl reload sshd >/dev/null 2>&1 || true
    if sshd -T 2>/dev/null | grep -qi '^passwordauthentication no'; then
      ok "SSH paroles pieteikšanās izslēgta (tikai atslēgas)"
    else
      warn "Ierakstīju $conf, bet sshd joprojām atļauj paroles (kāds cits fails to pārraksta). Pārbaudi: grep -ri passwordauthentication /etc/ssh/sshd_config /etc/ssh/sshd_config.d/"
    fi
  else
    rm -f "$conf"  # konfigurācija nederīga: izmaiņas atceltas, sshd nepārlādēts
    warn "sshd -t atrada kļūdu: SSH izmaiņas atceltas, pieteikšanās netiek mainīta"
  fi
}
harden_ssh

# Next.js būvēšanai vajag atmiņu: ja RAM < 3 GB un nav swap, izveidojam 2 GB swap
if [ "$(free -m | awk '/Mem:/{print $2}')" -lt 3000 ] && [ "$(swapon --show | wc -l)" -eq 0 ]; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  ok "Izveidots 2 GB swap"
fi

say "4/7 Iestatījumi (.env)"
if [ -f .env ] && grep -q '^DOMAIN=.\+' .env && grep -q '^POSTGRES_PASSWORD=.\+' .env; then
  ok ".env jau eksistē — atstāju kā ir"
else
  read -rp "Domēns (piem. studypilot.lv): " DOMAIN
  DOMAIN="${DOMAIN#https://}"; DOMAIN="${DOMAIN#http://}"; DOMAIN="${DOMAIN%/}"
  [ -n "$DOMAIN" ] || { warn "Domēns ir obligāts"; exit 1; }
  read -rp "DeepSeek API atslēga (Enter — pievienosi vēlāk): " DEEPSEEK
  read -rp "Premium cenas teksts sākumlapai (piem. 4,99 € / mēnesī, Enter — vēlāk): " PRICE
  umask 077
  cat > .env <<ENV
DOMAIN=$DOMAIN
POSTGRES_PASSWORD=$(openssl rand -hex 24)
DEEPSEEK_API_KEY=$DEEPSEEK
PREMIUM_PRICE_TEXT=$PRICE

# E-pasts (Brevo/Resend) — skat. DEPLOY.md
EMAIL_PROVIDER=brevo
EMAIL_API_KEY=
EMAIL_FROM=Study Pilot <jautajumi@$DOMAIN>

# Stripe — skat. DEPLOY.md
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
ENV
  chmod 600 .env
  ok ".env izveidots (datubāzes parole ģenerēta automātiski)"
fi
DOMAIN="$(grep '^DOMAIN=' .env | cut -d= -f2-)"

say "5/7 DNS pārbaude"
SERVER_IP="$(curl -fsS4 https://api.ipify.org || true)"
DNS_IP="$(dig +short A "$DOMAIN" | tail -1)"
if [ -n "$SERVER_IP" ] && [ "$SERVER_IP" = "$DNS_IP" ]; then
  ok "$DOMAIN -> $SERVER_IP"
else
  warn "$DOMAIN rāda uz '${DNS_IP:-nekur}', bet šī servera IP ir '${SERVER_IP:-?}'."
  warn "Domēna reģistratorā izveido A ierakstu: $DOMAIN -> $SERVER_IP (un www -> $SERVER_IP)."
  warn "HTTPS sertifikāts tiks izsniegts automātiski, tiklīdz DNS būs pareizs (var aizņemt līdz 1 h)."
fi

say "6/7 Būvē un palaiž (pirmo reizi 3–8 minūtes)"
mkdir -p backups
docker compose up -d --build
printf 'Gaidu lietotni'
for i in $(seq 1 90); do
  if docker compose exec -T app wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1; then echo; ok "Lietotne darbojas"; break; fi
  printf '.'; sleep 4
  [ "$i" -eq 90 ] && { echo; warn "Lietotne neatbild. Skaties: docker compose logs app"; exit 1; }
done
docker compose exec -T app npm run -s import:exams

say "7/7 Administrators"
if [ "$(docker compose exec -T db psql -U sp -d sp -tAc "SELECT count(*) FROM users WHERE role='admin'")" -gt 0 ]; then
  ok "Administrators jau ir"
else
  read -rp "Administratora e-pasts: " ADMIN_EMAIL
  ADMIN_PASS="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-16)"
  docker compose exec -T app npm run -s create-admin -- "$ADMIN_EMAIL" "$ADMIN_PASS" "Admin"
  echo
  echo "   E-pasts: $ADMIN_EMAIL"
  echo "   Parole:  $ADMIN_PASS"
  warn "Pieraksti paroli un pēc pieslēgšanās nomaini to profilā!"
fi

say "Gatavs!"
echo "   Vietne:      https://$DOMAIN"
echo "   Admin panelis: https://$DOMAIN/admin"
echo "   Atjaunināt:  sudo bash scripts/update.sh"
echo "   Žurnāli:     docker compose logs -f app"
echo "   Atslēgu (DeepSeek, e-pasts, Stripe) pievienošana: nano .env, tad: docker compose up -d"

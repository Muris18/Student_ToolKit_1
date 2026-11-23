# Pārskatītais plāns: serveris, domēns un slēgta piekļuve

**Mērķis:** pieslēgt domēnu un serveri, uzstādīt visu (HTTPS, e-pasts, maksājumu tests, rezerves kopijas) un pārbaudīt to darbībā. **Beta versija nebūs pieejama nevienam** — vietne serverī ir slēgta ar paroli, publiskas palaišanas un skolēnu nav.

> Datumi zemāk ir pieņēmumi, balstīti uz iepriekšējo plānu (serveris 25.11., pārbaude 26.11.). Publiskā palaišana 27.11. ir **atcelta**; jaunu palaišanas datumu nosaka vadītājs.

## Kas mainās salīdzinājumā ar iepriekšējo plānu
| Bija | Tagad |
|---|---|
| Beta palaišana 27.11. visiem | **Nav.** Palaišanas datums vēl nav noteikts |
| Skolēnu reģistrācija | Nav; piekļuve tikai komandai |
| Teksti un atbilstība pirms palaišanas | Joprojām vajadzīgi, bet nav steidzami; jābūt gataviem līdz publiskai palaišanai |
| Video un reklāma | Atlikta (video ir gatavs, bet netiek publicēts) |

## Piekļuves slēgšana (izvēlēts: Caddy paroles aizsardzība)
- Visu vietni slēdz ar vienu kopīgu paroli (Caddy `basic_auth`; parole `.env`/Caddy konfigurācijā kā hash, nekad skaidrā tekstā repozitorijā).
- **Izņēmumi bez paroles** (citādi tie nedarbosies): `/api/billing/webhook` (Stripe nevar ievadīt paroli; to jau aizsargā Stripe paraksts) un `/api/health` (uzraudzībai).
- Meklētājprogrammām: `X-Robots-Tag: noindex` un `robots.txt` ar `Disallow: /`.
- Pārbaude: no cita tīkla bez paroles jāsaņem 401; ar paroli lietotne strādā.
- Kad nolemts palaist: parole tiek noņemta un tiek izpildīts palaišanas kontrolsaraksts (`PARBAUDE_PIRMS_PALAISANAS.md`).

## Darbi pa posmiem

### 1. Serveris (Hetzner) — `DEPLOY.md`, `scripts/server-setup.sh`
- [ ] Hetzner Cloud serveris izveidots, SSH atslēga pievienota **pirms** `server-setup.sh`
- [ ] Parole SSH atspējota, ugunsmūris atver tikai 22, 80, 443
- [ ] `server-setup.sh` izpildīts, Docker Compose darbojas
- [ ] `.env` serverī aizpildīts (`DOMAIN`, `DATABASE_URL`, `DEEPSEEK_API_KEY`, `AI_TOKEN_LIMIT_FREE/PREMIUM`, `AI_DAILY_LIMIT_GLOBAL`, `COOKIE_SECURE` nav izslēgts)
- [ ] `npm run migrate` un `npm run import:exams` izpildīti serverī

### 2. Domēns un HTTPS
- [ ] Domēns nopirkts, DNS A ieraksti `@` un `www` uz servera IP
- [ ] Caddy iegūst HTTPS sertifikātu (pirmā atvēršana bez kļūdām); HSTS ieslēgts
- [ ] Caddy paroles aizsardzība un izņēmumi (sk. augstāk) ieviesti un pārbaudīti

### 3. E-pasts
- [ ] Sūtītāja domēns un SPF/DKIM/DMARC (Resend vai Brevo), `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM` serverī
- [ ] Apstiprināšanas un paroles atjaunošanas e-pasti atnāk (ne mēstulēs), saites ved uz domēnu

### 4. Maksājumi (Stripe, tikai test režīms)
- [ ] Test atslēgas serverī, webhook endpoint `https://<domēns>/api/billing/webhook` reģistrēts
- [ ] Premium pirkums ar testa karti, atcelšana, atgriešanās bezmaksas plānā

### 5. Uzturēšana
- [ ] `scripts/backup.sh` ieplānots un **atjaunošana no kopijas izmēģināta**
- [ ] `scripts/update.sh` (jauninājumi) izmēģināts; `/api/health` uzraudzība
- [ ] Žurnālu apjoms un diska vieta pārbaudīta

### 6. Pilna funkciju pārbaude serverī
- [ ] Kontrolsaraksta G sadaļa (reģistrācija, eksāmeni, AI, istabas, Premium, telefons) izpildīta uz īstā domēna
- [ ] `npm test` un CI zaļi; pārbaudes datus (testa kontus) izdzēst

## Gaida no komandas (neatkarīgi no tehnikas)
- Domēna reģistrators un DNS piekļuve
- E-pasta pakalpojuma konts un sūtītāja verifikācija
- Rodrigo: `privacy.md` un `terms.md` (AI vērtēšana, tokenu limits, "līdz 3 testiem" bezmaksas plānā) un **pārziņa dati** (nosaukums, reģistrācijas numurs, adrese)
- Lēmums par publiskās palaišanas datumu

## Neizdarām (atlikts līdz palaišanai)
- Beta uzaicinājumi un skolēnu reģistrācija
- Video publicēšana, sociālie tīkli
- Pilns juridiskais pārskats un pieejamības pārbaude publiskai versijai

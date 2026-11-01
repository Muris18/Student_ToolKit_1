# Study Pilot palaišana internetā

Viss, kas jādara: **nopirkt serveri un domēnu, ielikt vienu komandu, atbildēt uz 4 jautājumiem.** Pārējo (Docker, datubāzi, HTTPS sertifikātu, ugunsmūri, rezerves kopijas, administratora kontu) iestata skripts.

Laiks: ~20 minūtes. Izmaksas: serveris ~4–6 €/mēn., domēns ~10 €/gadā.

---

## 1. Serveris (Hetzner Cloud)

1. Reģistrējies [console.hetzner.cloud](https://console.hetzner.cloud) → **New project** → **Add server**.
2. Izvēlies:
   - **Location:** Falkenstein vai Nuremberg (Vācija) vai Helsinki (Somija). **Svarīgi — tikai ES**, citādi privātuma politika nav patiesa.
   - **Image:** Ubuntu 24.04
   - **Type:** CX22 (2 vCPU, 4 GB RAM) — pietiek pirmajiem tūkstošiem lietotāju
   - **SSH key:** pievieno savu (Windows CMD: `ssh-keygen`, tad iekopē faila `C:\Users\<tu>\.ssh\id_ed25519.pub` saturu)
   - **Backups:** ieslēdz (+20 % cenai) — kopija, ja sabojājas viss serveris
3. Pieraksti servera **IPv4 adresi**.

## 2. Domēns

Domēna reģistratorā (piem., nic.lv partneris) izveido divus **A** ierakstus:

| Tips | Nosaukums | Vērtība |
|---|---|---|
| A | `@` (pats domēns) | servera IPv4 |
| A | `www` | servera IPv4 |

DNS izmaiņas var aizņemt līdz 1 stundai.

## 3. Viena komanda

Windows CMD:

```cmd
ssh root@SERVERA_IP
```

Serverī:

```bash
git clone https://github.com/Muris18/Student_ToolKit_1.git
cd Student_ToolKit_1/Study_Pilot
sudo bash scripts/server-setup.sh
```

Skripts pajautās:
1. **Domēnu** (piem. `studypilot.lv`)
2. **DeepSeek API atslēgu** — vari nospiest Enter un pievienot vēlāk
3. **Premium cenas tekstu** sākumlapai — vari nospiest Enter
4. **Administratora e-pastu** — tev izveidos kontu un parādīs paroli **vienu reizi**. Pieraksti to!

Kad redzi **„Gatavs!”**, atver `https://tavsdomens.lv`. 🎉

> Ja DNS vēl nebija gatavs, HTTPS sertifikāts tiks izsniegts automātiski, tiklīdz DNS sāks rādīt uz serveri.

---

## 4. Atslēgas, ko var pievienot jebkurā laikā

Serverī: `cd ~/Student_ToolKit_1/Study_Pilot && nano .env`, ieraksti vērtības, saglabā (Ctrl+O, Enter, Ctrl+X) un palaid:

```bash
docker compose up -d
```

Admin panelī sadaļā **Pārskats → Sistēmas stāvoklis** redzi, kas ieslēgts.

### AI skolotājs (DeepSeek)
[platform.deepseek.com](https://platform.deepseek.com) → **API keys** → **Create**. Iemaksā dažus eiro.
```
DEEPSEEK_API_KEY=sk-...
```

### E-pasta apstiprināšana un paroles atjaunošana (Brevo, bezmaksas 300 e-pasti dienā)
1. [brevo.com](https://www.brevo.com) → reģistrējies.
2. **Senders, Domains & Dedicated IPs → Domains → Add a domain** → `studypilot.lv`. Brevo parādīs DNS ierakstus (TXT/CNAME) — ieliec tos domēna reģistratorā. Tas vajadzīgs, lai e-pasti nenonāk mēstulēs.
3. **SMTP & API → API Keys → Generate**.
```
EMAIL_PROVIDER=brevo
EMAIL_API_KEY=xkeysib-...
EMAIL_FROM=Study Pilot <jautajumi@studypilot.lv>
```

### Premium maksājumi (Stripe)
1. [dashboard.stripe.com](https://dashboard.stripe.com) → reģistrējies, aizpildi uzņēmuma/personas datus (**Business type: Individual**, kamēr nav SIA).
2. **Product catalog → Add product** → „Study Pilot Premium”, **Recurring**, **Monthly**, cena. Nokopē **Price ID** (`price_...`).
3. **Developers → API keys** → **Secret key** (`sk_live_...`).
4. **Developers → Webhooks → Add endpoint**:
   - URL: `https://studypilot.lv/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Nokopē **Signing secret** (`whsec_...`).
5. **Settings → Billing → Customer portal** → ieslēdz (lai lietotāji paši var atcelt abonementu un mainīt karti).
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
PREMIUM_PRICE_TEXT=4,99 € / mēnesī
```
> Vispirms vari visu izmēģināt ar **Test mode** atslēgām (`sk_test_...`) un testa karti `4242 4242 4242 4242`.

---

## 5. Ikdienā

| Ko | Komanda (serverī, mapē Study_Pilot) |
|---|---|
| Atjaunināt uz jaunāko versiju no GitHub | `sudo bash scripts/update.sh` |
| Skatīt žurnālus | `docker compose logs -f app` |
| Pārstartēt | `docker compose restart app` |
| Padarīt kādu par administratoru | `docker compose exec app npm run create-admin -- e-pasts@domens.lv` |
| Pievienot eksāmenus | Admin panelis → **Eksāmeni** (vai `exams/*.json` + `update.sh`) |
| Rezerves kopijas | automātiski katru dienu mapē `backups/`, glabā 7 dienas |
| Atjaunot no kopijas | skat. [README.md](README.md#rezerves-kopijas) |

## 6. Pirms atver skolēniem

- [ ] `content/privacy.md` un `content/terms.md`: ieraksti spēkā stāšanās datumu (un Hetzner atrašanās vietu privātuma politikas 5. sadaļā). Pēc tam `update.sh`.
- [ ] Izveido e-pastu `jautajumi@studypilot.lv` (uz to atsaucas politika un noteikumi).
- [ ] Parakstiet kopīgo pārziņu vienošanos.
- [ ] Ja ieslēdz Stripe: pārliecinies, ka tev kā fiziskai personai ir reģistrēta saimnieciskā darbība VID (vai ir SIA).
- [ ] Pievieno vismaz dažus valsts eksāmenus (admin panelis → Eksāmeni). Pārbaudi VIAA lietošanas noteikumus.
- [ ] Izmēģini: reģistrācija, AI jautājums, Premium (Test mode), paroles atjaunošana.

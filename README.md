# Study Pilot

*(iepriekšējais darba nosaukums — Student Toolkit)*

**Study Pilot** ir tīmekļa platforma skolēniem un studentiem, kas gatavojas Latvijas 9. un 12. klases valsts pārbaudes darbiem. Tajā ir mācību plānotājs ar termiņu radaru, savi uzdevumi un testi, progresa pārskats un AI skolotājs, kas izmanto iepriekšējo gadu eksāmenu uzdevumus un dod mājienus, nevis gatavas atbildes.

> **Statuss:** gatavs palaišanai (versija 1.0.0).

**🚀 Palaist internetā:** [`Study_Pilot/DEPLOY.md`](Study_Pilot/DEPLOY.md) — serveris + domēns + viena komanda.

Pats lietotnes kods atrodas mapē [`Study_Pilot/`](Study_Pilot/). Lokālā izstrāde — [`Study_Pilot/README.md`](Study_Pilot/README.md).

## Satura rādītājs

- [Kas jau strādā](#kas-jau-strādā)
- [AI skolotājs](#ai-skolotājs)
- [Tehnoloģijas](#tehnoloģijas)
- [Repozitorija struktūra](#repozitorija-struktūra)
- [Palaišana](#palaišana)
- [Kādus datus platforma apstrādā](#kādus-datus-platforma-apstrādā)
- [Drošība](#drošība)
- [Kas vēl jāizdara](#kas-vēl-jāizdara)
- [Avoti un autortiesības](#avoti-un-autortiesības)
- [Ieguldījums projektā](#ieguldījums-projektā)

## Kas jau strādā

- **Sākumlapa** — tumšais „Nakts” dizains ar zelta akcentu (noklusētais; „Gaišs” un „Tumšs” paliek izvēlami), cenas un biežāk uzdotie jautājumi.
- **Konti** — reģistrācija, pieslēgšanās, paroles maiņa, paroles atjaunošana un e-pasta apstiprināšana (ieslēdzas ar e-pasta atslēgu), konta dzēšana.
- **Valsts eksāmeni** — VIAA eksāmenu uzdevumi pa klasēm ar automātisku testa atbilžu pārbaudi; atvērtos uzdevumus pārbauda AI skolotājs.
- **AI skolotājs** — mājieni pa solim, līdzīgu eksāmenu uzdevumu meklēšana, formulas ar KaTeX.
- **Dashboard, plānotājs, termiņu radars, fokusa režīms, testi, progress.**
- **Premium** — Stripe abonements (ieslēdzas ar Stripe atslēgām) vai administratora piešķirts.
- **Administrēšana** — lietotāji (Premium, bloķēšana, dzēšana, admin loma), eksāmenu augšupielāde no pārlūka, AI lietojums un izmaksas, sistēmas stāvoklis.
- **Privātums** — `/privacy`, `/terms`, AI piekrišana, datu eksports, automātiska dzēšana, rezerves kopijas.

## AI skolotājs

- Strādā tikai **servera pusē**; API atslēga nekad nenonāk pārlūkā.
- Izmanto **DeepSeek API** (modelis `deepseek-chat`).
- Pirms atbildes sistēma ar PostgreSQL pilnteksta meklēšanu atrod līdz 4 līdzīgiem eksāmenu uzdevumiem un nodod tos modelim kopā ar pareizo atbildi vai vērtēšanas kritērijiem. Modelim ir aizliegts tos atklāt skolēnam — tas dod mājienus pa solim.
- Lietotājam tiek parādīts, no kura eksāmena (gads, klase, priekšmets, uzdevuma Nr.) ņemti avoti.
- Dienas limits: **10 jautājumi** (free) un **100 jautājumi** (premium); maināms ar vides mainīgajiem.
- Katram jautājumam tiek saglabāts lietojuma ieraksts (laiks, modelis, tokenu skaits), lai skaitītu limitus un izmaksas.

Pagaidām tiek lietota vārdu meklēšana, nevis vektoru meklēšana (RAG ar embeddings) — to var pievienot vēlāk.

## Tehnoloģijas

| Daļa | Tehnoloģija |
|---|---|
| Frontend un API | Next.js 15 (Pages Router, API routes), React 18 |
| Stils | Tailwind CSS |
| Datubāze | Pašu PostgreSQL 16 (Docker konteinerā) |
| Autentifikācija | Pašu veidota: e-pasts + parole (scrypt hash), sesijas žetons 30 dienas |
| AI | DeepSeek API, izsaukts tikai no servera |
| Meklēšana eksāmenos | PostgreSQL pilnteksta meklēšana (`tsvector` + `unaccent`) |
| Formulas | KaTeX (no servera, bez CDN) |
| Fonti | next/font — tiek piegādāti no servera, bez Google pieprasījumiem |
| E-pasts | Brevo vai Resend HTTP API (pēc izvēles) |
| Maksājumi | Stripe Checkout + klientu portāls + webhook (pēc izvēles) |
| Izvietošana | Hetzner Cloud serveris, Docker Compose, `scripts/server-setup.sh` |
| HTTPS | Caddy (automātisks Let's Encrypt sertifikāts savam domēnam) |

Supabase vairs **netiek** izmantots.

## Repozitorija struktūra

```text
Student_ToolKit_1/
├── README.md              ← šis fails
├── PRIVACY.md             ← norāde uz politiku + kas vēl jāizdara pirms publicēšanas
├── Informational/         ← plāni, ceļa karte, darba plūsma
└── Study_Pilot/           ← lietotne
    ├── src/
    │   ├── components/    ← kopīgie UI komponenti
    │   ├── features/      ← dashboard, planner, exams, profile
    │   ├── lib/           ← AppContext, palīgfunkcijas
    │   ├── pages/         ← lapas un pages/api/* (REST API)
    │   ├── server/        ← db.js (PostgreSQL), ai.js (DeepSeek), http.js
    │   └── styles/
    ├── content/           ← privacy.md (/privacy) un terms.md (/terms)
    ├── db/                ← init.sql un migrācijas
    ├── exams/             ← eksāmenu JSON faili importam
    ├── scripts/           ← migrate.js, import-exams.js
    ├── docker-compose.yml ← db + app + caddy
    ├── Caddyfile
    └── .env.example
```

## Palaišana

Vajag Node.js 20 un Docker Desktop (atvērtu). Mapē `Study_Pilot` (Windows CMD):

```cmd
powershell -ExecutionPolicy Bypass -File setup.ps1
npm run dev
```

Pēc tam atver http://localhost:3000. Skripts izveido paroli, vides failus, palaiž datubāzi, piemēro migrācijas un ielādē eksāmenus. Ja ports 5432 ir aizņemts vai rodas kļūdas, skat. [`Study_Pilot/README.md`](Study_Pilot/README.md) (soļi un sadaļa *Biežākās problēmas*).

## Kādus datus platforma apstrādā

Šī sadaļa ir pamats [privātuma politikai](Study_Pilot/content/privacy.md) (lietotnē — lapa `/privacy`). Ja kodā mainās vācamie dati, **jāatjauno arī šī tabula un `Study_Pilot/content/privacy.md`**.

| Dati | Kur glabājas | Kāpēc |
|---|---|---|
| E-pasts | `users.email` | Pieslēgšanās, konta identificēšana |
| Parole | `users.salt`, `users.pass_hash` — tikai scrypt hash, nekad pati parole | Pieslēgšanās |
| Vārds, uzvārds | `users.profile` | Uzrunāšana lietotnē |
| Līmenis (klase/kurss), klase vai kurss, skola, programma | `users.profile` | Saturs pielāgots klasei; AI meklē attiecīgās klases eksāmenus |
| Priekšmeti, termiņi, uzdevumi, testi, testu rezultāti | `users.data` | Plānotāja, eksāmenu un testu darbība |
| AI čata vēsture (lietotāja jautājumi un AI atbildes) | `users.data.chat` | Čata vēsture lietotājam |
| Aktivitātes dienas | `users.data.activity` | Progresa pārskats |
| Konta loma un plāns (`user`/`admin`, `free`/`premium`) | `users.role`, `users.plan` | Piekļuve un AI limiti |
| Konta izveides laiks, pēdējās aktivitātes laiks | `users.created_at`, `users.last_active` | Admin pārskats, drošība, neaktīvo kontu dzēšana |
| Reģistrācijas apstiprinājuma laiks ("vismaz 13 gadi" + "izlasīju politiku") | `users.terms_accepted_at` | Pierādīt, ka apstiprinājums dots |
| AI piekrišanas laiks (datu nosūtīšana uz DeepSeek) | `users.ai_consent_at` — `NULL`, ja nav dota vai atsaukta | Bez piekrišanas AI skolotājs nestrādā |
| Sesijas | `sessions` — tikai žetona SHA-256 hash, derīgs 30 dienas | Pieslēgšanās uzturēšana |
| E-pasta apstiprinājums, bloķēšana | `users.email_verified_at`, `users.blocked_at` | Drošība |
| Vienreizējās saites | `email_tokens` — tikai hash; 48 h (apstiprināšana) / 1 h (parole) | E-pasta apstiprināšana, paroles atjaunošana |
| Pieslēgšanās mēģinājumi | `login_attempts` — e-pasts, IP, laiks; dzēsti pēc 24 h | Aizsardzība pret paroļu minēšanu |
| Premium | `users.plan_source`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_status`, `premium_until` | Abonements |
| Valsts eksāmenu mēģinājumi | `users.data.examAttempts` | Progress |
| AI lietojuma žurnāls | `ai_usage` — laiks, modelis, tokenu skaits (bez jautājuma teksta) | Dienas limiti, izmaksu uzskaite |

**Pārlūkā** (`localStorage`/`sessionStorage`) tiek glabāts tikai sesijas žetons (`sp-session`), izvēlētā tēma (`sp-theme`) un tas, vai rādīts sākuma ekrāns (`sp-splash`). Sīkdatnes, analītika, reklāmas un trešo pušu skripti **netiek** izmantoti.

**Trešās puses, kas saņem datus:**

- **DeepSeek** — tikai pēc lietotāja piekrišanas saņem AI jautājumu, pēdējās 6 čata ziņas un atrastos eksāmenu uzdevumus. Vārds, e-pasts un skola netiek sūtīti. DeepSeek apstrādā datus ārpus Eiropas Savienības.
- **Hetzner** — servera nodrošinātājs; uz tā glabājas datubāze.
- **Stripe** — tikai, ja pērk Premium: e-pasts un maksājuma dati (kartes datus saņem tikai Stripe).
- **Brevo / Resend** — tikai, ja ieslēgta e-pasta sūtīšana: e-pasts un vēstules saturs.

**Dzēšana un eksports:** profilā lietotājs var lejupielādēt visus savus datus (JSON), notīrīt mācību datus vai dzēst kontu. Dzēšot kontu, tiek izdzēsts lietotājs, visas viņa sesijas un AI lietojuma ieraksti (`ON DELETE CASCADE`). Beigušās sesijas un 24 mēnešus neaktīvi konti (izņemot administratorus) tiek dzēsti automātiski.

**Kas redz datus:** administratoram ir pieejams e-pasts, vārds, uzvārds, klase, skola, plāns, AI jautājumu skaits, ierakstu skaits, izveides un pēdējās aktivitātes laiks. Čata tekstu admin skats nerāda.

## Drošība

- Paroles glabājas tikai kā scrypt hash ar unikālu sāli; salīdzināšana ar `timingSafeEqual`.
- Datubāzē glabājas tikai sesijas žetona hash, ne pats žetons.
- Visi API maršruti pārbauda pieslēgšanos; `admin` maršruti — lomu.
- Lietotājs piekļūst tikai saviem datiem (dati tiek ņemti no sesijas, nevis no pieprasījuma ID).
- Ievades ierobežojumi: AI jautājums līdz 1500 simboliem, datu saglabāšana līdz 2 MB.
- HTTPS caur Caddy; datubāzes ports produkcijā nav atvērts uz āru.
- Slepenās vērtības (`POSTGRES_PASSWORD`, `DEEPSEEK_API_KEY`, `STRIPE_*`, `EMAIL_API_KEY`) tikai `.env` / `.env.local`, kas ir `.gitignore`.
- Pieslēgšanās limits: 5 nepareizas paroles vienam e-pastam vai 30 no vienas IP 15 minūtēs → pauze.
- Paroles: vismaz 8 simboli, ne tikai cipari; maiņa vai atjaunošana izbeidz visas citas sesijas.
- Drošības galvenes (CSP, X-Frame-Options, HSTS u.c.) — `next.config.js` un `Caddyfile`.
- Stripe webhook paraksta pārbaude (HMAC-SHA256) un atkārtotu notikumu aizsardzība.
- Lietotne konteinerā darbojas kā parasts lietotājs (ne root); serverī ugunsmūris atļauj tikai 22, 80, 443.

## Kas vēl jāizdara

Pirms platformu atver reāliem lietotājiem — skat. [`Study_Pilot/DEPLOY.md`](Study_Pilot/DEPLOY.md#6-pirms-atver-skolēniem) un [`PRIVACY.md`](PRIVACY.md).

Vēlāk:
- [ ] Vairāk valsts eksāmenu (9. un 12. klase, visi priekšmeti).
- [ ] Vektoru meklēšana (RAG) AI skolotājam.
- [ ] Kad dibināta SIA: atjaunot pārzini un pārdevēju politikā un noteikumos.

## Avoti un autortiesības

Eksāmenu materiālu oficiālais avots ir Valsts izglītības attīstības aģentūra (VIAA):

- [VIAA — Valsts pārbaudes darbu programmas](https://www.viaa.gov.lv/lv/valsts-parbaudes-darbu-programmas)
- [VIAA — Biežāk uzdotie jautājumi par valsts pārbaudes darbiem](https://www.viaa.gov.lv/lv/biezak-uzdotie-jautajumi-par-valsts-parbaudes-darbiem)

Pirms eksāmenu uzdevumus ielikt publiskā repozitorijā vai rādīt lietotājiem, pārbaudi VIAA lietošanas noteikumus. Tas, ka PDF ir publiski pieejams, nenozīmē, ka to drīkst brīvi pārpublicēt.

## Ieguldījums projektā

1. Izveido atsevišķu Git zaru jaunai funkcijai vai labojumam.
2. Veic izmaiņas un pārbaudi tās lokāli.
3. Izveido Pull Request ar īsu izmaiņu aprakstu.
4. Neiekļauj repozitorijā API atslēgas, paroles vai citus noslēpumus.
5. Ja maini, kādus datus lietotne vāc vai kam tos nosūta, atjauno sadaļu [Kādus datus platforma apstrādā](#kādus-datus-platforma-apstrādā) un `Study_Pilot/content/privacy.md`.

# Study Pilot

*(iepriekšējais darba nosaukums — Student Toolkit)*

**Study Pilot** ir tīmekļa platforma skolēniem un studentiem, kas gatavojas Latvijas 9. un 12. klases valsts pārbaudes darbiem. Tajā ir iepriekšējo gadu VIAA eksāmeni ar atbilžu pārbaudi un eksāmena simulāciju, testi, ko AI veido no skolēna kļūdām, tēmu karte, mācību plānotājs ar termiņu radaru un AI skolotājs, kas dod mājienus, nevis gatavas atbildes.

> **Statuss:** aktīvā izstrādē (versija 0.2.0). Lietotne darbojas lokāli, internetā vēl nav palaista.

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

- **Dizains** — smaragda un piparmētru krāsas, tumšā „Nakts” tēma pēc noklusējuma („Gaišs” un „Tumšs” paliek izvēlami). Sākumlapā ritināms „Tavs ceļš līdz eksāmenam”, funkcijas, cenas un biežāk uzdotie jautājumi.
- **Konti** — reģistrācija, pieslēgšanās, paroles maiņa, paroles atjaunošana un e-pasta apstiprināšana (ieslēdzas ar e-pasta atslēgu), konta dzēšana.
- **Valsts eksāmeni** — VIAA eksāmeni 9. un 12. klasei (2023–2026; latviešu, angļu, matemātika, 9. kl. dabaszinātņu paraugs) pa priekšmetiem, līmeņiem un gadiem:
  - **Treniņš** — testa jautājumu pārbaude uzreiz, atvērtajiem uzdevumiem atbildes paraugs un mājieni no AI skolotāja.
  - **Simulācija** — viss eksāmens ar taimeri (45/90/120/180 min vai bez laika), bez mājieniem. Beigās testa jautājumus pārbauda serveris, atvērtos skolēns novērtē pats pēc parauga. Rezultāts: punkti, procenti, laiks un sadalījums pa tēmām.
- **Testa režīms** — testus veido no skolēna kļūdām: AI izveido jaunus jautājumus tajās pašās tēmās vai, ja AI nav pieejams, tests tiek sastādīts no īstiem VIAA uzdevumiem. Ja kļūdu vēl nav, diagnostikas tests.
- **AI skolotājs** — mājieni pa solim, līdzīgu eksāmenu uzdevumu meklēšana, formulas ar KaTeX.
- **Progress** — tēmu karte (katrai tēmai pareizo atbilžu īpatsvars un cik uzdevumu izmēģināts, ieteikums, ar ko sākt), simulāciju vēsture, aktivitāte un progress pa priekšmetiem.
- **Panelis, plānotājs, termiņu radars, fokusa režīms, savi uzdevumi un testi.**
- **Premium** — Stripe abonements (ieslēdzas ar Stripe atslēgām) vai administratora piešķirts.
- **Administrēšana** — lietotāji (Premium, bloķēšana, dzēšana, admin loma), eksāmenu augšupielāde no pārlūka, AI lietojums un izmaksas, sistēmas stāvoklis.
- **Privātums** — `/privacy`, `/terms`, AI piekrišana, datu eksports, automātiska dzēšana, rezerves kopijas.

## AI skolotājs

- Strādā tikai **servera pusē**; API atslēga nekad nenonāk pārlūkā.
- Izmanto **DeepSeek API** (modelis `deepseek-chat`).
- Pirms atbildes sistēma ar PostgreSQL pilnteksta meklēšanu atrod līdz 4 līdzīgiem eksāmenu uzdevumiem un nodod tos modelim kopā ar pareizo atbildi vai vērtēšanas kritērijiem. Modelim ir aizliegts tos atklāt skolēnam — tas dod mājienus pa solim.
- Lietotājam tiek parādīts, no kura eksāmena (gads, klase, priekšmets, uzdevuma Nr.) ņemti avoti.
- Dienas limits: **10 jautājumi** (free) un **100 jautājumi** (premium); maināms ar vides mainīgajiem. Katrs AI veidotais tests Testa režīmā arī skaitās kā viens jautājums.
- Vieta limitā tiek rezervēta **pirms** DeepSeek izsaukuma, tāpēc limitu nevar apiet ar vairākiem vienlaicīgiem pieprasījumiem. Ja AI neatbild, jautājums netiek norakstīts.
- Katram jautājumam tiek saglabāts lietojuma ieraksts (laiks, modelis, tokenu skaits), lai skaitītu limitus un izmaksas.
- Čata vēsturē modelim tiek nodotas tikai tās AI atbildes, kuras ir parakstījis serveris (HMAC), tāpēc viltotu „AI atbildi” vēsturē ielikt nevar.

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
| Fonti | Instrument Sans, Fraunces, JetBrains Mono caur next/font — lejupielādēti build laikā un piegādāti no servera, bez Google pieprasījumiem pārlūkā |
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
    │   ├── features/      ← dashboard (panelis, tēmu karte), exams (valsts eksāmeni,
    │   │                     simulācija, testa režīms, AI čats), planner, profile
    │   ├── lib/           ← AppContext, palīgfunkcijas
    │   ├── pages/         ← lapas un pages/api/* (REST API)
    │   ├── server/        ← db.js (PostgreSQL), ai.js (DeepSeek, AI limiti), exams.js
    │   │                     (eksāmeni, vērtēšana, tēmu karte), quiz.js, security.js, http.js
    │   └── styles/        ← globals.css (tēmas un krāsas kā CSS mainīgie)
    ├── content/           ← privacy.md (/privacy) un terms.md (/terms)
    ├── db/                ← init.sql un migrācijas
    ├── exams/             ← eksāmenu JSON faili importam (skat. exams/README.md)
    ├── scripts/           ← migrate, import-exams, create-admin, cleanup, backup, server-setup, update
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
| Testa režīma testi, ko izveidoja sistēma (pēdējie 20) | `users.data.aiQuizzes` | Testa atkārtošana |
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
| Eksāmenu simulāciju rezultāti (eksāmens, datums, punkti, izmantotais laiks; pēdējie 50) | `users.data.simulations` | Progress, rezultātu salīdzināšana |
| AI lietojuma žurnāls | `ai_usage` — laiks, modelis, tokenu skaits (bez jautājuma teksta) | Dienas limiti, izmaksu uzskaite |

**Pārlūkā** tiek glabāts:
- `localStorage`: sesijas žetons (`sp-session`), izvēlētā tēma (`sp-theme`), kuras izvēlnes grupas ir sakļautas (`sp-nav-closed`) un nepabeigtas eksāmena simulācijas atbildes (`sp-sim-<eksāmena id>`, lai tās nepazustu, pārlādējot lapu; izdzēš, sākot jaunu vai pārtraucot);
- `sessionStorage`: vai rādīts sākuma ekrāns (`sp-splash`) un uzdevuma teksts, ko no eksāmena nodod AI čatam (`sp-ai-draft`).

Sīkdatnes, analītika, reklāmas un trešo pušu skripti **netiek** izmantoti.

**Trešās puses, kas saņem datus:**

- **DeepSeek** — tikai pēc lietotāja piekrišanas. AI skolotājam tas saņem jautājumu, pēdējās 6 čata ziņas un atrastos eksāmenu uzdevumus. Testa režīmā tas saņem priekšmetu, klasi un eksāmenu uzdevumus, kuros skolēns kļūdījās. Vārds, e-pasts un skola netiek sūtīti. DeepSeek apstrādā datus ārpus Eiropas Savienības.
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
- AI limits: vieta tiek rezervēta transakcijā ar lietotāja slēdzeni (`pg_advisory_xact_lock`) pirms DeepSeek izsaukuma, tāpēc paralēli pieprasījumi limitu nepārsniedz.
- AI čata vēsture: serveris paraksta savas atbildes (HMAC-SHA256, piesaistīts lietotājam; atslēga `AI_HISTORY_SECRET` vai atvasināta no `DEEPSEEK_API_KEY`). Vēsturē tiek pieņemtas tikai AI ziņas ar derīgu parakstu.
- Testa jautājumu pareizās atbildes netiek sūtītas uz pārlūku kopā ar uzdevumiem. Atbildi pārbauda serveris, un pareizo variantu tas parāda tikai pēc atbildes vai simulācijas iesniegšanas.
- Pieprasījumu limiti arī atbilžu pārbaudei, simulācijas iesniegšanai un testu veidošanai.
- Lietotne konteinerā darbojas kā parasts lietotājs (ne root); serverī ugunsmūris atļauj tikai 22, 80, 443.

## Kas vēl jāizdara

Pirms platformu atver reāliem lietotājiem — skat. [`Study_Pilot/DEPLOY.md`](Study_Pilot/DEPLOY.md#6-pirms-atver-skolēniem) un [`PRIVACY.md`](PRIVACY.md).

Pirms palaišanas:
- [ ] Pārbaudīt VIAA lietošanas noteikumus. Eksāmenu uzdevumi ir šajā publiskajā repozitorijā (skat. [Avoti un autortiesības](#avoti-un-autortiesības)).
- [ ] Automātiskie testi (pagaidām nav neviena) un GitHub Actions pārbaude (`npm run build`) katram PR.

Vēlāk:
- [ ] Vairāk valsts eksāmenu (9. un 12. klase, visi priekšmeti).
- [ ] AI vērtējums atvērtajiem uzdevumiem simulācijā (pašlaik pašvērtējums pēc parauga).
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

# Study Pilot

*(iepriekšējais darba nosaukums — Student Toolkit)*

**Study Pilot** ir tīmekļa platforma skolēniem un studentiem, kas gatavojas Latvijas 9. un 12. klases valsts pārbaudes darbiem. Tajā ir mācību plānotājs ar termiņu radaru, savi uzdevumi un testi, progresa pārskats un AI skolotājs, kas izmanto iepriekšējo gadu eksāmenu uzdevumus un dod mājienus, nevis gatavas atbildes.

> **Statuss:** prototips (versija 0.2.0). Funkcijas var mainīties.

Pats lietotnes kods atrodas mapē [`Study_Pilot/`](Study_Pilot/). Tehniskā palaišanas instrukcija — [`Study_Pilot/README.md`](Study_Pilot/README.md).

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

- **Konti** — reģistrācija ar e-pastu un paroli, pieslēgšanās, izrakstīšanās, profila labošana, konta dzēšana.
- **Dashboard** — tuvākie termiņi, progress un ātrās darbības vienuviet.
- **Deadline Radar un Study Planner** — kontroldarbu, projektu un eksāmenu termiņi kalendārā.
- **Eksāmenu sadaļa** — savi eksāmenu uzdevumi pa priekšmetiem.
- **Quiz Mode** — savu testu veidošana un pildīšana.
- **Progress Tracking** — rezultāti un aktivitāte pa dienām.
- **AI skolotājs** — čats, kas meklē līdzīgus uzdevumus eksāmenu bāzē un palīdz ar mājieniem.
- **Administratora skats** — lietotāju un aktivitātes pārskats (tikai lomai `admin`).

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
| Izvietošana | Hetzner Cloud serveris, Docker Compose |
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
    ├── content/           ← privacy.md (privātuma politika, lapa /privacy)
    ├── db/                ← init.sql un migrācijas
    ├── exams/             ← eksāmenu JSON faili importam
    ├── scripts/           ← migrate.js, import-exams.js
    ├── docker-compose.yml ← db + app + caddy
    ├── Caddyfile
    └── .env.example
```

## Palaišana

Īsumā (Windows CMD, mapē `Study_Pilot`):

```cmd
copy .env.example .env
notepad .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
npm install
npm run migrate
npm run dev
```

Failā `.env` ieraksti paroli pie `POSTGRES_PASSWORD` un to pašu paroli `DATABASE_URL` vietā `TAVA_PAROLE`. Pēc tam atver http://localhost:3000. Detalizēti — [`Study_Pilot/README.md`](Study_Pilot/README.md).

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
| AI lietojuma žurnāls | `ai_usage` — laiks, modelis, tokenu skaits (bez jautājuma teksta) | Dienas limiti, izmaksu uzskaite |

**Pārlūkā** (`localStorage`/`sessionStorage`) tiek glabāts tikai sesijas žetons (`sp-session`), izvēlētā tēma (`sp-theme`) un tas, vai rādīts sākuma ekrāns (`sp-splash`). Sīkdatnes, analītika, reklāmas un trešo pušu skripti **netiek** izmantoti.

**Trešās puses, kas saņem datus:**

- **DeepSeek** — tikai pēc lietotāja piekrišanas saņem AI jautājumu, pēdējās 6 čata ziņas un atrastos eksāmenu uzdevumus. Vārds, e-pasts un skola netiek sūtīti. DeepSeek apstrādā datus ārpus Eiropas Savienības.
- **Hetzner** — servera nodrošinātājs; uz tā glabājas datubāze.

**Dzēšana un eksports:** profilā lietotājs var lejupielādēt visus savus datus (JSON), notīrīt mācību datus vai dzēst kontu. Dzēšot kontu, tiek izdzēsts lietotājs, visas viņa sesijas un AI lietojuma ieraksti (`ON DELETE CASCADE`). Beigušās sesijas un 24 mēnešus neaktīvi konti (izņemot administratorus) tiek dzēsti automātiski.

**Kas redz datus:** administratoram ir pieejams vārds, uzvārds, līmenis, klase, skola, ierakstu skaits, izveides un pēdējās aktivitātes laiks. Čata tekstu admin skats nerāda.

## Drošība

- Paroles glabājas tikai kā scrypt hash ar unikālu sāli; salīdzināšana ar `timingSafeEqual`.
- Datubāzē glabājas tikai sesijas žetona hash, ne pats žetons.
- Visi API maršruti pārbauda pieslēgšanos; `admin` maršruti — lomu.
- Lietotājs piekļūst tikai saviem datiem (dati tiek ņemti no sesijas, nevis no pieprasījuma ID).
- Ievades ierobežojumi: AI jautājums līdz 1500 simboliem, datu saglabāšana līdz 2 MB.
- HTTPS caur Caddy; datubāzes ports produkcijā nav atvērts uz āru.
- Slepenās vērtības (`POSTGRES_PASSWORD`, `DEEPSEEK_API_KEY`) tikai `.env` / `.env.local`, kas ir `.gitignore`.

## Kas vēl jāizdara

Pirms platformu atver reāliem lietotājiem:

- [x] Lapa `/privacy` un saites uz to.
- [x] Reģistrācijā obligātas atzīmes "Man ir vismaz 13 gadi" un "Esmu izlasījis privātuma politiku".
- [x] Piekrišana pirms pirmā AI jautājuma (DeepSeek, ārpus ES); atsaukšana profilā.
- [x] Automātiska beigušos sesiju un 24 mēnešus neaktīvu kontu dzēšana.
- [x] Datu eksports lietotājam ("Lejupielādēt manus datus").
- [ ] Aizpildīt atlikušās vietas politikā — skat. [`PRIVACY.md`](PRIVACY.md).
- [ ] E-pasta apstiprināšana.
- [ ] Pieslēgšanās mēģinājumu ierobežojums.
- [ ] Datubāzes rezerves kopijas (un to glabāšanas termiņš).
- [ ] Vektoru meklēšana (RAG) AI skolotājam.

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

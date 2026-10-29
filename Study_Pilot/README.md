# Study Pilot

Eksāmenu sagatavošanās platforma skolēniem (klase) un studentiem (kurss): plānotājs ar termiņu radaru, savi eksāmenu uzdevumi, savi testi, progresa analīze un AI skolotājs.

Projekta apraksts, datu saraksts un drošība — [saknes README](../README.md). Privātuma politika — [`content/privacy.md`](content/privacy.md) (lapa `/privacy`), lietošanas noteikumi — [`content/terms.md`](content/terms.md) (lapa `/terms`). Pēc teksta maiņas vajag jaunu build.

## Prasības

- **Node.js 18.17+** (ieteicams 20)
- **Docker Desktop** (PostgreSQL datubāzei)

## Palaišana lokāli (Windows CMD)

Pirms sākšanas atver **Docker Desktop** un pagaidi, līdz tas ir startējis.

### Ātrākais veids

Mapē `Study_Pilot`:

```cmd
powershell -ExecutionPolicy Bypass -File setup.ps1
npm run dev
```

Skripts izveido `.env` ar nejaušu paroli, `.env.local` ar `DATABASE_URL`, instalē pakotnes, palaiž datubāzi, piemēro migrācijas un ielādē eksāmenus. Esošu `.env.local` tas nepārraksta. Pēc tam atver **http://localhost:3000** → *Izveidot kontu*. (Linux/macOS: `bash setup.sh`.)

Ja ports 5432 jau ir aizņemts (skat. [Biežākās problēmas](#biežākās-problēmas)), pirms skripta palaišanas izveido failu `.env` ar rindu `DB_PORT=5433`.

### Pa soļiem (ja skripts neder)

1. Izveido vides failus:

   ```cmd
   copy .env.example .env
   notepad .env
   ```

   Aizpildi `.env`:

   ```env
   POSTGRES_PASSWORD=izdomā_paroli
   DB_PORT=5432
   ```

   Un izveido `.env.local` (tur ir `DATABASE_URL`, un šis fails nekad neiet Git):

   ```cmd
   notepad .env.local
   ```

   ```env
   DATABASE_URL=postgres://sp:izdomā_paroli@localhost:5432/sp
   DEEPSEEK_API_KEY=
   ```

   Parolei abos failos jābūt vienādai. `DEEPSEEK_API_KEY` var atstāt tukšu, tad AI čats paziņos, ka AI nav ieslēgts. Neliec komentārus tajā pašā rindā aiz vērtības.

2. Palaid datubāzi (tikai lokāli, ports atvērts tikai uz 127.0.0.1):

   ```cmd
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
   ```

3. Instalē, piemēro migrācijas, ielādē eksāmenus un palaid:

   ```cmd
   npm install
   npm run migrate
   npm run import:exams
   npm run dev
   ```

4. Atver **http://localhost:3000** → *Izveidot kontu*.

Pēc datora restarta nākamreiz pietiek ar: atvērt Docker Desktop, `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db` un `npm run dev`. Dati datubāzē saglabājas.

### Administratora konts

Jauns konts vienmēr ir `user`. Lai kādu padarītu par administratoru:

```cmd
docker compose exec db psql -U sp -c "UPDATE users SET role='admin' WHERE email='tavs@epasts.lv';"
```

### Citas komandas

| Komanda | Ko dara |
|---|---|
| `npm run dev` | Izstrādes serveris (localhost:3000) |
| `npm run dev:lan` | Tas pats, bet pieejams arī no telefona tajā pašā tīklā |
| `npm run build` un `npm start` | Produkcijas režīms |
| `npm run migrate` | Piemēro jaunās `db/migrations/*.sql` (drīkst palaist atkārtoti) |
| `npm run import:exams` | Ielādē `exams/*.json` datubāzē (skat. [`exams/README.md`](exams/README.md)) |
| `npm run cleanup` | Dzēš beigušās sesijas un 24 mēnešus neaktīvus kontus (lietotne to dara arī pati) |

## Biežākās problēmas

| Kļūda | Cēlonis un risinājums |
|---|---|
| `password authentication failed for user "sp"` | Vai nu ports 5432 jau aizņemts ar citu PostgreSQL (pārbaudi `netstat -ano \| findstr :5432`), vai arī parole `.env.local` nesakrīt ar `POSTGRES_PASSWORD`. Risinājums: `.env` ieraksti `DB_PORT=5433`, `.env.local` nomaini `localhost:5432` uz `localhost:5433`, tad pārveido datubāzi (zemāk). |
| `docker` nav atpazīts | Docker nav uzstādīts vai CMD logs atvērts pirms instalēšanas. Aizver un atver jaunu CMD logu. |
| `ECONNREFUSED` | Datubāze nedarbojas. Atver Docker Desktop un palaid `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db`. |
| `column ... does not exist` vai `relation ... does not exist` | Nav piemērotas migrācijas: `npm run migrate`. |
| `Port 3000 is in use` | Cits `npm run dev` jau darbojas. Aizver to vai atrodi procesu: `netstat -ano \| findstr :3000` (jāaptur LISTENING process, ne pārlūks). |
| Čats raksta, ka AI nav ieslēgts | Nav `DEEPSEEK_API_KEY` failā `.env.local`. Pēc pievienošanas pārstartē `npm run dev`. |
| Čats raksta, ka dienas limits izmantots | Testēšanai `.env.local` pievieno `AI_DAILY_LIMIT_FREE=200` un pārstartē serveri. |
| Lapa izskatās vecā vai nemainās | Pārlūkā `Ctrl+F5`. Pārbaudi, ka izmaiņas nav ielikušās nepareizā mapē (mapei `Study_Pilot` nedrīkst būt iekšā vēl viena `Study_Pilot`). |

**Datubāzes pārveidošana no nulles** (lokāli; izdzēš visus lokālos lietotājus un datus):

```cmd
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
npm run migrate
npm run import:exams
```

Paroli `docker` ieraksta tikai pirmajā izveidošanas reizē. Ja maini `POSTGRES_PASSWORD`, vajag `down -v`.

## Serverī (Hetzner, Docker Compose)

`.env` serverī: `POSTGRES_PASSWORD`, `DOMAIN`, `DEEPSEEK_API_KEY` (pēc izvēles `AI_DAILY_LIMIT_FREE`, `AI_DAILY_LIMIT_PREMIUM`).

```bash
docker compose up -d --build
docker compose exec app npm run import:exams
```

`docker-compose.yml` palaiž četrus konteinerus:

- **db** — PostgreSQL 16, dati Docker volume `pgdata`, ports uz āru netiek atvērts;
- **app** — Next.js; startā izpilda `npm run migrate` un `npm start`;
- **backup** — reizi dienā datubāzes rezerves kopija mapē `backups/`, glabā 7 dienas (`scripts/backup.sh`);
- **caddy** — HTTPS un reverse proxy uz `app:3000`, sertifikāts automātiski domēnam `DOMAIN`.

### Rezerves kopijas

- Pirmā kopija tiek izveidota uzreiz pēc palaišanas, tad reizi 24 stundās: `backups/sp-<datums>_<laiks>.dump`.
- Kopijas, kas vecākas par 7 dienām, tiek dzēstas automātiski. Termiņu maina ar `BACKUP_KEEP_DAYS` failā `.env`, bet **tad jāmaina arī privātuma politikas 6. sadaļa**.
- Kopijas satur visus personas datus: mape `backups/` ir `.gitignore`, tās nekad nelieciet GitHub un nesūtiet pa e-pastu.
- Pārbaudīt, vai strādā: `docker compose logs backup` un `ls -l backups`.

**Atjaunošana no kopijas** (pārraksta pašreizējos datus!):

```bash
docker compose stop app
docker compose exec -T db pg_restore -U sp -d sp --clean --if-exists --no-owner < backups/sp-2026-10-28_030000.dump
docker compose start app
```

Kopijas glabājas tajā pašā serverī, tāpēc pasargā no kļūdām un nejaušas dzēšanas, bet ne no servera bojājuma. Lai būtu drošāk, ieslēdziet arī Hetzner Cloud servera rezerves kopijas (Hetzner konsolē → serveris → *Backups*; arī tās glabā 7 kopijas).

## Kā darbojas dati

Visi lietotāju dati glabājas **PostgreSQL** datubāzē un saglabājas arī pēc servera restartēšanas.

| Tabula | Saturs |
|---|---|
| `users` | e-pasts, paroles hash + sāls, loma, plāns, `terms_accepted_at`, `ai_consent_at`, `profile` (vārds, uzvārds, līmenis, klase/kurss, skola, programma), `data` (priekšmeti, termiņi, uzdevumi, testi, rezultāti, čats, aktivitāte), izveides un pēdējās aktivitātes laiks |
| `sessions` | sesijas žetona SHA-256 hash, lietotājs, derīguma termiņš (30 dienas) |
| `ai_usage` | lietotājs, laiks, modelis, tokenu skaits — tikai limitiem un izmaksām |
| `exam_documents`, `exam_tasks` | eksāmenu uzdevumi AI skolotājam (bez personas datiem) |

- Klients visu `data` objektu sūta ar `PUT /api/me/data` (līdz 2 MB).
- `DELETE /api/me` dzēš lietotāju; sesijas un `ai_usage` tiek izdzēstas automātiski (`ON DELETE CASCADE`).
- Pārlūkā glabājas tikai `sp-session` (žetons), `sp-theme` un `sp-splash`. Sīkdatņu un analītikas nav.
- `GET /api/me/export` atdod visus lietotāja datus (poga "Lejupielādēt manus datus" profilā).
- Reģistrācija (`POST /api/auth/register`) prasa `ageConfirmed: true` un `acceptTerms: true`; laiks tiek saglabāts `terms_accepted_at`.
- Beigušās sesijas un konti, kas nav lietoti 24 mēnešus (izņemot `admin`), tiek dzēsti automātiski — ne biežāk kā reizi 6 h, pie jebkura pieslēgta pieprasījuma (`maybeCleanup` failā `src/server/db.js`). Termiņš `INACTIVE_MONTHS` jāsaskaņo ar `scripts/cleanup.js` un politiku.

**Ja pievieno jaunu lauku ar personas datiem vai jaunu ārēju servisu, atjauno datu tabulu saknes README un `content/privacy.md`.**

## AI skolotājs

- Kods: `src/server/ai.js` (meklēšana, limiti, DeepSeek izsaukums) un `src/pages/api/ai/tutor.js`.
- Uz DeepSeek tiek sūtīts: sistēmas instrukcija, līdz 4 atrasti eksāmenu uzdevumi, pēdējās 6 čata ziņas un jaunais jautājums (līdz 1500 simboliem). Vārds, e-pasts un skola **netiek** sūtīti.
- Dienas limits pēc Rīgas laika: free 10, premium 100.
- **Piekrišana:** pirms pirmā jautājuma čats parāda brīdinājumu par datu nosūtīšanu ārpus ES. `POST /api/me/ai-consent` saglabā piekrišanu, `DELETE` to atsauc (profilā). Bez piekrišanas `/api/ai/tutor` atbild ar 403 (`NO_AI_CONSENT`).
- Bez `DEEPSEEK_API_KEY` API atbild ar 503 un čats parāda, ka AI nav ieslēgts.

## Struktūra

```
src/
  components/     Button, Card, Modal, Navbar, Sidebar, AppShell, SubjectSelect, ThemeSwitcher …
  features/
    dashboard/    DashboardMain, ProgressSummaryWidget, UpcomingDeadlinesWidget, QuickActions, ProgressTracking
    planner/      DeadlineRadar, StudyPlannerCalendar, TaskView, AddTaskModal
    exams/        ExamSelector, ExamTaskList, QuizMode, QuizBuilder, AiTutorChat
    profile/      SubjectManager
  lib/            AppContext (lietotājs + dati), helpers, device, emptyData, markdown (politikas lapai)
  pages/          index, login, register, dashboard, planner, exams, progress, profile, admin, privacy, terms
  pages/api/      auth/register, auth/login, auth/logout, me, me/data, me/export, me/ai-consent, ai/tutor, admin/overview, health
  server/         db.js (PostgreSQL), ai.js (DeepSeek + meklēšana), http.js (metodes, pieslēgšanās, admin pārbaude)
db/               init.sql, migrations/
scripts/          migrate.js, import-exams.js, cleanup.js
content/          privacy.md (/privacy), terms.md (/terms)
exams/            eksāmenu JSON faili
```

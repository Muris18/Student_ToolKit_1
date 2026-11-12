# Study Pilot

Eksāmenu sagatavošanās platforma skolēniem (klase) un studentiem (kurss): plānotājs ar termiņu radaru, savi eksāmenu uzdevumi, savi testi, progresa analīze un AI skolotājs.

Projekta apraksts, datu saraksts un drošība — [saknes README](../README.md). Privātuma politika — [`content/privacy.md`](content/privacy.md) (lapa `/privacy`), lietošanas noteikumi — [`content/terms.md`](content/terms.md) (lapa `/terms`). Pēc teksta maiņas vajag jaunu build.

## Prasības

- **Node.js 22+** (pārbaude: `node -v`)
- **Docker** ar `docker compose` (PostgreSQL datubāzei; pārbaude: `docker compose version`)
- **Git** (repozitorija klonēšanai)

Kā uzstādīt:

| Sistēma | Node.js 22+ | Docker |
|---|---|---|
| **Windows** | Instalētājs no [nodejs.org](https://nodejs.org) vai `winget install OpenJS.NodeJS.LTS` (der jaunākā LTS versija) | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **macOS** | Instalētājs no [nodejs.org](https://nodejs.org) vai `brew install node@22` | [Docker Desktop](https://www.docker.com/products/docker-desktop/) vai `brew install --cask docker` |
| **Linux** | Ar [nvm](https://github.com/nvm-sh/nvm): `nvm install 22` (vai sava distributīva pakotnes, pārbaudi versiju ar `node -v`) | Docker Engine ar compose spraudni, skat. [instrukciju savam distributīvam](https://docs.docker.com/engine/install/) |

**Linux:** lai `docker` darbotos bez `sudo`, pievieno sevi grupai: `sudo usermod -aG docker $USER`, tad izrakstījies un pieteicies no jauna.

## Palaišana lokāli (Windows, macOS, Linux)

Pirms sākšanas:

- **Windows un macOS:** atver **Docker Desktop** un pagaidi, līdz tas ir startējis.
- **Linux:** pārliecinies, ka Docker darbojas, `docker ps` jāiet bez kļūdas.

### Ātrākais veids

Mapē `Study_Pilot`:

**Windows** (CMD vai PowerShell):

```cmd
powershell -ExecutionPolicy Bypass -File setup.ps1
npm run dev
```

**macOS un Linux** (Terminal):

```bash
bash setup.sh
npm run dev
```

(`bash setup.sh` der arī Git Bash uz Windows.) Skripts izveido `.env` ar nejaušu paroli, `.env.local` ar `DATABASE_URL`, instalē pakotnes, palaiž datubāzi, piemēro migrācijas un ielādē eksāmenus. Esošu `.env.local` tas nepārraksta. Pēc tam atver **http://localhost:3000** → *Izveidot kontu*.

Ja ports 5432 jau ir aizņemts (skat. [Biežākās problēmas](#biežākās-problēmas)), pirms skripta palaišanas izveido failu `.env` ar **divām** rindām. Skripts paroli lasa no šī faila, tāpēc ar vienu `DB_PORT` rindu nepietiek:

```env
POSTGRES_PASSWORD=izdomā_paroli
DB_PORT=5433
```

### Pa soļiem (ja skripts neder)

1. Izveido vides failus. Nokopē paraugu:

   - **Windows (CMD):** `copy .env.example .env`
   - **macOS un Linux:** `cp .env.example .env`

   Atver `.env` jebkurā redaktorā (Windows: `notepad .env`, macOS: `open -e .env`, Linux: `nano .env`) un aizpildi:

   ```env
   POSTGRES_PASSWORD=izdomā_paroli
   DB_PORT=5432
   ```

   Tajā pašā mapē izveido arī `.env.local` (tur ir `DATABASE_URL`, un šis fails nekad neiet Git):

   ```env
   DATABASE_URL=postgres://sp:izdomā_paroli@localhost:5432/sp
   DEEPSEEK_API_KEY=
   ```

   Parolei abos failos jābūt vienādai. `DEEPSEEK_API_KEY` var atstāt tukšu, tad AI čats paziņos, ka AI nav ieslēgts. Neliec komentārus tajā pašā rindā aiz vērtības.

2. Palaid datubāzi (tikai lokāli, ports atvērts tikai uz 127.0.0.1):

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
   ```

3. Instalē, piemēro migrācijas, ielādē eksāmenus un palaid:

   ```bash
   npm install
   npm run migrate
   npm run import:exams
   npm run dev
   ```

4. Atver **http://localhost:3000** → *Izveidot kontu*.

Pēc datora restarta nākamreiz pietiek ar: Windows un macOS atvērt Docker Desktop (Linux Docker parasti startē pats), tad `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db` un `npm run dev`. Dati datubāzē saglabājas.

### Administratora konts

Jauns konts vienmēr ir `user`. Lai kādu padarītu par administratoru:

```bash
docker compose exec db psql -U sp -c "UPDATE users SET role='admin' WHERE email='tavs@epasts.lv';"
```

Vai: `npm run create-admin -- tavs@epasts.lv` (tabula zemāk).

### Citas komandas

| Komanda | Ko dara |
|---|---|
| `npm run dev` | Izstrādes serveris (localhost:3000) |
| `npm run dev:lan` | Tas pats, bet pieejams arī no telefona tajā pašā tīklā |
| `npm run build` un `npm start` | Produkcijas režīms |
| `npm test` | Palaiž automātiskos testus (datubāze nav vajadzīga) |
| `npm run migrate` | Piemēro jaunās `db/migrations/*.sql` (drīkst palaist atkārtoti) |
| `npm run import:exams` | Ielādē `exams/*.json` datubāzē (skat. [`exams/README.md`](exams/README.md)) |
| `npm run cleanup` | Dzēš beigušās sesijas un 24 mēnešus neaktīvus kontus (lietotne to dara arī pati) |
| `npm run create-admin -- e-pasts [parole]` | Padara kontu par administratoru (vai izveido jaunu) |

## Biežākās problēmas

Komandas, kas atšķiras pa sistēmām, ir rādītas **Windows / macOS un Linux** formā.

| Kļūda | Cēlonis un risinājums |
|---|---|
| `password authentication failed for user "sp"` | Vai nu ports 5432 jau aizņemts ar citu PostgreSQL, vai arī parole `.env.local` nesakrīt ar `POSTGRES_PASSWORD`. Portu pārbauda: Windows `netstat -ano \| findstr :5432`, macOS un Linux `lsof -i :5432` (Linux arī `ss -ltnp \| grep 5432`). Risinājums: `.env` ieraksti `DB_PORT=5433`, `.env.local` nomaini `localhost:5432` uz `localhost:5433`, tad pārveido datubāzi (zemāk). |
| `docker` nav atpazīts (`command not found: docker`) | Docker nav uzstādīts, vai Windows terminālis atvērts pirms instalēšanas: aizver un atver jaunu. macOS un Linux: pārbaudi `which docker`. |
| `Cannot connect to the Docker daemon` | Docker nav palaists. Windows un macOS: atver Docker Desktop. Linux: `sudo systemctl start docker`. |
| `permission denied ... /var/run/docker.sock` (Linux) | Lietotājs nav `docker` grupā: `sudo usermod -aG docker $USER`, tad izrakstīties un pieteikties no jauna (īslaicīgi var lietot `sudo`). |
| `ECONNREFUSED` | Datubāze nedarbojas. Palaid Docker (skat. iepriekš) un `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db`. |
| `column ... does not exist` vai `relation ... does not exist` | Nav piemērotas migrācijas: `npm run migrate`. |
| `Port 3000 is in use` | Cits `npm run dev` jau darbojas. Aizver to vai atrodi procesu: Windows `netstat -ano \| findstr :3000` (jāaptur LISTENING process, ne pārlūks), macOS un Linux `lsof -i :3000`. |
| Brīdinājums par `engines` vai dīvainas kļūdas pēc `npm install` | Node versija ir vecāka par 22. Pārbaudi `node -v`; ar nvm: `nvm install 22 && nvm use 22`. |
| Čats raksta, ka AI nav ieslēgts | Nav `DEEPSEEK_API_KEY` failā `.env.local`. Pēc pievienošanas pārstartē `npm run dev`. |
| Čats raksta, ka dienas limits izmantots | Testēšanai `.env.local` pievieno `AI_DAILY_LIMIT_FREE=200` un pārstartē serveri. |
| Lapa izskatās vecā vai nemainās | Pārlūkā `Ctrl+F5` (macOS: `Cmd+Shift+R`). Pārbaudi, ka izmaiņas nav ielikušās nepareizā mapē (mapei `Study_Pilot` nedrīkst būt iekšā vēl viena `Study_Pilot`). |

**Datubāzes pārveidošana no nulles** (lokāli; izdzēš visus lokālos lietotājus un datus):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
npm run migrate
npm run import:exams
```

Paroli `docker` ieraksta tikai pirmajā izveidošanas reizē. Ja maini `POSTGRES_PASSWORD`, vajag `down -v`.

## Serverī (Hetzner, Docker Compose)

**Pilna instrukcija: [DEPLOY.md](DEPLOY.md).** Īsumā — tukšā Ubuntu serverī:

```bash
git clone https://github.com/Muris18/Student_ToolKit_1.git
cd Student_ToolKit_1/Study_Pilot
sudo bash scripts/server-setup.sh     # Docker, ugunsmūris, .env, HTTPS, eksāmeni, admins
sudo bash scripts/update.sh           # vēlāk: jaunākā versija no GitHub
```

Visi iestatījumi (`DOMAIN`, `DEEPSEEK_API_KEY`, `EMAIL_*`, `STRIPE_*` u.c.) ir aprakstīti [`.env.example`](.env.example). Neobligātās funkcijas (e-pasts, maksājumi) vienkārši ir izslēgtas, kamēr atslēga nav ievadīta.

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

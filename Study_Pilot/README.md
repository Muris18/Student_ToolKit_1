# Study Pilot

Eksāmenu sagatavošanās platforma skolēniem (klase) un studentiem (kurss): plānotājs ar termiņu radaru, savi eksāmenu uzdevumi, savi testi, progresa analīze un AI skolotājs.

Projekta apraksts, datu saraksts un drošība — [saknes README](../README.md). Privātuma politika — [`PRIVACY.md`](../PRIVACY.md).

## Prasības

- **Node.js 18.17+** (ieteicams 20)
- **Docker Desktop** (PostgreSQL datubāzei)

## Palaišana lokāli (Windows CMD)

1. Izveido vides failu:

   ```cmd
   copy .env.example .env
   notepad .env
   ```

   Aizpildi:

   ```env
   POSTGRES_PASSWORD=izdomā_paroli
   DATABASE_URL=postgres://sp:izdomā_paroli@localhost:5432/sp
   DEEPSEEK_API_KEY=
   ```

   `DEEPSEEK_API_KEY` var atstāt tukšu — tad AI čats paziņos, ka AI nav ieslēgts. Neliec komentārus tajā pašā rindā aiz vērtības.

2. Palaid datubāzi (tikai lokāli, ports atvērts tikai uz 127.0.0.1):

   ```cmd
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
   ```

   Pirmajā palaišanā automātiski izpildās `db/init.sql` (tabulas `users` un `sessions`).

3. Instalē, piemēro migrācijas, ielādē eksāmenus un palaid:

   ```cmd
   npm install
   npm run migrate
   npm run import:exams
   npm run dev
   ```

4. Atver **http://localhost:3000** → *Izveidot kontu*.

`setup.sh` / `setup.ps1` dara 2. soli automātiski un izveido paroli.

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

## Serverī (Hetzner, Docker Compose)

`.env` serverī: `POSTGRES_PASSWORD`, `DOMAIN`, `DEEPSEEK_API_KEY` (pēc izvēles `AI_DAILY_LIMIT_FREE`, `AI_DAILY_LIMIT_PREMIUM`).

```bash
docker compose up -d --build
docker compose exec app npm run import:exams
```

`docker-compose.yml` palaiž trīs konteinerus:

- **db** — PostgreSQL 16, dati Docker volume `pgdata`, ports uz āru netiek atvērts;
- **app** — Next.js; startā izpilda `npm run migrate` un `npm start`;
- **caddy** — HTTPS un reverse proxy uz `app:3000`, sertifikāts automātiski domēnam `DOMAIN`.

## Kā darbojas dati

Visi lietotāju dati glabājas **PostgreSQL** datubāzē un saglabājas arī pēc servera restartēšanas.

| Tabula | Saturs |
|---|---|
| `users` | e-pasts, paroles hash + sāls, loma, plāns, `profile` (vārds, uzvārds, līmenis, klase/kurss, skola, programma), `data` (priekšmeti, termiņi, uzdevumi, testi, rezultāti, čats, aktivitāte), izveides un pēdējās aktivitātes laiks |
| `sessions` | sesijas žetona SHA-256 hash, lietotājs, derīguma termiņš (30 dienas) |
| `ai_usage` | lietotājs, laiks, modelis, tokenu skaits — tikai limitiem un izmaksām |
| `exam_documents`, `exam_tasks` | eksāmenu uzdevumi AI skolotājam (bez personas datiem) |

- Klients visu `data` objektu sūta ar `PUT /api/me/data` (līdz 2 MB).
- `DELETE /api/me` dzēš lietotāju; sesijas un `ai_usage` tiek izdzēstas automātiski (`ON DELETE CASCADE`).
- Pārlūkā glabājas tikai `sp-session` (žetons), `sp-theme` un `sp-splash`. Sīkdatņu un analītikas nav.
- Beigušās sesijas pašlaik netiek dzēstas automātiski. Manuāli: `DELETE FROM sessions WHERE expires_at < now();`

**Ja pievieno jaunu lauku ar personas datiem vai jaunu ārēju servisu, atjauno datu tabulu saknes README un `PRIVACY.md`.**

## AI skolotājs

- Kods: `src/server/ai.js` (meklēšana, limiti, DeepSeek izsaukums) un `src/pages/api/ai/tutor.js`.
- Uz DeepSeek tiek sūtīts: sistēmas instrukcija, līdz 4 atrasti eksāmenu uzdevumi, pēdējās 6 čata ziņas un jaunais jautājums (līdz 1500 simboliem). Vārds, e-pasts un skola **netiek** sūtīti.
- Dienas limits pēc Rīgas laika: free 10, premium 100.
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
  lib/            AppContext (lietotājs + dati), helpers, device, emptyData
  pages/          index, login, register, dashboard, planner, exams, progress, profile, admin
  pages/api/      auth/register, auth/login, auth/logout, me, me/data, ai/tutor, admin/overview, health
  server/         db.js (PostgreSQL), ai.js (DeepSeek + meklēšana), http.js (metodes, pieslēgšanās, admin pārbaude)
db/               init.sql, migrations/
scripts/          migrate.js, import-exams.js
exams/            eksāmenu JSON faili
```

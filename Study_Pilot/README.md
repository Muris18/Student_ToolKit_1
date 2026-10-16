# Study Pilot

Eksāmenu sagatavošanās platforma skolēniem (klase) un studentiem (kurss): plānotājs ar termiņu radaru, savi eksāmenu uzdevumi, savi testi, progresa analīze un AI čata logs.

## Palaišana

Vajag **Node.js 18.17+** (ieteicams 20).

```bash
npm install
npm run dev
```

Atver **http://localhost:3000** → *Izveidot kontu*.

### GitHub Codespaces

1. GitHub repo → **Code → Codespaces → Create codespace**.
2. `.devcontainer` pats izpilda `npm install` un `npm run dev`.
3. Ports **3000** atveras automātiski (vai cilnē *Ports* → 3000 → 🌐).

Ja kaut kas neiet, terminālī vienkārši: `npm install && npm run dev`.

### Citas komandas

| Komanda | Ko dara |
|---|---|
| `npm run dev` | Izstrādes serveris (localhost:3000) |
| `npm run dev:lan` | Tas pats, bet pieejams arī no telefona tajā pašā tīklā |
| `npm run build && npm start` | Produkcijas režīms |

## Kā darbojas dati

**Nav datubāzes.** Visi dati (konti, priekšmeti, termiņi, uzdevumi, testi, čata ziņas) glabājas **servera atmiņā**, kamēr darbojas `npm run dev`.

- Katru reizi, kad serveri palaiž no jauna, **viss ir pilnīgi tīrs** un jāreģistrējas no jauna.
- Pārlūka lapas pārlādēšana datus nezaudē (kamēr serveris strādā).
- Kods: `src/server/db.js` (atmiņas "DB") + `src/pages/api/*` (REST API). Ja kādreiz pievienos īstu DB, jāaizstāj tikai `db.js`.

## AI čats

`src/features/exams/AiTutorChat.js` ir **tikai čata logs** — ziņas tiek parādītas un saglabātas, bet nekāda AI atbilde netiek ģenerēta un nekāds AI API netiek izsaukts.

## Struktūra

```
src/
  components/     Button, Card, Modal, Navbar, Sidebar, AppShell, SubjectSelect …
  features/
    dashboard/    DashboardMain, ProgressSummaryWidget, UpcomingDeadlinesWidget, QuickActions, ProgressTracking
    planner/      DeadlineRadar, StudyPlannerCalendar, TaskView, AddTaskModal
    exams/        ExamSelector, ExamTaskList, QuizMode, QuizBuilder, AiTutorChat
    profile/      SubjectManager
  lib/            AppContext (lietotājs + dati), helpers, device
  pages/          index, login, register, dashboard, planner, exams, progress, profile, admin
  pages/api/      auth/register, auth/login, auth/logout, me, me/data, admin/overview, health
  server/         db.js (atmiņas datubāze), http.js
  services/       supabaseClient, examService, api (vēlākām fāzēm, pašlaik netiek izmantoti)
```

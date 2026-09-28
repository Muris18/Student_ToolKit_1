# Student_ToolKit_1
Student toolkit prototype


# Student Toolkit

Free, fast tools for students in one place: GPA and grades, study planning, budgeting, deadlines, focus timer and more.

It is a static website built with plain HTML, CSS and JavaScript. There is no build step, no server, no database and no sign-up. Everything runs in the browser, so it can be hosted for free.

## Features

**Study**
- GPA Calculator: weighted average by credits
- Grade Calculator: points to percentage and letter grade
- Pomodoro Timer: custom focus and break lengths, beeps when a block ends
- Exam Countdown: several exams, live countdown, saved in the browser
- Student Score: exam readiness from 0 to 100
- Grade Predictor: average needed on the remaining work to reach a target grade
- Study Planner: spreads topics over the days until the exam (rule-based, no AI)

**Money**
- Budget Calculator: income, expenses and what is left
- Savings Calculator: months needed to reach a goal
- Can I Afford It?: simple verdict from price, income, expenses and savings

**Progress**
- Deadline Radar: deadlines sorted by urgency with colour coding
- Student Streaks: XP, levels, daily streak and a 7-day chart
- Student Dashboard: next exam, next deadlines and streak in one view

**Career**
- Salary Calculator: hourly rate to gross weekly, monthly and yearly pay

**Tools**
- Word Counter: words, characters, sentences, paragraphs, reading time
- Password Generator: secure random passwords using the browser's crypto API

**Site features:** search on the home page, categories, light and dark theme, mobile-first layout, keyboard-friendly forms with labels, About, Privacy and 404 pages.

**Coming soon (shown as cards, not built):** AI Study Planner, Photo to Study Plan, AI Homework Helper, Study Rooms. These need a backend, AI API and user accounts.

## Tech

- HTML, CSS, JavaScript (no frameworks, no dependencies)
- System font stack, no external requests, no tracking
- Data stored with `localStorage` in the visitor's browser

## Project structure

```
student-toolkit/
├── README.md
└── public/                 <- the whole website, upload this folder
    ├── index.html          home: search and categories
    ├── about.html
    ├── privacy.html
    ├── 404.html
    ├── robots.txt
    ├── css/
    │   └── style.css       shared design (colours, layout, dark mode)
    ├── js/
    │   ├── app.js          shared: mobile menu and theme toggle
    │   ├── home.js         home page search
    │   └── <tool>.js       logic for each tool
    └── tools/
        └── <tool>.html     one page per tool
```

## Run locally

Option 1: open `public/index.html` in a browser.

Option 2 (recommended, behaves like a real host): from the project folder run

```
npx serve public
```

and open the address it prints. This needs Node.js installed.

## Deploy (free)

The site is the `public` folder.

- **Cloudflare Pages or Vercel:** connect the GitHub repository, leave the build command empty and set the output directory to `public`.
- **Netlify:** drag and drop the `public` folder onto the Netlify deploy page.
- **GitHub Pages:** publish the contents of `public` (for example from a `docs` folder or a deploy branch).

### Before you publish
- [ ] Add a contact email in `public/about.html`
- [ ] Update `public/privacy.html` if you add analytics, ads or accounts
- [ ] Choose the final project name and replace "Student Toolkit" if needed (logo, page titles, footer)
- [ ] Optional: add a `sitemap.xml` with your real domain and point to it in `robots.txt`
- [ ] Open every tool once on your phone and on a desktop browser

## Saved data and privacy

Nothing is sent to a server. These items are saved in the visitor's browser only:

| Key | Used by | Contains |
| --- | --- | --- |
| `theme` | all pages | light or dark choice |
| `exams` | Exam Countdown, Dashboard | exam names and times |
| `deadlines` | Deadline Radar, Dashboard | deadline titles, courses, times, done state |
| `streaks` | Student Streaks, Dashboard | minutes studied per day |

Clearing browser data removes all of it.

## Adding a new tool

1. Copy an existing page from `public/tools/` (for example `grade.html`) and rename it.
2. Change the `<title>`, description, heading and the form fields.
3. Create `public/js/<name>.js` with the logic and reference it at the bottom of the page after `../js/app.js`.
4. Add a card in the right section of `public/index.html`. The `data-search` text (lowercase) is what the search box matches.
5. Reuse the classes from `style.css`: `panel`, `field-row`, `btn`, `result`, `stats`, `list`, `item`.

Guidelines: validate all input, show a clear error message, never build HTML from user text with `innerHTML` (use `textContent`), and give every input a `<label>`.

## Testing checklist

Calculators should be checked with known results:
- GPA: grades 8 (4 credits) and 6 (2 credits) give 7.33
- Grade: 42 out of 50 gives 84.0% (B)
- Grade Predictor: 70% on 60% of the grade, target 75%, needs 82.5%
- Savings: goal 1200, saved 200, 50 per month gives 20 months
- Salary: 8 per hour, 20 hours, 52 weeks gives 693.33 per month
- Budget: income 800 minus 650 expenses leaves 150

Also check: empty inputs, negative numbers, very large numbers, mobile width, dark mode and keyboard-only use.

## Roadmap

1. Publish the current version and collect first users
2. Add analytics and see which tools are used
3. Add SEO landing pages and short social videos
4. Add accounts and cloud sync (for example with Supabase)
5. Add Premium features, then AI tools with usage limits (API keys must live on a server, never in browser code)

Guiding principle: build, publish, measure, get feedback, improve, then monetize.

## License

Add your license here (for example MIT) before making the repository public.

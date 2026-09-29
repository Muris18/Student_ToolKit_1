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
    ├── account/
    │   ├── signin.html      log in (email/password + Google/Facebook/Apple)
    │   ├── signup.html      create account
    │   ├── reset-password.html forgot-password flow
    │   └── profile.html     edit display name and bio (requires login)
    └── tools/
        └── <tool>.html     one page per tool
```

Accounts are powered by [Supabase](https://supabase.com) (free tier). The `supabase/schema.sql`
file (one level above `public/`) sets up the database table these pages need.

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

## Accounts (sign in / sign up)

Sign in, sign up, password reset and a basic profile (display name + bio) are built in, with
email/password and Google, Facebook and Apple as one-click options. This needs a free
[Supabase](https://supabase.com) project — there is no bundler or npm install involved, the
site loads the Supabase client straight from a CDN.

### Set it up (about 10 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor**, paste the contents of `supabase/schema.sql`
   from this project, and run it. This creates the `profiles` table and locks it down so people
   can only read and edit their own row.
3. Go to **Project Settings -> API** and copy the **Project URL** and the **anon public key**.
4. Open `public/js/supabase-client.js` and paste them in place of `YOUR-PROJECT` and
   `YOUR-ANON-PUBLIC-KEY`.
5. In **Authentication -> URL Configuration**, add the URL(s) you will host the site on (and
   `http://localhost:3000` while testing) as allowed redirect URLs.

At this point email/password sign up and login already work. Until you add real keys, the
sign-in and sign-up pages show a message saying accounts are not set up yet, instead of failing
silently.

### Adding Google, Facebook and Apple sign-in

Each provider is a separate setup in **Authentication -> Providers** in Supabase, and each needs
you to create a developer app with that company first:

- **Google:** create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/),
  then paste the client ID and secret into Supabase's Google provider settings.
- **Facebook:** create an app at [developers.facebook.com](https://developers.facebook.com/),
  add Facebook Login, then paste the app ID and secret into Supabase.
- **Apple:** requires a paid [Apple Developer](https://developer.apple.com/) account
  (99 USD/year) to create a Sign in with Apple key, which then goes into Supabase.

Supabase shows the exact redirect URL to paste into each provider's settings, and their setup
screens change from time to time, so follow Supabase's own
[social login guides](https://supabase.com/docs/guides/auth/social-login) for the current steps.
You do not have to add all three at once — the buttons for providers you have not configured
will just show an error if someone clicks them, so only enable the ones you have set up, or
remove the unused buttons from `signin.html` / `signup.html`.

### How it fits with the rest of the site

The header on every page checks whether someone is signed in and shows either "Log in / Sign up"
or their name (linking to their profile) and a "Log out" button. This does not yet connect the
Exam Countdown, Deadline Radar or Student Streaks data (currently saved with `localStorage`) to
the account — that would be the next step if you want that data to follow a user between devices.

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

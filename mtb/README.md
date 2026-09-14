# MyTutBuddy

Interactive online Maths worksheets — built with plain HTML/CSS/JavaScript,
no framework, no database. Worksheets are stored as structured data and a
small build script turns them into real, SEO-friendly static pages.

👉 **To add a new worksheet, see [HOW_TO_ADD_A_WORKSHEET.md](./HOW_TO_ADD_A_WORKSHEET.md).**
That's the file you'll use day-to-day — everything below is background on how
the pieces fit together.

## How it works

```
data/worksheets/*.json   ← one file per worksheet (the content you edit)
templates/*.mjs          ← reusable page templates (rarely need editing)
scripts/build.mjs        ← reads the data, generates the whole site
static/                  ← CSS, and a self-hosted copy of KaTeX (maths rendering)
dist/                    ← generated output (not committed — built automatically)
```

Running the build turns each worksheet's JSON file into its own real HTML
page at a clean address, e.g.:

```
data/worksheets/solving-linear-equations.json
  → /worksheets/gcse/algebra/solving-linear-equations/
```

It also (re)generates the homepage, the searchable worksheet library page,
`sitemap.xml`, and `robots.txt` — all automatically, from whatever worksheet
files exist in `data/worksheets/`.

## Deployment

This repo is set up to deploy to **GitHub Pages automatically** via
`.github/workflows/deploy.yml`. Every time you push to `main`:

1. GitHub Actions runs `node scripts/build.mjs`
2. The generated `dist/` folder is published to GitHub Pages

**One-time setup required on GitHub:** in the repository's
**Settings → Pages**, set the "Source" to **GitHub Actions**. After that,
you never need to touch it again — pushing new worksheet files is enough.

The site will be live at:
```
https://naheed-ui.github.io/mytutbuddy/
```
(If you later connect a custom domain, update `SITE_URL` and `BASE_PATH` in
`scripts/config.mjs` — see the comments in that file.)

## Building locally (optional)

You don't need to do this — GitHub Actions builds it for you on every push.
But if you want to preview changes on your own computer first:

```bash
node scripts/build.mjs
npx serve dist
```

Requires [Node.js](https://nodejs.org) installed (no other dependencies).

## What's included in this first version

- Homepage, searchable/filterable worksheet library, individual worksheet pages
- Maths rendering via self-hosted KaTeX (fractions, powers, roots, equations)
- Five question types: text answer, multiple choice, dropdown, true/false, matching
- Progress bar, instant scoring, correct/incorrect highlighting, try again
- SEO: unique title/description per worksheet, clean URLs, canonical tags,
  sitemap.xml, robots.txt, structured data (JSON-LD)
- Fully responsive (desktop, tablet, mobile)
- Friendly build-time validation — a broken worksheet file fails the build
  with a plain-English error instead of publishing a broken page

## Deliberately left out of v1 (by design, per the project brief)

- No PDF downloads — everything is completed online
- No subjects other than Maths
- No teacher accounts / login system yet
- No drag-and-drop matching (uses accessible dropdown-based matching instead)
- No custom graph-plotting tool yet (worksheets can still include a static
  diagram image where needed)

These can be layered on top later without restructuring what's here.

# SAV Mechanical Services & Supplies — Website

Static, SEO-friendly company website for SAV Mechanical Services & Supplies Ltd., Part.
Built with **Next.js (static export) + Tailwind CSS v4**, deployable for free on **GitHub Pages**.

Why this stack: pages are pre-rendered to plain HTML at build time, so Google (and Google Ads/GDN
landing page checks) see fully-formed content immediately — no client-side rendering delay.

## 1. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 2. Before you go live — replace these placeholders

- `public/logo.png` — your real SAV logo file (the homepage currently renders a text-based
  fallback logo so the site works without it; swap in the real PNG/SVG when ready and update
  the `<Logo>` component in `app/page.tsx` to use an `<Image>` tag instead).
- `public/og-image.jpg` — a 1200×630px image used for link previews (LINE, Facebook, Google Ads).
- Contact form `action` in `app/page.tsx` — currently points to a placeholder Formspree URL.
  Create a free form at https://formspree.io, then replace `YOUR_FORM_ID`.
- `siteUrl` in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts` — set to your real domain
  once you have one. Until then the placeholder won't break anything locally or on GitHub Pages.
- Google Ads / GA4 tag — paste your `gtag.js` snippet into the `<head>` in `app/layout.tsx`
  (marked with a `TODO` comment) once you have your Ads/Analytics account IDs.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: SAV website"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

(Create the empty repo first at https://github.com/new — don't initialize it with a README,
so the push above doesn't conflict.)

## 4. Turn on GitHub Pages

1. On GitHub, go to your repo → **Settings → Pages**
2. Under "Build and deployment", set **Source** to **GitHub Actions**
3. Push to `main` (or re-run the workflow from the **Actions** tab) — the included workflow
   at `.github/workflows/deploy.yml` builds and deploys automatically
4. Your site will be live at `https://<your-username>.github.io/<your-repo-name>/`

### If your repo name isn't `<your-username>.github.io`

GitHub Pages serves project repos at a sub-path (`/<repo-name>/`). Open `next.config.mjs` and
uncomment the `basePath` / `assetPrefix` lines, replacing `REPO_NAME` with your actual repo name,
then push again. (Skip this step entirely if you name the repo `<your-username>.github.io`, or
once you point a custom domain at it.)

## 5. Later: custom domain

Once you buy a domain, add a `public/CNAME` file containing just the domain (e.g. `savthai.com`),
point its DNS at GitHub Pages per GitHub's docs, and remove the `basePath`/`assetPrefix` lines
from `next.config.mjs` again.

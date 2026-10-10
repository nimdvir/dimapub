# dimapub.com

The Dima Publishing website: an [Astro](https://astro.build) static site deployed to GitHub Pages at **dimapub.com**.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Where things live

| What | Where |
| --- | --- |
| Site name, email, reader link, book price | `src/data/site.ts` |
| Book copy: differences, table of contents, FAQ | `src/data/book.ts` |
| Shared navbar / footer / page shell | `src/components/Header.astro`, `Footer.astro`, `src/layouts/Base.astro` |
| Colors, type, buttons | `src/styles/global.css` |
| Pages | `src/pages/` (one file per URL) |
| Image & video URLs (Cloudinary) | `src/lib/media.ts` |
| Contact form backend | `supabase/functions/contact/index.ts` |
| Database schema | `supabase/migrations/` |
| Original brand media | `brand/` |

## Starfield background

The gold starfield is an adaptation of the React Bits [Galaxy](https://www.reactbits.dev/backgrounds/galaxy) background
(MIT + Commons Clause, notice kept in `src/scripts/galaxy.ts`), rendered with [ogl](https://github.com/oframe/ogl).
Use `<Galaxy />` inside a dark `.on-night` section; `Base.astro` adds a faint `variant="paper"` layer in the side
margins of every page. It pauses off-screen and in background tabs, and stays still for reduced-motion visitors.

## Media

All images and animations are served from Cloudinary (`dkndq6lyz`, folder `dimapub`). The large source GIFs are
delivered as short MP4/WebM loops (about 150–300 KB instead of 4 MB) using on-the-fly transformations; see
`src/lib/media.ts`.

## Backend (Supabase project `dimapub`)

- **Contact form & updates list** → `contact` edge function → `contact_messages` / `subscribers` tables, plus an
  email notification to dimapublishingllc@gmail.com through Resend. The function needs a `RESEND_API_KEY` secret
  (Supabase dashboard → Edge Functions → Secrets). Without it, messages are still saved; only the email is skipped.
- **Partner portal** (`/portal/`) → Supabase Auth (email + password). Only emails listed in `portal_members` can see
  rows in `research_reports` and files in the private `research` storage bucket.

### Add someone to the portal

1. Supabase → Authentication → Users → **Add user** (email + password).
2. Table editor → `portal_members` → insert their email.

### Publish a report

1. Storage → `research` bucket → upload the file (e.g. `2026/market-sizing.pdf`).
2. Table editor → `research_reports` → new row with a `title`, `summary`, `category` and `file_path`
   (`2026/market-sizing.pdf`). You can use `external_url` or `body_md` instead of a file.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.
`public/CNAME` sets the custom domain to `dimapub.com`.

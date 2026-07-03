# PerfectHire Global website

This repo is the production site for perfecthireglobal.com: a plain HTML/CSS/JS
site with one small Cloudflare Pages Function for live job listings. It was
implemented from a Claude Design handoff bundle (see below for that original
context, kept for reference).

## Site structure

- `index.html`, `for-companies.html`, `investors.html`, `jobs.html`, `about.html`, `contact.html` — the six pages, each self-contained (nav/footer duplicated on purpose, no build step)
- `css/styles.css` — shared base styles, fonts, animations
- `js/main.js` — shared behavior: homepage live placements ticker/map beacon, the US/Europe expansion toggle, the Jobs page listing fetch, the Contact page submit button
- `assets/` — logo, Ralph's photo, world map graphic, social share image
- `functions/api/jobs.js` — Cloudflare Pages Function that reads open roles from Notion server side (see `docs/notion-jobs-schema.md`)
- `404.html` — branded not-found page (Cloudflare Pages serves this automatically)
- `robots.txt`, `sitemap.xml` — SEO / crawler files

## SEO

Every page has: a unique `<title>` and meta description, a canonical URL, Open
Graph + Twitter Card tags (with an absolute `brand-social.png` share image),
`theme-color`, and favicons. The homepage also carries `Organization`
JSON-LD structured data. `sitemap.xml` and `robots.txt` are at the root.

All canonical/OG/sitemap URLs use the apex domain `https://perfecthireglobal.com`.
If you decide to serve the site from `www.` instead, do a find/replace of that
base URL across the HTML files, `sitemap.xml` and `robots.txt`, and set the
other host to 301-redirect to your chosen one (see go-live step 6).

## Go-live step plan (GitHub -> Cloudflare Pages -> Strato domain)

1. **GitHub.** Create a free GitHub account if you do not have one, and push this repo to a new GitHub repository. This can be done entirely through the GitHub website (upload the files, or let your coding agent push) &mdash; no command line needed.
2. **Cloudflare Pages.** In Cloudflare, create a Pages project and connect it to that GitHub repo.
   - Build command: none / leave empty
   - Build output directory: `/` (repo root)
   - You immediately get a live preview URL like `your-project.pages.dev` to test on.
3. **Notion env vars.** In the Pages project settings, add the two variables from `docs/notion-jobs-schema.md` (`NOTION_TOKEN`, `NOTION_DATABASE_ID`) once the Notion database exists, so `/api/jobs` serves live vacancies. The site works without them &mdash; Jobs falls back to a representative list until they are set. Redeploy after adding them.
4. **Test on the `.pages.dev` URL.** Click every page, the Calendly buttons, the Jobs list, the contact form. Nothing here touches your live domain or email yet.
5. **Custom domain in Cloudflare.** In the Pages project, add the custom domain `perfecthireglobal.com` (and `www.perfecthireglobal.com`). Cloudflare shows you the exact DNS records to create.
6. **DNS at Strato (do this last, carefully).** This is the only risky step, because your Microsoft 365 email lives on this domain.
   - **Before touching anything, write down all current DNS records at Strato** &mdash; especially `MX`, and the `TXT` records for `SPF`, `DKIM` and `DMARC`. These keep your email working.
   - Add/point only the website records (the `A` / `CNAME` for the apex and `www`) to what Cloudflare told you in step 5. **Leave every `MX` and mail-related `TXT` record exactly as it is.**
   - Pick one canonical host (this build uses the apex `perfecthireglobal.com`) and set the other (`www`) to redirect to it &mdash; Cloudflare Pages does this for you when both are added.
   - The old Wix site stays live as a fallback until DNS fully switches over, so there is no downtime window where the site is blank.
7. **Verify email still flows** after the DNS change: send a test mail to and from your `@perfecthireglobal.com` address. If anything is off, the MX/SPF/DKIM/DMARC records you wrote down in step 6 are the thing to restore.
8. **Search engines.** Once live on the real domain: add the site to Google Search Console, verify ownership, and submit `https://perfecthireglobal.com/sitemap.xml`. Do the same in Bing Webmaster Tools if you want.

Every later push to the connected GitHub branch redeploys automatically.

## Known placeholders / follow ups

- **Office addresses**: the Contact page intentionally does not list street addresses (only city and email), per your instruction that they are not important for now.
- **Contact form**: it does not send anywhere yet. Submitting it opens your Calendly link in a new tab, matching the original design &mdash; there is no backend collecting the form fields. Say the word if you want submissions captured somewhere (email, a spreadsheet, a CRM).
- **Domain cutover from Strato**: moving perfecthireglobal.com to point at the new Cloudflare Pages site is a DNS change, not a code change. Do this last, with the current Wix site still live as a fallback, and carry over your existing MX/SPF/DKIM/DMARC records exactly so Microsoft 365 email keeps working. Happy to walk through this step by step when you are ready.
- **Mobile layout**: the original design files had no mobile/responsive rules (fixed widths throughout), so the implementation matches that as built. Let me know if you want a responsive pass.

---

# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 1 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Find the primary design file under `project/` and read it top to bottom.** The chat transcripts will tell you which file the user was last iterating on. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `# PerfectHire Global Redesign` project files (HTML prototypes, assets, components)

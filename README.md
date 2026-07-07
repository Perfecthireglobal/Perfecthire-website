# PerfectHire Global website

This repo is the production site for perfecthireglobal.com: a plain HTML/CSS/JS
site with one small Cloudflare Pages Function for live job listings. It was
implemented from a Claude Design handoff bundle (see below for that original
context, kept for reference).

## Site structure

- `index.html`, `for-companies.html`, `investors.html`, `jobs.html`, `about.html`, `contact.html` — the six main pages, each self-contained (nav/footer duplicated on purpose, no build step)
- `apply.html` — open application page for candidates (CV upload or LinkedIn link)
- `thanks.html` — post-submit page doubling as a VSL / "why work with us" page. **To add your video:** open `thanks.html` and replace the placeholder video block with your embed (there's a commented example for YouTube/Vimeo/Loom right above it).

## Conversion elements you can personalise

- **Homepage "Without / With PerfectHire"** — the notification-style comparison with Gmail/Slack/Shopify icons. Pure HTML/CSS, edit the copy in `index.html`.
- **Testimonials as messages** — the homepage testimonials look like real email/WhatsApp/Slack messages. Each has an app icon **and** a profile photo. The photos are placeholders at `assets/review-nicole.png`, `review-ellen.png`, `review-pete.png`, `review-simran.png` — **overwrite those four files with real headshots (same filenames)** and they appear automatically. Same placeholders are used on `thanks.html`.
- **FAQ accordions** — on the homepage and the Investors page (`.faq` blocks). Add/edit questions directly in the HTML; the open/close behaviour is handled by `js/main.js`.
- `css/styles.css` — shared base styles, fonts, animations
- `js/main.js` — shared behavior: homepage live placements ticker/map beacon, US/Europe expansion toggle, Jobs listing fetch + filters, and the form helpers (redirect target + application validation)
- `assets/` — logo, Ralph's photo, world map graphic, social share image
- `functions/api/jobs.js` — Cloudflare Pages Function that reads the open-roles list from Notion server side (see `docs/notion-jobs-schema.md`)
- `functions/jobs/[slug].js` — Cloudflare Pages Function that renders each job's own detail page at a clean URL like `/jobs/country-manager-uk`, server-side from Notion. The Jobs list links to these; the slug comes from the Notion `Slug` field (or is generated from the title). If Notion is not configured or the role is gone, it shows a branded "role no longer listed" page.
- `404.html` — branded not-found page (Cloudflare Pages serves this automatically)
- `robots.txt`, `sitemap.xml` — SEO / crawler files

## Forms & email (FormSubmit)

Both forms send straight to **info@perfecthireglobal.com** with no backend, using the free [FormSubmit](https://formsubmit.co) service:

- **Contact page** (`contact.html`) — the "Request my consultation" form emails you the buyer's details. The separate "Pick a time on our calendar" button still goes straight to Calendly.
- **Apply page** (`apply.html`) — an open application for candidates: name, email, **mobile phone**, and either a **CV upload** (arrives as an email attachment) **or** a **LinkedIn URL**. The form requires at least one of CV/LinkedIn.

**One-time activation (required):** the very first time either form is submitted, FormSubmit sends a confirmation email to info@perfecthireglobal.com with an "Activate form" button. Click it once. After that, every submission arrives automatically. Do this test submit yourself on the live `.pages.dev` URL before launch.

After submitting, visitors land on the branded `thanks.html`. That redirect target is set at runtime by `js/main.js`, so it works on both the preview URL and the live domain automatically.

To change the destination address later, edit the `action="https://formsubmit.co/…"` line in `contact.html` and `apply.html`. To cut spam, FormSubmit gives you a hashed URL (e.g. `https://formsubmit.co/abcdef…`) after activation that you can swap in so your email address is not visible in the page source.

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
4. **Test on the `.pages.dev` URL.** Click every page, the Calendly buttons, the Jobs list and filters. Submit the contact form and the apply form once each — the first submit triggers the FormSubmit activation email to info@perfecthireglobal.com; click "Activate form" so real submissions come through from then on.
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
- **Forms**: both the contact form and the candidate apply form email info@perfecthireglobal.com via FormSubmit (see the "Forms & email" section above). Remember the one-time activation click on first submit.
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

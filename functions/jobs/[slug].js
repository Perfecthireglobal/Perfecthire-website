// Cloudflare Pages Function: GET /jobs/<slug>
// Renders a single job detail page, server-side, from the Notion "Vacatures"
// database. Clean URLs like /jobs/country-manager-france-benelux match the
// slug stored in Notion (or one generated from the title).
//
// Uses the same env vars as functions/api/jobs.js:
//   NOTION_TOKEN, NOTION_DATABASE_ID

const CALENDLY = 'https://calendly.com/perfecthire/introduction-call-perfecthireglobal';

function plainText(rt) {
  return (rt || []).map((t) => t.plain_text).join('').trim();
}
function slugify(input) {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
// Render multi-line rich text into HTML paragraphs / list items.
function paragraphs(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return '';
  return lines.map((l) => `<p style="font-size:15.5px;line-height:1.7;color:#aeb9c4;margin:0 0 14px;">${esc(l)}</p>`).join('');
}
function bullets(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.replace(/^[-*•\s]+/, '').trim()).filter(Boolean);
  if (!lines.length) return '';
  return '<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;">'
    + lines.map((l) => `<li style="display:flex;gap:12px;font-size:15.5px;line-height:1.6;color:#aeb9c4;"><span style="color:var(--accent,#47AEF2);font-weight:700;flex:none;">&rarr;</span><span>${esc(l)}</span></li>`).join('')
    + '</ul>';
}

function page({ title, body, status, head, description, canonical }) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">` : ''}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#091429">
<link rel="icon" href="/assets/logo-navy.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
${head || ''}
</head>
<body>
<div style="--accent:#47AEF2;width:100%;background:#091429;color:#fff;font-family:'IBM Plex Sans',sans-serif;min-height:100vh;">
  <div style="position:sticky;top:0;z-index:50;background:rgba(9,20,41,.82);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06);">
    <div style="max-width:1240px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:16px 48px;">
      <a href="/index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
        <img src="/assets/logo-white.png" alt="PerfectHire" style="height:42px;width:auto;display:block;">
      </a>
      <button class="ph-nav-toggle" aria-label="Open menu"><span></span><span></span><span></span></button>
      <div class="ph-nav-links" style="display:flex;gap:28px;align-items:center;font-size:14px;color:#c1cdd8;font-weight:500;">
        <a href="/for-companies.html" style="color:#c1cdd8;text-decoration:none;">For Companies</a>
        <a href="/investors.html" style="color:#c1cdd8;text-decoration:none;">Investors</a>
        <a href="/jobs.html" style="color:#fff;text-decoration:none;">Jobs</a>
        <a href="/about.html" style="color:#c1cdd8;text-decoration:none;">About</a>
        <a href="/contact.html" style="color:#c1cdd8;text-decoration:none;">Contact</a>
        <a href="${CALENDLY}" target="_blank" rel="noopener" style="background:var(--accent,#47AEF2);color:#08172c;font-family:'Archivo',sans-serif;font-weight:700;padding:10px 18px;border-radius:8px;font-size:14px;box-shadow:0 6px 20px -6px rgba(71,174,242,.7);text-decoration:none;">Book a consultation</a>
      </div>
    </div>
  </div>
  ${body}
  <footer style="background:#091429;border-top:1px solid rgba(255,255,255,.06);">
    <div style="max-width:1240px;margin:0 auto;padding:56px 48px 40px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;align-items:center;">
      <img src="/assets/logo-white.png" alt="PerfectHire" style="height:30px;width:auto;display:block;">
      <div style="font-size:12.5px;color:#5f6f7e;font-family:'IBM Plex Mono',monospace;letter-spacing:.04em;">&copy; 2026 PERFECTHIRE GLOBAL &nbsp;&middot;&nbsp; NO CURE, NO PAY</div>
    </div>
  </footer>
</div>
<script src="/js/main.js"></script>
</body>
</html>`;
  return new Response(html, {
    status: status || 200,
    headers: { 'content-type': 'text/html;charset=UTF-8', 'cache-control': 'public, max-age=60' },
  });
}

function notFoundPage() {
  const body = `
  <section style="max-width:1240px;margin:0 auto;padding:120px 48px;">
    <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.16em;color:#8fa5b5;margin-bottom:20px;">ROLE NOT AVAILABLE</div>
    <h1 style="font-family:'Archivo',sans-serif;font-weight:900;font-size:52px;line-height:1.02;letter-spacing:-.03em;margin:0;max-width:720px;">This role is no longer listed.</h1>
    <p style="font-size:18px;line-height:1.6;color:#aeb9c4;max-width:520px;margin:24px 0 34px;">It may have been filled. See what we are working on now, or send us your details so we reach out when the right one lands.</p>
    <div style="display:flex;gap:16px;flex-wrap:wrap;">
      <a href="/jobs.html" style="background:var(--accent,#47AEF2);color:#08172c;font-family:'Archivo',sans-serif;font-weight:700;font-size:16px;padding:16px 28px;border-radius:9px;text-decoration:none;">See open roles &nbsp;&rarr;</a>
      <a href="/apply.html" style="border:1px solid rgba(255,255,255,.22);color:#e4eaf0;font-weight:500;font-size:15px;padding:15px 24px;border-radius:9px;text-decoration:none;">Send your CV</a>
    </div>
  </section>`;
  return page({ title: 'Role not available · PerfectHire Global', body, status: 404 });
}

export async function onRequestGet(context) {
  const slug = (context.params.slug || '').toLowerCase();
  const { NOTION_TOKEN, NOTION_DATABASE_ID } = context.env;

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) return notFoundPage();

  let res;
  try {
    res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filter: { property: 'Status', select: { equals: 'Open' } }, page_size: 100 }),
    });
  } catch (e) {
    return notFoundPage();
  }
  if (!res.ok) return notFoundPage();

  const data = await res.json();
  const match = (data.results || []).find((pg) => {
    const p = pg.properties || {};
    const title = plainText(p['Functietitel'] && p['Functietitel'].title);
    const s = plainText(p['Slug'] && p['Slug'].rich_text) || slugify(title);
    return s === slug;
  });
  if (!match) return notFoundPage();

  const p = match.properties || {};
  const job = {
    title: plainText(p['Functietitel'] && p['Functietitel'].title),
    company: plainText(p['Bedrijf'] && p['Bedrijf'].rich_text),
    location: plainText(p['Locatie'] && p['Locatie'].rich_text),
    region: (p['Regio'] && p['Regio'].select && p['Regio'].select.name) || '',
    comp: plainText(p['Salarisrange'] && p['Salarisrange'].rich_text),
    type: plainText(p['Dienstverband'] && p['Dienstverband'].rich_text),
    description: plainText(p['Omschrijving'] && p['Omschrijving'].rich_text),
    requirements: plainText(p['Vereisten'] && p['Vereisten'].rich_text),
  };

  const chip = (label) => label
    ? `<span style="font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:.06em;color:#c1cdd8;border:1px solid rgba(255,255,255,.16);padding:7px 13px;border-radius:20px;">${esc(label)}</span>`
    : '';

  const applyMail = 'mailto:info@perfecthireglobal.com?subject=' + encodeURIComponent('Application: ' + job.title);

  const body = `
  <section style="background:radial-gradient(120% 110% at 78% 0%, #16233a 0%, #0c1728 45%, #091429 100%);border-bottom:1px solid rgba(255,255,255,.06);">
    <div style="max-width:1240px;margin:0 auto;padding:56px 48px 60px;">
      <a href="/jobs.html" style="font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.08em;color:#8fa5b5;text-decoration:none;">&larr; ALL OPEN ROLES</a>
      <h1 style="font-family:'Archivo',sans-serif;font-weight:900;font-size:46px;line-height:1.05;letter-spacing:-.03em;margin:22px 0 0;max-width:900px;">${esc(job.title)}</h1>
      <div style="font-size:16px;color:#8fa5b5;margin-top:16px;">${[job.company, job.location, job.comp].filter(Boolean).map(esc).join(' &middot; ')}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px;">${chip(job.region)}${chip(job.type)}</div>
    </div>
  </section>

  <section style="background:#091429;">
    <div style="max-width:1240px;margin:0 auto;padding:64px 48px 96px;display:grid;grid-template-columns:1.6fr .9fr;gap:56px;align-items:start;">
      <div>
        ${job.description ? `<h2 style="font-family:'Archivo',sans-serif;font-weight:800;font-size:24px;letter-spacing:-.02em;margin:0 0 18px;">About the role</h2>${paragraphs(job.description)}` : ''}
        ${job.requirements ? `<h2 style="font-family:'Archivo',sans-serif;font-weight:800;font-size:24px;letter-spacing:-.02em;margin:40px 0 18px;">What you bring</h2>${bullets(job.requirements)}` : ''}
        ${(!job.description && !job.requirements) ? `<p style="font-size:15.5px;line-height:1.7;color:#aeb9c4;margin:0;">Reach out and we will share the full brief for this role.</p>` : ''}
      </div>
      <div style="position:sticky;top:96px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#0b1627;padding:32px;">
        <div style="font-family:'Archivo',sans-serif;font-weight:800;font-size:20px;letter-spacing:-.01em;margin-bottom:8px;">Interested?</div>
        <p style="font-size:14.5px;line-height:1.6;color:#8fa5b5;margin:0 0 22px;">Apply with your CV or LinkedIn. We treat every application confidentially.</p>
        <a href="/apply.html" style="display:block;text-align:center;background:var(--accent,#47AEF2);color:#08172c;font-family:'Archivo',sans-serif;font-weight:700;font-size:15px;padding:14px;border-radius:10px;text-decoration:none;margin-bottom:12px;">Apply for this role &nbsp;&rarr;</a>
        <a href="${applyMail}" style="display:block;text-align:center;border:1px solid rgba(255,255,255,.2);color:#e4eaf0;font-weight:600;font-size:14px;padding:13px;border-radius:10px;text-decoration:none;">Email us directly</a>
      </div>
    </div>
  </section>`;

  const canonical = 'https://perfecthireglobal.com/jobs/' + slug;
  const metaDesc = (job.description || ('Open revenue role: ' + job.title + '.'))
    .replace(/\s+/g, ' ').trim().slice(0, 155);
  const isRemote = /remote|telecommut|thuis/i.test((job.location || '') + ' ' + (job.type || ''));
  const country = job.region === 'US' ? 'US' : 'NL';
  const jobLd = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: (paragraphs(job.description) || ('<p>' + esc(job.title) + '</p>'))
      + (job.requirements ? '<h3>What you bring</h3>' + bullets(job.requirements) : ''),
    datePosted: match.created_time || new Date().toISOString(),
    validThrough: new Date(Date.now() + 90 * 864e5).toISOString(),
    employmentType: /part|deeltijd/i.test(job.type || '') ? 'PART_TIME' : 'FULL_TIME',
    hiringOrganization: { '@type': 'Organization', name: job.company || 'Confidential client (via PerfectHire Global)' },
    identifier: { '@type': 'PropertyValue', name: 'PerfectHire Global', value: slug },
    url: canonical,
    directApply: true,
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location || '', addressCountry: country } },
  };
  if (job.comp) {
    const nums = (job.comp.match(/\d[\d.,]*/g) || []).map((x) => parseInt(x.replace(/[.,]/g, ''), 10)).filter((n) => n >= 1000);
    if (nums.length) {
      const qv = { '@type': 'QuantitativeValue', unitText: 'YEAR' };
      if (nums.length >= 2) { qv.minValue = Math.min.apply(null, nums); qv.maxValue = Math.max.apply(null, nums); }
      else { qv.value = nums[0]; }
      jobLd.baseSalary = { '@type': 'MonetaryAmount', currency: /€|EUR/.test(job.comp) ? 'EUR' : 'USD', value: qv };
    }
  }
  if (isRemote) {
    jobLd.jobLocationType = 'TELECOMMUTE';
    jobLd.applicantLocationRequirements = { '@type': 'Country', name: country === 'US' ? 'United States' : 'Netherlands' };
  }
  const head = '<meta property="og:title" content="' + esc(job.title + ' · PerfectHire Global') + '">'
    + '<meta property="og:type" content="website">'
    + '<meta property="og:url" content="' + canonical + '">'
    + '<meta property="og:image" content="https://perfecthireglobal.com/assets/brand-social.png">'
    + '<meta name="twitter:card" content="summary_large_image">'
    + '<script type="application/ld+json">' + JSON.stringify(jobLd) + '</script>';

  return page({ title: `${job.title} · PerfectHire Global`, body, head: head, description: metaDesc, canonical: canonical });
}

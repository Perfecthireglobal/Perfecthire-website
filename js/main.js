// PerfectHire Global -- shared site behavior.
// Each block guards on the presence of its target element, so this single
// file can be included on every page without extra wiring.

(function liveFeed() {
  const beacon = document.getElementById('feed-beacon');
  if (!beacon) return;

  const feed = [
    { city: 'San Francisco', role: 'Regional VP Sales', detail: 'Series B fintech scaleup', when: '5 hours ago', region: 'UNITED STATES', x: '4.5%', y: '38.9%' },
    { city: 'New York', role: 'Chief Revenue Officer', detail: 'bootstrapped healthtech hyperscaler', when: 'yesterday', region: 'UNITED STATES', x: '32.9%', y: '34.7%' },
    { city: 'Austin', role: 'VP Sales', detail: 'Series C cybersecurity platform', when: 'yesterday', region: 'UNITED STATES', x: '19%', y: '49.6%' },
    { city: 'Boston', role: 'Head of Enterprise Sales', detail: 'AI infrastructure company', when: '2 days ago', region: 'UNITED STATES', x: '34.6%', y: '32.3%' },
    { city: 'Amsterdam', role: 'VP Sales EMEA', detail: 'US payments company, first EU hire', when: '3 days ago', region: 'EUROPE', x: '79.4%', y: '18%' },
    { city: 'London', role: 'Country Manager UK', detail: 'Series B ERP platform', when: 'last week', region: 'EUROPE', x: '76.4%', y: '19.3%' },
    { city: 'Miami', role: 'Chief Commercial Officer', detail: 'profitable legaltech scaleup', when: 'last week', region: 'UNITED STATES', x: '29.3%', y: '56%' },
    { city: 'Berlin', role: 'VP Sales DACH', detail: 'Series A martech startup', when: 'last week', region: 'EUROPE', x: '84.4%', y: '17.9%' },
  ];

  const roleEl = document.getElementById('feed-role');
  const detailEl = document.getElementById('feed-detail');
  const cityEl = document.getElementById('feed-city');
  const regionEl = document.getElementById('feed-region');
  const whenEl = document.getElementById('feed-when');

  let i = 0;
  function render() {
    const f = feed[i];
    beacon.style.left = f.x;
    beacon.style.top = f.y;
    roleEl.textContent = f.role;
    detailEl.textContent = f.detail;
    cityEl.textContent = f.city;
    regionEl.textContent = f.region;
    whenEl.textContent = f.when;
  }
  render();
  setInterval(() => {
    i = (i + 1) % feed.length;
    render();
  }, 2900);
})();

(function expansionToggle() {
  const euTab = document.getElementById('tab-eu');
  const usTab = document.getElementById('tab-us');
  const euPanel = document.getElementById('panel-eu');
  const usPanel = document.getElementById('panel-us');
  if (!euTab || !usTab || !euPanel || !usPanel) return;

  function show(side) {
    const eu = side === 'eu';
    euTab.classList.toggle('is-active', eu);
    usTab.classList.toggle('is-active', !eu);
    euPanel.style.display = eu ? 'block' : 'none';
    usPanel.style.display = eu ? 'none' : 'block';
  }
  euTab.addEventListener('click', () => show('eu'));
  usTab.addEventListener('click', () => show('us'));
  show('us');
})();

(function jobsList() {
  const list = document.getElementById('jobs-list');
  if (!list) return;

  const fallback = [
    { title: 'VP Sales', region: 'US', company: 'Series B fintech scaleup', location: 'San Francisco, CA', comp: '$250k to $320k OTE' },
    { title: 'Chief Revenue Officer', region: 'US', company: 'Bootstrapped healthtech hyperscaler', location: 'New York, NY', comp: '$400k+ OTE + equity' },
    { title: 'Enterprise Account Executive', region: 'US', company: 'Series C cybersecurity platform', location: 'Austin, TX (hybrid)', comp: '$180k to $240k OTE' },
    { title: 'Head of Enterprise Sales', region: 'US', company: 'AI infrastructure company', location: 'Boston, MA', comp: '$280k to $360k OTE' },
    { title: 'VP Sales EMEA', region: 'EU', company: 'US payments company, first EU hire', location: 'Amsterdam, NL', comp: '€180k to €230k OTE' },
    { title: 'Country Manager UK', region: 'EU', company: 'Series B ERP platform', location: 'London, UK', comp: '£160k to £210k OTE' },
    { title: 'VP Sales DACH', region: 'EU', company: 'Series A martech startup', location: 'Berlin, DE (remote)', comp: '€160k to €200k OTE' },
  ];

  function slugify(input) {
    return (input || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function card(job) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;background:#0c1728;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:26px 30px;';
    wrap.innerHTML = `
      <div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <span style="font-family:'Archivo',sans-serif;font-weight:700;font-size:21px;letter-spacing:-.01em;"></span>
          <span style="font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.08em;color:var(--accent,#47AEF2);border:1px solid rgba(71,174,242,.35);padding:3px 8px;border-radius:5px;"></span>
        </div>
        <div style="font-size:14.5px;color:#8fa5b5;"></div>
      </div>
      <a class="job-view" style="font-size:14px;color:#e4eaf0;border:1px solid rgba(255,255,255,.2);padding:11px 20px;border-radius:8px;white-space:nowrap;text-decoration:none;">View role &nbsp;&rarr;</a>
    `;
    wrap.querySelector('span').textContent = job.title;
    wrap.querySelectorAll('span')[1].textContent = job.region;
    wrap.querySelector('div > div:last-child').textContent = `${job.company} · ${job.location} · ${job.comp}`;
    const slug = job.slug || slugify(job.title);
    wrap.querySelector('.job-view').setAttribute('href', '/jobs/' + encodeURIComponent(slug));
    return wrap;
  }

  function regionOf(job) {
    const r = (job.region || '').toLowerCase();
    if (r.indexOf('eu') !== -1 || r.indexOf('europe') !== -1) return 'eu';
    if (r.indexOf('us') !== -1 || r.indexOf('united states') !== -1) return 'us';
    return 'other';
  }

  // Leadership vs individual contributor, inferred from the title.
  // Match whole words so "Account" doesn't accidentally match "cco", etc.
  function levelOf(job) {
    const words = (job.title || '').toLowerCase().split(/[^a-z]+/).filter(Boolean);
    const leadWords = ['vp', 'svp', 'head', 'chief', 'director', 'cro', 'cco', 'ceo', 'president', 'vice', 'lead', 'manager'];
    return words.some((w) => leadWords.indexOf(w) !== -1) ? 'leadership' : 'ic';
  }

  // Combinable filters: Region AND Level AND free-text search.
  const filters = { region: 'all', level: 'all' };
  let searchTerm = '';

  function matches(job) {
    if (filters.region !== 'all' && regionOf(job) !== filters.region) return false;
    if (filters.level !== 'all' && levelOf(job) !== filters.level) return false;
    if (searchTerm) {
      const hay = [job.title, job.company, job.location, job.region, job.comp]
        .filter(Boolean).join(' ').toLowerCase();
      if (hay.indexOf(searchTerm) === -1) return false;
    }
    return true;
  }

  const isFiltered = () =>
    filters.region !== 'all' || filters.level !== 'all' || !!searchTerm;

  let allJobs = fallback;
  const countEl = document.getElementById('jobs-count');
  const clearBtn = document.getElementById('jobs-clear');

  function render() {
    const shown = allJobs.filter(matches);
    list.innerHTML = '';
    if (!shown.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'font-size:15px;color:#8fa5b5;padding:8px 2px;';
      empty.textContent = 'No roles match these filters right now. Try widening them, or send us your CV below.';
      list.appendChild(empty);
    } else {
      shown.forEach((job) => list.appendChild(card(job)));
    }
    if (countEl) {
      const n = shown.length, total = allJobs.length;
      countEl.textContent = isFiltered()
        ? `Showing ${n} of ${total} ${total === 1 ? 'role' : 'roles'}`
        : `${total} open ${total === 1 ? 'role' : 'roles'}`;
    }
    if (clearBtn) clearBtn.hidden = !isFiltered();
  }

  // Each group (region / level) is single-select; groups combine with AND.
  const controls = document.getElementById('jobs-controls');
  if (controls) {
    controls.addEventListener('click', (e) => {
      const btn = e.target.closest('.job-filter');
      if (!btn) return;
      const group = btn.closest('.jobs-fgroup');
      const key = group && group.dataset.group;
      if (!key) return;
      filters[key] = btn.dataset.filter || 'all';
      group.querySelectorAll('.job-filter').forEach((b) => b.classList.toggle('is-active', b === btn));
      render();
    });
  }

  const searchInput = document.getElementById('jobs-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      render();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      filters.region = 'all';
      filters.level = 'all';
      searchTerm = '';
      if (searchInput) searchInput.value = '';
      controls.querySelectorAll('.jobs-fgroup').forEach((g) => {
        g.querySelectorAll('.job-filter').forEach((b, i) => b.classList.toggle('is-active', i === 0));
      });
      render();
    });
  }

  fetch('/api/jobs')
    .then((r) => {
      if (!r.ok) throw new Error('jobs api unavailable');
      return r.json();
    })
    .then((jobs) => { allJobs = jobs && jobs.length ? jobs : fallback; render(); })
    .catch(() => { allJobs = fallback; render(); });
})();

(function scrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  const sections = Array.from(document.querySelectorAll('section'));
  sections.forEach((sec, si) => {
    if (si === 0) return; // leave the hero visible immediately (LCP)
    const container = sec.querySelector(':scope > div');
    if (!container) return;

    let kids = Array.from(container.children);
    if (kids.length === 1 && kids[0].children.length > 1) kids = Array.from(kids[0].children);

    // expand multi-item rows so cards animate in one by one
    const targets = [];
    kids.forEach((k) => {
      const st = k.getAttribute('style') || '';
      const isRow = k.children.length >= 3 &&
        (st.indexOf('grid-template-columns') !== -1 || st.indexOf('display:grid') !== -1 || st.indexOf('display:flex') !== -1);
      if (isRow) Array.from(k.children).forEach((c) => targets.push(c));
      else targets.push(k);
    });

    targets.forEach((el, i) => {
      // skip elements that are hidden (e.g. the inactive US/Europe toggle panel),
      // otherwise they would stay stuck at opacity:0 when later shown
      if (el.offsetParent === null) return;
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i, 6) * 70 + 'ms';
      io.observe(el);
    });
  });
})();

(function navToggle() {
  document.querySelectorAll('.ph-nav-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bar = btn.closest('div');
      const links = bar && bar.querySelector('.ph-nav-links');
      if (links) links.classList.toggle('open');
    });
  });
})();

(function faqAccordion() {
  const items = document.querySelectorAll('.faq');
  if (!items.length) return;
  items.forEach((item) => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      // close siblings within the same list for a clean single-open accordion
      const list = item.parentElement;
      list.querySelectorAll('.faq.is-open').forEach((el) => el.classList.remove('is-open'));
      if (!isOpen) item.classList.add('is-open');
    });
  });
})();

(function forms() {
  const forms = document.querySelectorAll('form.ph-form');
  if (!forms.length) return;

  // Point the Web3Forms redirect at the current site (works on both the
  // *.pages.dev preview and the live domain), falling back to the value
  // already in the HTML if anything is off.
  forms.forEach((form) => {
    const next = form.querySelector('input[name="redirect"]');
    if (next && location.origin && location.origin.indexOf('http') === 0) {
      next.value = location.origin + '/thanks.html';
    }
  });

  // Candidate application: submit to our own /api/apply function (which
  // emails the CV via Resend). Requires a CV upload, a CV link, or LinkedIn.
  const apply = document.getElementById('apply-form');
  if (apply) {
    const err = document.getElementById('apply-error');
    const showErr = (msg) => {
      if (!err) return;
      if (msg) err.textContent = msg;
      err.style.display = 'block';
      err.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };
    apply.addEventListener('submit', (e) => {
      const linkedin = (apply.querySelector('input[name="LinkedIn"]') || {}).value || '';
      const cvlink = (apply.querySelector('input[name="CV link"]') || {}).value || '';
      const fileInput = apply.querySelector('input[name="cv"]');
      const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

      if (!linkedin.trim() && !cvlink.trim() && !hasFile) {
        e.preventDefault();
        showErr('Please upload a CV, add a CV link, or share your LinkedIn URL so we have something to review.');
        return;
      }

      // Progressive enhancement: without fetch/FormData, let the browser do a
      // normal POST (the function redirects to /thanks.html on success).
      if (!window.fetch || !window.FormData) return;

      e.preventDefault();
      if (err) err.style.display = 'none';
      const btn = apply.querySelector('button[type="submit"]');
      const label = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.style.opacity = '.7'; btn.textContent = 'Sending…'; }

      fetch(apply.getAttribute('action') || '/api/apply', {
        method: 'POST',
        headers: { 'X-Requested-With': 'fetch' },
        body: new FormData(apply),
      })
        .then((r) => r.json().then((d) => d).catch(() => ({ ok: r.ok })))
        .then((data) => {
          if (data && data.ok) {
            window.location.href = '/thanks.html';
          } else {
            if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = label; }
            showErr((data && data.error) || 'Something went wrong. Please email your CV to info@perfecthireglobal.com.');
          }
        })
        .catch(() => {
          if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = label; }
          showErr('Could not send right now. Please email your CV to info@perfecthireglobal.com.');
        });
    });
  }
})();

// Hero: rotating role word under the headline.
// The word is visible by default (CSS), so it never appears blank even
// without JS; this just cycles through the list.
(function rotateWords() {
  const el = document.querySelector('.ph-rotate-word');
  if (!el) return;
  const words = (el.getAttribute('data-words') || '').split('|').filter(Boolean);
  if (!words.length) return;
  el.textContent = words[0];
  if (words.length < 2) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  let i = 0;
  setInterval(() => {
    el.classList.add('out'); // current word slides up and fades
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove('out');
      el.classList.add('pre'); // jump below with no transition
      void el.offsetWidth; // reflow
      el.classList.remove('pre'); // animate up into place
    }, 520);
  }, 2600);
})();

// Proof band: count numbers up when they scroll into view.
(function countUp() {
  const els = document.querySelectorAll('.ph-count');
  if (!els.length) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paint = (el, val) => {
    el.textContent = (el.getAttribute('data-prefix') || '') + val + (el.getAttribute('data-suffix') || '');
  };
  const run = (el) => {
    const to = parseInt(el.getAttribute('data-to'), 10) || 0;
    if (reduce || to === 0) { paint(el, to); return; }
    let start = null;
    const dur = 1300;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      paint(el, Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  els.forEach((el) => { paint(el, 0); io.observe(el); });
})();

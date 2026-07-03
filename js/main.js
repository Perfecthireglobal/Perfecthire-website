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
      <a href="contact.html" style="font-size:14px;color:#e4eaf0;border:1px solid rgba(255,255,255,.2);padding:11px 20px;border-radius:8px;white-space:nowrap;text-decoration:none;">View role &nbsp;&rarr;</a>
    `;
    wrap.querySelector('span').textContent = job.title;
    wrap.querySelectorAll('span')[1].textContent = job.region;
    wrap.querySelector('div > div:last-child').textContent = `${job.company} · ${job.location} · ${job.comp}`;
    return wrap;
  }

  function paint(jobs) {
    list.innerHTML = '';
    jobs.forEach((job) => list.appendChild(card(job)));
  }

  fetch('/api/jobs')
    .then((r) => {
      if (!r.ok) throw new Error('jobs api unavailable');
      return r.json();
    })
    .then((jobs) => paint(jobs && jobs.length ? jobs : fallback))
    .catch(() => paint(fallback));
})();

(function contactForm() {
  const btn = document.getElementById('consult-submit');
  if (!btn) return;
  const okMsg = document.getElementById('consult-ok');
  btn.addEventListener('click', () => {
    okMsg.style.display = 'block';
    window.open('https://calendly.com/perfecthire/introduction-call-perfecthireglobal', '_blank', 'noopener');
  });
})();

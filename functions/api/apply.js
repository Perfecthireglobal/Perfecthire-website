// Cloudflare Pages Function: POST /api/apply
// Receives a candidate application (incl. an optional CV file) and emails it
// to the team via Resend, with the CV as a real attachment. The Resend API
// key stays server-side and never reaches the browser.
//
// Requires environment variables on the Cloudflare Pages project
// (Settings -> Environment variables):
//   RESEND_API_KEY   Resend API key (the free plan is fine)
//   APPLY_TO         (optional) recipient, defaults to info@perfecthireglobal.com
//   APPLY_FROM       (optional) verified sender, e.g.
//                    "PerfectHire Global <careers@send.perfecthireglobal.com>"

const DEFAULT_TO = 'info@perfecthireglobal.com';
const DEFAULT_FROM = 'PerfectHire Global <careers@send.perfecthireglobal.com>';
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = /\.(pdf|doc|docx)$/i;
const MAILTO = 'info@perfecthireglobal.com';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ArrayBuffer -> base64, chunked so large files don't blow the call stack.
function toBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const isXhr = request.headers.get('x-requested-with') === 'fetch';

  const reply = (ok, status, error) => {
    if (isXhr) {
      return new Response(JSON.stringify(error ? { ok, error } : { ok }), {
        status,
        headers: { 'content-type': 'application/json' },
      });
    }
    // No-JS fallback: redirect to the thanks page on success, otherwise a
    // minimal HTML page with the error and a mailto.
    if (ok) {
      return Response.redirect(new URL('/thanks.html', request.url).toString(), 303);
    }
    const html =
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<body style="font-family:system-ui,Arial,sans-serif;background:#091429;color:#e4eaf0;padding:48px;line-height:1.6;">' +
      '<h1 style="font-size:22px;">We could not send your application</h1>' +
      '<p>' + esc(error || 'Something went wrong.') + '</p>' +
      '<p>Please email your CV to <a style="color:#47AEF2;" href="mailto:' + MAILTO + '">' + MAILTO + '</a>, ' +
      'or <a style="color:#47AEF2;" href="/apply.html">go back and try again</a>.</p></body>';
    return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
  };

  if (!env.RESEND_API_KEY) {
    return reply(false, 500, 'Applications are not configured yet. Please email your CV to ' + MAILTO + '.');
  }

  let form;
  try {
    form = await request.formData();
  } catch (e) {
    return reply(false, 400, 'Could not read the form. Please try again.');
  }

  // Honeypot: silently accept bots so they think it worked.
  if ((form.get('botcheck') || '').toString().trim() !== '') {
    return reply(true, 200);
  }

  const field = (k) => (form.get(k) || '').toString().trim();
  const name = field('Name');
  const email = field('Email');
  const phone = field('Phone');
  const role = field('Current role');
  const linkedin = field('LinkedIn');
  const cvLink = field('CV link');
  const message = field('Message');

  if (!name || !email) {
    return reply(false, 400, 'Please add your name and email.');
  }

  const attachments = [];
  const file = form.get('cv');
  if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
    if (!ALLOWED.test(file.name || '')) {
      return reply(false, 400, 'Please upload a PDF, DOC or DOCX file.');
    }
    if (file.size > MAX_BYTES) {
      return reply(false, 400, 'That file is larger than 10 MB. Please upload a smaller CV or share a link instead.');
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    attachments.push({ filename: file.name || 'cv.pdf', content: toBase64(buf) });
  }

  if (!linkedin && !cvLink && !attachments.length) {
    return reply(false, 400, 'Please add a LinkedIn URL, a CV link, or upload a CV so we have something to review.');
  }

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone],
    ['Current / recent role', role],
    ['LinkedIn', linkedin],
    ['CV link', cvLink],
  ].filter((r) => r[1]);

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#0c1c33;">' +
    '<h2 style="margin:0 0 14px;">New application — PerfectHire Global</h2>' +
    '<table cellpadding="6" style="border-collapse:collapse;">' +
    rows.map((r) =>
      '<tr><td style="color:#667;vertical-align:top;"><strong>' + esc(r[0]) + '</strong></td><td>' + esc(r[1]) + '</td></tr>'
    ).join('') +
    '</table>' +
    (message ? '<p style="margin:16px 0 0;"><strong>Message:</strong><br>' + esc(message).replace(/\n/g, '<br>') + '</p>' : '') +
    '<p style="margin:16px 0 0;color:#667;font-size:13px;">' +
      (attachments.length ? 'CV attached to this email.' : 'No file attached — see the LinkedIn / CV link above.') +
    '</p></div>';

  const payload = {
    from: env.APPLY_FROM || DEFAULT_FROM,
    to: [env.APPLY_TO || DEFAULT_TO],
    reply_to: email,
    subject: 'New application' + (role ? ' — ' + role : '') + ': ' + name,
    html,
  };
  if (attachments.length) payload.attachments = attachments;

  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return reply(false, 502, 'Could not send right now. Please email your CV to ' + MAILTO + '.');
  }

  if (!res.ok) {
    return reply(false, 502, 'Could not send right now. Please email your CV to ' + MAILTO + '.');
  }

  return reply(true, 200);
}

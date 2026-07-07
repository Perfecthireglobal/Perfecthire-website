// Cloudflare Pages Function: GET /api/jobs
// Reads open vacancies from the "Vacatures" Notion database server side,
// so the Notion integration token never reaches the browser.
//
// Requires two environment variables/secrets set in the Cloudflare Pages
// project (Settings -> Environment variables):
//   NOTION_TOKEN        Notion internal integration secret
//   NOTION_DATABASE_ID  ID of the Vacatures database, shared with that integration
//
// See /docs/notion-jobs-schema.md for the exact database schema this expects.

function plainText(richTextArray) {
  return (richTextArray || []).map((t) => t.plain_text).join('').trim();
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function onRequestGet(context) {
  const { NOTION_TOKEN, NOTION_DATABASE_ID } = context.env;

  const empty = () =>
    new Response('[]', {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) return empty();

  let notionRes;
  try {
    notionRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: 'Status', select: { equals: 'Open' } },
        sorts: [
          { property: 'Uitgelicht', direction: 'descending' },
          { property: 'Functietitel', direction: 'ascending' },
        ],
        page_size: 50,
      }),
    });
  } catch (err) {
    return empty();
  }

  if (!notionRes.ok) return empty();

  const data = await notionRes.json();

  const jobs = (data.results || [])
    .map((page) => {
      const p = page.properties || {};
      const title = plainText(p['Functietitel']?.title);
      const slugRaw = plainText(p['Slug']?.rich_text);
      return {
        title,
        company: plainText(p['Bedrijf']?.rich_text),
        location: plainText(p['Locatie']?.rich_text),
        region: plainText(p['Regio']?.rich_text),
        comp: plainText(p['Salarisrange']?.rich_text),
        employmentType: p['Dienstverband']?.select?.name || '',
        description: plainText(p['Omschrijving']?.rich_text),
        requirements: plainText(p['Vereisten']?.rich_text),
        slug: slugRaw || slugify(title),
        featured: !!p['Uitgelicht']?.checkbox,
      };
    })
    .filter((job) => job.title);

  return new Response(JSON.stringify(jobs), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=60',
    },
  });
}

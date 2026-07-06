# Notion "Vacatures" database schema

The Jobs page (`jobs.html`) reads open vacancies from a Notion database through
a small Cloudflare Pages Function at `functions/api/jobs.js`. Create the
database with exactly these properties (names and types matter, the function
reads them by name):

| Property name  | Type        | Notes |
|-----------------|-------------|-------|
| `Functietitel`  | Title       | The job title, e.g. "VP Sales" |
| `Bedrijf`       | Text        | Company description, e.g. "Series B fintech scaleup" |
| `Locatie`       | Text        | City, e.g. "San Francisco, CA" |
| `Regio`         | Text        | e.g. "US" or "EU" |
| `Salarisrange`  | Text        | e.g. "$250k to $320k OTE" |
| `Dienstverband` | Select      | Options: `Fulltime`, `Parttime`, `Interim` |
| `Omschrijving`  | Text        | Full job description |
| `Vereisten`     | Text        | Requirements |
| `Slug`          | Text        | URL slug. Leave empty and the function auto generates one from the title |
| `Uitgelicht`    | Checkbox    | Featured roles sort first |
| `Status`        | **Select** (not the special "Status" property type) | Options: `Open`, `Gesloten`. Must be a Select property, because the API filter used by the function is `select.equals`, not `status.equals` |

Only rows with `Status = Open` are shown on the site.

## Connecting it

1. Create the database in Notion with the schema above.
2. Create a Notion internal integration at notion.so/my-integrations, copy its secret.
3. Share the "Vacatures" database with that integration (`···` menu on the database -> Connections -> add the integration).
4. Copy the database ID from its URL: `notion.so/<workspace>/<DATABASE_ID>?v=...`
5. In the Cloudflare Pages project, add two environment variables/secrets:
   - `NOTION_TOKEN` = the integration secret
   - `NOTION_DATABASE_ID` = the database ID
6. Redeploy. `jobs.html` calls `/api/jobs`, which now returns your live vacancies. If the variables are not set yet, or the call fails, the page silently falls back to a representative static list so it never shows a broken page.

# cop-flagration 🔥

cop-flagration is a mobile-first civic tool for documenting police deployments, estimating what they cost the community, and translating that same amount into concrete alternatives (housing, meals, therapy, and more).

## Why this exists

Public safety spending is often discussed in aggregate. cop-flagration helps people quickly estimate the cost of a specific deployment and compare that amount to other urgent community needs.

## Tech stack

- Remix with Cloudflare Pages adapter (`@remix-run/cloudflare-pages`)
- Cloudflare D1 (SQLite) for cities, comparisons, and reports
- Tailwind CSS v4
- Leaflet (optional map pin, loaded lazily)
- nanoid (shareable short slugs)
- Vitest (tests)

## Local development

### Prerequisites

- Node.js 20+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm install -g wrangler` or use the local version via `npx wrangler`)

### Setup

1. Clone and install:
   ```bash
   git clone https://github.com/froboy/cop-flagration.git
   cd cop-flagration
   npm install
   ```
2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```
3. Create a D1 database (if you don't already have one):
   ```bash
   wrangler d1 create cop-flagration
   ```
4. Copy the local config template and fill in the returned database ID:
   ```bash
   cp wrangler.local.toml.example wrangler.local.toml
   ```
   Then edit `wrangler.local.toml` and replace `database_id` with your real ID.

   **`wrangler.local.toml` is gitignored — it never gets committed.** `wrangler.toml` itself (which
   *is* committed) intentionally ships with no `[[d1_databases]]` block at all. This isn't just a
   "don't leak an ID" precaution: Cloudflare Pages' git-connected auto-deploy reads the *committed*
   `wrangler.toml`, and if it declares a `[[d1_databases]]` block with an invalid or placeholder
   `database_id`, the deploy hard-fails (`Invalid database UUID`), regardless of any binding
   configured in the dashboard. So for the deployed project, the D1 binding is configured
   exclusively via the Cloudflare Pages dashboard (see [Attach the D1 database](#2-attach-the-d1-database)
   below). `wrangler.local.toml` exists purely as a local-dev convenience for the Wrangler CLI and
   Vite dev server (`npm run dev`, `db:init`/`db:seed`), which can't see dashboard bindings and need
   their own config — both are already wired up to read it via `--config`/`configPath`, so once the
   file exists you don't need to do anything else. (Local `npm run deploy` doesn't need it at all:
   `wrangler pages deploy` only uploads code/assets — bindings live on the Pages project itself.)
5. Initialize local schema and seed data:
   ```bash
   npm run db:init
   npm run db:seed
   ```
   This creates a local SQLite database (`.wrangler/state/v3/d1/`) used by the dev server. It seeds
   cities, national comparison values, and city-specific comparison overrides.
6. Start dev server:
   ```bash
   npm run dev
   ```

### Testing and type checking

```bash
npm test            # run Vitest unit tests
npm run typecheck   # run TypeScript type checking
```

## Deploying to Cloudflare Pages

### 1. Create a Cloudflare Pages project

Connect the repository to Cloudflare Pages via the dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the `cop-flagration` repository and configure the build:
   - **Build command:** `npm run build`
   - **Build output directory:** `./build/client`
3. Save and deploy (the first deploy may fail until the D1 binding is configured — that's expected).

Alternatively, create the project from the CLI:
```bash
wrangler pages project create cop-flagration
```

### 2. Attach the D1 database

In the Cloudflare Dashboard, go to your Pages project → **Settings** → **Bindings** → **Add** → **D1 database**:

- **Variable name:** `DB`
- **D1 database:** select your `cop-flagration` database

Cloudflare Pages scopes bindings per environment — add this binding under **both Production and
Preview**, or Preview deploys (e.g. from PR branches) will fail the same way Production did before
this was configured.

This binding name must be exactly `DB` — it matches what the app reads from `context.cloudflare.env.DB`.

### 3. Initialize the remote database

Run the schema and seed files against the remote (production) D1 database once:

```bash
wrangler d1 execute cop-flagration --remote --file=db/schema.sql
wrangler d1 execute cop-flagration --remote --file=db/seed-cities.sql
wrangler d1 execute cop-flagration --remote --file=db/seed-comparisons.sql
wrangler d1 execute cop-flagration --remote --file=db/seed-city-overrides.sql
```

### 4. Deploy

```bash
npm run build
npm run deploy
```

Subsequent deploys from a connected repository branch are also triggered automatically on push.

## Updating city cost data

The database is seeded from three SQL files:

| File | Contents |
|---|---|
| `db/seed-cities.sql` | Per-city hourly cost rates (officers, vehicles, helicopters, etc.) |
| `db/seed-comparisons.sql` | National comparison values (meals, housing, therapy, etc.) |
| `db/seed-city-overrides.sql` | City-specific overrides for comparison costs |

To update data:

1. Edit the relevant seed file(s).
2. Re-seed locally:
   ```bash
   npm run db:seed
   ```
3. After merging, re-seed the remote database:
   ```bash
   wrangler d1 execute cop-flagration --remote --file=db/seed-cities.sql
   wrangler d1 execute cop-flagration --remote --file=db/seed-comparisons.sql
   wrangler d1 execute cop-flagration --remote --file=db/seed-city-overrides.sql
   ```
4. Submit a PR with source links and years for transparency.

## Data sources and methodology

Police deployment rates and comparison values are estimates based on publicly available reports and datasets including Vera Institute, city budgets, NLIHC, Feeding America, SAMHSA, BLS, HRSA, NAEMSP, and USFS urban forestry publications.

See `/about` and `/cities` in the app for methodology and source transparency.

## Contributing

Contributions are welcome. Open an issue or suggestion at:

https://github.com/froboy/cop-flagration/issues

## License

This project is licensed under the MIT License. See `LICENSE`.

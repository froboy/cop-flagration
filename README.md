# Cop Takeover 🔥

Cop Takeover (repo/package name: `cop-flagration`) is a mobile-first civic tool for documenting police deployments, estimating what they cost the community, and translating that same amount into concrete alternatives (housing, meals, therapy, and more).

## Why this exists

Public safety spending is often discussed in aggregate. Cop Takeover helps people quickly estimate the cost of a specific deployment and compare that amount to other urgent community needs.

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
4. Add a `[[d1_databases]]` block to `wrangler.toml` with the returned database ID:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "cop-flagration"
   database_id = "your-real-database-id"
   ```

   **This does mean a real D1 database ID lives in `wrangler.toml`, committed to this public repo.**
   That's intentional, not an oversight: once Cloudflare Pages detects a `wrangler.toml` in the repo,
   it can switch the project into "config-file-managed" bindings mode, where the *committed* file
   becomes the only source of truth for bindings and the dashboard's binding UI goes read-only for
   this project - so there's no dashboard-only alternative that keeps the ID out of git. The upside:
   a D1 database ID isn't a usable credential on its own (it can't access your data without a valid
   Cloudflare API token/account access) - the actual cost of committing it is exposing your
   infrastructure layout, not a real security risk, which is why this is a reasonable trade for a
   deploy that actually works.
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
3. Save and deploy.

Alternatively, create the project from the CLI:
```bash
wrangler pages project create cop-flagration
```

### 2. Confirm the D1 binding

Because `wrangler.toml` declares the `[[d1_databases]]` block (see step 4 above), Cloudflare Pages
picks up the `DB` binding automatically from the committed config on deploy - no manual dashboard
step needed. After your first deploy, verify it in the dashboard under your Pages project →
**Settings** → **Bindings**; it should show as configured from `wrangler.toml` (the binding UI
becomes read-only once a project is in this mode).

This should apply to both Production and Preview automatically, but Preview environments have
bitten us before here - if a PR-branch preview deploy still 500s on a D1-backed route, check its
bindings in the dashboard the same way.

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

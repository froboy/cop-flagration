# cop-flagration 🔥

cop-flagration is a mobile-first civic tool for documenting police deployments, estimating what they cost the community, and translating that same amount into concrete alternatives (housing, meals, therapy, and more).

## Why this exists

Public safety spending is often discussed in aggregate. cop-flagration helps people quickly estimate the cost of a specific deployment and compare that amount to other urgent community needs.

## Tech stack

- Remix with Cloudflare Pages adapter (`@remix-run/cloudflare-pages`)
- Cloudflare D1 (SQLite)
- Tailwind CSS
- Leaflet (optional map pin)
- nanoid (shareable short slugs)

## Local development

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
4. Copy the returned database ID into `wrangler.toml` (`database_id = "..."`).

   **`wrangler.toml` is committed to this public repo and is *not* gitignored.** Don't commit your
   real `database_id` over the placeholder value. A D1 database ID isn't itself a credential (it
   can't be used to access your data without a valid Cloudflare API token/account access), but
   committing it still exposes your infrastructure layout unnecessarily. Instead:
   - Keep `database_id` set to the placeholder in git, and use `wrangler d1 execute --local`/`--remote`
     flags with your real ID only in your local shell, or
   - Set the D1 binding in the Cloudflare Pages dashboard (Settings → Functions → D1 database
     bindings) instead of `wrangler.toml`, or
   - If you do need it in `wrangler.toml` locally, run `git update-index --skip-worktree wrangler.toml`
     first so git ignores further local edits to the file.
5. Initialize schema and seed data:
   ```bash
   npm run db:init
   npm run db:seed
   ```
6. Start dev server:
   ```bash
   npm run dev
   ```

## Deploying to Cloudflare Pages

1. Build app:
   ```bash
   npm run build
   ```
2. Deploy:
   ```bash
   npm run deploy
   ```

Configure Cloudflare Pages with this repository and ensure the D1 binding name is `DB`.

## Updating city cost data

1. Update values in:
   - `db/seed-cities.sql`
   - `db/seed-city-overrides.sql` (for city-specific comparison overrides)
2. Re-seed locally:
   ```bash
   npm run db:seed
   ```
3. Submit a PR with source links and years for transparency.

## Data sources and methodology

Police deployment rates and comparison values are estimates based on publicly available reports and datasets including Vera Institute, city budgets, NLIHC, Feeding America, SAMHSA, BLS, HRSA, NAEMSP, and USFS urban forestry publications.

See `/about` and `/cities` in the app for methodology and source transparency.

## Contributing

Contributions are welcome. Open an issue or suggestion at:

https://github.com/froboy/cop-flagration/issues

## License

This project is licensed under the MIT License. See `LICENSE`.

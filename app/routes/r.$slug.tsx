import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { ComparisonCards } from "~/components/ComparisonCards";
import { formatCurrency, formatDuration } from "~/lib/cost-calculator";
import { getReportBySlug, getReportComparisons } from "~/lib/db";

type AppContext = { cloudflare: { env: { DB: D1Database } } };

export async function loader({ params, context }: LoaderFunctionArgs) {
  const slug = params.slug;
  if (!slug) {
    throw new Response("Not found", { status: 404 });
  }

  const db = (context as AppContext).cloudflare.env.DB;
  const report = await getReportBySlug(db, slug);
  if (!report) {
    throw new Response("Not found", { status: 404 });
  }

  const comparisons = await getReportComparisons(db, slug);
  return json({ report, comparisons });
}

export default function ReportSharePage() {
  const { report, comparisons } = useLoaderData<typeof loader>();

  const cityName = report.city_name || report.custom_city;
  const duration = formatDuration(report.duration_minutes);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Shared report</p>
      <h1 className="mt-1 text-2xl font-black">
        {cityName} · {report.location_description}
      </h1>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
        {report.report_date} · {duration}
      </p>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">estimated cost to the community</p>
        <p className="mt-2 text-7xl font-black leading-none">{formatCurrency(report.estimated_total_cost)}</p>
      </section>

      <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-black">Deployment breakdown</h2>
        <ul className="mt-3 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          {report.officer_count > 0 ? <li>👮 Officers: {report.officer_count}</li> : null}
          {report.commander_count > 0 ? <li>⭐ Commanders/Supervisors: {report.commander_count}</li> : null}
          {report.vehicle_count > 0 ? <li>🚔 Patrol Vehicles: {report.vehicle_count}</li> : null}
          {report.motorcycle_count > 0 ? <li>🏍️ Motorcycles: {report.motorcycle_count}</li> : null}
          {report.helicopter_count > 0 ? <li>🚁 Helicopters/Aircraft: {report.helicopter_count}</li> : null}
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-2xl font-black">What else could this have funded?</h2>
        <div className="mt-3">
          <ComparisonCards snapshots={comparisons} />
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          onClick={async () => {
            if (typeof window !== "undefined") {
              await navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          🔗 Copy shareable link
        </button>

        <Link
          to="/report/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Document another →
        </Link>
      </div>

      <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
        All figures are estimates based on publicly available budget data.
      </p>
    </main>
  );
}

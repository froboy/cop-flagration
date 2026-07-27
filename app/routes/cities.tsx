import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getCities } from "~/lib/db";
import { formatCurrency } from "~/lib/cost-calculator";

type AppContext = { cloudflare: { env: { DB: D1Database } } };

export async function loader({ context }: LoaderFunctionArgs) {
  const db = (context as AppContext).cloudflare.env.DB;
  const cities = await getCities(db);
  return json({ cities });
}

export default function CitiesPage() {
  const { cities } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-black">City cost data</h1>
      <p className="mt-2 text-sm text-zinc-700">
        Don't see your city? Reports for unlisted cities use national average cost estimates.
      </p>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-700">
            <tr>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">State</th>
              <th className="px-3 py-2">Officer/hr</th>
              <th className="px-3 py-2">Commander/hr</th>
              <th className="px-3 py-2">Vehicle/hr</th>
              <th className="px-3 py-2">Motorcycle/hr</th>
              <th className="px-3 py-2">Helicopter/hr</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Year</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id} className="border-t border-zinc-200">
                <td className="px-3 py-2 font-semibold">{city.name}</td>
                <td className="px-3 py-2">{city.state}</td>
                <td className="px-3 py-2">{formatCurrency(city.cost_per_officer_per_hour)}</td>
                <td className="px-3 py-2">{formatCurrency(city.cost_per_commander_per_hour)}</td>
                <td className="px-3 py-2">{formatCurrency(city.cost_per_vehicle_per_hour)}</td>
                <td className="px-3 py-2">{formatCurrency(city.cost_per_motorcycle_per_hour)}</td>
                <td className="px-3 py-2">{formatCurrency(city.cost_per_helicopter_per_hour)}</td>
                <td className="px-3 py-2">
                  {city.source_url ? (
                    <a className="underline" href={city.source_url}>
                      source
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2">{city.source_year ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

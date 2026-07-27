export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-black">About cop-flagration</h1>
      <div className="mt-6 space-y-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <section>
          <h2 className="text-xl font-bold">How deployment costs are estimated</h2>
          <p className="mt-2 text-zinc-700">
            We estimate hourly costs using city budget and staffing data, including public analyses like Vera
            Institute's <a className="underline" href="https://www.vera.org/publications/what-policing-costs-in-americas-biggest-cities">What Policing Costs in America's Biggest Cities</a>.
            Totals are based on headcount, equipment type, and reported deployment duration.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">What's included</h2>
          <p className="mt-2 text-zinc-700">
            Officer, supervisor, vehicle, motorcycle, and aircraft estimated hourly costs. Estimates are
            directional and designed for transparency in civic discussions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Comparison data sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-700">
            <li>NLIHC (supportive housing)</li>
            <li>Feeding America (meals)</li>
            <li>SAMHSA (mental health care)</li>
            <li>BLS (teacher salary)</li>
            <li>HRSA ADAP (HIV medication)</li>
            <li>NAEMSP (community paramedic response)</li>
            <li>USFS (urban forestry)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold">Caveats and limitations</h2>
          <p className="mt-2 text-zinc-700">
            Data quality varies by city and year. Actual incident costs can differ due to overtime, specialty
            units, and non-public spending details.
          </p>
        </section>

        <p className="text-sm">
          Suggest corrections: <a className="underline" href="https://github.com/froboy/cop-flagration/issues">https://github.com/froboy/cop-flagration/issues</a>
        </p>
      </div>
    </main>
  );
}

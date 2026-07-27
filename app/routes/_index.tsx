export default function Index() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="text-4xl font-black leading-tight">cop-flagration 🔥</h1>
        <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
          When a conflagration of cops shows up, document it. Estimate what it cost your community — and
          what that same money could have funded instead.
        </p>
        <a
          href="/report/new"
          className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-lg font-black text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Document a cop-flagration →
        </a>
        <div className="mt-4 flex gap-4 text-sm">
          <a href="/about" className="font-semibold text-zinc-700 underline dark:text-zinc-300">
            About
          </a>
          <a href="/cities" className="font-semibold text-zinc-700 underline dark:text-zinc-300">
            Cities
          </a>
        </div>
      </section>
    </main>
  );
}

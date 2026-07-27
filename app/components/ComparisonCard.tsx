type ComparisonCardProps = {
  icon: string | null;
  count: number;
  pluralLabel: string | null;
  label: string;
  description: string;
  sourceName: string | null;
  sourceUrl: string | null;
  wasCitySpecific: number;
};

export function ComparisonCard({
  icon,
  count,
  pluralLabel,
  label,
  description,
  sourceName,
  sourceUrl,
  wasCitySpecific,
}: ComparisonCardProps) {
  const resolvedLabel = count === 1 ? label : pluralLabel || `${label}s`;

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-3xl font-black">
        {icon ? `${icon} ` : ""}
        {count.toLocaleString()}
      </p>
      <p className="mt-1 text-base font-semibold">{resolvedLabel}</p>
      {description ? <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{description}</p> : null}
      {sourceName ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Source: {sourceUrl ? <a href={sourceUrl}>{sourceName}</a> : sourceName}
          {wasCitySpecific ? " (city-specific)" : ""}
        </p>
      ) : null}
    </article>
  );
}

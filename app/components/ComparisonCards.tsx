import { ComparisonCard } from "./ComparisonCard";

type Snapshot = {
  id?: number;
  label: string;
  icon: string | null;
  count_equivalent: number;
  plural_label?: string | null;
  description?: string;
  source_name: string | null;
  source_url: string | null;
  was_city_specific: number;
};

export function ComparisonCards({ snapshots }: { snapshots: Snapshot[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {snapshots.map((snapshot, index) => (
        <ComparisonCard
          key={snapshot.id ?? `${snapshot.label}-${index}`}
          icon={snapshot.icon}
          count={snapshot.count_equivalent}
          pluralLabel={snapshot.plural_label || null}
          label={snapshot.label}
          description={snapshot.description || ""}
          sourceName={snapshot.source_name}
          sourceUrl={snapshot.source_url}
          wasCitySpecific={snapshot.was_city_specific}
        />
      ))}
    </div>
  );
}

type UnitCounterProps = {
  name: string;
  label: string;
  icon: string;
  value: number;
  onChange: (nextValue: number) => void;
};

export function UnitCounter({ name, label, icon, value, onChange }: UnitCounterProps) {
  const decrement = () => onChange(Math.max(0, value - 1));
  const increment = () => onChange(value + 1);

  return (
    <div className="rounded-xl border border-zinc-300 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">
          {icon} {label}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrement}
            className="h-9 w-9 rounded-lg border border-zinc-300 text-xl font-bold"
            aria-label={`Decrease ${label}`}
          >
            −
          </button>
          <span className="w-8 text-center text-lg font-black">{value}</span>
          <button
            type="button"
            onClick={increment}
            className="h-9 w-9 rounded-lg border border-zinc-300 text-xl font-bold"
            aria-label={`Increase ${label}`}
          >
            +
          </button>
        </div>
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

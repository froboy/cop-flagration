import { useEffect, useState, type ChangeEvent } from "react";

type UnitCounterProps = {
  name: string;
  label: string;
  icon: string;
  value: number;
  onChange: (nextValue: number) => void;
};

function clampCount(raw: number) {
  return Math.max(0, Math.floor(raw));
}

export function UnitCounter({ name, label, icon, value, onChange }: UnitCounterProps) {
  // Local text buffer decoupled from the numeric `value` so the user can
  // freely clear/retype the field (e.g. briefly empty) without every
  // keystroke forcing a snap back to "0". It's reconciled with `value`
  // whenever the field isn't actively being edited (on mount, on external
  // value changes such as +/-/+10 clicks, and on blur).
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const decrement = () => onChange(clampCount(value - 1));
  const increment = () => onChange(clampCount(value + 1));
  const bumpByTen = () => onChange(clampCount(value + 10));

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setText(raw);

    if (raw.trim() === "") {
      // Let the field sit empty while the user is typing; don't push a
      // value upstream until they either finish typing a number or blur.
      return;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      // Non-numeric input (shouldn't normally happen with a number input,
      // but keep it defensive) - don't propagate garbage.
      return;
    }

    onChange(clampCount(parsed));
  };

  const handleBlur = () => {
    // Snap the visible text back in sync with the committed value, e.g. if
    // the user left the field empty or typed something like "-5".
    setText(String(value));
  };

  return (
    <div className="rounded-xl border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">
          {icon} {label}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrement}
            className="h-9 w-9 rounded-lg border border-zinc-300 text-xl font-bold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label={`Decrease ${label}`}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            name={name}
            value={text}
            onChange={handleInputChange}
            onBlur={handleBlur}
            aria-label={`${label} count`}
            className="w-16 rounded-lg border border-zinc-300 bg-white p-1 text-center text-lg font-black [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={increment}
            className="h-9 w-9 rounded-lg border border-zinc-300 text-xl font-bold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label={`Increase ${label}`}
          >
            +
          </button>
          <button
            type="button"
            onClick={bumpByTen}
            className="h-9 rounded-lg border border-dashed border-zinc-400 bg-zinc-100 px-2 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            aria-label={`Increase ${label} by 10`}
          >
            +10
          </button>
        </div>
      </div>
    </div>
  );
}

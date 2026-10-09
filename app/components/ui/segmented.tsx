// Purpose: the segmented control, a row of exclusive choices (the sort, a chance view). Each choice is a button with
// aria-pressed, so the choice is read aloud and not only shown. Classes come from styles/ui.css (.seg). Sprint -1.
export type Option<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="seg">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

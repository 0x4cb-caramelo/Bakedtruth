// Purpose: the two moments of a campaign, entries close and the deadline, as two rows, never one (BR-06). Each shows
// its time relative on screen, with the UTC time in small type and in the title. The caller formats the times.
// Classes come from styles/ui.css (.moments-rows). Sprint -1.
export type Moment = { label: string; iso: string; relative: string; utc: string };

export function Moments({ moments }: { moments: [Moment, Moment] }) {
  return (
    <dl className="moments-rows grid gap-2 text-[13px]">
      {moments.map((m) => (
        <div key={m.label} className="flex items-baseline justify-between gap-4">
          <dt className="text-(--muted)">{m.label}</dt>
          <dd className="flex flex-col items-end">
            <time dateTime={m.iso} title={m.utc}>
              {m.relative}
            </time>
            <small className="text-[11px] text-(--dim)">{m.utc}</small>
          </dd>
        </div>
      ))}
    </dl>
  );
}

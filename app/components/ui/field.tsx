/**
 * Purpose: the form controls: a labelled field with its help or error text, a text input, and a select. The error sets aria-invalid and the error colour; the text says what is wrong.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { useId } from "react";
import { cx } from "./cx";

export function Field({
  label,
  help,
  error,
  children,
}: {
  label: string;
  help?: string;
  error?: string;
  children: (ids: { id: string; describedBy: string | undefined }) => ReactNode;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const text = error ?? help;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        {label}
      </label>
      {children({ id, describedBy: text ? helpId : undefined })}
      {text ? (
        <p id={helpId} className={cx("m-0 text-xs", error ? "text-error" : "text-muted")}>
          {text}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  "w-full min-h-11 rounded-sm border border-field-line bg-bg px-3 py-2.5 text-base text-text " +
  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 aria-[invalid=true]:border-error";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(CONTROL, props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "min-h-9 rounded-sm border border-field-line bg-panel px-2.5 py-1.5 text-[12.5px] text-muted",
        props.className,
      )}
    />
  );
}

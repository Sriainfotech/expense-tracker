/**
 * Inline "accordion" row shown directly beneath a table row when its view
 * action is toggled — replaces the old popup/modal pattern (DetailDialog)
 * for in-table record details.
 */
export function DetailAccordionRow({
  colSpan,
  description,
  rows,
}: {
  colSpan: number;
  description?: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <tr className="bg-muted/30">
      <td colSpan={colSpan} className="px-4 py-4">
        {description ? (
          <p className="mb-3 text-xs font-medium text-muted-foreground">{description}</p>
        ) : null}
        <dl className="grid gap-2 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {row.label}
              </dt>
              <dd className="truncate text-sm font-medium text-card-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </td>
    </tr>
  );
}

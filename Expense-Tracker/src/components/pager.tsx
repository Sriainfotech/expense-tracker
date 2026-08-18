import { Button } from "@/components/ui/button";

export function Pager({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">
        {total} record{total === 1 ? "" : "s"} · page {Math.min(page, pageCount)} of {pageCount}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function paginate<T>(rows: T[], page: number, size = 8) {
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const safePage = Math.min(page, pageCount);
  return {
    pageCount,
    rows: rows.slice((safePage - 1) * size, safePage * size),
  };
}

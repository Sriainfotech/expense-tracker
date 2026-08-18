import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell, RequireRole } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Pager, paginate } from "@/components/pager";
import { DetailDialog } from "@/components/detail-dialog";
import { RowActions } from "@/routes/admin.users.$userId";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { formatDate, formatINR } from "@/lib/format";
import type { Investment } from "@/lib/types";

export const Route = createFileRoute("/user/investments")({
  head: () => ({
    meta: [
      { title: "My investments · Ledgerly" },
      {
        name: "description",
        content: "Read-only history of the capital allocated to your account.",
      },
      { property: "og:title", content: "My investments · Ledgerly" },
      {
        property: "og:description",
        content: "Read-only history of the capital allocated to your account.",
      },
    ],
  }),
  component: () => (
    <RequireRole role="standard_user">
      <UserInvestments />
    </RequireRole>
  ),
});

function UserInvestments() {
  const { currentUser, investments } = useStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Investment | null>(null);

  const userId = currentUser?.id ?? "";
  const filtered = useMemo(
    () =>
      investments
        .filter((inv) => inv.userId === userId)
        .filter((inv) => {
          const q = search.trim().toLowerCase();
          return (
            !q || inv.source.toLowerCase().includes(q) || inv.description.toLowerCase().includes(q)
          );
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [investments, userId, search],
  );

  const { rows, pageCount } = paginate(filtered, page);
  const total = filtered.reduce((sum, inv) => sum + inv.amount, 0);

  if (!currentUser) return null;

  return (
    <AppShell
      role="standard_user"
      title="My Investments"
      subtitle={`${filtered.length} records · ${formatINR(total)} allocated to you`}
    >
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border p-4">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search investments"
            className="max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Investment ID</th>
                <th className="px-4 py-3 font-semibold">Investor / Source</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                  <td className="px-4 py-3 font-semibold">{inv.source}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {formatINR(inv.amount)}
                  </td>
                  <td className="px-4 py-3">{formatDate(inv.date)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions onView={() => setViewing(inv)} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No investments found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pager page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} />
      </div>

      <DetailDialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        title="Investment details"
        description="Investments are recorded by your administrator."
        rows={
          viewing
            ? [
                { label: "Investment ID", value: viewing.id },
                { label: "Investor / Source", value: viewing.source },
                { label: "Amount", value: formatINR(viewing.amount) },
                { label: "Date", value: formatDate(viewing.date) },
                { label: "Description", value: viewing.description || "—" },
                { label: "Status", value: viewing.status },
                { label: "Created At", value: formatDate(viewing.createdAt) },
              ]
            : []
        }
      />
    </AppShell>
  );
}

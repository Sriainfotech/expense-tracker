import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PiggyBank, Receipt, Scale } from "lucide-react";

import { AppShell, RequireRole } from "@/components/app-shell";
import { SummaryCard } from "@/components/summary-card";
import { StatusBadge } from "@/components/status-badge";
import { Pager, paginate } from "@/components/pager";
import { DetailDialog } from "@/components/detail-dialog";
import { RowActions } from "@/routes/admin.users.$userId";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { formatDate, formatINR } from "@/lib/format";
import type { Expense } from "@/lib/types";

export const Route = createFileRoute("/user/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses · Ledgerly" },
      {
        name: "description",
        content: "Read-only history of the company-wide shared expenses.",
      },
      { property: "og:title", content: "Expenses · Ledgerly" },
      {
        property: "og:description",
        content: "Read-only history of the company-wide shared expenses.",
      },
    ],
  }),
  component: () => (
    <RequireRole role="standard_user">
      <UserExpenses />
    </RequireRole>
  ),
});

function UserExpenses() {
  const { currentUser, expenses, expenseCategories, financialsFor } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Expense | null>(null);

  // Expenses are shared/company-wide — everyone sees the same list.
  const filtered = useMemo(
    () =>
      expenses
        .filter((exp) => {
          const q = search.trim().toLowerCase();
          const matchesQuery =
            !q ||
            exp.category.toLowerCase().includes(q) ||
            exp.description.toLowerCase().includes(q) ||
            exp.id.toLowerCase().includes(q);
          const matchesCategory = categoryFilter === "all" || exp.category === categoryFilter;
          return matchesQuery && matchesCategory;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, search, categoryFilter],
  );

  const { rows, pageCount } = paginate(filtered, page);

  if (!currentUser) return null;
  const f = financialsFor(currentUser.id);

  return (
    <AppShell
      role="standard_user"
      title="Expenses"
      subtitle={`${formatINR(f.totalExpenses)} company-wide · ${formatINR(f.remainingBalance)} remaining`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Investment"
          value={formatINR(f.totalInvestment)}
          icon={PiggyBank}
          tone="investment"
        />
        <SummaryCard
          label="Total Expenses"
          value={formatINR(f.totalExpenses)}
          icon={Receipt}
          tone="expense"
        />
        <SummaryCard
          label="Remaining Balance"
          value={formatINR(f.remainingBalance)}
          icon={Scale}
          tone="balance"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex flex-wrap gap-3 border-b border-border p-4">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by category, description or ID"
            className="max-w-xs"
          />
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {expenseCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Expense ID</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Payment Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs">{exp.id}</td>
                  <td className="px-4 py-3 font-semibold">{exp.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{exp.description || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-warning">
                    {formatINR(exp.amount)}
                  </td>
                  <td className="px-4 py-3">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3">{exp.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={exp.status} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions onView={() => setViewing(exp)} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No expenses recorded yet.
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
        title="Expense details"
        description="Shared company expense"
        rows={
          viewing
            ? [
                { label: "Expense ID", value: viewing.id },
                { label: "Category", value: viewing.category },
                { label: "Description", value: viewing.description || "—" },
                { label: "Amount", value: formatINR(viewing.amount) },
                { label: "Date", value: formatDate(viewing.date) },
                { label: "Payment Method", value: viewing.paymentMethod },
                { label: "Status", value: viewing.status },
                { label: "Created At", value: formatDate(viewing.createdAt) },
              ]
            : []
        }
      />

    </AppShell>
  );
}

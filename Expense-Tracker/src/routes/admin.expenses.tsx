import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { PiggyBank, Plus, Receipt, Scale } from "lucide-react";
import { toast } from "sonner";

import { AppShell, RequireRole } from "@/components/app-shell";
import { SummaryCard } from "@/components/summary-card";
import { StatusBadge } from "@/components/status-badge";
import { Pager, paginate } from "@/components/pager";
import { ConfirmDelete } from "@/components/confirm-delete";
import { DetailAccordionRow } from "@/components/detail-accordion-row";
import { ExpenseFormDialog } from "@/components/expense-form-dialog";
import { RowActions } from "@/routes/admin.users.$userId";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/admin/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses · Ledgerly" },
      {
        name: "description",
        content: "Review and manage every shared expense that reduces the company-wide remaining balance.",
      },
      { property: "og:title", content: "Expenses · Ledgerly" },
      {
        property: "og:description",
        content: "Review and manage every shared expense that reduces the company-wide remaining balance.",
      },
    ],
  }),
  component: () => (
    <RequireRole role="admin">
      <AdminExpenses />
    </RequireRole>
  ),
});

function AdminExpenses() {
  const { expenses, expenseCategories, addExpense, updateExpense, deleteExpense, totals } =
    useStore();
  const t = totals();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const filtered = useMemo(
    () =>
      expenses
        .filter((exp) => {
          const q = search.trim().toLowerCase();
          const matchesQuery =
            !q ||
            exp.id.toLowerCase().includes(q) ||
            exp.description.toLowerCase().includes(q) ||
            exp.category.toLowerCase().includes(q);
          const matchesCategory = categoryFilter === "all" || exp.category === categoryFilter;
          return matchesQuery && matchesCategory;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, search, categoryFilter],
  );

  const { rows, pageCount } = paginate(filtered, page);
  const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const exp of filtered) {
      totals.set(exp.category, (totals.get(exp.category) ?? 0) + exp.amount);
    }
    return expenseCategories
      .map((category) => ({
        category,
        amount: totals.get(category) ?? 0,
      }))
      .filter((entry) => entry.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [filtered, expenseCategories]);

  return (
    <AppShell
      role="admin"
      title="Expenses"
      subtitle={`${filtered.length} records · ${formatINR(total)} spent`}
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add Expense
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Investment"
          value={formatINR(t.totalInvestment)}
          icon={PiggyBank}
          tone="investment"
        />
        <SummaryCard
          label="Total Expenses"
          value={formatINR(t.totalExpenses)}
          icon={Receipt}
          tone="expense"
        />
        <SummaryCard
          label="Remaining Balance"
          value={formatINR(t.remainingBalance)}
          icon={Scale}
          tone="balance"
        />
      </div>

      {byCategory.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            By Category
          </span>
          {byCategory.map(({ category, amount }) => (
            <span
              key={category}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs"
            >
              <span className="font-medium">{category}</span>
              <span className="font-semibold text-warning">{formatINR(amount)}</span>
            </span>
          ))}
        </div>
      ) : null}

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
          <table className="w-full min-w-[1220px] text-sm">
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
                <Fragment key={exp.id}>
                  <tr className="hover:bg-muted/40">
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
                      <RowActions
                        expanded={expandedId === exp.id}
                        onView={() => setExpandedId((id) => (id === exp.id ? null : exp.id))}
                        onEdit={() => {
                          setEditing(exp);
                          setFormOpen(true);
                        }}
                        onDelete={() => setDeleteTarget(exp)}
                      />
                    </td>
                  </tr>
                  {expandedId === exp.id ? (
                    <DetailAccordionRow
                      colSpan={8}
                      rows={[
                        { label: "Expense ID", value: exp.id },
                        { label: "Category", value: exp.category },
                        { label: "Description", value: exp.description || "—" },
                        { label: "Amount", value: formatINR(exp.amount) },
                        { label: "Date", value: formatDate(exp.date) },
                        { label: "Payment Method", value: exp.paymentMethod },
                        { label: "Status", value: exp.status },
                        { label: "Created At", value: formatDate(exp.createdAt) },
                      ]}
                    />
                  ) : null}
                </Fragment>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No expenses match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pager page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} />
      </div>

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        showStatus
        editing={editing}
        onSubmit={(values) => {
          if (editing) {
            updateExpense(editing.id, values);
            toast.success("Expense updated");
          } else {
            addExpense(values);
            toast.success("Expense added and remaining balance recalculated");
          }
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this expense?"
        description="The overall remaining balance will increase accordingly."
        onConfirm={() => {
          if (deleteTarget) deleteExpense(deleteTarget.id);
          setDeleteTarget(null);
          toast.success("Expense deleted");
        }}
      />
    </AppShell>
  );
}

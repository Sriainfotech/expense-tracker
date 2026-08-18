import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PiggyBank, Plus, Receipt, Scale } from "lucide-react";
import { toast } from "sonner";

import { AppShell, RequireRole } from "@/components/app-shell";
import { SummaryCard } from "@/components/summary-card";
import { StatusBadge } from "@/components/status-badge";
import { Pager, paginate } from "@/components/pager";
import { ConfirmDelete } from "@/components/confirm-delete";
import { DetailDialog } from "@/components/detail-dialog";
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

export const Route = createFileRoute("/user/expenses")({
  head: () => ({
    meta: [
      { title: "My expenses · Ledgerly" },
      {
        name: "description",
        content: "Record what you spend and watch your remaining balance update instantly.",
      },
      { property: "og:title", content: "My expenses · Ledgerly" },
      {
        property: "og:description",
        content: "Record what you spend and watch your remaining balance update instantly.",
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
  const {
    currentUser,
    expenses,
    expenseCategories,
    addExpense,
    updateExpense,
    deleteExpense,
    financialsFor,
  } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [viewing, setViewing] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const userId = currentUser?.id ?? "";
  const filtered = useMemo(
    () =>
      expenses
        .filter((exp) => exp.userId === userId)
        .filter((exp) => {
          const q = search.trim().toLowerCase();
          const matchesQuery =
            !q || exp.description.toLowerCase().includes(q) || exp.id.toLowerCase().includes(q);
          const matchesCategory = categoryFilter === "all" || exp.category === categoryFilter;
          return matchesQuery && matchesCategory;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, userId, search, categoryFilter],
  );

  const { rows, pageCount } = paginate(filtered, page);

  if (!currentUser) return null;
  const f = financialsFor(currentUser.id);

  return (
    <AppShell
      role="standard_user"
      title="My Expenses"
      subtitle={`${formatINR(f.totalExpenses)} spent · ${formatINR(f.remainingBalance)} remaining`}
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
            placeholder="Search expenses"
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
                    <RowActions
                      onView={() => setViewing(exp)}
                      onEdit={() => {
                        setEditing(exp);
                        setFormOpen(true);
                      }}
                      onDelete={() => setDeleteTarget(exp)}
                    />
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No expenses yet — add your first one.
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
        lockedUserId={currentUser.id}
        editing={editing}
        onSubmit={(values) => {
          if (editing) {
            updateExpense(editing.id, values);
            toast.success("Expense updated");
          } else {
            addExpense({ ...values, userId: currentUser.id });
            toast.success("Expense added — remaining balance updated");
          }
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <DetailDialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        title="Expense details"
        description="Your expense record"
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

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this expense?"
        description="Your remaining balance will increase accordingly."
        onConfirm={() => {
          if (deleteTarget) deleteExpense(deleteTarget.id);
          setDeleteTarget(null);
          toast.success("Expense deleted");
        }}
      />
    </AppShell>
  );
}

import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, Pencil, PiggyBank, Receipt, Scale, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell, RequireRole } from "@/components/app-shell";
import { SummaryCard } from "@/components/summary-card";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDelete } from "@/components/confirm-delete";
import { DetailDialog } from "@/components/detail-dialog";
import { InvestmentFormDialog } from "@/components/investment-form-dialog";
import { ExpenseFormDialog } from "@/components/expense-form-dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { formatDate, formatINR } from "@/lib/format";
import type { Expense, Investment } from "@/lib/types";

export const Route = createFileRoute("/admin/users/$userId")({
  head: () => ({
    meta: [
      { title: "User financial details · Ledgerly" },
      {
        name: "description",
        content: "Full investment and expense history for a single user with live remaining balance.",
      },
      { property: "og:title", content: "User financial details · Ledgerly" },
      {
        property: "og:description",
        content: "Full investment and expense history for a single user with live remaining balance.",
      },
    ],
  }),
  component: () => (
    <RequireRole role="admin">
      <UserDetail />
    </RequireRole>
  ),
});

function UserDetail() {
  const { userId } = useParams({ from: "/admin/users/$userId" });
  const {
    users,
    investments,
    expenses,
    financialsFor,
    updateInvestment,
    deleteInvestment,
    updateExpense,
    deleteExpense,
  } = useStore();

  const user = users.find((u) => u.id === userId);
  const [editInvestment, setEditInvestment] = useState<Investment | null>(null);
  const [viewInvestment, setViewInvestment] = useState<Investment | null>(null);
  const [deleteInvestmentTarget, setDeleteInvestmentTarget] = useState<Investment | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<Expense | null>(null);

  if (!user) {
    return (
      <AppShell role="admin" title="User not found">
        <p className="text-sm text-muted-foreground">
          This user no longer exists.{" "}
          <Link to="/admin/users" className="font-medium text-primary hover:underline">
            Back to users
          </Link>
        </p>
      </AppShell>
    );
  }

  const f = financialsFor(user.id);
  const userInvestments = investments
    .filter((i) => i.userId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const userExpenses = expenses
    .filter((e) => e.userId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppShell
      role="admin"
      title={user.fullName}
      subtitle={`${user.email} · Remaining Balance = Total Investment − Total Expenses`}
      actions={
        <Button asChild variant="outline">
          <Link to="/admin/users">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Investment"
          value={formatINR(f.totalInvestment)}
          hint={`${f.investmentCount} investments`}
          icon={PiggyBank}
          tone="investment"
        />
        <SummaryCard
          label="Total Expenses"
          value={formatINR(f.totalExpenses)}
          hint={`${f.expenseCount} expenses`}
          icon={Receipt}
          tone="expense"
        />
        <SummaryCard
          label="Remaining Balance"
          value={formatINR(f.remainingBalance)}
          hint="Calculated automatically"
          icon={Scale}
          tone="balance"
        />
      </div>

      <section className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold">Investment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Investment ID</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created At</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {userInvestments.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {formatINR(inv.amount)}
                  </td>
                  <td className="px-4 py-3">{formatDate(inv.date)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.description || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.createdAt)}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      onView={() => setViewInvestment(inv)}
                      onEdit={() => setEditInvestment(inv)}
                      onDelete={() => setDeleteInvestmentTarget(inv)}
                    />
                  </td>
                </tr>
              ))}
              {userInvestments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No investments recorded for this user.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold">Expense History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Expense ID</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Payment Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created At</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {userExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs">{exp.id}</td>
                  <td className="px-4 py-3">{exp.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{exp.description || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-warning">
                    {formatINR(exp.amount)}
                  </td>
                  <td className="px-4 py-3">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3">{exp.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={exp.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(exp.createdAt)}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      onView={() => setViewExpense(exp)}
                      onEdit={() => setEditExpense(exp)}
                      onDelete={() => setDeleteExpenseTarget(exp)}
                    />
                  </td>
                </tr>
              ))}
              {userExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No expenses recorded for this user.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <InvestmentFormDialog
        open={editInvestment !== null}
        onOpenChange={(open) => !open && setEditInvestment(null)}
        users={users.filter((u) => u.role === "standard_user")}
        editing={editInvestment}
        onSubmit={(values) => {
          if (editInvestment) updateInvestment(editInvestment.id, values);
          setEditInvestment(null);
          toast.success("Investment updated");
        }}
      />

      <ExpenseFormDialog
        open={editExpense !== null}
        onOpenChange={(open) => !open && setEditExpense(null)}
        users={users.filter((u) => u.role === "standard_user")}
        showStatus
        editing={editExpense}
        onSubmit={(values) => {
          if (editExpense) updateExpense(editExpense.id, values);
          setEditExpense(null);
          toast.success("Expense updated");
        }}
      />

      <DetailDialog
        open={viewInvestment !== null}
        onOpenChange={(open) => !open && setViewInvestment(null)}
        title="Investment details"
        description={`Belongs to ${user.fullName}`}
        rows={
          viewInvestment
            ? [
                { label: "Investment ID", value: viewInvestment.id },
                { label: "Investor / Source", value: viewInvestment.source },
                { label: "Amount", value: formatINR(viewInvestment.amount) },
                { label: "Date", value: formatDate(viewInvestment.date) },
                { label: "Description", value: viewInvestment.description || "—" },
                { label: "Status", value: viewInvestment.status },
                { label: "Created At", value: formatDate(viewInvestment.createdAt) },
              ]
            : []
        }
      />

      <DetailDialog
        open={viewExpense !== null}
        onOpenChange={(open) => !open && setViewExpense(null)}
        title="Expense details"
        description={`Belongs to ${user.fullName}`}
        rows={
          viewExpense
            ? [
                { label: "Expense ID", value: viewExpense.id },
                { label: "Category", value: viewExpense.category },
                { label: "Description", value: viewExpense.description || "—" },
                { label: "Amount", value: formatINR(viewExpense.amount) },
                { label: "Date", value: formatDate(viewExpense.date) },
                { label: "Payment Method", value: viewExpense.paymentMethod },
                { label: "Status", value: viewExpense.status },
                { label: "Created At", value: formatDate(viewExpense.createdAt) },
              ]
            : []
        }
      />

      <ConfirmDelete
        open={deleteInvestmentTarget !== null}
        onOpenChange={(open) => !open && setDeleteInvestmentTarget(null)}
        title="Delete this investment?"
        onConfirm={() => {
          if (deleteInvestmentTarget) deleteInvestment(deleteInvestmentTarget.id);
          setDeleteInvestmentTarget(null);
          toast.success("Investment deleted");
        }}
      />

      <ConfirmDelete
        open={deleteExpenseTarget !== null}
        onOpenChange={(open) => !open && setDeleteExpenseTarget(null)}
        title="Delete this expense?"
        onConfirm={() => {
          if (deleteExpenseTarget) deleteExpense(deleteExpenseTarget.id);
          setDeleteExpenseTarget(null);
          toast.success("Expense deleted");
        }}
      />
    </AppShell>
  );
}

export function RowActions({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label="View record" onClick={onView}>
        <Eye className="size-4" />
      </Button>
      {onEdit ? (
        <Button variant="ghost" size="icon" aria-label="Edit record" onClick={onEdit}>
          <Pencil className="size-4" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete record"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

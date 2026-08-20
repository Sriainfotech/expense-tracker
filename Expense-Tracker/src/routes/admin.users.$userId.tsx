import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { ArrowLeft, Eye, Pencil, PiggyBank, Receipt, Scale, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell, RequireRole } from "@/components/app-shell";
import { SummaryCard } from "@/components/summary-card";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDelete } from "@/components/confirm-delete";
import { DetailAccordionRow } from "@/components/detail-accordion-row";
import { InvestmentFormDialog } from "@/components/investment-form-dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { formatDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Investment } from "@/lib/types";

export const Route = createFileRoute("/admin/users/$userId")({
  head: () => ({
    meta: [
      { title: "User financial details · Ledgerly" },
      {
        name: "description",
        content: "Investment history for a single user, alongside the company-wide remaining balance.",
      },
      { property: "og:title", content: "User financial details · Ledgerly" },
      {
        property: "og:description",
        content: "Investment history for a single user, alongside the company-wide remaining balance.",
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
  const { users, investments, financialsFor, updateInvestment, deleteInvestment } = useStore();

  const user = users.find((u) => u.id === userId);
  const [editInvestment, setEditInvestment] = useState<Investment | null>(null);
  const [expandedInvestmentId, setExpandedInvestmentId] = useState<string | null>(null);
  const [deleteInvestmentTarget, setDeleteInvestmentTarget] = useState<Investment | null>(null);

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

  return (
    <AppShell
      role="admin"
      title={user.fullName}
      subtitle={`${user.email} · Remaining Balance is the company-wide figure`}
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
          hint={`${f.expenseCount} company-wide`}
          icon={Receipt}
          tone="expense"
        />
        <SummaryCard
          label="Remaining Balance"
          value={formatINR(f.remainingBalance)}
          hint="Company-wide figure"
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
                <Fragment key={inv.id}>
                  <tr className="hover:bg-muted/40">
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
                        expanded={expandedInvestmentId === inv.id}
                        onView={() =>
                          setExpandedInvestmentId((id) => (id === inv.id ? null : inv.id))
                        }
                        onEdit={() => setEditInvestment(inv)}
                        onDelete={() => setDeleteInvestmentTarget(inv)}
                      />
                    </td>
                  </tr>
                  {expandedInvestmentId === inv.id ? (
                    <DetailAccordionRow
                      colSpan={7}
                      rows={[
                        { label: "Investment ID", value: inv.id },
                        { label: "Investor / Source", value: inv.source },
                        { label: "Amount", value: formatINR(inv.amount) },
                        { label: "Date", value: formatDate(inv.date) },
                        { label: "Description", value: inv.description || "—" },
                        { label: "Status", value: inv.status },
                        { label: "Created At", value: formatDate(inv.createdAt) },
                      ]}
                    />
                  ) : null}
                </Fragment>
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

    </AppShell>
  );
}

export function RowActions({
  expanded,
  onView,
  onEdit,
  onDelete,
}: {
  /** Whether the inline detail accordion for this row is currently open. */
  expanded?: boolean;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={expanded ? "Hide details" : "View details"}
        aria-expanded={expanded}
        className={cn(expanded && "bg-accent text-accent-foreground")}
        onClick={onView}
      >
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

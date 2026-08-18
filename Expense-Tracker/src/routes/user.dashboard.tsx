import { createFileRoute, Link } from "@tanstack/react-router";
import { PiggyBank, Receipt, Scale } from "lucide-react";

import { AppShell, RequireRole } from "@/components/app-shell";
import { SummaryCard } from "@/components/summary-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { formatDate, formatINR } from "@/lib/format";

export const Route = createFileRoute("/user/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard · Ledgerly" },
      {
        name: "description",
        content: "Your allocated investment, recorded expenses and remaining balance.",
      },
      { property: "og:title", content: "My dashboard · Ledgerly" },
      {
        property: "og:description",
        content: "Your allocated investment, recorded expenses and remaining balance.",
      },
    ],
  }),
  component: () => (
    <RequireRole role="standard_user">
      <UserDashboard />
    </RequireRole>
  ),
});

function UserDashboard() {
  const { currentUser, investments, expenses, financialsFor } = useStore();
  if (!currentUser) return null;

  const f = financialsFor(currentUser.id);
  const myInvestments = investments
    .filter((i) => i.userId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const myExpenses = expenses
    .filter((e) => e.userId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <AppShell
      role="standard_user"
      title={`Welcome back, ${currentUser.fullName.split(" ")[0]}`}
      subtitle="Remaining Balance = Total Investment − Total Expenses"
      actions={
        <Button asChild>
          <Link to="/user/expenses">Add Expense</Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Investment"
          value={formatINR(f.totalInvestment)}
          hint={`${f.investmentCount} investments received`}
          icon={PiggyBank}
          tone="investment"
        />
        <SummaryCard
          label="Total Expenses"
          value={formatINR(f.totalExpenses)}
          hint={`${f.expenseCount} expenses recorded`}
          icon={Receipt}
          tone="expense"
        />
        <SummaryCard
          label="Remaining Balance"
          value={formatINR(f.remainingBalance)}
          hint="Updates as you spend"
          icon={Scale}
          tone="balance"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold">My recent investments</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/user/investments">View all</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {myInvestments.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{inv.source}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(inv.date)}</p>
                </div>
                <StatusBadge status={inv.status} />
                <p className="text-sm font-bold text-primary">{formatINR(inv.amount)}</p>
              </li>
            ))}
            {myInvestments.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                No investments yet.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold">My recent expenses</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/user/expenses">View all</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {myExpenses.map((exp) => (
              <li key={exp.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{exp.category}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {exp.description || "—"} · {formatDate(exp.date)}
                  </p>
                </div>
                <StatusBadge status={exp.status} />
                <p className="text-sm font-bold text-warning">−{formatINR(exp.amount)}</p>
              </li>
            ))}
            {myExpenses.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                No expenses yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

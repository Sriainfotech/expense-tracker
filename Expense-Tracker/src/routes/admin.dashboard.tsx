import { createFileRoute } from "@tanstack/react-router";
import { PiggyBank, Receipt, Scale, Users } from "lucide-react";

import { AppShell, RequireRole } from "@/components/app-shell";
import { SummaryCard } from "@/components/summary-card";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { formatDate, formatINR } from "@/lib/format";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin dashboard · Ledgerly" },
      {
        name: "description",
        content: "Company-wide investments, expenses and remaining balance at a glance.",
      },
      { property: "og:title", content: "Admin dashboard · Ledgerly" },
      {
        property: "og:description",
        content: "Company-wide investments, expenses and remaining balance at a glance.",
      },
    ],
  }),
  component: () => (
    <RequireRole role="admin">
      <AdminDashboard />
    </RequireRole>
  ),
});

function AdminDashboard() {
  const { totals, investments, expenses, userName } = useStore();
  const t = totals();

  const recentInvestments = [...investments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const recentExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <AppShell
      role="admin"
      title="Dashboard"
      subtitle="Remaining Balance = Total Investment − Total Expenses"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Investment"
          value={formatINR(t.totalInvestment)}
          hint={`${t.investmentCount} investments recorded`}
          icon={PiggyBank}
          tone="investment"
        />
        <SummaryCard
          label="Total Expenses"
          value={formatINR(t.totalExpenses)}
          hint={`${t.expenseCount} expenses recorded`}
          icon={Receipt}
          tone="expense"
        />
        <SummaryCard
          label="Remaining Balance"
          value={formatINR(t.remainingBalance)}
          hint="Calculated automatically"
          icon={Scale}
          tone="balance"
        />
        <SummaryCard
          label="Total Users"
          value={String(t.userCount)}
          hint="Admins and standard users"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold">Latest investments</h2>
          </div>
          <ul className="divide-y divide-border">
            {recentInvestments.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{userName(inv.userId)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {inv.source} · {formatDate(inv.date)}
                  </p>
                </div>
                <StatusBadge status={inv.status} />
                <p className="text-sm font-bold text-primary">{formatINR(inv.amount)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold">Latest expenses</h2>
          </div>
          <ul className="divide-y divide-border">
            {recentExpenses.map((exp) => (
              <li key={exp.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{exp.category}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {exp.description || "No description"} · {formatDate(exp.date)}
                  </p>
                </div>
                <StatusBadge status={exp.status} />
                <p className="text-sm font-bold text-warning">−{formatINR(exp.amount)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

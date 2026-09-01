import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { Hash, PiggyBank, Plus, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell, RequireRole } from "@/components/app-shell";
import { SummaryCard } from "@/components/summary-card";
import { StatusBadge } from "@/components/status-badge";
import { Pager, paginate } from "@/components/pager";
import { ConfirmDelete } from "@/components/confirm-delete";
import { DetailAccordionRow } from "@/components/detail-accordion-row";
import { InvestmentFormDialog } from "@/components/investment-form-dialog";
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
import { RECORD_STATUSES, type Investment } from "@/lib/types";

export const Route = createFileRoute("/admin/investments")({
  head: () => ({
    meta: [
      { title: "Investments · Ledgerly" },
      {
        name: "description",
        content: "Record and manage every capital investment allocated across users.",
      },
      { property: "og:title", content: "Investments · Ledgerly" },
      {
        property: "og:description",
        content: "Record and manage every capital investment allocated across users.",
      },
    ],
  }),
  component: () => (
    <RequireRole role="admin">
      <AdminInvestments />
    </RequireRole>
  ),
});

function AdminInvestments() {
  const { users, investments, addInvestment, updateInvestment, deleteInvestment, userName } =
    useStore();
  const standardUsers = users.filter((u) => u.role === "standard_user");

  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Investment | null>(null);

  const filtersActive =
    search.trim() !== "" ||
    userFilter !== "all" ||
    statusFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  function clearFilters() {
    setSearch("");
    setUserFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const filtered = useMemo(
    () =>
      investments
        .filter((inv) => {
          const q = search.trim().toLowerCase();
          const matchesQuery =
            !q ||
            inv.id.toLowerCase().includes(q) ||
            inv.source.toLowerCase().includes(q) ||
            userName(inv.userId).toLowerCase().includes(q);
          const matchesUser = userFilter === "all" || inv.userId === userFilter;
          const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
          const matchesFrom = !dateFrom || inv.date >= dateFrom;
          const matchesTo = !dateTo || inv.date <= dateTo;
          return matchesQuery && matchesUser && matchesStatus && matchesFrom && matchesTo;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [investments, search, userFilter, statusFilter, dateFrom, dateTo, userName],
  );

  const { rows, pageCount } = paginate(filtered, page);
  const total = filtered.reduce((sum, inv) => sum + inv.amount, 0);
  const average = filtered.length > 0 ? total / filtered.length : 0;

  return (
    <AppShell
      role="admin"
      title="Investments"
      subtitle={`${filtered.length} records · ${formatINR(total)} total capital`}
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add Investment
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Investment"
          value={formatINR(total)}
          hint={filtersActive ? "Filtered total" : "All investments"}
          icon={PiggyBank}
          tone="investment"
        />
        <SummaryCard
          label="Number of Investments"
          value={String(filtered.length)}
          hint={filtersActive ? "Matching current filters" : "Total records"}
          icon={Hash}
        />
        <SummaryCard
          label="Average Investment"
          value={formatINR(average)}
          hint={filtersActive ? "Across the filtered set" : "Across all records"}
          icon={TrendingUp}
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
            placeholder="Search by user, source or ID"
            className="max-w-xs"
          />
          <Select
            value={userFilter}
            onValueChange={(v) => {
              setUserFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {standardUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {RECORD_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-40"
              aria-label="From date"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-40"
              aria-label="To date"
            />
          </div>
          {filtersActive ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-4" />
              Clear filters
            </Button>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Investment ID</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Investor / Source</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((inv) => (
                <Fragment key={inv.id}>
                  <tr className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                    <td className="px-4 py-3 font-semibold">{userName(inv.userId)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.source}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">
                      {formatINR(inv.amount)}
                    </td>
                    <td className="px-4 py-3">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        expanded={expandedId === inv.id}
                        onView={() => setExpandedId((id) => (id === inv.id ? null : inv.id))}
                        onEdit={() => {
                          setEditing(inv);
                          setFormOpen(true);
                        }}
                        onDelete={() => setDeleteTarget(inv)}
                      />
                    </td>
                  </tr>
                  {expandedId === inv.id ? (
                    <DetailAccordionRow
                      colSpan={7}
                      description={userName(inv.userId)}
                      rows={[
                        { label: "Investment ID", value: inv.id },
                        { label: "User", value: userName(inv.userId) },
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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No investments match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pager page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} />
      </div>

      <InvestmentFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        users={standardUsers}
        editing={editing}
        onSubmit={(values) => {
          if (editing) {
            updateInvestment(editing.id, values);
            toast.success("Investment updated");
          } else {
            addInvestment(values);
            toast.success("Investment added and balances recalculated");
          }
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this investment?"
        description="The user's total investment and remaining balance will update immediately."
        onConfirm={() => {
          if (deleteTarget) deleteInvestment(deleteTarget.id);
          setDeleteTarget(null);
          toast.success("Investment deleted");
        }}
      />
    </AppShell>
  );
}

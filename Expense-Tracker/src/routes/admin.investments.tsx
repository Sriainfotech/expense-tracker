import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { AppShell, RequireRole } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Pager, paginate } from "@/components/pager";
import { ConfirmDelete } from "@/components/confirm-delete";
import { DetailDialog } from "@/components/detail-dialog";
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
import type { Investment } from "@/lib/types";

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
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [viewing, setViewing] = useState<Investment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Investment | null>(null);

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
          return matchesQuery && matchesUser;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [investments, search, userFilter, userName],
  );

  const { rows, pageCount } = paginate(filtered, page);
  const total = filtered.reduce((sum, inv) => sum + inv.amount, 0);

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
                <tr key={inv.id} className="hover:bg-muted/40">
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
                      onView={() => setViewing(inv)}
                      onEdit={() => {
                        setEditing(inv);
                        setFormOpen(true);
                      }}
                      onDelete={() => setDeleteTarget(inv)}
                    />
                  </td>
                </tr>
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

      <DetailDialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        title="Investment details"
        description={viewing ? userName(viewing.userId) : ""}
        rows={
          viewing
            ? [
                { label: "Investment ID", value: viewing.id },
                { label: "User", value: userName(viewing.userId) },
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { AppShell, RequireRole } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Pager, paginate } from "@/components/pager";
import { ConfirmDelete } from "@/components/confirm-delete";
import { UserFormDialog, type UserFormValues } from "@/components/user-form-dialog";
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
import type { User } from "@/lib/types";

export const Route = createFileRoute("/admin/users/")({
  head: () => ({
    meta: [
      { title: "User management · Ledgerly" },
      {
        name: "description",
        content: "Create, edit and review standard users with their live financial position.",
      },
      { property: "og:title", content: "User management · Ledgerly" },
      {
        property: "og:description",
        content: "Create, edit and review standard users with their live financial position.",
      },
    ],
  }),
  component: () => (
    <RequireRole role="admin">
      <AdminUsers />
    </RequireRole>
  ),
});

function AdminUsers() {
  const { users, addUser, updateUser, deleteUser, financialsFor } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const q = search.trim().toLowerCase();
        const matchesQuery =
          !q ||
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q);
        const matchesStatus = status === "all" || u.status === status;
        return matchesQuery && matchesStatus;
      }),
    [users, search, status],
  );

  const { rows, pageCount } = paginate(filtered, page);

  // function
  async function handleSubmit(values: UserFormValues) {
    if (editing) {
      updateUser(editing.id, {
        fullName: values.fullName,
        email: values.email,
        status: values.status,
        ...(values.password ? { password: values.password } : {}),
      });
      toast.success(`${values.fullName} updated`);
    } else {
      await addUser({
  fullName: values.fullName,
  email: values.email,
  password: values.password,
  confirmPassword: values.confirmPassword,
  role: "standard_user",
  status: values.status,
});
      toast.success(`${values.fullName} can now sign in with these credentials`);
    }
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <AppShell
      role="admin"
      title="User Management"
      subtitle="Standard users see only their own investments, expenses and balance."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <UserPlus className="size-4" />
          Add User
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
            placeholder="Search by name, email or ID"
            className="max-w-xs"
          />
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">User ID</th>
                <th className="px-4 py-3 font-semibold">Full Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 text-right font-semibold">Total Investment</th>
                <th className="px-4 py-3 text-right font-semibold">Total Expenses</th>
                <th className="px-4 py-3 text-right font-semibold">Remaining</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created At</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((user) => {
                const f = financialsFor(user.id);
                return (
                  <tr key={user.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs">{user.id}</td>
                    <td className="px-4 py-3 font-semibold">{user.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.role === "admin" ? "Administrator" : "Standard User"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-primary">
                      {formatINR(f.totalInvestment)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-warning">
                      {formatINR(f.totalExpenses)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-success">
                      {formatINR(f.remainingBalance)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" aria-label="View user">
                          <Link to="/admin/users/$userId" params={{ userId: user.id }}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit user"
                          onClick={() => {
                            setEditing(user);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete user"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                    No users match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pager page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} />
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
        existingEmails={users
          .filter((u) => u.id !== editing?.id)
          .map((u) => u.email.toLowerCase())}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.fullName ?? "user"}?`}
        description="Their investments and expenses will also be removed and totals recalculated."
        onConfirm={async () => {
  if (!deleteTarget) return;

  try {
    await deleteUser(deleteTarget.id);

    toast.success(`${deleteTarget.fullName} deleted`);
    setDeleteTarget(null);
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete user.");
  }
}}
      />
    </AppShell>
  );
}

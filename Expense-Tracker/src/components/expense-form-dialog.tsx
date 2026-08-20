import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import {
  PAYMENT_METHODS,
  RECORD_STATUSES,
  type Expense,
  type RecordStatus,
  type User,
} from "@/lib/types";
import { todayISO } from "@/lib/format";

export interface ExpenseFormValues {
  userId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: RecordStatus;
}

type Errors = Partial<Record<keyof ExpenseFormValues, string>>;

interface Draft {
  userId: string;
  category: string;
  description: string;
  amount: string;
  date: string;
  paymentMethod: string;
  status: RecordStatus;
}

function emptyDraft(userId: string): Draft {
  return {
    userId,
    category: "",
    description: "",
    amount: "",
    date: todayISO(),
    paymentMethod: "",
    status: "Active",
  };
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  users,
  lockedUserId,
  showStatus,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Admin-only: lets admin pick which standard user this expense belongs to. */
  users?: User[];
  /** Owner for a newly created expense — always the signed-in user creating it. */
  lockedUserId?: string;
  /** Admin-only: lets an existing expense be marked Active/Inactive. */
  showStatus?: boolean;
  editing?: Expense | null;
  onSubmit: (values: ExpenseFormValues) => void;
}) {
  const { expenseCategories, addExpenseCategory } = useStore();
  const [draft, setDraft] = useState<Draft>(emptyDraft(lockedUserId ?? ""));
  const [errors, setErrors] = useState<Errors>({});
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setCreatingCategory(false);
    setNewCategoryName("");
    setDraft(
      editing
        ? {
            userId: editing.userId,
            category: editing.category,
            description: editing.description,
            amount: String(editing.amount),
            date: editing.date,
            paymentMethod: editing.paymentMethod,
            status: editing.status,
          }
        : emptyDraft(lockedUserId ?? ""),
    );
  }, [open, editing, lockedUserId]);

  // The category on an existing expense might not be in the shared catalog
  // yet (e.g. seeded before the catalog existed) — keep it selectable.
  const categoryOptions =
    draft.category && !expenseCategories.includes(draft.category)
      ? [...expenseCategories, draft.category].sort()
      : expenseCategories;

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;

    setSavingCategory(true);
    try {
      const created = await addExpenseCategory(name);
      set("category", created);
      setCreatingCategory(false);
      setNewCategoryName("");
      toast.success("Category added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add category");
    } finally {
      setSavingCategory(false);
    }
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    const next: Errors = {};
    const amount = Number(draft.amount);
    if (users && !draft.userId) next.userId = "User is required.";
    if (!draft.category) next.category = "Expense category is required.";
    if (!draft.amount) next.amount = "Amount is required.";
    else if (!Number.isFinite(amount) || amount <= 0)
      next.amount = "Amount must be greater than 0.";
    if (!draft.date) next.date = "Expense date is required.";
    if (!draft.paymentMethod) next.paymentMethod = "Payment method is required.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({
      userId: draft.userId,
      category: draft.category,
      description: draft.description.trim(),
      amount,
      date: draft.date,
      paymentMethod: draft.paymentMethod,
      status: draft.status,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>
            Expenses are deducted from the owner's investment to compute their remaining balance.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {users ? (
            <Field label="User" error={errors.userId}>
              <Select value={draft.userId} onValueChange={(v) => set("userId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName} · {u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Expense Category" error={errors.category}>
              {creatingCategory ? (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateCategory();
                      }
                      if (e.key === "Escape") {
                        setCreatingCategory(false);
                        setNewCategoryName("");
                      }
                    }}
                    placeholder="New category name"
                  />
                  <Button
                    type="button"
                    size="icon"
                    aria-label="Save category"
                    disabled={!newCategoryName.trim() || savingCategory}
                    onClick={handleCreateCategory}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Cancel"
                    onClick={() => {
                      setCreatingCategory(false);
                      setNewCategoryName("");
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Add new category"
                    title="Add new category"
                    onClick={() => setCreatingCategory(true)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              )}
            </Field>
            <Field label="Payment Method" error={errors.paymentMethod}>
              <Select value={draft.paymentMethod} onValueChange={(v) => set("paymentMethod", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount (₹)" error={errors.amount}>
              <Input
                type="number"
                min={1}
                value={draft.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="10000"
              />
            </Field>
            <Field label="Expense Date" error={errors.date}>
              <Input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
          </div>

          <Field label="Description">
            <Textarea
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Business travel"
              rows={3}
            />
          </Field>

          {showStatus ? (
            <Field label="Status">
              <Select value={draft.status} onValueChange={(v) => set("status", v as RecordStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Add expense"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

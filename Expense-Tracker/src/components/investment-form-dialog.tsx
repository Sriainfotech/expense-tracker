import { Fragment, useEffect, useState } from "react";

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
import { ConfirmAction } from "@/components/confirm-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RECORD_STATUSES, type Investment, type RecordStatus, type User } from "@/lib/types";
import { todayISO } from "@/lib/format";

export interface InvestmentFormValues {
  userId: string;
  source: string;
  amount: number;
  date: string;
  description: string;
  status: RecordStatus;
}

type Errors = Partial<Record<keyof InvestmentFormValues, string>>;

interface Draft {
  userId: string;
  source: string;
  amount: string;
  date: string;
  description: string;
  status: RecordStatus;
}

export function InvestmentFormDialog({
  open,
  onOpenChange,
  users,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  editing?: Investment | null;
  onSubmit: (values: InvestmentFormValues) => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    userId: "",
    source: "",
    amount: "",
    date: todayISO(),
    description: "",
    status: "Active",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [pendingSubmit, setPendingSubmit] = useState<InvestmentFormValues | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setDraft(
      editing
        ? {
            userId: editing.userId,
            source: editing.source,
            amount: String(editing.amount),
            date: editing.date,
            description: editing.description,
            status: editing.status,
          }
        : {
            userId: "",
            source: "",
            amount: "",
            date: todayISO(),
            description: "",
            status: "Active",
          },
    );
  }, [open, editing]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    const next: Errors = {};
    const amount = Number(draft.amount);
    if (!draft.userId) next.userId = "User is required.";
    if (!draft.source.trim()) next.source = "Investor / source is required.";
    if (!draft.amount) next.amount = "Investment amount is required.";
    else if (!Number.isFinite(amount) || amount <= 0)
      next.amount = "Amount must be greater than 0.";
    if (!draft.date) next.date = "Investment date is required.";
    if (!draft.status) next.status = "Status is required.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const values: InvestmentFormValues = {
      userId: draft.userId,
      source: draft.source.trim(),
      amount,
      date: draft.date,
      description: draft.description.trim(),
      status: draft.status,
    };

    if (editing) {
      setPendingSubmit(values);
    } else {
      onSubmit(values);
    }
  }

  return (
    <Fragment>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit investment" : "Add investment"}</DialogTitle>
          <DialogDescription>
            Every investment belongs to one user's contribution and adds to the shared capital pool.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
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
          <Field label="Investor / Source" error={errors.source}>
            <Input
              value={draft.source}
              onChange={(e) => set("source", e.target.value)}
              placeholder="Northbridge Capital"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Investment Amount (₹)" error={errors.amount}>
              <Input
                type="number"
                min={1}
                value={draft.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="50000"
              />
            </Field>
            <Field label="Investment Date" error={errors.date}>
              <Input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
          </div>
          <Field label="Description (optional)">
            <Textarea
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Seed allocation for regional expansion"
              rows={3}
            />
          </Field>
          <Field label="Status" error={errors.status}>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Add investment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ConfirmAction
      open={pendingSubmit !== null}
      onOpenChange={(open) => !open && setPendingSubmit(null)}
      title="Save these changes?"
      description="This investment will be updated and remaining balances recalculated."
      confirmLabel="Save changes"
      onConfirm={() => {
        if (pendingSubmit) onSubmit(pendingSubmit);
        setPendingSubmit(null);
      }}
    />
    </Fragment>
  );
}

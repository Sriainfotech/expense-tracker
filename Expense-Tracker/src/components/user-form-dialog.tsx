import { useEffect, useState } from "react";

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
import { Field } from "@/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RecordStatus, User } from "@/lib/types";

export interface UserFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  status: RecordStatus;
}

type Errors = Partial<Record<keyof UserFormValues, string>>;

const empty: UserFormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  status: "Active",
};

export function UserFormDialog({
  open,
  onOpenChange,
  editing,
  existingEmails,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: User | null;
  existingEmails: string[];
  onSubmit: (values: UserFormValues) => void;
}) {
  const [values, setValues] = useState<UserFormValues>(empty);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues(
      editing
        ? {
            fullName: editing.fullName,
            email: editing.email,
            password: "",
            confirmPassword: "",
            status: editing.status,
          }
        : empty,
    );
  }, [open, editing]);

  function set<K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    const next: Errors = {};
    const email = values.email.trim().toLowerCase();
    if (!values.fullName.trim()) next.fullName = "Full name is required.";
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    else if (existingEmails.includes(email)) next.email = "This email is already registered.";

    /** Editing an existing user: password is optional, only validated if the admin chose to change it. */
    const isChangingPassword = !editing || values.password.length > 0 || values.confirmPassword.length > 0;
    if (isChangingPassword) {
      if (!values.password) {
        next.password = "Password is required.";
      } else if (values.password.length < 8) {
        next.password = "Password must be at least 8 characters.";
      }
      if (!values.confirmPassword) next.confirmPassword = "Confirm password is required.";
      else if (values.password !== values.confirmPassword)
        next.confirmPassword = "Passwords do not match.";
    }
    if (!values.status) next.status = "Status is required.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({ ...values, fullName: values.fullName.trim(), email: values.email.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            Standard users can sign in with these credentials and see only their own data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="Full Name" error={errors.fullName}>
            <Input
              value={values.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Kavya Iyer"
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="kavya@example.com"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" error={errors.password}>
              <Input
                type="password"
                value={values.password}
                onChange={(e) => set("password", e.target.value)}
                minLength={8}
                placeholder={editing ? "Leave blank to keep current password" : "Minimum 8 characters"}
              />
            </Field>
            <Field label="Confirm Password" error={errors.confirmPassword}>
              <Input
                type="password"
                value={values.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                minLength={8}
                placeholder="Re-enter password"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role">
              <Input value="Standard User" readOnly disabled />
            </Field>
            <Field label="Status" error={errors.status}>
              <Select value={values.status} onValueChange={(v) => set("status", v as RecordStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Create user"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

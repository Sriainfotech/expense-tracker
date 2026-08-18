export type Role = "admin" | "standard_user";
export type RecordStatus = "Active" | "Inactive";

// export interface User {
//   id: string;
//   fullName: string;
//   email: string;
//   password: string;
//   role: Role;
//   status: RecordStatus;
//   createdAt: string;
// }


export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: RecordStatus;
  createdAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  source: string;
  amount: number;
  date: string;
  description: string;
  status: RecordStatus;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: RecordStatus;
  createdAt: string;
}

export interface UserFinancials {
  totalInvestment: number;
  totalExpenses: number;
  remainingBalance: number;
  investmentCount: number;
  expenseCount: number;
}

export const EXPENSE_CATEGORIES = [
  "Travel",
  "Operations",
  "Marketing",
  "Payroll",
  "Equipment",
  "Software",
  "Utilities",
  "Other",
] as const;

export const PAYMENT_METHODS = [
  "UPI",
  "Bank Transfer",
  "Credit Card",
  "Debit Card",
  "Cash",
  "Cheque",
] as const;

export const RECORD_STATUSES: RecordStatus[] = ["Active", "Inactive"];

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import api from "./api";
import type {
  Expense,
  Investment,
  User,
  UserFinancials,
  Role,
  RecordStatus,
} from "./types";

interface State {
  users: User[];
  investments: Investment[];
  expenses: Expense[];
  expenseCategories: string[];
  /** Company-wide remaining balance (overall investment − overall shared
   * expenses) — the same number for every user, fetched from the backend
   * since a standard user's local `investments` only contains their own. */
  overallRemainingBalance: number;
}

interface LoginResult {
  ok: true;
  user: User;
}

interface LoginError {
  ok: false;
  error: string;
}

// interface CreateUserInput {
//   fullName: string;
//   email: string;
//   password: string;
//   role: Role;
//   status: RecordStatus;
// }

interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  status: RecordStatus;
}

interface StoreValue extends State {
  ready: boolean;
  currentUser: User | null;

  login: (
    identifier: string,
    password: string,
  ) => Promise<LoginResult | LoginError>;

  logout: () => void;

  addUser: (input: CreateUserInput) => Promise<User>;
  updateUser: (
    id: string,
    patch: Partial<Omit<User, "id">> & { password?: string },
  ) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  addInvestment: (
    input: Omit<Investment, "id" | "createdAt">,
  ) => Promise<void>;

  updateInvestment: (
    id: string,
    patch: Partial<Omit<Investment, "id">>,
  ) => Promise<void>;

  deleteInvestment: (id: string) => Promise<void>;

  addExpense: (
    input: Omit<Expense, "id" | "createdAt">,
  ) => Promise<void>;

  updateExpense: (
    id: string,
    patch: Partial<Omit<Expense, "id">>,
  ) => Promise<void>;

  deleteExpense: (id: string) => Promise<void>;

  /** Adds a new shared expense category and returns its name. */
  addExpenseCategory: (name: string) => Promise<string>;

  financialsFor: (userId: string) => UserFinancials;
  totals: () => UserFinancials & { userCount: number };
  userName: (userId: string) => string;
}

const StoreContext = createContext<StoreValue | null>(null);

function mapUser(data: any): User {
  return {
    id: String(data.id),
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status === "active" ? "Active" : "Inactive",
    createdAt: data.created_at,
  };
}

function mapRecordStatus(status: string): RecordStatus {
  return String(status).toLowerCase() === "active" ? "Active" : "Inactive";
}

function mapInvestment(data: any): Investment {
  return {
    id: String(data.id),
    userId: String(data.user),
    source: data.investor_source,
    amount: Number(data.amount),
    date: data.investment_date,
    description: data.description ?? "",
    status: mapRecordStatus(data.status),
    createdAt: data.created_at,
  };
}

function mapExpense(data: any): Expense {
  return {
    id: String(data.id),
    category: data.category,
    description: data.description ?? "",
    amount: Number(data.amount),
    date: data.expense_date,
    paymentMethod: data.payment_method,
    status: mapRecordStatus(data.status),
    createdAt: data.created_at,
  };
}

function mapExpenseCategory(data: any): string {
  return data.name;
}

function getErrorMessage(error: any): string {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Something went wrong.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.non_field_errors)) {
    return data.non_field_errors.join(", ");
  }

  for (const key of Object.keys(data)) {
    const value = data[key];

    if (Array.isArray(value) && value.length > 0) {
      return `${key}: ${value.join(", ")}`;
    }

    if (typeof value === "string") {
      return `${key}: ${value}`;
    }
  }

  return "Request failed.";
}

function extractResults(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

// function mapUserInputToBackend(input: CreateUserInput) {
//   return {
//     full_name: input.fullName,
//     email: input.email,
//     password: input.password,
//     role: input.role,
//     status: input.status.toLowerCase(),
//   };
// }


function mapUserInputToBackend(input: CreateUserInput) {
  return {
    full_name: input.fullName,
    email: input.email,
    password: input.password,
    confirm_password: input.confirmPassword,
    role: input.role,
    status: input.status.toLowerCase(),
  };
}
function mapUserPatchToBackend(
  patch: Partial<Omit<User, "id">> & { password?: string },
) {
  const result: Record<string, unknown> = {};

  if (patch.fullName !== undefined) {
    result["full_name"] = patch.fullName;
  }

  if (patch.email !== undefined) {
    result["email"] = patch.email;
  }

  if (patch.role !== undefined) {
    result["role"] = patch.role;
  }

  if (patch.status !== undefined) {
    result["status"] = patch.status.toLowerCase();
  }

  if (patch.createdAt !== undefined) {
    result["created_at"] = patch.createdAt;
  }

  /** Only send a password when the admin intentionally changed it. */
  if (patch.password) {
    result["password"] = patch.password;
  }

  return result;
}

function mapInvestmentToBackend(
  input: Omit<Investment, "id" | "createdAt">,
) {
  return {
    user: Number(input.userId),
    investor_source: input.source,
    amount: input.amount,
    investment_date: input.date,
    description: input.description,
    status: input.status.toLowerCase(),
  };
}

function mapInvestmentPatchToBackend(
  patch: Partial<Omit<Investment, "id">>,
) {
  const result: Record<string, unknown> = {};

  if (patch.userId !== undefined) {
    result["user"] = Number(patch.userId);
  }

  if (patch.source !== undefined) {
    result["investor_source"] = patch.source;
  }

  if (patch.amount !== undefined) {
    result["amount"] = patch.amount;
  }

  if (patch.date !== undefined) {
    result["investment_date"] = patch.date;
  }

  if (patch.description !== undefined) {
    result["description"] = patch.description;
  }

  if (patch.status !== undefined) {
    result["status"] = patch.status.toLowerCase();
  }

  return result;
}

function mapExpenseToBackend(
  input: Omit<Expense, "id" | "createdAt">,
) {
  return {
    category: input.category,
    description: input.description,
    amount: input.amount,
    expense_date: input.date,
    payment_method: input.paymentMethod,
    status: input.status.toLowerCase(),
  };
}

function mapExpensePatchToBackend(
  patch: Partial<Omit<Expense, "id">>,
) {
  const result: Record<string, unknown> = {};

  if (patch.category !== undefined) {
    result["category"] = patch.category;
  }

  if (patch.description !== undefined) {
    result["description"] = patch.description;
  }

  if (patch.amount !== undefined) {
    result["amount"] = patch.amount;
  }

  if (patch.date !== undefined) {
    result["expense_date"] = patch.date;
  }

  if (patch.paymentMethod !== undefined) {
    result["payment_method"] = patch.paymentMethod;
  }

  if (patch.status !== undefined) {
    result["status"] = patch.status.toLowerCase();
  }

  return result;
}

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<State>({
    users: [],
    investments: [],
    expenses: [],
    expenseCategories: [],
    overallRemainingBalance: 0,
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  /*
   * Load current authenticated user and API data.
   */
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const token = localStorage.getItem("ledgerly.access");

      if (!token) {
        if (!cancelled) {
          setReady(true);
        }
        return;
      }

      try {
        const meResponse = await api.get("/auth/me/");
        const user = mapUser(meResponse.data);

        if (cancelled) return;

        setCurrentUser(user);

        /*
         * Admin can access all three resources.
         * Standard user can access their own investments/expenses.
         */
        if (user.role === "admin") {
          const [usersResponse, investmentsResponse, expensesResponse, categoriesResponse, balanceResponse] =
            await Promise.all([
              api.get("/users/"),
              api.get("/investments/"),
              api.get("/expenses/"),
              api.get("/expense-categories/"),
              api.get("/balance/"),
            ]);

          if (cancelled) return;

          setState({
            users: extractResults(usersResponse.data).map(mapUser),
            investments: extractResults(
              investmentsResponse.data,
            ).map(mapInvestment),
            expenses: extractResults(
              expensesResponse.data,
            ).map(mapExpense),
            expenseCategories: extractResults(
              categoriesResponse.data,
            ).map(mapExpenseCategory),
            overallRemainingBalance: Number(balanceResponse.data.remaining_balance) || 0,
          });
        } else {
          const [investmentsResponse, expensesResponse, categoriesResponse, balanceResponse] =
            await Promise.all([
              api.get("/investments/"),
              api.get("/expenses/"),
              api.get("/expense-categories/"),
              api.get("/balance/"),
            ]);

          if (cancelled) return;

          setState({
            users: [user],
            investments: extractResults(
              investmentsResponse.data,
            ).map(mapInvestment),
            expenses: extractResults(
              expensesResponse.data,
            ).map(mapExpense),
            expenseCategories: extractResults(
              categoriesResponse.data,
            ).map(mapExpenseCategory),
            overallRemainingBalance: Number(balanceResponse.data.remaining_balance) || 0,
          });
        }
      } catch (error) {
        console.error("Failed to initialize store:", error);

        localStorage.removeItem("ledgerly.access");
        localStorage.removeItem("ledgerly.refresh");

        if (!cancelled) {
          setCurrentUser(null);
          setState({
            users: [],
            investments: [],
            expenses: [],
            expenseCategories: [],
            overallRemainingBalance: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * LOGIn
   */async function login(
  identifier: string,
  password: string,
): Promise<LoginResult | LoginError> {
  try {
    const response = await api.post("/auth/login/", {
      identifier: identifier.trim(),
      password,
    });

    const access = response.data.access;
    const refresh = response.data.refresh;

    if (!access || !refresh) {
      return {
        ok: false,
        error: "Login succeeded but tokens were not returned.",
      };
    }

    // Store JWT tokens
    localStorage.setItem("ledgerly.access", access);
    localStorage.setItem("ledgerly.refresh", refresh);

    // Django already returns the logged-in user
    const user = mapUser(response.data.user);

    setCurrentUser(user);

    // Load data after login
    if (user.role === "admin") {
      const [usersResponse, investmentsResponse, expensesResponse, categoriesResponse, balanceResponse] =
        await Promise.all([
          api.get("/users/"),
          api.get("/investments/"),
          api.get("/expenses/"),
          api.get("/expense-categories/"),
          api.get("/balance/"),
        ]);

      setState({
        users: extractResults(usersResponse.data).map(mapUser),
        investments: extractResults(
          investmentsResponse.data,
        ).map(mapInvestment),
        expenses: extractResults(
          expensesResponse.data,
        ).map(mapExpense),
        expenseCategories: extractResults(
          categoriesResponse.data,
        ).map(mapExpenseCategory),
        overallRemainingBalance: Number(balanceResponse.data.remaining_balance) || 0,
      });
    } else {
      const [investmentsResponse, expensesResponse, categoriesResponse, balanceResponse] =
        await Promise.all([
          api.get("/investments/"),
          api.get("/expenses/"),
          api.get("/expense-categories/"),
          api.get("/balance/"),
        ]);

      setState({
        users: [user],
        investments: extractResults(
          investmentsResponse.data,
        ).map(mapInvestment),
        expenses: extractResults(
          expensesResponse.data,
        ).map(mapExpense),
        expenseCategories: extractResults(
          categoriesResponse.data,
        ).map(mapExpenseCategory),
        overallRemainingBalance: Number(balanceResponse.data.remaining_balance) || 0,
      });
    }

    return {
      ok: true,
      user,
    };
  } catch (error) {
    localStorage.removeItem("ledgerly.access");
    localStorage.removeItem("ledgerly.refresh");

    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}
  /*
   * LOGOUT
   */
  const logout = useCallback(() => {
    localStorage.removeItem("ledgerly.access");
    localStorage.removeItem("ledgerly.refresh");

    setCurrentUser(null);

    setState({
      users: [],
      investments: [],
      expenses: [],
      expenseCategories: [],
      overallRemainingBalance: 0,
    });
  }, []);

  /*
   * USERS
   */
  const addUser = useCallback<StoreValue["addUser"]>(
    async (input) => {
      try {
        const response = await api.post(
          "/users/",
          mapUserInputToBackend(input),
        );

        const user = mapUser(response.data);

        setState((prev) => ({
          ...prev,
          users: [...prev.users, user],
        }));

        return user;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [],
  );

  const updateUser = useCallback<StoreValue["updateUser"]>(
    async (id, patch) => {
      try {
        const response = await api.put(
          `/users/${id}/`,
          mapUserPatchToBackend(patch),
        );

        const updatedUser = mapUser(response.data);

        setState((prev) => ({
          ...prev,
          users: prev.users.map((user) =>
            user.id === id ? updatedUser : user,
          ),
        }));
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [],
  );

  // const deleteUser = useCallback<StoreValue["deleteUser"]>(
  //   async (id) => {
  //     try {
  //       await api.delete(`/users/${id}/`);

  //       setState((prev) => ({
  //         ...prev,
  //         users: prev.users.filter((user) => user.id !== id),
  //         investments: prev.investments.filter(
  //           (investment) => investment.userId !== id,
  //         ),
  //         expenses: prev.expenses.filter(
  //           (expense) => expense.userId !== id,
  //         ),
  //       }));
  //     } catch (error) {
  //       throw new Error(getErrorMessage(error));
  //     }
  //   },
  //   [],
  // );

  const deleteUser = useCallback<StoreValue["deleteUser"]>(
  async (id) => {
    try {
      await api.delete(`/users/${id}/`);

      setState((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== id),
        investments: prev.investments.filter((i) => i.userId !== id),
      }));
    } catch (error) {
      console.error("Delete user failed:", error);
      throw error;
    }
  },
  [],
);

  /*
   * INVESTMENTS
   */
  const addInvestment = useCallback<StoreValue["addInvestment"]>(
    async (input) => {
      try {
        const response = await api.post(
          "/investments/",
          mapInvestmentToBackend(input),
        );

        const investment = mapInvestment(response.data);

        setState((prev) => ({
          ...prev,
          investments: [...prev.investments, investment],
        }));
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [],
  );

  const updateInvestment = useCallback<
    StoreValue["updateInvestment"]
  >(async (id, patch) => {
    try {
      const response = await api.put(
        `/investments/${id}/`,
        mapInvestmentPatchToBackend(patch),
      );

      const investment = mapInvestment(response.data);

      setState((prev) => ({
        ...prev,
        investments: prev.investments.map((item) =>
          item.id === id ? investment : item,
        ),
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const deleteInvestment = useCallback<
    StoreValue["deleteInvestment"]
  >(async (id) => {
    try {
      await api.delete(`/investments/${id}/`);

      setState((prev) => ({
        ...prev,
        investments: prev.investments.filter(
          (investment) => investment.id !== id,
        ),
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  /*
   * EXPENSES
   */
  const addExpense = useCallback<StoreValue["addExpense"]>(
    async (input) => {
      try {
        const response = await api.post(
          "/expenses/",
          mapExpenseToBackend(input),
        );

        const expense = mapExpense(response.data);

        setState((prev) => ({
          ...prev,
          expenses: [...prev.expenses, expense],
        }));
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [],
  );

  const updateExpense = useCallback<
    StoreValue["updateExpense"]
  >(async (id, patch) => {
    try {
      const response = await api.put(
        `/expenses/${id}/`,
        mapExpensePatchToBackend(patch),
      );

      const expense = mapExpense(response.data);

      setState((prev) => ({
        ...prev,
        expenses: prev.expenses.map((item) =>
          item.id === id ? expense : item,
        ),
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const deleteExpense = useCallback<
    StoreValue["deleteExpense"]
  >(async (id) => {
    try {
      await api.delete(`/expenses/${id}/`);

      setState((prev) => ({
        ...prev,
        expenses: prev.expenses.filter(
          (expense) => expense.id !== id,
        ),
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const addExpenseCategory = useCallback<StoreValue["addExpenseCategory"]>(
    async (name) => {
      try {
        const response = await api.post("/expense-categories/", {
          name: name.trim(),
        });

        const category = mapExpenseCategory(response.data);

        setState((prev) =>
          prev.expenseCategories.includes(category)
            ? prev
            : {
                ...prev,
                expenseCategories: [...prev.expenseCategories, category].sort(),
              },
        );

        return category;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [],
  );

  /*
   * FINANCIALS
   *
   * These are calculated from the currently loaded Django records.
   * Django remains the real database/source of truth. Only "Active" records
   * count toward totals/balance, matching the backend's calculation rule
   * (finance/services.py only sums status="active" investments/expenses).
   */
  const financialsFor = useCallback<StoreValue["financialsFor"]>(
    (userId) => {
      const investments = state.investments.filter(
        (investment) => investment.userId === userId && investment.status === "Active",
      );

      // Expenses are shared/company-wide — not filtered by user.
      const expenses = state.expenses.filter((expense) => expense.status === "Active");

      const totalInvestment = investments.reduce(
        (sum, investment) => sum + investment.amount,
        0,
      );

      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );

      return {
        totalInvestment,
        totalExpenses,
        remainingBalance: state.overallRemainingBalance,
        investmentCount: investments.length,
        expenseCount: expenses.length,
      };
    },
    [state.investments, state.expenses, state.overallRemainingBalance],
  );

  const totals = useCallback<StoreValue["totals"]>(() => {
    const activeInvestments = state.investments.filter((investment) => investment.status === "Active");
    const activeExpenses = state.expenses.filter((expense) => expense.status === "Active");

    const totalInvestment = activeInvestments.reduce(
      (sum, investment) => sum + investment.amount,
      0,
    );

    const totalExpenses = activeExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    return {
      totalInvestment,
      totalExpenses,
      remainingBalance: state.overallRemainingBalance,
      investmentCount: activeInvestments.length,
      expenseCount: activeExpenses.length,
      userCount: state.users.length,
    };
  }, [state]);

  const userName = useCallback<StoreValue["userName"]>(
    (userId) =>
      state.users.find((user) => user.id === userId)?.fullName ??
      "Unknown user",
    [state.users],
  );

  const value: StoreValue = {
    ...state,
    ready,
    currentUser,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addExpense,
    updateExpense,
    deleteExpense,
    addExpenseCategory,
    financialsFor,
    totals,
    userName,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);

  if (!ctx) {
    throw new Error(
      "useStore must be used inside StoreProvider",
    );
  }

  return ctx;
}
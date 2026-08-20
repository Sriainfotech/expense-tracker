import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Receipt,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/investments", label: "Investments", icon: PiggyBank },
  { to: "/admin/expenses", label: "Expenses", icon: Receipt },
] as const;

const userNav = [
  { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/user/investments", label: "Investments", icon: PiggyBank },
  { to: "/user/expenses", label: "Expenses", icon: Receipt },
] as const;

export function AppShell({
  role,
  title,
  subtitle,
  actions,
  children,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const nav = role === "admin" ? adminNav : userNav;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {open ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-brand-deep/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-68 flex-col brand-gradient text-brand-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/25">
            <Wallet className="size-5" />
          </span>
          <div>
            <p className="text-base font-bold leading-tight">Ledgerly</p>
            <p className="text-[11px] uppercase tracking-wider text-brand-foreground/65">
              Capital Control
            </p>
          </div>
          <button
            className="ml-auto rounded-md p-1 lg:hidden"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/25 text-brand-foreground"
                    : "text-brand-foreground/75 hover:bg-primary/12 hover:text-brand-foreground",
                )}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/25 text-sm font-semibold">
              {currentUser?.fullName.charAt(0) ?? "?"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{currentUser?.fullName}</p>
              <p className="truncate text-[11px] text-brand-foreground/65">
                {role === "admin" ? "Administrator" : "Standard user"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <nav className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
          <button
            className="rounded-md border border-border p-2 lg:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-4.5" />
          </button>
          <div className="flex flex-1 items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Wallet className="size-4" />
            </span>
            <p className="text-sm font-bold tracking-tight">Ledgerly</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            <span>Logout</span>
          </button>
        </nav>

        <header className="flex flex-col gap-3 bg-card/90 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
            {subtitle ? (
              <p className="text-xs text-muted-foreground sm:truncate sm:text-sm">{subtitle}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>
          ) : null}
        </header>
        <main className="flex-1 space-y-6 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { ready, currentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      navigate({ to: "/", replace: true });
      return;
    }
    if (currentUser.role !== role) {
      navigate({
        to: currentUser.role === "admin" ? "/admin/dashboard" : "/user/dashboard",
        replace: true,
      });
    }
  }, [ready, currentUser, role, navigate]);

  if (!ready || !currentUser || currentUser.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <BarChart3 className="size-4 animate-pulse" />
          Loading workspace…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export { Button };

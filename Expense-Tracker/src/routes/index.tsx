import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Scale,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · Ledgerly Capital Control Platform" },
      {
        name: "description",
        content:
          "Sign in to Ledgerly to record who invested what, track shared expenses against one capital pool, and see the live remaining balance.",
      },
      { property: "og:title", content: "Sign in · Ledgerly Capital Control Platform" },
      {
        property: "og:description",
        content: "One shared capital pool. Every expense deducted from it, live.",
      },
    ],
  }),
  component: LoginPage,
});

const features = [
  {
    icon: Wallet,
    title: "One shared capital pool",
    description: "Every user's investment adds to it; every expense is deducted from it.",
  },
  {
    icon: Layers,
    title: "Categorized expenses",
    description: "Log expenses against custom categories, editable inline as you go.",
  },
  {
    icon: Scale,
    title: "Live remaining balance",
    description: "Total investment minus total expenses, recalculated the instant either changes.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description:
      "Admins manage users, investments and expenses. Standard users get read-only visibility.",
  },
];

function LoginPage() {
  const { login, currentUser, ready } = useStore();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || !currentUser) return;
    navigate({
      to: currentUser.role === "admin" ? "/admin/dashboard" : "/user/dashboard",
      replace: true,
    });
  }, [ready, currentUser, navigate]);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);

  if (!identifier.trim() || !password) {
    setError("Enter your email or username and password.");
    return;
  }

  setSubmitting(true);
  try {
    const result = await login(identifier, password);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success(`Welcome back, ${result.user.fullName.split(" ")[0]}`);

    navigate({
      to:
        result.user.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard",
      replace: true,
    });
  } finally {
    setSubmitting(false);
  }
}
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branding */}
      <section className="brand-gradient relative flex flex-col justify-between gap-10 px-6 py-10 text-brand-foreground sm:px-10 lg:px-14 lg:py-14">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/25">
            <Wallet className="size-5.5" />
          </span>
          <div>
            <p className="text-lg font-bold leading-tight">Ledgerly</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-foreground/65">
              Capital Control Platform
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            One capital pool. Every rupee accounted for.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-foreground/75 sm:text-base">
            Record who invested what, log shared expenses by category, and see the remaining
            balance update the moment either side changes.
          </p>

          <div className="mt-8 space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/25">
                  <feature.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="mt-0.5 text-xs text-brand-foreground/70 sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-brand-foreground/55">
          © 2026 Ledgerly. One shared balance — Investments − Expenses.
        </p>
      </section>

      {/* Login */}
      <section className="flex items-center justify-center bg-background px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sign in to your workspace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="user@example.com or your full name"
                className="h-11 bg-card shadow-soft"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-card pr-11 shadow-soft"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={submitting} className="h-11 w-full text-base">
              {submitting ? (
                <>
                  <Loader2 className="size-4.5 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4.5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

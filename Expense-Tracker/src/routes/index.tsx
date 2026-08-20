import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  LineChart,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · Ledgerly Capital Control Platform" },
      {
        name: "description",
        content:
          "Sign in to Ledgerly to track investments, manage expenses against remaining balance and see where the money went.",
      },
      { property: "og:title", content: "Sign in · Ledgerly Capital Control Platform" },
      {
        property: "og:description",
        content: "Every expense, tied to real capital. Live investment and expense control.",
      },
    ],
  }),
  component: LoginPage,
});

const features = [
  {
    icon: LineChart,
    title: "Live balance engine",
    description: "Investments − Expenses, recalculated instantly.",
  },
  {
    icon: BarChart3,
    title: "Board-ready reporting",
    description: "Trends, categories and financial summaries in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based control",
    description: "Admins manage users. Users see only their own data.",
  },
];

function LoginPage() {
  const { login, currentUser, ready } = useStore();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
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
            Every expense, tied to real capital.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-foreground/75 sm:text-base">
            Track investments, manage expenses against remaining balance, and give finance leaders a
            live view of where the money went — with clear financial visibility.
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
          © 2026 Ledgerly. Investments − Expenses = Remaining balance.
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

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  aria-label="Remember me"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast.info("Password recovery is handled by your administrator.")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
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

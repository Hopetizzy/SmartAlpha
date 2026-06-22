"use client";

import Link from "next/link";
import { useState } from "react";

import { OAuthProviderButtons } from "@/components/oauth-provider-buttons";
import { signIn } from "@/lib/auth-actions";

export function SignInForm({ providers }: { providers: string[] }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn(email.trim(), password);

    if (result.success) {
      window.location.href = "/protected";
      return;
    }

    setError(result.error);
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary" htmlFor="password">
              Password
            </label>
            <Link
              href="/auth/reset-password"
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-error font-medium">{error}</p> : null}

        <button
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <OAuthProviderButtons providers={providers} />
    </div>
  );
}

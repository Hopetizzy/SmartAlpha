"use client";

import { useState } from "react";

import { OAuthProviderButtons } from "@/components/oauth-provider-buttons";
import { resendVerification, signUp, verifyEmail } from "@/lib/auth-actions";

export function SignUpForm({ providers }: { providers: string[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    const result = await signUp(email.trim(), password, name.trim());

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    if (result.requireVerification) {
      setStep("verify");
      setMessage("Check your email for a verification code.");
      setIsLoading(false);
      return;
    }

    window.location.href = "/protected";
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await verifyEmail(email.trim(), otp.trim());

    if (result.success) {
      window.location.href = "/protected";
      return;
    }

    setError(result.error);
    setIsLoading(false);
  }

  async function handleResend() {
    setError("");
    setMessage("");
    const result = await resendVerification(email.trim());

    if (result.success) {
      setMessage("Verification code resent.");
      return;
    }

    setError(result.error);
  }

  if (step === "verify") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">Verify your email</h1>
          <p className="mt-1.5 text-sm text-text-secondary font-medium">
            We sent a 6-digit code to <span className="font-semibold text-text-primary">{email}</span>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleVerify}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="otp">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              required
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              className="flex h-12 w-full rounded-md border border-border bg-surface px-3 py-2 text-center text-xl tracking-[0.35em] font-bold text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
              placeholder="000000"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>

          {error ? <p className="text-sm text-error font-medium">{error}</p> : null}
          {message ? <p className="text-sm text-success-foreground font-medium">{message}</p> : null}

          <button
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            type="submit"
            disabled={isLoading || otp.length < 6}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary font-medium">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            className="text-text-primary font-semibold hover:underline"
            onClick={() => void handleResend()}
          >
            Resend
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Create an account</h1>
        <p className="mt-1.5 text-sm text-text-secondary font-medium">Enter your details to get started</p>
      </div>

      <form className="space-y-4" onSubmit={handleSignUp}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

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
          <label className="text-sm font-medium text-text-primary" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-error font-medium">{error}</p> : null}
        {message ? <p className="text-sm text-success-foreground font-medium">{message}</p> : null}

        <button
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <OAuthProviderButtons providers={providers} />
    </div>
  );
}

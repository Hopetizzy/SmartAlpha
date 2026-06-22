import Link from "next/link";
import Image from "next/image";
import { Check, Zap, Bell, Shield, Sliders } from "lucide-react";

import { getCurrentViewer } from "@/lib/auth-state";
import { SiteShell } from "@/components/site-shell";
import { DashboardPreview } from "@/components/dashboard-preview";

export default async function Home() {
  const viewer = await getCurrentViewer();

  return (
    <SiteShell>
      <div className="flex flex-col gap-24 py-8">
        {/* Hero Section */}
        <section className="relative isolate flex flex-col items-center text-center max-w-4xl mx-auto gap-8 w-full">
          {/* Logo Watermark Background (Opacity 0.08, centered) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[420px] md:h-[420px] opacity-[0.08] pointer-events-none select-none -z-10">
            <Image
              src="/logo.png"
              alt="Smart Alpha Watermark"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-lightest border border-success-light text-success-foreground text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Low Latency Solana Swaps</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-tight md:leading-none">
            Track Solana <span className="text-success-dark">Smart Money</span> in Real-Time
          </h1>

          <p className="text-lg md:text-xl text-text-secondary font-medium max-w-2xl">
            Stop chasing green candles. Monitor highly profitable wallets on-chain, filter out the low-liquidity noise, and get instant buy/sell alerts directly in your Telegram.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-2">
            {viewer.isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold rounded-lg px-8 py-3.5 text-base shadow hover:opacity-95 transition-all text-center"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="w-full sm:w-auto bg-surface border border-border text-text-primary font-semibold rounded-lg px-8 py-3.5 text-base hover:bg-surface-secondary transition-all text-center"
                >
                  Configure Filters
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-up"
                  className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold rounded-lg px-8 py-3.5 text-base shadow hover:opacity-95 transition-all text-center"
                >
                  Start Tracking Now
                </Link>
                <Link
                  href="#pricing"
                  className="w-full sm:w-auto bg-surface border border-border text-text-primary font-semibold rounded-lg px-8 py-3.5 text-base hover:bg-surface-secondary transition-all text-center"
                >
                  View Pricing Plans
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Animated Dashboard Live Preview Mockup Section */}
        <section className="w-full max-w-5xl mx-auto flex flex-col gap-6">
          <div className="text-center md:text-left flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-text-primary">Interactive Dashboard Preview</h2>
            <p className="text-sm text-text-secondary font-medium">
              See what’s happening in real-time. Watch mock transactions sync, or view your settings console below.
            </p>
          </div>
          <DashboardPreview />
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-text-muted transition-colors flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-info-lightest border border-info-light flex items-center justify-center text-info">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Instant Telegram Alerts</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              Get notified immediately via a dedicated direct message bot when tracked wallets execute swaps on Raydium, Jupiter, or Pump.fun.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-text-muted transition-colors flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-success-lightest border border-success-light flex items-center justify-center text-success">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Custom Signal Filters</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              Eliminate spam. Define your thresholds for minimum token liquidity, swap size (USD), and max safety/risk score before alerts are sent.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-text-muted transition-colors flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-error-light border border-error flex items-center justify-center text-error">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Dynamic Risk Scoring</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              Every alert is analyzed and scored (0-100) based on token developer concentration, pool liquidity locks, and contract creation age.
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="flex flex-col gap-12 max-w-5xl mx-auto w-full">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-extrabold text-text-primary">Simple, Transparent Pricing</h2>
            <p className="text-text-secondary text-base font-medium">
              Choose the package that fits your trading style. Unlock real-time bot alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
            {/* Free Tier */}
            <div className="bg-surface border border-border rounded-xl p-8 flex flex-col justify-between shadow-sm relative">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Free Observer</h3>
                  <p className="text-sm text-text-secondary mt-1">For basic on-chain exploration</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-text-primary">$0</span>
                  <span className="text-text-secondary ml-1 text-sm font-medium">/ month</span>
                </div>
                <ul className="flex flex-col gap-3.5 text-sm text-text-secondary font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-success" />
                    <span>View Public Wallet Leaderboard</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-success" />
                    <span>Live Alert Feed (Web only)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-success" />
                    <span>Add up to 2 Wallets to Watchlist</span>
                  </li>
                  <li className="flex items-center gap-2.5 opacity-50">
                    <Check className="w-4 h-4 text-text-muted" />
                    <span>No Telegram Alert Pushes</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href={viewer.isAuthenticated ? "/dashboard" : "/auth/sign-up"}
                  className="block w-full py-2.5 text-center font-semibold text-sm rounded-lg bg-surface border border-border hover:bg-surface-secondary text-text-primary transition-all"
                >
                  Start Observing
                </Link>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="bg-surface border-2 border-primary rounded-xl p-8 flex flex-col justify-between shadow-md relative">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Alpha Premium</h3>
                  <p className="text-sm text-text-secondary mt-1">For serious data-driven traders</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-text-primary">$29</span>
                  <span className="text-text-secondary ml-1 text-sm font-medium">/ month</span>
                </div>
                <ul className="flex flex-col gap-3.5 text-sm text-text-secondary font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-success" />
                    <span>Real-time Telegram DM alerts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-success" />
                    <span>Custom Alert Filters (liquidity, size)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-success" />
                    <span>Unlimited Personal Watchlist Wallets</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-success" />
                    <span>Deep Risk & Safety Scores</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-success" />
                    <span>DexScreener & Birdeye Direct Links</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href={viewer.isAuthenticated ? "/dashboard" : "/auth/sign-up"}
                  className="block w-full py-2.5 text-center font-semibold text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-95 transition-all shadow"
                >
                  Upgrade to Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Stats Section */}
        <section className="bg-surface border border-border rounded-xl p-8 shadow-sm max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-text-primary">150+</span>
            <span className="text-xs text-text-secondary font-semibold uppercase">Smart Wallets Tracked</span>
          </div>
          <div className="flex flex-col gap-1 border-t sm:border-t-0 sm:border-x border-border pt-4 sm:pt-0">
            <span className="text-3xl font-extrabold text-text-primary">&lt; 100ms</span>
            <span className="text-xs text-text-secondary font-semibold uppercase">Webhook Ingestion Latency</span>
          </div>
          <div className="flex flex-col gap-1 border-t sm:border-t-0 pt-4 sm:pt-0">
            <span className="text-3xl font-extrabold text-text-primary">12M+</span>
            <span className="text-xs text-text-secondary font-semibold uppercase">Processed Swap Signals</span>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

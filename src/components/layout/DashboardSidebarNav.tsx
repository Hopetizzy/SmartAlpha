"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Layers, 
  Settings, 
  Trophy, 
  Sparkles, 
  X, 
  Loader2,
  Menu
} from "lucide-react";
import { WalletLeaderboard } from "@/components/wallet-leaderboard";
import { createStripeCheckoutSession, createStripeCustomerPortalSession } from "@/app/settings/actions";
import posthog from "posthog-js";

interface DashboardSidebarNavProps {
  isPremium: boolean;
  userDisplayName: string;
}

export function DashboardSidebarNav({ isPremium, userDisplayName }: DashboardSidebarNavProps) {
  const pathname = usePathname();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSubscribe = async () => {
    setIsBillingLoading(true);
    const res = await createStripeCheckoutSession();
    if (res.error) {
      alert(res.error);
      setIsBillingLoading(false);
    } else if (res.url) {
      posthog.capture("checkout_initiated");
      window.location.assign(res.url);
    }
  };

  const handleManageBilling = async () => {
    setIsBillingLoading(true);
    const res = await createStripeCustomerPortalSession();
    if (res.error) {
      alert(res.error);
      setIsBillingLoading(false);
    } else if (res.url) {
      posthog.capture("customer_portal_opened");
      window.location.assign(res.url);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Layers },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const renderSidebarContent = (onClose?: () => void) => (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="SmartAlpha Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-bold text-text-primary text-base tracking-tight uppercase">
              SmartAlpha
            </span>
          </Link>
          {onClose && (
            <button 
              onClick={onClose} 
              className="lg:hidden p-1 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu Section */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase px-2 mb-1">
            Main Menu
          </span>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-surface-secondary text-text-primary border border-border/80 shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-text-primary" : "text-text-muted"}`} />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                if (onClose) onClose();
                setIsLeaderboardOpen(true);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 transition-colors text-left w-full"
            >
              <Trophy className="w-4.5 h-4.5 text-text-muted" />
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Promo & Sign Out Action Panel */}
      <div className="flex flex-col gap-4 border-t border-border/40 pt-6">
        {!isPremium ? (
          <div className="bg-surface-secondary border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary-lightest border border-primary-light flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-text-primary">Upgrade Plan</span>
                <span className="text-[10px] text-text-secondary font-medium leading-normal">
                  Unlock instant Telegram notifications, custom alert parameters, and unlimited wallet watchlists.
                </span>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={isBillingLoading}
              className="w-full bg-primary text-primary-foreground font-bold text-xs py-2 rounded-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
            >
              {isBillingLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              Subscribe for $9/mo
            </button>
          </div>
        ) : (
          <div className="bg-success-lightest/30 border border-success-light/40 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-success-lightest border border-success-light flex items-center justify-center text-success shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-success" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-success-foreground">Alpha Premium</span>
                <span className="text-[10px] text-text-secondary font-medium leading-normal">
                  Premium subscriber access is active.
                </span>
              </div>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={isBillingLoading}
              className="w-full bg-surface border border-border text-text-primary font-bold text-xs py-2 rounded-lg hover:bg-surface-secondary transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              {isBillingLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              Manage Billing
            </button>
          </div>
        )}

        {/* Mobile-Only Sign Out button inside drawer */}
        <form action="/auth/sign-out" method="post" className="lg:hidden w-full">
          <button
            type="submit"
            className="w-full bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors font-semibold rounded-lg py-2 text-xs text-center"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (always visible on lg width) */}
      <div className="hidden lg:flex w-64 h-screen border-r border-border bg-surface flex-col justify-between shrink-0 sticky top-0 z-50 p-6">
        {renderSidebarContent()}
      </div>

      {/* 2. Mobile Header Panel (only visible on mobile/tablet viewports) */}
      <div className="lg:hidden flex items-center justify-between w-full h-16 border-b border-border bg-surface shrink-0 px-6 sticky top-0 z-40">
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="p-2 rounded-lg border border-border bg-surface-secondary/50 text-text-primary hover:bg-surface-secondary transition-colors"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="SmartAlpha Logo" width={24} height={24} />
          <span className="font-bold text-text-primary text-sm uppercase tracking-wider">SmartAlpha</span>
        </Link>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-primary-foreground text-xs font-extrabold shadow-sm shrink-0 border border-primary-light">
          {userDisplayName.slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* 3. Mobile Slide-out Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur overlay */}
          <div 
            onClick={() => setIsMobileOpen(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
          />
          
          {/* Drawer container */}
          <div className="relative flex flex-col w-64 max-w-[80vw] h-full bg-surface border-r border-border p-6 justify-between animate-in slide-in-from-left duration-200 shadow-2xl">
            {renderSidebarContent(() => setIsMobileOpen(false))}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                  SMART MONEY TRACKING
                </span>
                <h3 className="text-lg font-bold text-text-primary mt-1">
                  Wallet Performance Leaderboard
                </h3>
              </div>
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <WalletLeaderboard isModal={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

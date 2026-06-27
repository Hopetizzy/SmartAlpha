"use client";

import { useState, useTransition } from "react";
import {
  Sliders,
  Bot,
  Trash2,
  Plus,
  Loader2,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Clipboard,
  CheckCircle2,
  AlertTriangle,
  CreditCard
} from "lucide-react";
import {
  updateSettings,
  addCustomWatchlist,
  removeFromWatchlist,
  generateTelegramLink,
  disconnectTelegram,
  AlertSettings,
  WatchlistItem,
  createStripeCheckoutSession,
  createStripeCustomerPortalSession,
  TransactionRecord
} from "./actions";
import posthog from "posthog-js";

interface SettingsContentProps {
  initialSettings: AlertSettings;
  initialWatchlist: WatchlistItem[];
  isPremium: boolean;
  telegramChatId: string;
  userDisplayName: string;
  userEmail: string;
  userId: string;
  createdAt: string;
  stripeCustomerId: string | null;
  initialTransactions: TransactionRecord[];
}

export function SettingsContent({
  initialSettings,
  initialWatchlist,
  isPremium,
  telegramChatId,
  userDisplayName,
  userEmail,
  userId,
  createdAt,
  stripeCustomerId,
  initialTransactions,
}: SettingsContentProps) {
  // 1. Settings state
  const [minLiquidity, setMinLiquidity] = useState(initialSettings.min_liquidity);
  const [minVolume, setMinVolume] = useState(initialSettings.min_volume);
  const [maxRiskScore, setMaxRiskScore] = useState(initialSettings.max_risk_score);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // 2. Watchlist state
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(initialWatchlist);
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");
  const [watchlistSuccess, setWatchlistSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 3. Telegram state
  const [chatId, setChatId] = useState(telegramChatId);
  const [isConnectingTelegram, setIsConnectingTelegram] = useState(false);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [isDisconnectingTelegram, setIsDisconnectingTelegram] = useState(false);

  // 4. Billing state
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"alerts" | "telegram" | "watchlist" | "billing">("alerts");

  const [isPending, startTransition] = useTransition();


  // Save Settings handler
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    const res = await updateSettings(minLiquidity, minVolume, maxRiskScore);
    setIsSavingSettings(false);
    if (res.error) {
      alert(res.error);
    } else {
      posthog.capture("alert_settings_saved", {
        min_liquidity: minLiquidity,
        min_volume: minVolume,
        max_risk_score: maxRiskScore,
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    }
  };

  // Add Watchlist handler
  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingWatchlist(true);
    setWatchlistError("");
    setWatchlistSuccess(false);

    const res = await addCustomWatchlist(newAddress, newLabel);
    setIsAddingWatchlist(false);

    if (res.error) {
      setWatchlistError(res.error);
    } else {
      posthog.capture("watchlist_wallet_added", { label: newLabel });
      setWatchlistSuccess(true);
      setNewAddress("");
      setNewLabel("");
      // Refetch watchlist locally
      const updated = await fetch("/api/settings/watchlist-helper").then(r => r.json());
      if (updated.data) setWatchlist(updated.data);
      setTimeout(() => setWatchlistSuccess(false), 3000);
    }
  };

  // Remove Watchlist handler
  const handleRemoveWatchlist = async (id: string) => {
    setDeletingId(id);
    const res = await removeFromWatchlist(id);
    setDeletingId(null);
    if (res.error) {
      alert(res.error);
    } else {
      posthog.capture("watchlist_wallet_removed");
      setWatchlist(prev => prev.filter(item => item.id !== id));
    }
  };

  // Telegram Connect handler
  const handleConnectTelegram = async () => {
    setIsConnectingTelegram(true);
    const res = await generateTelegramLink();
    setIsConnectingTelegram(false);
    if (res.error) {
      alert(res.error);
    } else if (res.link) {
      posthog.capture("telegram_connect_initiated");
      setTelegramLink(res.link);
    }
  };

  // Telegram Disconnect handler
  const handleDisconnectTelegram = async () => {
    if (!confirm("Are you sure you want to disconnect your Telegram bot alerts?")) return;
    setIsDisconnectingTelegram(true);
    const res = await disconnectTelegram();
    setIsDisconnectingTelegram(false);
    if (res.error) {
      alert(res.error);
    } else {
      posthog.capture("telegram_disconnected");
      setChatId("");
      setTelegramLink(null);
    }
  };

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

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Horizontal Segmented Tabs Navigation */}
      <div className="bg-surface-secondary/60 p-1.5 rounded-xl flex items-center gap-1.5 w-fit border border-border/40">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "alerts"
              ? "bg-surface text-text-primary shadow-sm border border-border/30"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Alert Parameters
        </button>
        <button
          onClick={() => setActiveTab("telegram")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "telegram"
              ? "bg-surface text-text-primary shadow-sm border border-border/30"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          Telegram Integration
        </button>
        <button
          onClick={() => setActiveTab("watchlist")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "watchlist"
              ? "bg-surface text-text-primary shadow-sm border border-border/30"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Watchlist Manager
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "billing"
              ? "bg-surface text-text-primary shadow-sm border border-border/30"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Billing & Account
        </button>
      </div>

      {/* Tab Panel Content Area */}
      <div className="w-full">
        
        {/* Tab 1: Alert Parameters */}
        {activeTab === "alerts" && (
          <div className="bg-surface border border-border/80 rounded-xl p-6 shadow-sm flex flex-col gap-6 hover:shadow-md transition-all duration-300">
            <div className="border-b border-border pb-4">
              <h4 className="text-base font-bold text-text-primary">Alert Parameters Settings</h4>
              <p className="text-xs text-text-muted mt-0.5">Define thresholds for custom Telegram notifications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Min Liquidity Slider */}
              <div className="flex flex-col gap-3 p-4 bg-surface-secondary/40 rounded-xl border border-border/40">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Min Token Liquidity
                  </label>
                  <span className="text-xs font-black bg-surface border border-border px-2 py-0.5 rounded-full text-text-primary">
                    ${minLiquidity.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="5000"
                  value={minLiquidity}
                  onChange={(e) => setMinLiquidity(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-text-muted font-medium leading-relaxed">
                  Filter alerts for coins with shallow liquidity pools to reduce slippage risk.
                </span>
              </div>

              {/* Min Volume/Size Slider */}
              <div className="flex flex-col gap-3 p-4 bg-surface-secondary/40 rounded-xl border border-border/40">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Min Swap Size (USD)
                  </label>
                  <span className="text-xs font-black bg-surface border border-border px-2 py-0.5 rounded-full text-text-primary">
                    ${minVolume.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="1000"
                  value={minVolume}
                  onChange={(e) => setMinVolume(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-text-muted font-medium leading-relaxed">
                  Only receive notifications for swaps above this threshold (ignores small noise trades).
                </span>
              </div>

              {/* Max Risk Score Slider */}
              <div className="flex flex-col gap-3 p-4 bg-surface-secondary/40 rounded-xl border border-border/40 md:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Max Allowed Risk Score
                  </label>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    maxRiskScore <= 30 
                      ? "bg-success-lightest text-success-foreground border border-success-light" 
                      : maxRiskScore <= 70 
                      ? "bg-warning-lightest text-warning-foreground border border-warning-light" 
                      : "bg-error-light text-error border border-error-light"
                  }`}>
                    {maxRiskScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={maxRiskScore}
                  onChange={(e) => setMaxRiskScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: maxRiskScore <= 30 ? "var(--color-success)" : maxRiskScore <= 70 ? "var(--color-warning)" : "var(--color-error)"
                  }}
                />
                <span className="text-[10px] text-text-muted font-medium leading-relaxed">
                  Bypasses bot broadcasts for contracts exceeding this developer concentration or honeypot risk rating.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="bg-primary text-primary-foreground font-semibold rounded-md px-5 py-2 text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Parameter Thresholds
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Telegram Integration */}
        {activeTab === "telegram" && (
          <div className="bg-surface border border-border/80 rounded-xl p-6 shadow-sm flex flex-col gap-6 hover:shadow-md transition-all duration-300">
            <div className="border-b border-border pb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-base font-bold text-text-primary">Telegram Status</h4>
                <p className="text-xs text-text-muted mt-0.5">Receive real-time push alerts on whale transaction updates.</p>
              </div>
            </div>

            {!isPremium ? (
              <div className="p-6 border border-warning-light bg-warning-light/5 rounded-xl flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-warning shrink-0" />
                  <span className="text-sm font-bold text-text-primary tracking-tight uppercase">Telegram Integration Locked</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                  Real-time Telegram bot alerts are exclusively available to premium subscribers. Upgrade your account in the "Billing & Account" tab to unlock Telegram linking and get instant signals.
                </p>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="w-fit bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-lg hover:opacity-95 transition-opacity shadow-sm"
                >
                  View Subscription Options
                </button>
              </div>
            ) : chatId ? (
              <div className="flex flex-col gap-6">
                <div className="p-4 border border-success-light bg-success-lightest/45 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-success-foreground">Connected to Telegram</span>
                    <span className="text-xs text-text-secondary mt-1 font-medium leading-relaxed">
                      Alerts are currently being routed to Telegram Chat ID:
                      <code className="bg-white/60 px-1.5 py-0.5 rounded text-text-primary font-mono ml-1.5 border border-border/20">{chatId}</code>
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectTelegram}
                  disabled={isDisconnectingTelegram}
                  className="w-fit bg-surface border border-error-light hover:bg-error-light hover:text-error-foreground text-text-secondary font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  {isDisconnectingTelegram && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Disconnect Telegram Bot
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="p-4 border border-border bg-surface-secondary/40 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-primary">Not Linked to Telegram</span>
                    <span className="text-xs text-text-secondary mt-1 leading-relaxed font-medium">
                      Generate a unique synchronization token below to register your account with our on-chain alert bot.
                    </span>
                  </div>
                </div>

                {!telegramLink ? (
                  <button
                    onClick={handleConnectTelegram}
                    disabled={isConnectingTelegram}
                    className="w-fit bg-primary text-primary-foreground font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:opacity-95 transition-opacity flex items-center gap-1.5"
                  >
                    {isConnectingTelegram && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Generate Sync Link
                  </button>
                ) : (
                  <div className="flex flex-col gap-4 max-w-xl">
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 text-center"
                    >
                      Open Telegram Chat
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    
                    <div className="p-4 bg-surface-secondary/50 border border-border rounded-xl flex flex-col gap-2">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Connection Instructions</span>
                      <div className="text-xs text-text-muted leading-relaxed font-medium flex flex-col gap-1.5 mt-1">
                        <div>1. Click the button above to launch the bot in your Telegram app.</div>
                        <div>2. Press the <b>Start</b> button or send <b>/start</b> inside the chat.</div>
                        <div>3. The bot will reply confirming connection. Refresh this dashboard settings page once completed.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Watchlist Manager */}
        {activeTab === "watchlist" && (
          <div className="bg-surface border border-border/80 rounded-xl p-6 shadow-sm flex flex-col gap-6 hover:shadow-md transition-all duration-300">
            <div className="border-b border-border pb-4">
              <h4 className="text-base font-bold text-text-primary">Personal Watchlist Manager</h4>
              <p className="text-xs text-text-muted mt-0.5">Track custom Solana addresses and override platform labels.</p>
            </div>

            {/* Add Wallet Form */}
            <form onSubmit={handleAddWatchlist} className="flex flex-col gap-4">
              {watchlistError && (
                <div className="p-3.5 border border-error-light bg-error-light text-error-foreground rounded-lg flex items-center gap-2 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {watchlistError}
                </div>
              )}
              
              {watchlistSuccess && (
                <div className="p-3.5 border border-success-light bg-success-lightest text-success-foreground rounded-lg flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Successfully added custom wallet to watchlist!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Solana Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Hw2sX7Gsz98xK9Z3p4R5qW6eT7yU8i9oOpQ"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="bg-surface-secondary/40 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Custom Alias Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Whale Raydium sniper"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="bg-surface-secondary/40 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingWatchlist}
                  className="bg-primary text-primary-foreground font-semibold rounded-md px-4 py-2 text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
                >
                  {isAddingWatchlist ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Add Custom Address
                </button>
              </div>
            </form>

            {/* List/Table of Active Watchlist */}
            <div className="mt-4 flex flex-col gap-3">
              <h5 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Currently Tracked Wallets ({watchlist.length})</h5>
              
              {watchlist.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center gap-2 bg-surface-secondary/10">
                  <Sparkles className="w-5 h-5 text-text-muted" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Watchlist is empty</p>
                    <p className="text-[10px] text-text-muted max-w-sm mt-0.5 leading-normal">
                      Add custom whale wallets above to monitor their real-time trades on your feed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-border/85 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface-secondary text-xs font-semibold text-text-secondary uppercase">
                        <th className="px-5 py-3">Label Alias</th>
                        <th className="px-5 py-3">Solana Address</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-xs font-semibold text-text-primary">
                      {watchlist.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-secondary/50 transition-colors">
                          <td className="px-5 py-3.5">{item.label}</td>
                          <td className="px-5 py-3.5 font-mono text-text-secondary">
                            <div className="flex items-center gap-2">
                              <span>
                                {item.wallet_address.slice(0, 6)}...{item.wallet_address.slice(-6)}
                              </span>
                              <a
                                href={`https://solscan.io/account/${item.wallet_address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
                                title="View on Solscan"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleRemoveWatchlist(item.id)}
                              disabled={deletingId === item.id}
                              className="text-text-muted hover:text-error hover:bg-error-light p-1.5 rounded-lg transition-all inline-flex items-center justify-center shrink-0 border border-transparent hover:border-error-light"
                              title="Remove from Watchlist"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Billing & Account */}
        {activeTab === "billing" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* User Details card */}
              <div className="bg-surface border border-border/80 rounded-xl p-6 shadow-sm flex flex-col gap-5 hover:shadow-md transition-all duration-300">
                <div className="border-b border-border/50 pb-4">
                  <h4 className="text-base font-bold text-text-primary">Your Profile</h4>
                  <p className="text-xs text-text-muted mt-0.5">Details of your logged-in SmartAlpha credentials.</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-primary-foreground text-lg font-extrabold shadow-sm shrink-0 border border-primary-light">
                    {userDisplayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-black text-text-primary tracking-tight">{userDisplayName}</h3>
                    <span className={`w-fit inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                      isPremium 
                        ? "bg-success-lightest text-success-foreground border border-success-light" 
                        : "bg-surface-secondary text-text-secondary border border-border"
                    }`}>
                      {isPremium ? (
                        <>
                          <Sparkles className="w-3 h-3 text-success shrink-0" />
                          Premium Subscriber
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3 h-3 text-text-secondary shrink-0" />
                          Free Plan
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-2 border-t border-border/40 pt-4 text-xs font-semibold">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Email Address</span>
                    <span className="font-mono text-text-primary">{userEmail}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Account ID</span>
                    <span className="font-mono text-text-muted text-[10px] select-all">{userId}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Member Since</span>
                    <span className="text-text-primary">
                      {new Date(createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {stripeCustomerId && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-text-secondary">Customer Reference</span>
                      <span className="font-mono text-text-muted text-[10px] select-all">{stripeCustomerId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan / Upgrades Card */}
              <div className="bg-surface border border-border/80 rounded-xl p-6 shadow-sm flex flex-col gap-5 hover:shadow-md transition-all duration-300">
                <div className="border-b border-border/50 pb-4">
                  <h4 className="text-base font-bold text-text-primary">Subscription Plan</h4>
                  <p className="text-xs text-text-muted mt-0.5">Unlock alerts and watchlist features on your account.</p>
                </div>

                {isPremium ? (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 border border-success-light bg-success-lightest/45 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-success-foreground">Alpha Premium Plan Active</span>
                        <span className="text-xs text-text-secondary mt-1 font-medium leading-relaxed">
                          Full access to Telegram alert feeds, customized slider risk criteria, and personal watchlists is unlocked.
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleManageBilling}
                      disabled={isBillingLoading}
                      className="w-full bg-surface border border-border hover:bg-surface-secondary text-text-primary font-bold text-xs py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      {isBillingLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Manage Billing & Invoices
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 rounded-xl flex flex-col gap-2.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-text-primary tracking-tight">$9</span>
                        <span className="text-xs text-text-muted font-medium">/ month</span>
                        <span className="text-sm text-text-muted line-through ml-1.5 font-medium">$29/mo</span>
                        <span className="text-[9px] font-extrabold bg-primary-lightest text-primary px-2 py-0.5 rounded border border-primary-light uppercase tracking-wider ml-auto">
                          Early Promo
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary leading-relaxed font-medium">
                        Receive real-time notifications for wallet swaps, custom filters on liquidity/swaps, and limitless watchlists.
                      </p>
                    </div>

                    <button
                      onClick={handleSubscribe}
                      disabled={isBillingLoading}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-[0_4px_12px_rgba(124,58,237,0.2)] hover:shadow-[0_6px_16px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-1.5"
                    >
                      {isBillingLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Upgrade to Premium
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Billing History Card */}
            <div className="bg-surface border border-border/80 rounded-xl p-6 shadow-sm flex flex-col gap-5 hover:shadow-md transition-all duration-300">
              <div className="border-b border-border/50 pb-4">
                <h4 className="text-base font-bold text-text-primary">Billing & Invoice History</h4>
                <p className="text-xs text-text-muted mt-0.5">View and download your historical premium subscription statements.</p>
              </div>

              {initialTransactions.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center gap-2 bg-surface-secondary/10">
                  <CreditCard className="w-5 h-5 text-text-muted animate-pulse" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">No transactions found</p>
                    <p className="text-[10px] text-text-muted max-w-sm mt-0.5 leading-normal">
                      Once you upgrade or complete subscription payments, invoice records will populate here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-border/85 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface-secondary text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        <th className="px-5 py-3">Description</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Invoices</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-xs font-semibold text-text-primary">
                      {initialTransactions.map((tx) => {
                        const dateStr = new Date(tx.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        const amountFormatted = new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: tx.currency || "USD",
                        }).format(tx.amount / 100);

                        const invoicePdf = tx.raw?.invoice_pdf;
                        const hostedInvoiceUrl = tx.raw?.hosted_invoice_url;
                        const invoiceNumber = tx.raw?.number || `TX-${tx.id.slice(0, 8).toUpperCase()}`;

                        return (
                          <tr key={tx.id} className="hover:bg-surface-secondary/50 transition-colors">
                            <td className="px-5 py-3.5 flex flex-col gap-0.5">
                              <span className="text-text-primary font-bold">
                                {tx.description || "Alpha Premium Subscription"}
                              </span>
                              <span className="text-[10px] text-text-muted font-mono">{invoiceNumber}</span>
                            </td>
                            <td className="px-5 py-3.5 text-text-secondary">{dateStr}</td>
                            <td className="px-5 py-3.5 font-bold text-text-primary">{amountFormatted}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider capitalize ${
                                tx.status === "succeeded" || tx.status === "paid"
                                  ? "bg-success-lightest text-success-foreground border border-success-light"
                                  : tx.status === "failed"
                                  ? "bg-error-light text-error border border-error-light"
                                  : "bg-surface-secondary text-text-secondary border border-border"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="inline-flex items-center gap-2 justify-end w-full">
                                {hostedInvoiceUrl && (
                                  <a
                                    href={hostedInvoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                                  >
                                    View Online
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {invoicePdf && (
                                  <a
                                    href={invoicePdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-surface border border-border hover:bg-surface-secondary text-text-primary font-bold text-[10px] px-2.5 py-1 rounded shadow-sm transition-colors"
                                  >
                                    PDF
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  ArrowUpRight, 
  Search, 
  Zap, 
  Loader2, 
  Play, 
  Plus, 
  Check, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { fetchAlerts, generateMockAlerts, addToWatchlist, AlertWithLabel } from "@/app/dashboard/actions";

interface LiveAlertFeedProps {
  isPremium: boolean;
}

export function LiveAlertFeed({ isPremium }: LiveAlertFeedProps) {
  const [alerts, setAlerts] = useState<AlertWithLabel[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track adding state per wallet address
  const [addingWallets, setAddingWallets] = useState<Record<string, boolean>>({});
  const [addedWallets, setAddedWallets] = useState<Record<string, boolean>>({});
  
  // Modal State for Contract Audit
  const [selectedAlert, setSelectedAlert] = useState<AlertWithLabel | null>(null);
  
  const [isPending, startTransition] = useTransition();

  const loadAlerts = async (query?: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    const result = await fetchAlerts(query);
    if (result.error) {
      setError(result.error);
    } else {
      setAlerts(result.data);
      setError(null);
    }
    if (!isSilent) setLoading(false);
  };

  // Initial load & search filter
  useEffect(() => {
    loadAlerts(search);
  }, [search]);

  // Polling every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAlerts(search, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [search]);

  const handleSeed = () => {
    startTransition(async () => {
      const result = await generateMockAlerts();
      if (result.error) {
        setError(result.error);
      } else {
        await loadAlerts(search);
      }
    });
  };

  const handleAddWatchlist = async (address: string, label: string) => {
    setAddingWallets(prev => ({ ...prev, [address]: true }));
    const result = await addToWatchlist(address, label);
    setAddingWallets(prev => ({ ...prev, [address]: false }));
    
    if (result.error) {
      alert(result.error);
    } else {
      setAddedWallets(prev => ({ ...prev, [address]: true }));
      // Reset added state after 3 seconds
      setTimeout(() => {
        setAddedWallets(prev => ({ ...prev, [address]: false }));
      }, 3000);
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 0) return "Just now";
    if (diffSec < 15) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return past.toLocaleDateString();
  };

  const formatAddress = (addr: string) => {
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Maps score range to reference design visual styles using only project tokens
  const getRiskLabel = (score: number) => {
    if (score <= 30) {
      return { 
        text: "LOW RISK", 
        color: "text-success border-success-light bg-success-lightest hover:opacity-90" 
      };
    }
    if (score <= 70) {
      return { 
        text: "MID RISK", 
        color: "text-warning border-border bg-surface-secondary hover:bg-surface-tertiary" 
      };
    }
    return { 
      text: "HIGH RISK", 
      color: "text-error border-error-light bg-error-light hover:opacity-90" 
    };
  };

  // Helper to compute token swap size matching "3,130,902 BASEGOD" style
  const getTokenQty = (amountUsd: number, symbol: string) => {
    let price = 0.082; // Default mock price
    const upperSym = symbol.toUpperCase();
    if (upperSym === "SOL") price = 150.0;
    else if (upperSym === "USDC" || upperSym === "USDT") price = 1.0;
    else if (upperSym === "BONK") price = 0.00002;
    else if (upperSym === "WIF") price = 2.45;
    else if (upperSym === "POPCAT") price = 0.92;
    
    const qty = Math.round(amountUsd / price);
    return qty.toLocaleString();
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden flex flex-col w-full">
      
      {/* Card Header */}
      <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Zap className="w-4 h-4 text-success fill-current" />
            LIVE SMART MONEY SIGNALS
          </h2>
          <p className="text-xs text-text-muted mt-1 font-medium">
            Swaps executed by tracked wallets stream below in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <button
            onClick={handleSeed}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold rounded-md px-3 py-1.5 text-xs hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Seed Demo Data
          </button>
        </div>
      </div>

      {/* Card Body / Table */}
      <div className="overflow-x-auto min-h-[350px] flex flex-col justify-between">
        {loading && alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 gap-2 text-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
            <span className="text-sm font-semibold">Connecting to live network signals...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 gap-2 text-text-secondary">
            <span className="text-sm font-bold text-error">Error loading signals: {error}</span>
            <button
              onClick={() => loadAlerts(search)}
              className="text-xs font-semibold text-primary hover:underline mt-2"
            >
              Retry Connection
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center text-text-muted">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">No live signals match filters</p>
              <p className="text-xs text-text-muted max-w-sm mx-auto mt-1 leading-relaxed">
                Click "Seed Demo Data" above to push swap notifications into the feed.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Wallet</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Swap Action</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Token Asset</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Net Value</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Auto Risk Auditing</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Dex Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light text-sm font-medium">
              {alerts.map((alert) => {
                const risk = getRiskLabel(alert.risk_score);
                const isBuy = alert.type === "BUY";
                const isAdding = addingWallets[alert.wallet_address];
                const isAdded = addedWallets[alert.wallet_address];

                return (
                  <tr
                    key={alert.id}
                    className="hover:bg-surface-secondary transition-colors duration-150"
                  >
                    {/* 1. Wallet Column with + ADD Watchlist button */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary text-sm font-semibold leading-5">
                            {alert.wallet_label}
                          </span>
                          
                          {/* Watchlist Inline Seeder */}
                          <button
                            onClick={() => handleAddWatchlist(alert.wallet_address, alert.wallet_label)}
                            disabled={isAdding || isAdded}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              isAdded 
                                ? "bg-success-lightest border-success-light text-success-foreground"
                                : "bg-info-lightest border-info-light text-text-secondary hover:text-text-primary hover:bg-info-light"
                            }`}
                          >
                            {isAdding ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : isAdded ? (
                              <>
                                <Check className="w-2.5 h-2.5" />
                                ADDED
                              </>
                            ) : (
                              <>
                                <Plus className="w-2.5 h-2.5" />
                                ADD
                              </>
                            )}
                          </button>
                        </div>
                        <span className="text-xs text-text-muted font-normal mt-0.5">
                          {formatAddress(alert.wallet_address)}
                        </span>
                      </div>
                    </td>

                    {/* 2. Swap Action */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isBuy
                            ? "bg-success-lightest text-success-foreground"
                            : "bg-error-light text-error-foreground"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isBuy ? "bg-success" : "bg-error"}`} />
                        {alert.type}
                      </span>
                    </td>

                    {/* 3. Token Asset */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-text-primary text-sm font-semibold leading-5">
                          {alert.token_symbol}
                        </span>
                        <span className="text-xs text-text-muted font-normal mt-0.5">
                          {alert.token_symbol === "SOL" 
                            ? "Solana Native Token" 
                            : alert.token_symbol === "USDC" 
                            ? "USD Coin" 
                            : alert.token_symbol === "BONK"
                            ? "Bonk and Hold Protocol"
                            : "Based Memecoin Asset"}
                        </span>
                      </div>
                    </td>

                    {/* 4. Net Value */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-text-primary text-sm font-bold">
                          ${alert.amount_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-text-muted font-normal mt-0.5">
                          {getTokenQty(alert.amount_usd, alert.token_symbol)} {alert.token_symbol}
                        </span>
                      </div>
                    </td>

                    {/* 5. Auto Risk Auditing Box */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all shadow-sm ${risk.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${scoreToDotBg(alert.risk_score)}`} />
                        {alert.risk_score} • {risk.text}
                      </button>
                    </td>

                    {/* 6. Dex Terminal dual options */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={`https://dexscreener.com/solana/${alert.token_mint}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="DexScreener Link"
                          className="w-8 h-8 bg-surface border border-border rounded-lg flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-all shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://jup.ag/swap/SOL-${alert.token_mint}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Jupiter Swap Link"
                          className="w-8 h-8 bg-surface border border-border rounded-lg flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-success transition-all shadow-sm"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ---------------- AUTOMATED CONTRACT AUDITING MODAL ---------------- */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                  AUTOMATED CONTRACT AUDITING
                </span>
                <h3 className="text-lg font-bold text-text-primary mt-1">
                  {selectedAlert.token_symbol} Safety Analysis
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col gap-6">
              
              {/* Dynamic Safety Index Card */}
              <div className="bg-surface-secondary border border-border rounded-lg p-5 flex items-center gap-5">
                {/* Circular Gauge SVG */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Ring background */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="var(--color-surface-tertiary)"
                      strokeWidth="3"
                    />
                    {/* Segment representing safety score */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke={scoreToStrokeColor(selectedAlert.risk_score)}
                      strokeWidth="3"
                      strokeDasharray={`${100 - selectedAlert.risk_score} ${selectedAlert.risk_score}`}
                      strokeDashoffset="0"
                    />
                  </svg>
                  {/* Gauge Text */}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-base font-bold text-text-primary leading-tight">
                      {100 - selectedAlert.risk_score}
                    </span>
                  </div>
                  {/* Score Alert Badge */}
                  <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 w-4 h-4 rounded-full bg-error border border-white flex items-center justify-center text-white shrink-0">
                    <ShieldAlert className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                    Dynamic Safety Index
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    {getAuditText(selectedAlert.risk_score)}
                  </p>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="flex flex-col gap-3">
                
                {/* Item 1: Liquidity Pool Locked */}
                <div className="flex items-center justify-between p-3 border border-border-light rounded-lg bg-surface hover:bg-surface-secondary transition-colors">
                  <div className="flex items-center gap-2.5">
                    {selectedAlert.risk_score <= 70 ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-error" />
                    )}
                    <span className="text-xs font-semibold text-text-primary">Liquidity Pool Locked</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedAlert.risk_score <= 30
                      ? "bg-success-lightest text-success-foreground"
                      : selectedAlert.risk_score <= 70
                      ? "bg-surface-secondary text-warning"
                      : "bg-error-light text-error-foreground"
                  }`}>
                    {selectedAlert.risk_score <= 30 
                      ? "LOCKED / SECURE" 
                      : selectedAlert.risk_score <= 70 
                      ? "PARTIAL LOCK" 
                      : "UNLOCKED / RISK"}
                  </span>
                </div>

                {/* Item 2: Developer Mint Authority */}
                <div className="flex items-center justify-between p-3 border border-border-light rounded-lg bg-surface hover:bg-surface-secondary transition-colors">
                  <div className="flex items-center gap-2.5">
                    {selectedAlert.risk_score <= 70 ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-error" />
                    )}
                    <span className="text-xs font-semibold text-text-primary">Developer Mint Authority Disabled</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedAlert.risk_score <= 70
                      ? "bg-success-lightest text-success-foreground"
                      : "bg-error-light text-error-foreground"
                  }`}>
                    {selectedAlert.risk_score <= 70 ? "RENNOUNCED" : "ACTIVE / DANGER"}
                  </span>
                </div>

                {/* Item 3: Top 10 Holder Distribution Block */}
                <div className="flex items-center justify-between p-3 border border-border-light rounded-lg bg-surface hover:bg-surface-secondary transition-colors">
                  <div className="flex items-center gap-2.5">
                    {selectedAlert.risk_score <= 30 ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                    <span className="text-xs font-semibold text-text-primary">Top 10 Holder Distribution Block</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedAlert.risk_score <= 30
                      ? "bg-success-lightest text-success-foreground"
                      : selectedAlert.risk_score <= 70
                      ? "bg-surface-secondary text-warning"
                      : "bg-error-light text-error-foreground"
                  }`}>
                    {selectedAlert.risk_score <= 30 
                      ? "DECENTRALIZED" 
                      : selectedAlert.risk_score <= 70 
                      ? "CONCENTRATED" 
                      : "HIGHLY CONCENTRATED"}
                  </span>
                </div>

                {/* Item 4: Anti-Honeypot Gas Limit Check */}
                <div className="flex items-center justify-between p-3 border border-border-light rounded-lg bg-surface hover:bg-surface-secondary transition-colors">
                  <div className="flex items-center gap-2.5">
                    {selectedAlert.risk_score <= 70 ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-error" />
                    )}
                    <span className="text-xs font-semibold text-text-primary">Anti-Honeypot Gas Limit Check</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedAlert.risk_score <= 70
                      ? "bg-success-lightest text-success-foreground"
                      : "bg-error-light text-error-foreground"
                  }`}>
                    {selectedAlert.risk_score <= 70 ? "PASSED / 0% TAX" : "WARNING / RISK"}
                  </span>
                </div>

              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => {
                    handleAddWatchlist(selectedAlert.wallet_address, selectedAlert.wallet_label);
                    setSelectedAlert(null);
                  }}
                  className="flex-1 bg-primary text-primary-foreground hover:opacity-90 font-bold text-sm py-3 px-4 rounded-lg shadow-sm transition-all text-center"
                >
                  Add Creator Wallet to Watchlist
                </button>
                <a
                  href={`https://dexscreener.com/solana/${selectedAlert.token_mint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-surface-secondary border border-border rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all shadow-sm shrink-0"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Helpers for modal colors and ratings
function scoreToStrokeColor(score: number) {
  if (score <= 30) return "var(--color-success)"; // Locked/High Safety -> Green
  if (score <= 70) return "var(--color-warning)"; // Medium Safety -> Orange
  return "var(--color-error)"; // Low Safety -> Red
}

function scoreToDotBg(score: number) {
  if (score <= 30) return "bg-success";
  if (score <= 70) return "bg-warning";
  return "bg-error";
}

function getAuditText(score: number) {
  if (score <= 30) {
    return "Safe transaction profile. Liquidity pool is locked, mint authority is renounced, and token distribution is decentralized.";
  }
  if (score <= 70) {
    return "Medium risk parameters detected. Mint authority is disabled, but liquidity lock is partial and top holders own a concentrated share.";
  }
  return "Dangerous honeypot warnings. Developer can mint custom supply, and liquidity pools are fully unlocked!";
}

"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, TrendingUp, Sliders, Shield, Zap, Search } from "lucide-react";

type MockAlert = {
  id: string;
  walletAlias: string;
  walletAddress: string;
  tokenName: string;
  tokenSymbol: string;
  type: "BUY" | "SELL";
  amountUsd: number;
  riskScore: number;
  timeAgo: string;
};

const INITIAL_ALERTS: MockAlert[] = [
  {
    id: "1",
    walletAlias: "Smart Whale #04",
    walletAddress: "Hw2s...98xK",
    tokenName: "Dogwifhat",
    tokenSymbol: "WIF",
    type: "BUY",
    amountUsd: 18450,
    riskScore: 24,
    timeAgo: "Just now",
  },
  {
    id: "2",
    walletAlias: "Sniper Alpha",
    walletAddress: "7dfX...eR2t",
    tokenName: "Popcat",
    tokenSymbol: "POPCAT",
    type: "BUY",
    amountUsd: 9200,
    riskScore: 48,
    timeAgo: "2m ago",
  },
  {
    id: "3",
    walletAlias: "Insane Win-Rate",
    walletAddress: "Ag91...qP8w",
    tokenName: "Bonk",
    tokenSymbol: "BONK",
    type: "SELL",
    amountUsd: 14100,
    riskScore: 18,
    timeAgo: "5m ago",
  },
];

const NEW_ALERTS: MockAlert[] = [
  {
    id: "4",
    walletAlias: "Raydium Frontrunner",
    walletAddress: "Dx51...wE4q",
    tokenName: "Cat in a Dogs World",
    tokenSymbol: "MEW",
    type: "BUY",
    amountUsd: 22100,
    riskScore: 32,
    timeAgo: "Just now",
  },
  {
    id: "5",
    walletAlias: "Smart Whale #04",
    walletAddress: "Hw2s...98xK",
    tokenName: "Mother Iggy",
    tokenSymbol: "MOTHER",
    type: "SELL",
    amountUsd: 8700,
    riskScore: 54,
    timeAgo: "Just now",
  },
  {
    id: "6",
    walletAlias: "Meme Collector",
    walletAddress: "8fKw...6yUt",
    tokenName: "Book of Meme",
    tokenSymbol: "BOME",
    type: "BUY",
    amountUsd: 11500,
    riskScore: 78,
    timeAgo: "Just now",
  },
];

export function DashboardPreview() {
  const [alerts, setAlerts] = useState<MockAlert[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<"feed" | "filters">("feed");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setAlerts((prev) => {
        const nextAlert = {
          ...NEW_ALERTS[index % NEW_ALERTS.length],
          id: Date.now().toString(),
        };
        index++;
        
        // Update timeAgo for previous alerts
        const updatedPrev = prev.map((a, i) => ({
          ...a,
          timeAgo: i === 0 ? "1m ago" : i === 1 ? "4m ago" : "8m ago",
        }));

        // Keep last 4 alerts
        return [nextAlert, ...updatedPrev].slice(0, 4);
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-surface border border-border rounded-xl shadow-xl overflow-hidden flex flex-col md:grid md:grid-cols-12 min-h-[500px]">
      {/* Sidebar Navigation Mockup */}
      <div className="col-span-3 border-r border-border bg-surface-secondary p-6 flex flex-col justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-bold text-text-secondary tracking-wider uppercase">
              Live Monitoring
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("feed")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all text-left ${
                activeTab === "feed"
                  ? "bg-surface border border-border text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Zap className="w-4 h-4 text-success" />
              <span>Live Alert Feed</span>
            </button>

            <button
              onClick={() => setActiveTab("filters")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all text-left ${
                activeTab === "filters"
                  ? "bg-surface border border-border text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Sliders className="w-4 h-4 text-info" />
              <span>Custom Filters</span>
            </button>
          </div>
        </div>

        {/* Small stats summary */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col gap-4 text-xs font-semibold text-text-secondary">
          <div className="flex justify-between items-center">
            <span>Webhook Status</span>
            <span className="text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Active
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>API Latency</span>
            <span className="text-text-primary font-bold">82ms</span>
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="col-span-9 p-8 flex flex-col gap-6 bg-surface">
        {activeTab === "feed" ? (
          <div className="flex flex-col gap-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h4 className="text-base font-bold text-text-primary">Live Signal Ingestion</h4>
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  Swaps executed by tracked wallets stream below in real time.
                </p>
              </div>
              <div className="relative w-48 hidden sm:block">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  disabled
                  placeholder="Search token..."
                  className="w-full pl-9 pr-3 py-1 text-xs border border-border rounded-md bg-surface-secondary outline-none"
                />
              </div>
            </div>

            {/* Table Mockup */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="pb-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Wallet</th>
                    <th className="pb-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Token</th>
                    <th className="pb-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Type</th>
                    <th className="pb-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Size (USD)</th>
                    <th className="pb-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Risk Score</th>
                    <th className="pb-3 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light text-sm font-medium">
                  {alerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="hover:bg-surface-secondary transition-all duration-300 animate-slide-down"
                    >
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-text-primary text-sm font-bold">{alert.walletAlias}</span>
                          <span className="text-xs text-text-muted">{alert.walletAddress}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-text-primary text-sm font-bold">{alert.tokenSymbol}</span>
                          <span className="text-xs text-text-muted">{alert.tokenName}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            alert.type === "BUY"
                              ? "bg-success-lightest text-success-foreground"
                              : "bg-error-light text-error-foreground"
                          }`}
                        >
                          {alert.type}
                        </span>
                      </td>
                      <td className="py-4 text-text-primary font-bold">
                        ${alert.amountUsd.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              alert.riskScore <= 30
                                ? "bg-success"
                                : alert.riskScore <= 70
                                ? "bg-warning"
                                : "bg-error"
                            }`}
                          />
                          <span
                            className={`font-bold ${
                              alert.riskScore <= 30
                                ? "text-success"
                                : alert.riskScore <= 70
                                ? "text-warning"
                                : "text-error"
                            }`}
                          >
                            {alert.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-xs text-text-muted">{alert.timeAgo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h4 className="text-base font-bold text-text-primary">Alert Parameters Settings</h4>
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  Fine-tune what triggers a Telegram DM alert. Adjust sliders to match your strategy.
                </p>
              </div>
            </div>

            {/* Filters Form Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Min Token Liquidity
                    </label>
                    <span className="text-sm font-extrabold text-text-primary">$20,000</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    defaultValue="2000"
                    disabled
                    className="w-full accent-primary h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-text-muted font-medium">
                    Filter out tokens with extremely shallow pools (prevents slippage traps).
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Min Swap Size (USD)
                    </label>
                    <span className="text-sm font-extrabold text-text-primary">$5,000</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    defaultValue="5000"
                    disabled
                    className="w-full accent-primary h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-text-muted font-medium">
                    Only alert when whales buy/sell meaningful chunks of supply.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Max Allowed Risk Score
                    </label>
                    <span className="text-sm font-extrabold text-warning">65 / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="65"
                    disabled
                    className="w-full accent-warning h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-text-muted font-medium">
                    Bypasses alerts for contracts with high developer holdings or unlock warnings.
                  </span>
                </div>

                {/* Mock Telegram Bot Card */}
                <div className="border border-border rounded-xl p-4 bg-surface-secondary flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-info-light border border-info flex items-center justify-center text-info shrink-0">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-text-primary">Telegram Status</span>
                    <p className="text-[10px] text-text-secondary font-medium leading-relaxed">
                      Linked to Chat ID <strong className="text-text-primary">@alpha_tracker_bot</strong>. Alerts are dispatched to your Telegram DM within milliseconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

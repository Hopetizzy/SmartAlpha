"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Loader2, Award, ExternalLink } from "lucide-react";
import { fetchTargetWallets, TargetWallet } from "@/app/dashboard/actions";

interface WalletLeaderboardProps {
  isModal?: boolean;
}

export function WalletLeaderboard({ isModal = false }: WalletLeaderboardProps) {
  const [wallets, setWallets] = useState<TargetWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWallets = async () => {
    setLoading(true);
    const result = await fetchTargetWallets();
    if (result.error) {
      setError(result.error);
    } else {
      setWallets(result.data);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const formatAddress = (addr: string) => {
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Base CSS classes based on rendering mode (modal vs card inline)
  const containerClasses = isModal 
    ? "flex flex-col w-full bg-transparent" 
    : "bg-surface border border-border rounded-lg shadow-sm overflow-hidden flex flex-col w-full";

  return (
    <div className={containerClasses}>
      {/* Card Header (only shown if NOT inside a modal) */}
      {!isModal && (
        <div className="p-6 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-info" />
            Smart Money Leaderboard
          </h2>
          <p className="text-xs text-text-muted mt-1 font-medium">
            Top-performing smart wallets monitored by the platform (7d stats).
          </p>
        </div>
      )}

      {/* Card Body / Table */}
      <div className="overflow-x-auto min-h-[220px] flex flex-col justify-between">
        {loading ? (
          <div className="flex-grow flex flex-col items-center justify-center p-12 gap-2 text-text-secondary">
            <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
            <span className="text-xs font-semibold">Loading leaderboard data...</span>
          </div>
        ) : error ? (
          <div className="flex-grow flex flex-col items-center justify-center p-12 gap-2 text-text-secondary">
            <span className="text-sm font-bold text-error">Error: {error}</span>
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center gap-2">
            <div className="w-9 h-9 rounded-full bg-surface-tertiary flex items-center justify-center text-text-muted">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary">No target wallets found</p>
              <p className="text-[10px] text-text-muted max-w-[200px] mx-auto mt-0.5">
                Seed wallets by clicking "Seed Demo Data" in the alert feed panel.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Wallet Alias</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">On-chain Address</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center font-bold">Win Rate</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">7d Profit/Loss</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light text-sm font-medium">
              {wallets.map((wallet, index) => {
                const winRateVal = Number(wallet.win_rate) || 0;
                const pnlVal = Number(wallet.profit_loss_7d) || 0;
                const isPositive = pnlVal > 0;
                const isNegative = pnlVal < 0;

                return (
                  <tr
                    key={wallet.address}
                    className="hover:bg-surface-secondary transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        {/* Rank badge */}
                        <span className="text-xs text-text-muted font-bold w-4 text-center shrink-0">
                          #{index + 1}
                        </span>
                        <span className="text-text-primary text-sm font-semibold leading-5">
                          {wallet.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-secondary">
                      {wallet.address}
                    </td>
                    <td className="px-6 py-4 text-center text-text-primary font-bold text-sm">
                      {winRateVal.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-sm text-xs font-bold ${
                          isPositive
                            ? "bg-success-lightest text-success-foreground"
                            : isNegative
                            ? "bg-error-light text-error-foreground"
                            : "bg-surface-tertiary text-text-muted"
                        }`}
                      >
                        {isPositive ? `+${pnlVal.toFixed(1)}` : pnlVal.toFixed(1)} SOL
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={`https://solscan.io/account/${wallet.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-7 h-7 rounded border border-border hover:bg-surface-tertiary text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

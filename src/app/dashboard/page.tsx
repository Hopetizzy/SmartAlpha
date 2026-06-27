import { redirect } from "next/navigation";

import { getCurrentViewer, syncUserPremiumStatus } from "@/lib/auth-state";
import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";
import { SiteShell } from "@/components/site-shell";
import { LiveAlertFeed } from "@/components/live-alert-feed";

export default async function DashboardPage() {
  const viewer = await getCurrentViewer();

  if (!viewer.isAuthenticated || !viewer.id) {
    redirect("/auth/sign-in");
  }

  // Sync premium status programmatically from Stripe views
  await syncUserPremiumStatus(viewer.id);

  const accessToken = await getAccessToken();
  const insforge = createInsforgeServerClient({ accessToken: accessToken ?? undefined });

  // 1. Fetch user details from public.users
  const { data: dbUser, error: userError } = await insforge.database
    .from("users")
    .select("*")
    .eq("id", viewer.id)
    .maybeSingle();

  if (userError) {
    console.error("[dashboard] Error fetching db user:", userError);
  }

  const isPremium = dbUser?.is_premium ?? false;
  const hasTelegram = !!dbUser?.telegram_chat_id;
  const telegramChatId = dbUser?.telegram_chat_id || "";

  // 2. Fetch some mock statistics for the charts/bars
  const { count: totalAlertsCount } = await insforge.database
    .from("alerts")
    .select("*", { count: "exact", head: true });

  const { data: targetWallets } = await insforge.database
    .from("target_wallets")
    .select("label, win_rate")
    .limit(3);

  // Compute mock ratio of BUY vs SELL signals
  // Default to 65% BUY and 35% SELL if no alerts are in DB
  let buyPercent = 65;
  let sellPercent = 35;

  const { count: buyAlertsCount } = await insforge.database
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("type", "BUY");

  if (totalAlertsCount && buyAlertsCount) {
    buyPercent = Math.round((buyAlertsCount / totalAlertsCount) * 100);
    sellPercent = 100 - buyPercent;
  }

  // Format date like "MONDAY, MARCH 24"
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase();

  const userDisplayName = viewer.name || viewer.email?.split("@")[0] || "Trader";

  return (
    <SiteShell>
      <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* ROW 1: Visual Breakdowns Grid (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* Card 1: Signal Distribution (Donut style) */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col gap-4 h-[220px]">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Signal Distribution
            </h4>
            
            <div className="flex-grow flex items-center gap-6">
              {/* SVG Circular Donut Chart */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="var(--color-surface-tertiary)"
                    strokeWidth="3.2"
                  />
                  {/* Segment 1: BUYs (Success Green) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth="3.2"
                    strokeDasharray={`${buyPercent} ${100 - buyPercent}`}
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: SELLs (Error Red) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="var(--color-error)"
                    strokeWidth="3.2"
                    strokeDasharray={`${sellPercent} ${100 - sellPercent}`}
                    strokeDashoffset={`-${buyPercent}`}
                  />
                </svg>
                {/* Centered Percentage */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-bold text-text-primary">{buyPercent}%</span>
                  <span className="text-[8px] font-bold text-text-muted uppercase">BUYs</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2.5 text-xs font-medium text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
                  <div>
                    <span className="text-text-primary font-bold">{buyPercent}%</span> BUY Action
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-error inline-block" />
                  <div>
                    <span className="text-text-primary font-bold">{sellPercent}%</span> SELL Action
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Wallet win rates progress list */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col gap-4 h-[220px]">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Target Wallet Win Rates
            </h4>
            
            <div className="flex-grow flex flex-col justify-center gap-4">
              {targetWallets && targetWallets.length > 0 ? (
                targetWallets.map((wallet) => (
                  <div key={wallet.label} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-text-primary">{wallet.label}</span>
                      <span className="text-text-secondary">{Number(wallet.win_rate).toFixed(1)}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-surface-tertiary h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-info h-full rounded-full transition-all duration-500"
                        style={{ width: `${wallet.win_rate}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-text-muted py-6">
                  No active target wallets tracked.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Main Signals Feed (Full Width) */}
        <div className="w-full">
          <LiveAlertFeed isPremium={isPremium} />
        </div>
        
      </div>
    </SiteShell>
  );
}

import { redirect } from "next/navigation";

import { getCurrentViewer, syncUserPremiumStatus } from "@/lib/auth-state";
import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";
import { SiteShell } from "@/components/site-shell";
import { SettingsContent } from "./settings-content";
import { fetchSettings, fetchWatchlist, fetchTransactions } from "./actions";

export const metadata = {
  title: "Settings | SmartAlpha - On-Chain Whale Alerts",
  description: "Configure your live on-chain smart money alerts thresholds and manage custom Solana wallet watchlists.",
};

export default async function SettingsPage() {
  const viewer = await getCurrentViewer();

  if (!viewer.isAuthenticated || !viewer.id) {
    redirect("/auth/sign-in");
  }

  // 1. Sync premium status programmatically
  await syncUserPremiumStatus(viewer.id);

  const accessToken = await getAccessToken();
  const insforge = createInsforgeServerClient({ accessToken: accessToken ?? undefined });

  // 2. Fetch user record for premium/Telegram info
  const { data: dbUser, error: userError } = await insforge.database
    .from("users")
    .select("*")
    .eq("id", viewer.id)
    .maybeSingle();

  if (userError) {
    console.error("[settings] Error fetching db user:", userError);
  }

  const isPremium = dbUser?.is_premium ?? false;
  const telegramChatId = dbUser?.telegram_chat_id || "";
  const stripeCustomerId = dbUser?.stripe_customer_id || null;
  const createdAt = dbUser?.created_at || new Date().toISOString();
  const userEmail = dbUser?.email || viewer.email || "";

  // 2. Fetch current settings, watchlist, and transactions
  const settingsRes = await fetchSettings();
  const watchlistRes = await fetchWatchlist();
  const transactionsRes = await fetchTransactions();

  const userDisplayName = viewer.name || viewer.email?.split("@")[0] || "Trader";

  return (
    <SiteShell>
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6">
        
        {/* Header Title */}
        <div className="border-b border-border pb-6 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-text-primary uppercase tracking-tight">Profile & Preferences</h2>
          <p className="text-xs text-text-secondary font-medium">
            Fine-tune custom alert strategies and manage on-chain targets tracking.
          </p>
        </div>

        {/* Content Container */}
        <SettingsContent
          initialSettings={settingsRes.data || { min_liquidity: 0, min_volume: 0, max_risk_score: 100 }}
          initialWatchlist={watchlistRes.data || []}
          isPremium={isPremium}
          telegramChatId={telegramChatId}
          userDisplayName={userDisplayName}
          userEmail={userEmail}
          userId={viewer.id}
          createdAt={createdAt}
          stripeCustomerId={stripeCustomerId}
          initialTransactions={transactionsRes.data || []}
        />
        
      </div>
    </SiteShell>
  );
}

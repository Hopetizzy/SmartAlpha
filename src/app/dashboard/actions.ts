"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";
import { getCurrentUserDetails } from "@/lib/auth-state";

async function getAuthenticatedClient() {
  const accessToken = await getAccessToken();
  return createInsforgeServerClient({ accessToken: accessToken ?? undefined });
}

export type AlertWithLabel = {
  id: string;
  wallet_address: string;
  wallet_label: string;
  token_mint: string;
  token_symbol: string;
  type: string;
  amount_usd: number;
  risk_score: number;
  timestamp: string;
};

export async function fetchAlerts(searchQuery?: string): Promise<{ data: AlertWithLabel[]; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) {
      return { data: [], error: "Unauthorized" };
    }

    const insforge = await getAuthenticatedClient();

    // 1. Fetch alerts
    let query = insforge.database
      .from("alerts")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(50);

    if (searchQuery?.trim()) {
      query = query.ilike("token_symbol", `%${searchQuery.trim()}%`);
    }

    const { data: alerts, error: alertsError } = await query;

    if (alertsError) {
      console.error("[dashboard/actions] Error fetching alerts:", alertsError);
      return { data: [], error: alertsError.message };
    }

    if (!alerts || alerts.length === 0) {
      return { data: [] };
    }

    // 2. Fetch labels from target_wallets
    const { data: targetWallets, error: targetError } = await insforge.database
      .from("target_wallets")
      .select("address, label");

    // 3. Fetch labels from user's watchlist
    const { data: watchlist, error: watchError } = await insforge.database
      .from("watchlists")
      .select("wallet_address, label")
      .eq("user_id", user.id);

    // 4. Create mapping dictionary
    const labelMap: Record<string, string> = {};

    if (!targetError && targetWallets) {
      targetWallets.forEach((w) => {
        labelMap[w.address] = w.label;
      });
    }

    if (!watchError && watchlist) {
      watchlist.forEach((w) => {
        labelMap[w.wallet_address] = w.label; // Watchlist custom label overrides platform label if same
      });
    }

    // 5. Map labels
    const mappedAlerts: AlertWithLabel[] = alerts.map((alert: any) => {
      const label = labelMap[alert.wallet_address] || "Tracked Wallet";
      return {
        id: alert.id,
        wallet_address: alert.wallet_address,
        wallet_label: label,
        token_mint: alert.token_mint,
        token_symbol: alert.token_symbol,
        type: alert.type,
        amount_usd: Number(alert.amount_usd) || 0,
        risk_score: Number(alert.risk_score) || 0,
        timestamp: alert.timestamp,
      };
    });

    return { data: mappedAlerts };
  } catch (err: any) {
    console.error("[dashboard/actions] fetchAlerts failure:", err);
    return { data: [], error: err.message || "Unknown error" };
  }
}

export type TargetWallet = {
  address: string;
  label: string;
  win_rate: number;
  profit_loss_7d: number;
};

export async function fetchTargetWallets(): Promise<{ data: TargetWallet[]; error?: string }> {
  try {
    const insforge = await getAuthenticatedClient();

    let { data: wallets, error } = await insforge.database
      .from("target_wallets")
      .select("*")
      .order("profit_loss_7d", { ascending: false });

    if (error) {
      console.error("[dashboard/actions] Error fetching target wallets:", error);
      return { data: [], error: error.message };
    }

    if (!wallets || wallets.length === 0) {
      await seedTargetWallets();
      const { data: refetched, error: refetchError } = await insforge.database
        .from("target_wallets")
        .select("*")
        .order("profit_loss_7d", { ascending: false });
      
      if (!refetchError && refetched) {
        wallets = refetched;
      }
    }

    return { data: (wallets as TargetWallet[]) || [] };
  } catch (err: any) {
    console.error("[dashboard/actions] fetchTargetWallets failure:", err);
    return { data: [], error: err.message || "Unknown error" };
  }
}

export async function seedTargetWallets() {
  try {
    const insforge = await getAuthenticatedClient();

    // Check if already populated
    const { data: existing } = await insforge.database
      .from("target_wallets")
      .select("address")
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: true, message: "Target wallets already seeded" };
    }

    const walletsToInsert = [
      {
        address: "Hw2sX7Gsz98xK9Z3p4R5qW6eT7yU8i9oOpQ",
        label: "Smart Whale #04",
        win_rate: 72.5,
        profit_loss_7d: 184.5,
      },
      {
        address: "7dfXeR2t98xK9Z3p4R5qW6eT7yU8i9oOpQ",
        label: "Sniper Alpha",
        win_rate: 84.2,
        profit_loss_7d: 92.0,
      },
      {
        address: "Ag91qP8w98xK9Z3p4R5qW6eT7yU8i9oOpQ",
        label: "Insane Win-Rate",
        win_rate: 91.0,
        profit_loss_7d: 141.0,
      },
    ];

    const { error } = await insforge.database
      .from("target_wallets")
      .insert(walletsToInsert);

    if (error) {
      console.error("[dashboard/actions] Error seeding wallets:", error);
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[dashboard/actions] seedTargetWallets failure:", err);
    return { error: err.message || "Unknown error" };
  }
}

export async function generateMockAlerts() {
  try {
    const insforge = await getAuthenticatedClient();

    // Make sure we have wallets seeded first
    await seedTargetWallets();

    const mockAlerts = [
      {
        wallet_address: "Hw2sX7Gsz98xK9Z3p4R5qW6eT7yU8i9oOpQ",
        token_mint: "So11111111111111111111111111111111111111112",
        token_symbol: "SOL",
        type: "BUY",
        amount_usd: 18450,
        risk_score: 24,
        timestamp: new Date().toISOString(),
      },
      {
        wallet_address: "7dfXeR2t98xK9Z3p4R5qW6eT7yU8i9oOpQ",
        token_mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        token_symbol: "USDC",
        type: "SELL",
        amount_usd: 9200,
        risk_score: 48,
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
      {
        wallet_address: "Ag91qP8w98xK9Z3p4R5qW6eT7yU8i9oOpQ",
        token_mint: "DezXAZ8z7PnrnRJjz3wX4mTyUN25SJ61VjJUM6W8xPzK",
        token_symbol: "BONK",
        type: "BUY",
        amount_usd: 14100,
        risk_score: 18,
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
    ];

    const { error } = await insforge.database
      .from("alerts")
      .insert(mockAlerts);

    if (error) {
      console.error("[dashboard/actions] Error generating mock alerts:", error);
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[dashboard/actions] generateMockAlerts failure:", err);
    return { error: err.message || "Unknown error" };
  }
}

export async function addToWatchlist(address: string, label: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const insforge = await getAuthenticatedClient();

    // Check if already exists in watchlist to prevent duplicates
    const { data: existing, error: checkError } = await insforge.database
      .from("watchlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("wallet_address", address)
      .maybeSingle();

    if (checkError) {
      console.error("[dashboard/actions] Error checking watchlist existence:", checkError);
      return { error: checkError.message };
    }

    if (existing) {
      return { error: "Wallet is already in your watchlist" };
    }

    // Insert into watchlist
    const { error: insertError } = await insforge.database
      .from("watchlists")
      .insert([
        {
          user_id: user.id,
          wallet_address: address,
          label: label,
        },
      ]);

    if (insertError) {
      console.error("[dashboard/actions] Error inserting into watchlist:", insertError);
      return { error: insertError.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[dashboard/actions] addToWatchlist failure:", err);
    return { error: err.message || "Unknown error" };
  }
}

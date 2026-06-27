"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";
import { getCurrentUserDetails } from "@/lib/auth-state";

async function getAuthenticatedClient() {
  const accessToken = await getAccessToken();
  return createInsforgeServerClient({ accessToken: accessToken ?? undefined });
}

export type AlertSettings = {
  min_liquidity: number;
  min_volume: number;
  max_risk_score: number;
};

export async function fetchSettings(): Promise<{ data: AlertSettings | null; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { data: null, error: "Unauthorized" };

    const insforge = await getAuthenticatedClient();

    let { data: settings, error } = await insforge.database
      .from("alert_settings")
      .select("min_liquidity, min_volume, max_risk_score")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[settings/actions] Error fetching settings:", error);
      return { data: null, error: error.message };
    }

    // Fallback seed if settings doesn't exist yet
    let finalSettings = settings;
    if (!finalSettings) {
      const { data: newSettings, error: insertError } = await insforge.database
        .from("alert_settings")
        .insert([
          {
            user_id: user.id,
            min_liquidity: 0,
            min_volume: 0,
            max_risk_score: 100,
          },
        ])
        .select("min_liquidity, min_volume, max_risk_score")
        .maybeSingle();

      if (insertError) {
        console.error("[settings/actions] Error seeding settings:", insertError);
        return { data: null, error: insertError.message };
      }
      finalSettings = newSettings;
    }

    if (!finalSettings) {
      return { data: null, error: "Failed to initialize settings" };
    }

    return {
      data: {
        min_liquidity: Number(finalSettings.min_liquidity),
        min_volume: Number(finalSettings.min_volume),
        max_risk_score: Number(finalSettings.max_risk_score),
      },
    };
  } catch (err: any) {
    console.error("[settings/actions] fetchSettings failure:", err);
    return { data: null, error: err.message || "Unknown error" };
  }
}

export async function updateSettings(
  minLiquidity: number,
  minVolume: number,
  maxRiskScore: number
): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { error: "Unauthorized" };

    const insforge = await getAuthenticatedClient();

    const { error } = await insforge.database
      .from("alert_settings")
      .upsert({
        user_id: user.id,
        min_liquidity: minLiquidity,
        min_volume: minVolume,
        max_risk_score: maxRiskScore,
      });

    if (error) {
      console.error("[settings/actions] Error updating settings:", error);
      return { error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[settings/actions] updateSettings failure:", err);
    return { error: err.message || "Unknown error" };
  }
}

export type WatchlistItem = {
  id: string;
  wallet_address: string;
  label: string;
  created_at: string;
};

export async function fetchWatchlist(): Promise<{ data: WatchlistItem[]; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { data: [], error: "Unauthorized" };

    const insforge = await getAuthenticatedClient();

    const { data, error } = await insforge.database
      .from("watchlists")
      .select("id, wallet_address, label, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[settings/actions] Error fetching watchlist:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (err: any) {
    console.error("[settings/actions] fetchWatchlist failure:", err);
    return { data: [], error: err.message || "Unknown error" };
  }
}

export async function addCustomWatchlist(
  address: string,
  label: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { error: "Unauthorized" };

    // Validate Solana address layout (e.g. Base58 check, 32 to 44 characters)
    const cleanAddress = address.trim();
    const cleanLabel = label.trim();

    if (!cleanAddress) {
      return { error: "Solana wallet address is required" };
    }

    if (!cleanLabel) {
      return { error: "Label is required" };
    }

    // Basic format check: Solana addresses are Base58 strings of length 32 to 44
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaRegex.test(cleanAddress)) {
      return { error: "Invalid Solana wallet address format" };
    }

    const insforge = await getAuthenticatedClient();

    // Check if already in watchlist
    const { data: existing, error: checkError } = await insforge.database
      .from("watchlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("wallet_address", cleanAddress)
      .maybeSingle();

    if (checkError) {
      console.error("[settings/actions] Error checking watchlist existence:", checkError);
      return { error: checkError.message };
    }

    if (existing) {
      return { error: "Wallet is already in your watchlist" };
    }

    // Insert into database
    const { error: insertError } = await insforge.database
      .from("watchlists")
      .insert([
        {
          user_id: user.id,
          wallet_address: cleanAddress,
          label: cleanLabel,
        },
      ]);

    if (insertError) {
      console.error("[settings/actions] Error adding to watchlist:", insertError);
      return { error: insertError.message };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[settings/actions] addCustomWatchlist failure:", err);
    return { error: err.message || "Unknown error" };
  }
}

export async function removeFromWatchlist(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { error: "Unauthorized" };

    const insforge = await getAuthenticatedClient();

    const { error } = await insforge.database
      .from("watchlists")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[settings/actions] Error removing from watchlist:", error);
      return { error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[settings/actions] removeFromWatchlist failure:", err);
    return { error: err.message || "Unknown error" };
  }
}

export async function generateTelegramLink(): Promise<{ link?: string; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { error: "Unauthorized" };

    const insforge = await getAuthenticatedClient();

    // Verify user has premium subscription
    const { data: dbUser, error: fetchUserError } = await insforge.database
      .from("users")
      .select("is_premium")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchUserError || !dbUser?.is_premium) {
      return { error: "Telegram alerts require an active Premium subscription." };
    }

    // Generate random token
    const connectToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Save token to users table
    const { error } = await insforge.database
      .from("users")
      .update({
        telegram_connect_token: connectToken,
      })
      .eq("id", user.id);

    if (error) {
      console.error("[settings/actions] Error generating connect token:", error);
      return { error: error.message };
    }

    const botUsername = "SmartAlpha_Trading_Bot";
    const telegramLink = `https://t.me/${botUsername}?start=${connectToken}`;

    return { link: telegramLink };
  } catch (err: any) {
    console.error("[settings/actions] generateTelegramLink failure:", err);
    return { error: err.message || "Unknown error" };
  }
}

export async function disconnectTelegram(): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { error: "Unauthorized" };

    const insforge = await getAuthenticatedClient();

    const { error } = await insforge.database
      .from("users")
      .update({
        telegram_chat_id: null,
        telegram_connect_token: null,
      })
      .eq("id", user.id);

    if (error) {
      console.error("[settings/actions] Error disconnecting Telegram:", error);
      return { error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[settings/actions] disconnectTelegram failure:", err);
    return { error: err.message || "Unknown error" };
  }
}

export async function createStripeCheckoutSession(): Promise<{ url?: string; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { error: "Unauthorized" };

    const insforge = await getAuthenticatedClient();

    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") || host.startsWith("192.168.") || host.startsWith("10.") ? "http" : "https";
    const appUrl = `${protocol}://${host}`;
    
    const successUrl = `${appUrl}/settings?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/settings`;

    const priceId = "price_1TmjiQFzoBpJWuBGvEJMiBqN"; // InsForge test $9/month price ID

    const { data, error } = await insforge.payments.stripe.createCheckoutSession("test", {
      mode: "subscription",
      lineItems: [{ priceId, quantity: 1 }],
      successUrl,
      cancelUrl,
      subject: {
        type: "users",
        id: user.id,
      },
    });

    if (error) {
      console.error("[settings/actions] Stripe checkout error:", error);
      return { error: error.message };
    }

    if (!data?.checkoutSession?.url) {
      return { error: "Failed to generate checkout session URL" };
    }

    return { url: data.checkoutSession.url };
  } catch (err: any) {
    console.error("[settings/actions] createStripeCheckoutSession failure:", err);
    return { error: err.message || "Unknown error" };
  }
}

export async function createStripeCustomerPortalSession(): Promise<{ url?: string; error?: string }> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { error: "Unauthorized" };

    const insforge = await getAuthenticatedClient();

    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") || host.startsWith("192.168.") || host.startsWith("10.") ? "http" : "https";
    const appUrl = `${protocol}://${host}`;
    
    const returnUrl = `${appUrl}/settings`;

    const { data, error } = await insforge.payments.stripe.createCustomerPortalSession("test", {
      subject: {
        type: "users",
        id: user.id,
      },
      returnUrl,
    });

    if (error) {
      console.error("[settings/actions] Stripe customer portal error:", error);
      return { error: error.message };
    }

    if (!data?.customerPortalSession?.url) {
      return { error: "Failed to generate customer portal session URL" };
    }

    return { url: data.customerPortalSession.url };
  } catch (err: any) {
    console.error("[settings/actions] createStripeCustomerPortalSession failure:", err);
    return { error: err.message || "Unknown error" };
  }
}


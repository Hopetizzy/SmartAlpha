import "server-only";

import type { UserSchema } from "@insforge/sdk";

import { getAccessToken, getRefreshToken, setAuthCookies } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";

type AuthViewer = {
  isAuthenticated: boolean;
  id: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

const VISITOR_VIEWER: AuthViewer = {
  isAuthenticated: false,
  id: null,
  email: null,
  name: null,
  avatarUrl: null,
};

export type { AuthViewer };

function mapUserToViewer(user: UserSchema | null | undefined): AuthViewer {
  if (!user) {
    return VISITOR_VIEWER;
  }

  return {
    isAuthenticated: true,
    id: user.id,
    email: user.email,
    name: user.profile?.name?.trim() || null,
    avatarUrl: user.profile?.avatar_url?.trim() || null,
  };
}

async function refreshAuthenticatedUser(refreshToken: string) {
  const insforge = createInsforgeServerClient();
  const { data, error } = await insforge.auth.refreshSession({ refreshToken });

  if (error || !data?.user || !data?.accessToken || !data?.refreshToken) {
    return null;
  }

  try {
    await setAuthCookies(data.accessToken, data.refreshToken);
  } catch (cookieError) {
    console.error("[auth-state] Failed to write cookies during refresh:", cookieError);
  }

  return data.user;
}

export async function getCurrentUserDetails(): Promise<UserSchema | null> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (accessToken) {
    const insforge = createInsforgeServerClient({ accessToken });
    const { data, error } = await insforge.auth.getCurrentUser();

    if (!error && data.user) {
      return data.user;
    }
  }

  if (refreshToken) {
    return refreshAuthenticatedUser(refreshToken);
  }

  return null;
}

export async function getCurrentViewer(): Promise<AuthViewer> {
  const user = await getCurrentUserDetails();
  return mapUserToViewer(user);
}

export async function syncUserPremiumStatus(userId: string): Promise<{ isPremium: boolean; stripeCustomerId: string | null }> {
  try {
    const insforge = createInsforgeServerClient();

    // 1. Query customer mapping to get Stripe customer ID
    const { data: mapping, error: mapError } = await insforge.database
      .from("customer_mappings_view")
      .select("provider_customer_id")
      .eq("subject_type", "users")
      .eq("subject_id", userId)
      .maybeSingle();

    if (mapError) {
      console.error("[auth-state/sync] Error fetching customer mapping:", mapError);
    }

    const stripeCustomerId = mapping?.provider_customer_id || null;

    // 2. Query subscriptions to see if there is any active/trialing
    const { data: subs, error: subError } = await insforge.database
      .from("stripe_subscriptions_view")
      .select("status")
      .eq("subject_type", "users")
      .eq("subject_id", userId);

    if (subError) {
      console.error("[auth-state/sync] Error fetching subscriptions:", subError);
    }

    const isPremium = subs?.some(
      (sub: any) => sub.status === "active" || sub.status === "trialing"
    ) ?? false;

    // 3. Update the users table
    const { error: updateError } = await insforge.database
      .from("users")
      .update({
        is_premium: isPremium,
        stripe_customer_id: stripeCustomerId,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("[auth-state/sync] Error updating users table:", updateError);
    }

    return { isPremium, stripeCustomerId };
  } catch (err) {
    console.error("[auth-state/sync] Exception during sync:", err);
    return { isPremium: false, stripeCustomerId: null };
  }
}


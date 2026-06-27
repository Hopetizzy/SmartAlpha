import { NextRequest, NextResponse } from "next/server";
import { getCurrentViewer } from "@/lib/auth-state";
import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";

export async function GET(req: NextRequest) {
  try {
    const viewer = await getCurrentViewer();
    if (!viewer.isAuthenticated || !viewer.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getAccessToken();
    const insforge = createInsforgeServerClient({ accessToken: accessToken ?? undefined });

    const { data, error } = await insforge.database
      .from("watchlists")
      .select("id, wallet_address, label, created_at")
      .eq("user_id", viewer.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/settings/watchlist-helper] Error fetching watchlist:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error("[api/settings/watchlist-helper] Failure:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}

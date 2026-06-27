import { NextRequest, NextResponse } from "next/server";

import { getInsforgeServerClient } from "@/lib/insforge";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Signature
    const secret = process.env.INSFORGE_WEBHOOK_SECRET;
    const signature =
      req.headers.get("x-insforge-signature") ||
      req.headers.get("authorization") ||
      req.headers.get("x-webhook-secret");

    if (!secret) {
      console.error("[webhooks/insforge] Missing INSFORGE_WEBHOOK_SECRET environment variable");
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    const isValid = signature === secret || signature === `Bearer ${secret}`;
    if (!isValid) {
      console.warn("[webhooks/insforge] Unauthorized webhook attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse payload
    const body = await req.json();
    console.log("[webhooks/insforge] Received webhook payload:", JSON.stringify(body));

    // Handle payload differences if they are nested in data or at root
    const userPayload = body.data?.user || body.data || body;
    const insforgeId = userPayload.id;
    const email = userPayload.email;

    if (!insforgeId || !email) {
      console.error("[webhooks/insforge] Missing id or email in payload", userPayload);
      return new NextResponse("Bad Request", { status: 400 });
    }

    const insforge = getInsforgeServerClient();

    // 3. Check if user already exists (idempotency)
    const { data: existingUser, error: checkError } = await insforge.database
      .from("users")
      .select("id")
      .eq("id", insforgeId)
      .maybeSingle();

    if (checkError) {
      console.error("[webhooks/insforge] Error checking user existence:", checkError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ success: true, message: "User already exists" });
    }

    // 4. Insert user record
    const { error: userInsertError } = await insforge.database
      .from("users")
      .insert([
        {
          id: insforgeId,
          email: email,
          is_premium: false,
          created_at: new Date().toISOString(),
        },
      ]);

    if (userInsertError) {
      console.error("[webhooks/insforge] Error inserting user record:", userInsertError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // 5. Insert default alert settings
    const { error: settingsInsertError } = await insforge.database
      .from("alert_settings")
      .insert([
        {
          user_id: insforgeId,
          min_liquidity: 0,
          min_volume: 0,
          max_risk_score: 100,
        },
      ]);

    if (settingsInsertError) {
      console.error("[webhooks/insforge] Error inserting default settings:", settingsInsertError);
      // We don't rollback the user, but we log the error
    }

    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: email,
      properties: { email, user_id: insforgeId },
    });
    posthog.capture({
      distinctId: email,
      event: "user_synced",
      properties: { email, user_id: insforgeId },
    });

    return NextResponse.json({ success: true, message: "User synced successfully" });
  } catch (error) {
    console.error("[webhooks/insforge] Webhook execution error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

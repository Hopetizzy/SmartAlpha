import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { bot } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const headerToken = req.headers.get("x-telegram-bot-api-secret-token");
    
    console.log("[webhooks/telegram] Webhook route triggered. secretToken =", secretToken, "headerToken =", headerToken);

    if (secretToken && headerToken !== secretToken) {
      console.warn("[webhooks/telegram] Unauthorized webhook secret token mismatch");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const rawBody = await req.text();
    console.log("[webhooks/telegram] Request body payload:", rawBody);

    // Recreate request with fresh stream so grammY can read it
    const freshReq = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: rawBody
    });

    const handleUpdate = webhookCallback(bot, "std/http");
    return await handleUpdate(freshReq);
  } catch (err) {
    console.error("[webhooks/telegram] Webhook route execution error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

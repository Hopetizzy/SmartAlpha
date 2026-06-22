import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getInsforgeServerClient } from "@/lib/insforge";
import { broadcastAlert } from "@/lib/telegram";

// Helper to determine risk score
function calculateRiskScore(mintAddress: string, symbol: string): number {
  const knownTokens: Record<string, number> = {
    SOL: 0,
    USDC: 0,
    USDT: 0,
    WIF: 24,
    POPCAT: 48,
    BONK: 18,
    MEW: 32,
    BOME: 45,
    MOTHER: 54,
  };
  
  const upperSymbol = symbol.toUpperCase();
  if (upperSymbol in knownTokens) {
    return knownTokens[upperSymbol];
  }

  let hash = 0;
  for (let i = 0; i < mintAddress.length; i++) {
    hash = mintAddress.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return 10 + (Math.abs(hash) % 86); // Returns 10 - 95 range
}

const QUOTE_MINTS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
};

export async function POST(req: NextRequest) {
  try {
    // 1. Verify credentials via HMAC-SHA256
    const secret = process.env.ALCHEMY_WEBHOOK_SECRET;
    const signature = req.headers.get("x-alchemy-signature");

    if (!secret) {
      console.error("[webhooks/alchemy] Missing ALCHEMY_WEBHOOK_SECRET environment variable");
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    if (!signature) {
      console.warn("[webhooks/alchemy] Missing x-alchemy-signature header");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Read raw body for signature verification
    const rawBody = await req.text();
    const hmac = createHmac("sha256", secret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest("hex");

    if (calculatedSignature !== signature) {
      console.warn("[webhooks/alchemy] Unauthorized webhook signature mismatch");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse payload
    const body = JSON.parse(rawBody);
    console.log("[webhooks/alchemy] Received webhook payload:", JSON.stringify(body));

    // Alchemy payloads contain events, usually an activity array
    const activities = body.event?.activity || [];
    const alertsToInsert: any[] = [];

    for (const act of activities) {
      // Look for SWAP activities
      if (act.type !== "SWAP" && !act.swaps) {
        continue;
      }

      const walletAddress = act.feePayer || act.fromAddress || (act.swaps?.[0]?.user);
      const swaps = act.swaps || [];

      if (!walletAddress || swaps.length === 0) {
        console.warn("[webhooks/alchemy] Skipping activity: missing wallet or swaps", act.signature);
        continue;
      }

      for (const swap of swaps) {
        const input = swap.inputToken;
        const output = swap.outputToken;

        if (!input || !output) {
          console.warn("[webhooks/alchemy] Skipping swap: missing input/output tokens", act.signature);
          continue;
        }

        // Determine BUY vs SELL
        const isInputQuote = Object.values(QUOTE_MINTS).includes(input.mint);
        const isOutputQuote = Object.values(QUOTE_MINTS).includes(output.mint);

        let type: "BUY" | "SELL" = "BUY";
        let targetMint = output.mint;
        let targetSymbol = output.symbol || "";
        let amountUsd = 0;

        if (isInputQuote && !isOutputQuote) {
          type = "BUY";
          targetMint = output.mint;
          targetSymbol = output.symbol || "";
        } else if (!isInputQuote && isOutputQuote) {
          type = "SELL";
          targetMint = input.mint;
          targetSymbol = input.symbol || "";
        } else {
          type = "BUY";
          targetMint = output.mint;
          targetSymbol = output.symbol || "";
        }

        if (!targetSymbol) {
          targetSymbol = targetMint.slice(0, 4) + "..." + targetMint.slice(-4);
        }

        // Parse token amounts (in Alchemy these are usually strings representing human-readable numbers, or bigints)
        const inputAmount = Number(input.amount) / Math.pow(10, input.decimals || 0) || Number(input.amount) || 0;
        const outputAmount = Number(output.amount) / Math.pow(10, output.decimals || 0) || Number(output.amount) || 0;

        // Determine USD Size
        if (input.mint === QUOTE_MINTS.USDC || input.mint === QUOTE_MINTS.USDT) {
          amountUsd = inputAmount;
        } else if (output.mint === QUOTE_MINTS.USDC || output.mint === QUOTE_MINTS.USDT) {
          amountUsd = outputAmount;
        } else if (input.mint === QUOTE_MINTS.SOL) {
          amountUsd = inputAmount * 150;
        } else if (output.mint === QUOTE_MINTS.SOL) {
          amountUsd = outputAmount * 150;
        } else {
          amountUsd = 1000;
        }

        const riskScore = calculateRiskScore(targetMint, targetSymbol);

        alertsToInsert.push({
          wallet_address: walletAddress,
          token_mint: targetMint,
          token_symbol: targetSymbol,
          type: type,
          amount_usd: amountUsd,
          risk_score: riskScore,
          timestamp: act.timestamp ? new Date(act.timestamp * 1000).toISOString() : new Date().toISOString(),
        });
      }
    }

    if (alertsToInsert.length > 0) {
      const insforge = getInsforgeServerClient();
      const { error } = await insforge.database
        .from("alerts")
        .insert(alertsToInsert);

      if (error) {
        console.error("[webhooks/alchemy] Error inserting alerts to database:", error);
        return NextResponse.json({ error: "Database insert error", details: error }, { status: 500 });
      }

      console.log(`[webhooks/alchemy] Successfully inserted ${alertsToInsert.length} alerts.`);
      // Broadcast alerts asynchronously to premium users
      for (const alert of alertsToInsert) {
        broadcastAlert(alert).catch((err) => {
          console.error("[webhooks/alchemy] Alert broadcast error:", err);
        });
      }
    }

    return NextResponse.json({ success: true, message: `Processed ${alertsToInsert.length} alerts` });
  } catch (error) {
    console.error("[webhooks/alchemy] Webhook execution error:", error);
    return NextResponse.json({ error: "Webhook execution error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

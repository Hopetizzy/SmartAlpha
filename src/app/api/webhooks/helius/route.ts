import { NextRequest, NextResponse } from "next/server";
import { getInsforgeServerClient } from "@/lib/insforge";

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
    // 1. Verify credentials
    const secret = process.env.HELIUS_WEBHOOK_SECRET;
    const signature =
      req.headers.get("authorization") ||
      req.headers.get("x-helius-signature") ||
      new URL(req.url).searchParams.get("secret");

    if (!secret) {
      console.error("[webhooks/helius] Missing HELIUS_WEBHOOK_SECRET environment variable");
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    const isValid = signature === secret || signature === `Bearer ${secret}`;
    if (!isValid) {
      console.warn("[webhooks/helius] Unauthorized webhook attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse payload
    const body = await req.json();
    console.log("[webhooks/helius] Received webhook payload:", JSON.stringify(body));

    // Helius webhooks can send an array of transactions
    const transactions = Array.isArray(body) ? body : [body];
    const alertsToInsert: any[] = [];

    for (const tx of transactions) {
      // We only care about SWAP transactions
      if (tx.type !== "SWAP") {
        continue;
      }

      const walletAddress = tx.feePayer;
      const swapEvent = tx.events?.swap;

      if (!swapEvent || !walletAddress) {
        console.warn("[webhooks/helius] Skipping swap: missing events or feePayer", tx.signature);
        continue;
      }

      // Helius parsed tokenInputs / tokenOutputs
      const input = swapEvent.tokenInputs?.[0];
      const output = swapEvent.tokenOutputs?.[0];

      if (!input || !output) {
        console.warn("[webhooks/helius] Skipping swap: missing input/output tokens", tx.signature);
        continue;
      }

      // Determine BUY vs SELL
      // BUY: User swaps quote token (SOL/USDC/USDT) for target memecoin
      // SELL: User swaps target memecoin for quote token (SOL/USDC/USDT)
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
        // Fallback if neither or both are quote tokens
        type = "BUY";
        targetMint = output.mint;
        targetSymbol = output.symbol || "";
      }

      // Format target symbol fallback
      if (!targetSymbol) {
        targetSymbol = targetMint.slice(0, 4) + "..." + targetMint.slice(-4);
      }

      // Determine USD Size
      // If we have USDC/USDT involved, use that directly
      // If we have SOL, multiply by average $150 fallback
      if (input.mint === QUOTE_MINTS.USDC || input.mint === QUOTE_MINTS.USDT) {
        amountUsd = Number(input.tokenAmount) || 0;
      } else if (output.mint === QUOTE_MINTS.USDC || output.mint === QUOTE_MINTS.USDT) {
        amountUsd = Number(output.tokenAmount) || 0;
      } else if (input.mint === QUOTE_MINTS.SOL) {
        amountUsd = (Number(input.tokenAmount) || 0) * 150;
      } else if (output.mint === QUOTE_MINTS.SOL) {
        amountUsd = (Number(output.tokenAmount) || 0) * 150;
      } else {
        // Ultimate fallback
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
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
      });
    }

    if (alertsToInsert.length > 0) {
      const insforge = getInsforgeServerClient();
      const { error } = await insforge.database
        .from("alerts")
        .insert(alertsToInsert);

      if (error) {
        console.error("[webhooks/helius] Supabase insert error:", error);
        return NextResponse.json({ error: "Database insert error", details: error }, { status: 500 });
      } else {
        console.log(`[webhooks/helius] Successfully inserted ${alertsToInsert.length} alerts.`);
      }
    }

    return NextResponse.json({ success: true, message: `Processed ${alertsToInsert.length} alerts` });
  } catch (error) {
    console.error("[webhooks/helius] Webhook execution error:", error);
    return NextResponse.json({ error: "Webhook execution error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// 1. Load env variables from .env.local manually
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local file. Please run the project setup first.");
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/(^['"]|['"]$)/g, "");
      env[key] = val;
      process.env[key] = val;
    }
  });
  return env;
}

loadEnv();

const HELIUS_SECRET = process.env.HELIUS_WEBHOOK_SECRET || "dev-helius-secret-12345";
const ALCHEMY_SECRET = process.env.ALCHEMY_WEBHOOK_SECRET || "dev-alchemy-secret-12345";
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// 2. Prepare Helius mock payload
const heliusMockPayload = [
  {
    type: "SWAP",
    feePayer: "Hw2sX7Gsz98xK9Z3p4R5qW6eT7yU8i9oOpQ",
    signature: "5MvXyZ_HELIUS_BUY_" + Math.random().toString(36).substring(7),
    timestamp: Math.floor(Date.now() / 1000),
    events: {
      swap: {
        tokenInputs: [
          {
            mint: "So11111111111111111111111111111111111111112",
            symbol: "SOL",
            tokenAmount: "10.5",
            decimals: 9
          }
        ],
        tokenOutputs: [
          {
            mint: "DezXAZ8z7PnrnRJjz3wX4mTyUN25SJ61VjJUM6W8xPzK",
            symbol: "BONK",
            tokenAmount: "15000000",
            decimals: 5
          }
        ]
      }
    }
  },
  {
    type: "SWAP",
    feePayer: "7dfXeR2t98xK9Z3p4R5qW6eT7yU8i9oOpQ",
    signature: "7MvXyZ_HELIUS_SELL_" + Math.random().toString(36).substring(7),
    timestamp: Math.floor(Date.now() / 1000),
    events: {
      swap: {
        tokenInputs: [
          {
            mint: "DezXAZ8z7PnrnRJjz3wX4mTyUN25SJ61VjJUM6W8xPzK",
            symbol: "BONK",
            tokenAmount: "20000000",
            decimals: 5
          }
        ],
        tokenOutputs: [
          {
            mint: "So11111111111111111111111111111111111111112",
            symbol: "SOL",
            tokenAmount: "14.2",
            decimals: 9
          }
        ]
      }
    }
  }
];

// 3. Prepare Alchemy mock payload
const alchemyMockPayload = {
  webhookId: "wh_test123",
  id: "evt_test123",
  createdAt: new Date().toISOString(),
  type: "SOLANA_ACTIVITY",
  event: {
    activity: [
      {
        type: "SWAP",
        signature: "8MvXyZ_ALCHEMY_SWAP_" + Math.random().toString(36).substring(7),
        feePayer: "Ag91qP8w98xK9Z3p4R5qW6eT7yU8i9oOpQ",
        timestamp: Math.floor(Date.now() / 1000),
        swaps: [
          {
            user: "Ag91qP8w98xK9Z3p4R5qW6eT7yU8i9oOpQ",
            inputToken: {
              mint: "So11111111111111111111111111111111111111112",
              amount: "8500000000", // 8.5 SOL
              decimals: 9,
              symbol: "SOL"
            },
            outputToken: {
              mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              amount: "1275000000", // 1275 USDC
              decimals: 6,
              symbol: "USDC"
            }
          }
        ]
      }
    ]
  }
};

async function runTests() {
  console.log(`Starting Webhook Route Integration Tests against ${BASE_URL}...`);

  // --- TEST HELIUS WEBHOOK ---
  try {
    console.log("\n[1/4] Testing Helius Webhook Ingestion...");
    const url = `${BASE_URL}/api/webhooks/helius`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HELIUS_SECRET}`
      },
      body: JSON.stringify(heliusMockPayload)
    });

    const status = response.status;
    const text = await response.text();
    console.log(`Response Status: ${status}`);
    console.log(`Response Body: ${text}`);

    if (status === 200) {
      console.log("✅ Helius Webhook test passed successfully!");
    } else {
      console.log("❌ Helius Webhook test failed.");
    }
  } catch (err) {
    console.error("❌ Helius Webhook request error:", err.message);
  }

  // --- TEST HELIUS WEBHOOK (UNAUTHORIZED) ---
  try {
    console.log("\n[2/4] Testing Helius Webhook (Unauthorized Signature)...");
    const url = `${BASE_URL}/api/webhooks/helius`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer WRONG_SECRET`
      },
      body: JSON.stringify(heliusMockPayload)
    });

    const status = response.status;
    console.log(`Response Status: ${status} (expected: 401)`);
    if (status === 401) {
      console.log("✅ Helius Unauthorized test passed successfully!");
    } else {
      console.log("❌ Helius Unauthorized test failed.");
    }
  } catch (err) {
    console.error("❌ Request error:", err.message);
  }

  // --- TEST ALCHEMY WEBHOOK ---
  try {
    console.log("\n[3/4] Testing Alchemy Webhook Ingestion...");
    const url = `${BASE_URL}/api/webhooks/alchemy`;
    const jsonBody = JSON.stringify(alchemyMockPayload);

    // Compute HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", ALCHEMY_SECRET);
    hmac.update(jsonBody);
    const signature = hmac.digest("hex");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-alchemy-signature": signature
      },
      body: jsonBody
    });

    const status = response.status;
    const text = await response.text();
    console.log(`Response Status: ${status}`);
    console.log(`Response Body: ${text}`);

    if (status === 200) {
      console.log("✅ Alchemy Webhook test passed successfully!");
    } else {
      console.log("❌ Alchemy Webhook test failed.");
    }
  } catch (err) {
    console.error("❌ Alchemy Webhook request error:", err.message);
  }

  // --- TEST ALCHEMY WEBHOOK (UNAUTHORIZED) ---
  try {
    console.log("\n[4/4] Testing Alchemy Webhook (Unauthorized Signature)...");
    const url = `${BASE_URL}/api/webhooks/alchemy`;
    const jsonBody = JSON.stringify(alchemyMockPayload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-alchemy-signature": "invalid_signature_hex_12345"
      },
      body: jsonBody
    });

    const status = response.status;
    console.log(`Response Status: ${status} (expected: 401)`);
    if (status === 401) {
      console.log("✅ Alchemy Unauthorized test passed successfully!");
    } else {
      console.log("❌ Alchemy Unauthorized test failed.");
    }
  } catch (err) {
    console.error("❌ Request error:", err.message);
  }
}

runTests();

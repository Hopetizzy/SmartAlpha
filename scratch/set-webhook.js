const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    console.warn("No .env.local found. Using process.env.");
    return;
  }
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/(^['"]|['"]$)/g, "");
      process.env[key] = val;
    }
  });
}

loadEnv();

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN in environment.");
  process.exit(1);
}

const appUrl = process.argv[2] || process.env.NEXT_PUBLIC_APP_URL;
if (!appUrl) {
  console.error("Usage: node scratch/set-webhook.js <app_url>");
  console.error("Example: node scratch/set-webhook.js https://my-app.insforge.site");
  process.exit(1);
}

// Clean up trailing slash and construct full webhook URL
const cleanUrl = appUrl.replace(/\/$/, "");
const webhookUrl = `${cleanUrl}/api/webhooks/telegram`;

console.log(`Setting Telegram webhook to: ${webhookUrl}`);
if (secret) {
  console.log(`Using secret token: ${secret}`);
}

const apiEndpoint = `https://api.telegram.org/bot${token}/setWebhook`;

async function run() {
  try {
    const payload = {
      url: webhookUrl,
      ...(secret ? { secret_token: secret } : {}),
      allowed_updates: ["message"]
    };

    console.log(`Sending POST request to: ${apiEndpoint}`);
    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Telegram API Response:", JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log("✅ Webhook configured successfully!");
    } else {
      console.error("❌ Failed to configure webhook:", data.description);
    }
  } catch (err) {
    console.error("Error setting webhook:", err.message);
  }
}

run();

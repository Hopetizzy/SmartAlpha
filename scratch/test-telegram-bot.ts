import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Load env variables
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local file.");
    process.exit(1);
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

const TELEGRAM_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "dev-telegram-secret-12345";
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

const TEST_USER_EMAIL = "fridayhope044@gmail.com";
const MOCK_CHAT_ID = "123456789";
const TEST_CONNECT_TOKEN = "link_token_" + Math.random().toString(36).substring(7);

// Run SQL query using the CLI to avoid package exports loading errors in standalone Node scripts
function runSql(sql: string): any[] {
  try {
    const cmd = `npx @insforge/cli db query --json "${sql.replace(/"/g, '\\"')}"`;
    const output = execSync(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    const resultObj = JSON.parse(output.trim());
    return resultObj.rows || [];
  } catch (err: any) {
    throw new Error(`CLI SQL execution failed: ${err.stderr || err.message}`);
  }
}

async function runTests() {
  console.log("Starting Telegram Webhook Integration Tests via CLI DB Query...");

  try {
    // 1. Set the connect token for our test user
    console.log(`\n[1/3] Setting test connection token '${TEST_CONNECT_TOKEN}' for ${TEST_USER_EMAIL}...`);
    
    // Clear any previous chat linkage and set token
    runSql(
      `UPDATE public.users SET telegram_chat_id = NULL, telegram_connect_token = '${TEST_CONNECT_TOKEN}' WHERE email = '${TEST_USER_EMAIL}';`
    );
    console.log("✅ Database updated with connection token.");

    // 2. Send mock /start webhook request to local Next.js API endpoint
    console.log("\n[2/3] Dispatching simulated /start update webhook request...");
    const url = `${BASE_URL}/api/webhooks/telegram`;
    
    const mockTelegramPayload = {
      update_id: 99999,
      message: {
        message_id: 1,
        from: {
          id: Number(MOCK_CHAT_ID),
          is_bot: false,
          first_name: "Hope",
          last_name: "Tester",
          username: "hope_tester",
          language_code: "en"
        },
        chat: {
          id: Number(MOCK_CHAT_ID),
          first_name: "Hope",
          last_name: "Tester",
          username: "hope_tester",
          type: "private"
        },
        date: Math.floor(Date.now() / 1000),
        text: `/start ${TEST_CONNECT_TOKEN}`,
        entities: [
          {
            offset: 0,
            length: 6,
            type: "bot_command"
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": TELEGRAM_SECRET
      },
      body: JSON.stringify(mockTelegramPayload)
    });

    const status = response.status;
    const text = await response.text();
    console.log(`Webhook HTTP Response Status: ${status}`);
    console.log(`Webhook HTTP Response Body: ${text}`);

    // 3. Verify that database was updated (linked chat id)
    console.log("\n[3/3] Querying database to verify user account linkage...");
    const result = runSql(
      `SELECT telegram_chat_id, telegram_connect_token FROM public.users WHERE email = '${TEST_USER_EMAIL}';`
    );

    if (result.length === 0) {
      throw new Error(`Failed to find user profile with email ${TEST_USER_EMAIL}`);
    }

    const user = result[0];
    console.log(`Database Result - Chat ID: ${user.telegram_chat_id}, Token: ${user.telegram_connect_token}`);

    if (user.telegram_chat_id === MOCK_CHAT_ID && user.telegram_connect_token === null) {
      console.log("\n🎉 SUCCESS: Telegram user account linkage verified successfully!");
    } else {
      console.log("\n❌ FAILURE: Database values do not match expected linked status.");
    }

  } catch (err: any) {
    console.error("❌ Test error:", err.message);
  }
}

runTests();

import { Bot } from "grammy";
import { createClient } from "@insforge/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
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

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN in .env.local");
  process.exit(1);
}

const bot = new Bot(token);

// Create InsForge client
const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  isServerMode: true
});

bot.command("start", async (ctx) => {
  const connectToken = ctx.match?.trim();
  console.log(`[bot] /start command received. token=${connectToken || "none"}, chatId=${ctx.chat.id}`);

  if (!connectToken) {
    return ctx.reply(
      "Welcome to SmartAlpha!\n\nTo link your Telegram profile, please go to your website dashboard settings page and click 'Generate Sync Link'."
    );
  }

  try {
    const { data: user, error: fetchError } = await insforge.database
      .from("users")
      .select("id, email")
      .eq("telegram_connect_token", connectToken)
      .maybeSingle();

    if (fetchError || !user) {
      console.log("[bot] Connect token lookup failure:", fetchError);
      return ctx.reply(
        "[Error] Invalid or expired connection token. Please request a new link from your settings page."
      );
    }

    const { error: updateError } = await insforge.database
      .from("users")
      .update({
        telegram_chat_id: ctx.chat.id.toString(),
        telegram_connect_token: null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[bot] Database link update failure:", updateError);
      return ctx.reply("[Error] An error occurred while linking your account. Please try again.");
    }

    console.log(`[bot] Connected user ID ${user.id} (${user.email}) to chat ID ${ctx.chat.id}`);
    return ctx.reply(
      `[Success] Your Telegram account has been linked to SmartAlpha (${user.email}).\n\nYou will now receive live alerts based on your premium status and filter settings.`
    );
  } catch (err) {
    console.error("[bot] start command handler exception:", err);
    return ctx.reply("[Error] An unexpected error occurred.");
  }
});

// Help command
bot.command("help", (ctx) => {
  return ctx.reply(
    "<b>SmartAlpha Bot Help</b>\n\n" +
      "Commands:\n" +
      "• /start &lt;token&gt; - Onboard and sync your Telegram account\n" +
      "• /help - Display this command information card",
    { parse_mode: "HTML" }
  );
});

async function run() {
  try {
    console.log("Deleting active Telegram webhooks to prevent conflict...");
    const deleteRes = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
    const deleteData = await deleteRes.json();
    console.log("Telegram deleteWebhook response:", JSON.stringify(deleteData));

    console.log("Starting Telegram Bot in long polling mode...");
    bot.start();
    console.log("Bot is online and listening for messages!");
  } catch (err) {
    console.error("Error starting bot:", err);
  }
}

run();

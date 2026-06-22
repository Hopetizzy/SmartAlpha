import { Bot } from "grammy";
import { getInsforgeServerClient } from "./insforge";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN environment variable is not defined");
}

export const bot = new Bot(token || "");

// Intercept outbound API calls in development to prevent hangs/timeouts due to network blocks
bot.api.config.use(async (prev, method, payload, signal) => {
  console.log(`[telegram] Outbound API call: ${method}`, JSON.stringify(payload));
  
  const isMock = process.env.NODE_ENV === "development" || process.env.MOCK_TELEGRAM === "true";
  if (isMock) {
    console.log(`[telegram-mock] Mocking response for ${method}`);
    if (method === "getMe") {
      return {
        ok: true,
        result: {
          id: 8672222265,
          is_bot: true,
          first_name: "SmartAlpha_Trading_Bot",
          username: "SmartAlpha_Trading_Bot",
          can_join_groups: true,
          can_read_all_group_messages: false,
          supports_inline_queries: false,
        }
      } as any;
    }
    return {
      ok: true,
      result: true
    } as any;
  }
  
  return prev(method, payload, signal);
});

bot.botInfo = {
  id: 8672222265,
  is_bot: true,
  first_name: "SmartAlpha_Trading_Bot",
  username: "SmartAlpha_Trading_Bot",
  can_join_groups: true,
  can_read_all_group_messages: false,
  supports_inline_queries: false,
  can_connect_to_business: false,
  has_main_web_app: false
} as any;

// Global middleware to log all incoming updates
bot.use(async (ctx, next) => {
  console.log(`[telegram] Update received: update_id=${ctx.update.update_id}, message_text=${ctx.message?.text || "none"}`);
  return next();
});

bot.catch((err) => {
  console.error("[telegram] Global bot error:", err.error || err);
});

// 1. /start command: connect user accounts
bot.command("start", async (ctx) => {
  try {
    const connectToken = ctx.match?.trim();
    console.log("[telegram] /start command invoked. connectToken =", connectToken, "chatId =", ctx.chat.id);
    if (!connectToken) {
      return ctx.reply(
        "👋 Welcome to SmartAlpha!\n\nTo start receiving live alerts directly in your Telegram, please visit the dashboard settings page on our website and click 'Connect Telegram' to generate your unique linkage link."
      );
    }

    const insforge = getInsforgeServerClient();
    console.log("[telegram] Searching user with token:", connectToken);

    // Find the user with this connection token
    const { data: user, error: fetchError } = await insforge.database
      .from("users")
      .select("id, email")
      .eq("telegram_connect_token", connectToken)
      .maybeSingle();

    console.log("[telegram] User query result:", { user, fetchError });

    if (fetchError || !user) {
      console.error("[telegram] Connect token lookup failure:", fetchError);
      return ctx.reply(
        "❌ Invalid or expired connection token. Please request a new link from your dashboard settings page."
      );
    }

    // Link the chat ID and clear the connect token
    console.log("[telegram] Updating user:", user.id, "with chat ID:", ctx.chat.id.toString());
    const { error: updateError } = await insforge.database
      .from("users")
      .update({
        telegram_chat_id: ctx.chat.id.toString(),
        telegram_connect_token: null,
      })
      .eq("id", user.id);

    console.log("[telegram] Database update result error:", updateError);

    if (updateError) {
      console.error("[telegram] Link update failure:", updateError);
      return ctx.reply("❌ An error occurred while linking your account. Please try again later.");
    }

    console.log("[telegram] Successfully linked account, replying to user...");
    return ctx.reply(
      `✅ Success! Your Telegram account has been linked to SmartAlpha (${user.email}).\n\nYou will now receive live alerts according to your premium status and filter parameters settings.`
    );
  } catch (err) {
    console.error("[telegram] error handling /start:", err);
    return ctx.reply("❌ An unexpected error occurred.");
  }
});

// 2. /status command: show linkage and plan info
bot.command("status", async (ctx) => {
  try {
    const insforge = getInsforgeServerClient();
    const { data: user, error } = await insforge.database
      .from("users")
      .select("email, is_premium")
      .eq("telegram_chat_id", ctx.chat.id.toString())
      .maybeSingle();

    if (error || !user) {
      return ctx.reply(
        "ℹ️ This Telegram chat is not connected to a SmartAlpha profile. Log in to the dashboard to sync."
      );
    }

    return ctx.reply(
      `📊 <b>SmartAlpha Status</b>\n\n<b>Connected Account:</b> ${user.email}\n<b>Status:</b> ${
        user.is_premium ? "⭐ Premium Plan (Unrestricted)" : "Free Tier"
      }`,
      { parse_mode: "HTML" }
    );
  } catch (err) {
    console.error("[telegram] error handling /status:", err);
  }
});

// 3. /help command
bot.command("help", (ctx) => {
  return ctx.reply(
    "🤖 <b>SmartAlpha Bot Help</b>\n\n" +
      "Commands:\n" +
      "• /start &lt;token&gt; - Onboard and sync your Telegram account\n" +
      "• /status - View account details and active subscription status\n" +
      "• /help - Display this command information card",
    { parse_mode: "HTML" }
  );
});

// 4. /admin command: privileged statistics
bot.command("admin", async (ctx) => {
  try {
    const adminId = process.env.ADMIN_TELEGRAM_ID;
    if (!adminId || ctx.chat.id.toString() !== adminId) {
      return; // Silently ignore for unauthorized users
    }

    const insforge = getInsforgeServerClient();

    // Query total users
    const { count: totalUsers, error: err1 } = await insforge.database
      .from("users")
      .select("*", { count: "exact", head: true });

    // Query premium users
    const { count: premiumUsers, error: err2 } = await insforge.database
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_premium", true);

    if (err1 || err2) {
      return ctx.reply("❌ Error fetching metrics from the database.");
    }

    return ctx.reply(
      `📈 <b>System Dashboard Stats</b>\n\n` +
        `• <b>Total Registers:</b> ${totalUsers}\n` +
        `• <b>Premium Subscriptions:</b> ${premiumUsers}`,
      { parse_mode: "HTML" }
    );
  } catch (err) {
    console.error("[telegram] error handling /admin:", err);
  }
});

// 5. Broadcast helper called by webhook routes
export async function broadcastAlert(alert: {
  wallet_address: string;
  token_mint: string;
  token_symbol: string;
  type: string;
  amount_usd: number | string;
  risk_score: number;
}) {
  try {
    const insforge = getInsforgeServerClient();

    // Retrieve active premium users with registered Telegram connections
    const { data: premiumUsers, error: fetchUsersError } = await insforge.database
      .from("users")
      .select("id, telegram_chat_id")
      .eq("is_premium", true)
      .not("telegram_chat_id", "is", null);

    if (fetchUsersError || !premiumUsers || premiumUsers.length === 0) {
      console.log("[telegram] No active premium subscribers registered to receive DMs.");
      return;
    }

    // Also fetch custom wallets labels or names if we want, but let's default to wallet alias
    // Query target wallets to see if there is a known label
    const { data: targetWallet } = await insforge.database
      .from("target_wallets")
      .select("label")
      .eq("address", alert.wallet_address)
      .maybeSingle();

    const walletLabel = targetWallet?.label || "Tracked Wallet";
    const walletAddressShort =
      alert.wallet_address.slice(0, 4) + "..." + alert.wallet_address.slice(-4);
    const mintShort = alert.token_mint.slice(0, 4) + "..." + alert.token_mint.slice(-4);
    const riskEmoji = alert.risk_score <= 30 ? "🟢" : alert.risk_score <= 70 ? "🟡" : "🔴";
    const amountVal = Number(alert.amount_usd) || 0;

    for (const user of premiumUsers) {
      try {
        // Fetch individual user filter parameters
        const { data: settings, error: fetchSettingsError } = await insforge.database
          .from("alert_settings")
          .select("min_liquidity, min_volume, max_risk_score")
          .eq("user_id", user.id)
          .maybeSingle();

        if (fetchSettingsError) {
          console.error(`[telegram] Error fetching settings for user ${user.id}:`, fetchSettingsError);
          continue;
        }

        // Apply filters
        if (settings) {
          if (amountVal < Number(settings.min_volume)) {
            continue; // Filtered out by size
          }
          if (alert.risk_score > settings.max_risk_score) {
            continue; // Filtered out by risk score
          }
        }

        // Format premium alert message
        const message =
          `🚨 <b>SMART MONEY ALERT</b> 🚨\n\n` +
          `<b>Wallet:</b> <code>${walletLabel}</code> (<code>${walletAddressShort}</code>)\n` +
          `<b>Action:</b> ${alert.type === "BUY" ? "🟢 BUY" : "🔴 SELL"}\n` +
          `<b>Asset:</b> <b>${alert.token_symbol}</b> (<code>${mintShort}</code>)\n\n` +
          `<b>Amount:</b> $${amountVal.toLocaleString()}\n` +
          `<b>Risk Score:</b> ${alert.risk_score}/100 ${riskEmoji}\n\n` +
          `📊 <a href="https://dexscreener.com/solana/${alert.token_mint}">View on DexScreener</a> | ⚡ <a href="https://jup.ag/swap/SOL-${alert.token_mint}">Trade on Jupiter</a>`;

        await bot.api.sendMessage(user.telegram_chat_id, message, {
          parse_mode: "HTML",
          link_preview_options: {
            is_disabled: true,
          },
        });
      } catch (sendErr) {
        // Handle blocked bot or invalid chat IDs gracefully so we do not stop loop
        console.error(`[telegram] Failed to send message to chat ${user.telegram_chat_id}:`, sendErr);
      }
    }
  } catch (err) {
    console.error("[telegram] Webhook broadcast execution failure:", err);
  }
}

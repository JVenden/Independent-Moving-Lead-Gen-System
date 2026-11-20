/**
 * Sends an alert to every configured channel (Telegram and/or email via Resend).
 * Throws only if no channel delivered it, so callers can decide what to do.
 */
async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) throw new Error(`Telegram failed: ${res.status} ${await res.text()}`);
  return true;
}

async function sendEmail(subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.ALERT_EMAIL_TO;
  if (!apiKey || !from || !to) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
  return true;
}

export async function sendAlert(subject: string, text: string) {
  const results = await Promise.allSettled([sendTelegram(text), sendEmail(subject, text)]);
  const delivered = results.some((r) => r.status === "fulfilled" && r.value === true);
  const errors = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  errors.forEach((e) => console.error("[notify]", e.reason));
  if (!delivered) {
    if (errors.length === 0) console.warn(`[notify] No alert channel configured.\n${text}`);
    throw new Error("Alert was not delivered on any channel");
  }
}

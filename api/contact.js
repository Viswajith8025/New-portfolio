import { sendTelegramMessage } from "../lib/telegram.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, message } = req.body ?? {};

  if (!name?.trim() || !phone?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name, phone, and message are required" });
  }

  try {
    await sendTelegramMessage(
      {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
      },
      {
        token: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Telegram send error:", error);
    return res.status(500).json({ error: error.message || "Failed to send message" });
  }
}

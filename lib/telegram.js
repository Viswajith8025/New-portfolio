export async function sendTelegramMessage({ name, phone, message }, { token, chatId }) {
  if (!token || !chatId) {
    throw new Error("Telegram credentials are not configured");
  }

  const text = [
    "📬 New Portfolio Message",
    "",
    `👤 Name: ${name}`,
    `📱 Phone: ${phone}`,
    "",
    "💬 Message:",
    message,
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    let description = "Failed to send Telegram message";

    try {
      const error = await response.json();
      description = error.description || description;

      if (description.toLowerCase().includes("chat not found")) {
        throw new Error(
          "Telegram chat not found. Open your bot in Telegram, send /start, then update TELEGRAM_CHAT_ID."
        );
      }
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message.includes("Telegram chat not found")) {
        throw parseError;
      }
    }

    throw new Error(description);
  }

  return response.json();
}

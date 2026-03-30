import type { DiscordEmbed, DiscordWebhookPayload } from './types.js';

export async function sendDiscordWebhook(
  webhookUrl: string,
  embed: DiscordEmbed,
  mentionRoleId: string | null,
): Promise<void> {
  const payload: DiscordWebhookPayload = {
    embeds: [embed],
  };

  if (mentionRoleId) {
    payload.content = `<@&${mentionRoleId}>`;
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord webhook failed: ${res.status} ${text}`);
  }
}

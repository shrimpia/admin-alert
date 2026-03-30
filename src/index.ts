import { Hono } from 'hono';
import type { Env, MisskeyWebhookPayload, Config } from './types.js';
import { sendDiscordWebhook } from './discord.js';
import {
  formatAbuseReport,
  formatAbuseReportResolved,
  formatUserCreated,
  formatInactiveModeratorsWarning,
  formatInactiveModeratorsInvitationOnlyChanged,
} from './formatters.js';
import config from '../config.json';

const app = new Hono<{ Bindings: Env }>();

app.post('/webhook', async (c) => {
  // シークレット検証
  const secret = c.req.header('X-Misskey-Hook-Secret');
  if (secret !== c.env.MISSKEY_HOOK_SECRET) {
    return c.text('Forbidden', 403);
  }

  let payload: MisskeyWebhookPayload;
  try {
    payload = await c.req.json<MisskeyWebhookPayload>();
  } catch {
    return c.text('Bad Request: invalid JSON', 400);
  }

  const cfg = config as Config;
  const eventConfig = cfg.events[payload.type as keyof typeof cfg.events];

  // 未対応イベントまたは無効イベントはスキップ
  if (!eventConfig || !eventConfig.enabled) {
    return c.text('OK', 200);
  }

  let embed;
  switch (payload.type) {
    case 'abuseReport':
      embed = formatAbuseReport(payload, cfg);
      break;
    case 'abuseReportResolved':
      embed = formatAbuseReportResolved(payload, cfg);
      break;
    case 'userCreated':
      embed = formatUserCreated(payload, cfg);
      break;
    case 'inactiveModeratorsWarning':
      embed = formatInactiveModeratorsWarning(payload, cfg);
      break;
    case 'inactiveModeratorsInvitationOnlyChanged':
      embed = formatInactiveModeratorsInvitationOnlyChanged(payload, cfg);
      break;
    default:
      return c.text('OK', 200);
  }

  await sendDiscordWebhook(c.env.DISCORD_WEBHOOK_URL, embed, eventConfig.mentionRoleId);
  return c.text('OK', 200);
});

export default app;

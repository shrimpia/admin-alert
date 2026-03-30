import type {
  AbuseReportBody,
  AbuseReportResolvedBody,
  UserCreatedBody,
  InactiveModeratorsWarningBody,
  InactiveModeratorsInvitationOnlyChangedBody,
  Config,
  DiscordEmbed,
  DiscordEmbedField,
} from './types.js';

function userLabel(user: { name: string | null; username: string; host: string | null }): string {
  const display = user.name ?? user.username;
  const acct = user.host ? `@${user.username}@${user.host}` : `@${user.username}`;
  return `${display} (${acct})`;
}

export function formatAbuseReport(
  payload: { body: AbuseReportBody; server: string; createdAt: number },
  config: Config,
): DiscordEmbed {
  const { body, server, createdAt } = payload;
  const { labels } = config;
  const eventConfig = config.events.abuseReport;

  const fields: DiscordEmbedField[] = [
    { name: labels.targetUser, value: userLabel(body.targetUser), inline: true },
    { name: labels.reporter, value: userLabel(body.reporter), inline: true },
    { name: labels.comment, value: body.comment || '—' },
    { name: labels.forwarded, value: body.forwarded ? '✅' : '❌', inline: true },
    { name: labels.server, value: server, inline: true },
  ];

  if (body.assignee) {
    fields.push({ name: labels.assignee, value: userLabel(body.assignee), inline: true });
  }

  return {
    title: eventConfig.title,
    color: eventConfig.color,
    fields,
    timestamp: new Date(createdAt).toISOString(),
  };
}

export function formatAbuseReportResolved(
  payload: { body: AbuseReportResolvedBody; server: string; createdAt: number },
  config: Config,
): DiscordEmbed {
  const { body, server, createdAt } = payload;
  const { labels } = config;
  const eventConfig = config.events.abuseReportResolved;

  const fields: DiscordEmbedField[] = [
    { name: labels.targetUser, value: userLabel(body.targetUser), inline: true },
    { name: labels.reporter, value: userLabel(body.reporter), inline: true },
    { name: labels.comment, value: body.comment || '—' },
    { name: labels.resolvedAs, value: body.resolvedAs ?? labels.unknown, inline: true },
    { name: labels.server, value: server, inline: true },
  ];

  if (body.assignee) {
    fields.push({ name: labels.assignee, value: userLabel(body.assignee), inline: true });
  }

  return {
    title: eventConfig.title,
    color: eventConfig.color,
    fields,
    timestamp: new Date(createdAt).toISOString(),
  };
}

export function formatUserCreated(
  payload: { body: UserCreatedBody; server: string; createdAt: number },
  config: Config,
): DiscordEmbed {
  const { body, server, createdAt } = payload;
  const { labels } = config;
  const eventConfig = config.events.userCreated;

  return {
    title: eventConfig.title,
    color: eventConfig.color,
    fields: [
      { name: labels.targetUser, value: userLabel(body) },
      { name: labels.server, value: server, inline: true },
    ],
    timestamp: new Date(createdAt).toISOString(),
  };
}

export function formatInactiveModeratorsWarning(
  payload: { body: InactiveModeratorsWarningBody; server: string; createdAt: number },
  config: Config,
): DiscordEmbed {
  const { body, server, createdAt } = payload;
  const { labels } = config;
  const eventConfig = config.events.inactiveModeratorsWarning;

  const totalMinutes = Math.floor(body.remainingTime / 1000 / 60);
  const days = Math.floor(totalMinutes / 60 / 24);
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const remainingStr = `${days}${labels.days} ${hours}${labels.hours}`;

  return {
    title: eventConfig.title,
    color: eventConfig.color,
    fields: [
      { name: labels.remainingTime, value: remainingStr, inline: true },
      { name: labels.server, value: server, inline: true },
    ],
    timestamp: new Date(createdAt).toISOString(),
  };
}

export function formatInactiveModeratorsInvitationOnlyChanged(
  payload: { body: InactiveModeratorsInvitationOnlyChangedBody; server: string; createdAt: number },
  config: Config,
): DiscordEmbed {
  const { body, server, createdAt } = payload;
  const eventConfig = config.events.inactiveModeratorsInvitationOnlyChanged;
  const { labels } = config;

  return {
    title: eventConfig.title,
    color: eventConfig.color,
    fields: [
      { name: '招待制', value: body.invitationOnly ? '有効' : '無効', inline: true },
      { name: labels.server, value: server, inline: true },
    ],
    timestamp: new Date(createdAt).toISOString(),
  };
}

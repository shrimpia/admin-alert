// Misskey UserLite型
export interface UserLite {
  id: string;
  name: string | null;
  username: string;
  host: string | null;
  avatarUrl: string | null;
  avatarBlurhash: string | null;
  isBot: boolean;
  isCat: boolean;
  emojis: Record<string, string>;
  onlineStatus: 'unknown' | 'online' | 'active' | 'offline';
  badgeRoles: unknown[];
}

// 各イベントのbody型
export interface AbuseReportBody {
  id: string;
  targetUserId: string;
  targetUser: UserLite;
  reporterId: string;
  reporter: UserLite;
  assigneeId: string | null;
  assignee: UserLite | null;
  comment: string;
  forwarded: boolean;
}

export interface AbuseReportResolvedBody {
  reportId: string;
  targetUserId: string;
  targetUser: UserLite;
  reporterId: string;
  reporter: UserLite;
  assigneeId: string | null;
  assignee: UserLite | null;
  comment: string;
  forwarded: boolean;
  resolvedAs: string | null;
}

export interface UserCreatedBody extends UserLite {}

export interface InactiveModeratorsWarningBody {
  remainingTime: number; // milliseconds
}

export interface InactiveModeratorsInvitationOnlyChangedBody {
  invitationOnly: boolean;
}

// Webhookペイロード（discriminated union）
export type MisskeyWebhookPayload =
  | { type: 'abuseReport'; server: string; hookId: string; eventId: string; createdAt: number; body: AbuseReportBody }
  | { type: 'abuseReportResolved'; server: string; hookId: string; eventId: string; createdAt: number; body: AbuseReportResolvedBody }
  | { type: 'userCreated'; server: string; hookId: string; eventId: string; createdAt: number; body: UserCreatedBody }
  | { type: 'inactiveModeratorsWarning'; server: string; hookId: string; eventId: string; createdAt: number; body: InactiveModeratorsWarningBody }
  | { type: 'inactiveModeratorsInvitationOnlyChanged'; server: string; hookId: string; eventId: string; createdAt: number; body: InactiveModeratorsInvitationOnlyChangedBody };

// Config型
export interface EventConfig {
  enabled: boolean;
  title: string;
  color: number;
  mentionRoleId: string | null;
}

export interface Config {
  events: {
    abuseReport: EventConfig;
    abuseReportResolved: EventConfig;
    userCreated: EventConfig;
    inactiveModeratorsWarning: EventConfig;
    inactiveModeratorsInvitationOnlyChanged: EventConfig;
  };
  labels: {
    targetUser: string;
    reporter: string;
    comment: string;
    assignee: string;
    resolved: string;
    resolvedAs: string;
    forwarded: string;
    remainingTime: string;
    days: string;
    hours: string;
    server: string;
    unknown: string;
  };
}

// Discord embed型
export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  color: number;
  fields: DiscordEmbedField[];
  timestamp?: string;
}

export interface DiscordWebhookPayload {
  content?: string;
  embeds: DiscordEmbed[];
}

// Cloudflare Workers環境変数
export interface Env {
  DISCORD_WEBHOOK_URL: string;
  MISSKEY_HOOK_SECRET: string;
}

import type { ProfileIntegrationStatus } from '@/types/profile';

export function getProfileIntegrationStatus(): ProfileIntegrationStatus {
  return {
    auth: Boolean(process.env.VERTYX_AUTH_API_URL),
    blob: Boolean(process.env.VERTYX_BLOB_UPLOAD_URL || process.env.BLOB_READ_WRITE_TOKEN),
    payments: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_WEBHOOK_ID),
    discord: Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_GUILD_ID && process.env.DISCORD_PRO_ROLE_ID),
    moderation: Boolean(process.env.VERTYX_MODERATION_API_URL),
    activity: Boolean(process.env.VERTYX_ACTIVITY_API_URL),
  };
}

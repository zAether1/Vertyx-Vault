import type { ProfileIntegrationStatus } from '@/types/profile';

export function getProfileIntegrationStatus(): ProfileIntegrationStatus {
  return {
    auth: Boolean(process.env.VERTYX_AUTH_API_URL),
    blob: Boolean(process.env.VERTYX_BLOB_UPLOAD_URL || process.env.BLOB_READ_WRITE_TOKEN),
    payments: Boolean(process.env.VERTYX_PRO_API_URL || process.env.VERTYX_PAYMENTS_API_URL || process.env.STRIPE_SECRET_KEY),
    discord: Boolean(process.env.VERTYX_DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID),
    moderation: Boolean(process.env.VERTYX_MODERATION_API_URL),
    activity: Boolean(process.env.VERTYX_ACTIVITY_API_URL),
  };
}

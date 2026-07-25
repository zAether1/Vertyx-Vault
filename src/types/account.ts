import type { AuthProvider } from '@/types/session';

export type AccountSecurityAction = 'email' | 'password' | 'two-factor' | 'sessions' | 'logout-others' | 'login-history' | 'delete-account';

export interface AccountActionResult {
  ok: boolean;
  ready: boolean;
  action: AccountSecurityAction;
  message: string;
  next?: string;
}

export interface AccountSessionDevice {
  id: string;
  device: string;
  location: string;
  current?: boolean;
  lastSeenAt: string;
}

export interface AccountLoginEvent {
  id: string;
  provider: AuthProvider;
  device: string;
  status: 'success' | 'blocked';
  at: string;
}

export interface AccountSecurityOverview {
  ready: boolean;
  sessions: AccountSessionDevice[];
  loginHistory: AccountLoginEvent[];
  twoFactorEnabled: boolean;
  providers: {
    google: boolean;
    discord: boolean;
  };
  message?: string;
}

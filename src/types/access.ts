export const ROLES = ['guest', 'user', 'uploader', 'moderator', 'admin', 'manager', 'owner'] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'profile:read', 'profile:update', 'library:manage', 'submission:create', 'submission:review',
  'content:publish', 'user:manage', 'role:manage', 'activity:read',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  guest: ['profile:read'],
  user: ['profile:read', 'profile:update', 'library:manage'],
  uploader: ['profile:read', 'profile:update', 'library:manage', 'submission:create'],
  moderator: ['profile:read', 'profile:update', 'library:manage', 'submission:create', 'submission:review', 'activity:read'],
  admin: ['profile:read', 'profile:update', 'library:manage', 'submission:create', 'submission:review', 'content:publish', 'user:manage', 'activity:read'],
  manager: ['profile:read', 'profile:update', 'library:manage', 'submission:create', 'submission:review', 'content:publish', 'user:manage', 'role:manage', 'activity:read'],
  owner: PERMISSIONS,
};

export const ROLE_LABELS: Record<Role, string> = {
  guest: 'Invitado', user: 'Sin verificar', uploader: 'Miembro', moderator: 'Mod', admin: 'Admin', manager: 'Manager', owner: 'Owner',
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

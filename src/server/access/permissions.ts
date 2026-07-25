import { hasPermission, type Permission, type Role } from '@/types/access';

/** Punto único para futuras validaciones del proveedor de identidad o base de datos. */
export function can(role: Role, permission: Permission): boolean {
  return hasPermission(role, permission);
}

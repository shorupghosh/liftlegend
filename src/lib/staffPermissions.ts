export type StaffRole = 'OWNER' | 'MANAGER' | 'TRAINER' | 'SUPER_ADMIN';

export function canAccessStaffManagement(role: string | null): boolean {
  return role === 'OWNER' || role === 'MANAGER';
}

export function canInviteStaff(role: string | null): boolean {
  return role === 'OWNER' || role === 'MANAGER';
}

export function getAssignableRoles(role: string | null): StaffRole[] {
  if (role === 'OWNER') {
    return ['OWNER', 'MANAGER', 'TRAINER'];
  }

  if (role === 'MANAGER') {
    return ['TRAINER'];
  }

  return [];
}

export function canManageTargetRole(actorRole: string | null, targetRole: string): boolean {
  if (actorRole === 'OWNER') {
    return targetRole === 'OWNER' || targetRole === 'MANAGER' || targetRole === 'TRAINER';
  }

  if (actorRole === 'MANAGER') {
    return targetRole === 'TRAINER';
  }

  return false;
}

export function getTenantNavVisibility(role: string | null) {
  if (role === 'TRAINER') {
    return ['Dashboard', 'Members', 'Attendance'];
  }

  if (role === 'MANAGER') {
    return ['Dashboard', 'Members', 'Plans', 'Attendance', 'Payments', 'Analytics', 'Staff'];
  }

  return ['Dashboard', 'Members', 'Plans', 'Attendance', 'Payments', 'Analytics', 'Notifications', 'Staff', 'Settings'];
}

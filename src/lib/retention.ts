export type RetentionStatus = 'Inactive' | 'At Risk' | 'Missing This Week';

export type RetentionMember = {
  id: string;
  name: string;
  phone: string;
  planName: string;
  lastCheckIn: string | null;
  inactivityDays: number;
  status: RetentionStatus;
  membershipState: 'active-plan' | 'expired-plan' | 'no-expiry';
};

export const INACTIVITY_THRESHOLD_DAYS = 5;
export const AT_RISK_THRESHOLD_DAYS = 3;
export const RETENTION_LOOKBACK_DAYS = 35;

const reminderTemplates = [
  'Hey {{name}}, we miss you at the gym. Come back today and stay on track.',
  'Hi {{name}}, it looks like you have not checked in recently. Let us get back to training.',
];

export function formatDisplayDate(value: string | null): string {
  if (!value) {
    return 'No visit yet';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function buildReminderMessage(member: Pick<RetentionMember, 'name' | 'status'>): string {
  const template = member.status === 'Inactive' ? reminderTemplates[0] : reminderTemplates[1];
  return template.replace('{{name}}', member.name);
}

export function getMembershipState(
  expiryDate: string | null,
  today: Date
): 'active-plan' | 'expired-plan' | 'no-expiry' {
  if (!expiryDate) {
    return 'no-expiry';
  }

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry < today ? 'expired-plan' : 'active-plan';
}

export function getInactivityDays(lastCheckIn: string | null, today: Date): number {
  if (!lastCheckIn) {
    return RETENTION_LOOKBACK_DAYS;
  }

  const lastVisit = new Date(lastCheckIn);
  lastVisit.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - lastVisit.getTime();
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
}

export function classifyRetentionStatus(
  lastCheckIn: string | null,
  inactivityDays: number,
  weekStart: Date
): RetentionStatus | null {
  if (!lastCheckIn || inactivityDays >= INACTIVITY_THRESHOLD_DAYS) {
    return 'Inactive';
  }

  if (inactivityDays >= AT_RISK_THRESHOLD_DAYS) {
    return 'At Risk';
  }

  const lastVisit = new Date(lastCheckIn);
  lastVisit.setHours(0, 0, 0, 0);
  if (lastVisit < weekStart) {
    return 'Missing This Week';
  }

  return null;
}

/**
 * Member Expiry utility functions.
 * Calculates days remaining and returns alert status for member badges.
 */

export type AlertVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ExpiryAlert {
  label: string;
  variant: AlertVariant;
}

/**
 * Calculate the number of days left until expiry.
 * Returns negative number if already expired.
 */
export function getDaysLeft(expiryDate: string | Date | null | undefined): number | null {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get the expiry alert info for a member based on their expiry_date.
 * 
 * Rules:
 *  - daysLeft < 0  → "Expired"        (danger / red)
 *  - daysLeft <= 3  → "Expires in X days" (warning / orange)
 *  - daysLeft <= 7  → "Expiring Soon"  (info / yellow)
 *  - else           → "Active"         (success / green)
 *  - no expiry      → "No Expiry"      (neutral, treated as success)
 */
export function getMemberExpiryAlert(expiryDate: string | Date | null | undefined): ExpiryAlert {
  const daysLeft = getDaysLeft(expiryDate);

  if (daysLeft === null) {
    return { label: 'No Expiry', variant: 'success' };
  }

  if (daysLeft < 0) {
    return { label: 'Expired', variant: 'danger' };
  }

  if (daysLeft === 0) {
    return { label: 'Expires Today', variant: 'warning' };
  }

  if (daysLeft <= 3) {
    return { label: `Expires in ${daysLeft}d`, variant: 'warning' };
  }

  if (daysLeft <= 7) {
    return { label: 'Expiring Soon', variant: 'info' };
  }

  return { label: 'Active', variant: 'success' };
}

/**
 * Calculate the expiry date given a start date and plan duration in days.
 */
export function calculateExpiryDate(startDate: string | Date, durationDays: number): string {
  const start = new Date(startDate);
  start.setDate(start.getDate() + durationDays);
  return start.toISOString().split('T')[0]; // YYYY-MM-DD
}

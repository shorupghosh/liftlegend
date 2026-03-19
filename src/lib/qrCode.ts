import QRCode from 'qrcode';

/**
 * Generate a secure QR code value for a member.
 * Format: gym:<gym_uuid>|member:<member_uuid>
 */
export function generateQrValue(gymId: string, memberId: string): string {
  return `gym:${gymId}|member:${memberId}`;
}

/**
 * Parse a scanned QR code value.
 * Returns { gymId, memberId } or null if the format is invalid.
 */
export function parseQrValue(qrValue: string): { gymId: string; memberId: string } | null {
  // Support format: gym:<uuid>|member:<uuid>
  const match = qrValue.match(/^gym:([a-f0-9-]+)\|member:([a-f0-9-]+)$/i);
  if (match) {
    return { gymId: match[1], memberId: match[2] };
  }

  // Fallback: raw UUID (legacy compat — member.id directly)
  const uuidMatch = qrValue.match(/^[a-f0-9-]{36}$/i);
  if (uuidMatch) {
    return { gymId: '', memberId: qrValue };
  }

  return null;
}

/**
 * Generate a QR code data URL (PNG base64) from a QR value.
 */
export async function generateQrDataUrl(qrValue: string, size = 300): Promise<string> {
  return QRCode.toDataURL(qrValue, {
    width: size,
    margin: 2,
    color: {
      dark: '#1e293b',   // slate-800
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Download a QR code as PNG image.
 */
export async function downloadQrCode(qrValue: string, memberName: string): Promise<void> {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, qrValue, {
    width: 512,
    margin: 3,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });

  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  const safeName = (memberName || 'Member').trim().replace(/\s+/g, '_');
  link.download = `QR_${safeName}.png`;
  link.click();
}

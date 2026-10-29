import { differenceInDays, parseISO, isValid } from 'date-fns';
import { CertificateStatus } from '../types';

export function calculateCertificateStatus(
  expiryDate?: string | null,
  requiresExpiry: boolean = true
): CertificateStatus {
  if (!requiresExpiry || !expiryDate) {
    return 'no_expiry';
  }

  const parsed = parseISO(expiryDate);
  if (!isValid(parsed)) {
    return 'missing';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = differenceInDays(parsed, today);

  if (days < 0) {
    return 'expired';
  } else if (days <= 30) {
    return 'expiring_soon';
  } else {
    return 'valid';
  }
}

export function formatExpiryWindow(
  expiryDate?: string | null,
  locale: 'en' | 'ar' = 'en'
): { text: string; days: number; status: CertificateStatus } {
  const isAr = locale === 'ar';

  if (!expiryDate) {
    return {
      text: isAr ? 'لا يتطلب انتهاء' : 'No Expiry Required',
      days: 9999,
      status: 'no_expiry'
    };
  }

  const parsed = parseISO(expiryDate);
  if (!isValid(parsed)) {
    return {
      text: isAr ? 'مستند غير مكتمل' : 'Missing / Invalid Date',
      days: 0,
      status: 'missing'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = differenceInDays(parsed, today);

  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      text: isAr ? `منتهية منذ ${absDays} يوم` : `Expired ${absDays}d ago`,
      days,
      status: 'expired'
    };
  } else if (days === 0) {
    return {
      text: isAr ? 'تنتهي اليوم' : 'Expires Today',
      days: 0,
      status: 'expiring_soon'
    };
  } else if (days <= 30) {
    return {
      text: isAr ? `متبقي ${days} يوم فقط` : `${days} days remaining`,
      days,
      status: 'expiring_soon'
    };
  } else if (days < 60) {
    return {
      text: isAr ? `متبقي شهر تقريباً (${days} يوم)` : `~1 month left (${days}d)`,
      days,
      status: 'valid'
    };
  } else {
    const months = Math.floor(days / 30);
    return {
      text: isAr ? `متبقي ${months} شهر` : `${months} mos remaining`,
      days,
      status: 'valid'
    };
  }
}

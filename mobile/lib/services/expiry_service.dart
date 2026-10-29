import '../models/certificate.dart';

class ExpiryService {
  /// Calculates CertificateStatus based on expiry date and whether expiry is required.
  /// Logic:
  /// - If requiresExpiry is false or expiryDate is null -> CertificateStatus.noExpiry
  /// - If expiryDate < today (start of day) -> CertificateStatus.expired
  /// - If expiryDate <= today + 30 days -> CertificateStatus.expiringSoon
  /// - Otherwise -> CertificateStatus.valid
  static CertificateStatus calculateStatus({
    DateTime? expiryDate,
    bool requiresExpiry = true,
  }) {
    if (!requiresExpiry || expiryDate == null) {
      return CertificateStatus.noExpiry;
    }

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(expiryDate.year, expiryDate.month, expiryDate.day);

    final differenceInDays = target.difference(today).inDays;

    if (differenceInDays < 0) {
      return CertificateStatus.expired;
    } else if (differenceInDays <= 30) {
      return CertificateStatus.expiringSoon;
    } else {
      return CertificateStatus.valid;
    }
  }

  /// Returns days remaining (positive) or days expired (negative).
  static int? daysUntilExpiry(DateTime? expiryDate) {
    if (expiryDate == null) return null;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(expiryDate.year, expiryDate.month, expiryDate.day);
    return target.difference(today).inDays;
  }

  /// Returns a human-friendly localized badge description.
  static String formatExpiryDescription({
    DateTime? expiryDate,
    bool isArabic = false,
  }) {
    if (expiryDate == null) {
      return isArabic ? 'دائمة / بدون انتهاء' : 'No Expiry Required';
    }

    final days = daysUntilExpiry(expiryDate);
    if (days == null) return '';

    if (days < 0) {
      final abs = days.abs();
      return isArabic ? 'منتهية منذ $abs يوم' : 'Expired ${abs}d ago';
    } else if (days == 0) {
      return isArabic ? 'تنتهي اليوم' : 'Expires Today';
    } else if (days <= 30) {
      return isArabic ? 'تنتهي خلال $days يوم' : 'Expires in ${days}d';
    } else {
      return isArabic ? 'سارية ($days يوم)' : 'Valid (${days}d left)';
    }
  }
}

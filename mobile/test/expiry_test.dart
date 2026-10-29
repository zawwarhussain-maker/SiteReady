import 'package:flutter_test/flutter_test.dart';
import 'package:siteready_gcc/models/certificate.dart';
import 'package:siteready_gcc/services/expiry_service.dart';

void main() {
  group('ExpiryService & Status Calculations', () {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    test('Null expiry date returns noExpiry', () {
      final status = ExpiryService.calculateStatus(
        expiryDate: null,
        requiresExpiry: true,
      );
      expect(status, CertificateStatus.noExpiry);
    });

    test('requiresExpiry false returns noExpiry even with date', () {
      final status = ExpiryService.calculateStatus(
        expiryDate: today.add(const Duration(days: 10)),
        requiresExpiry: false,
      );
      expect(status, CertificateStatus.noExpiry);
    });

    test('Past date returns expired', () {
      final status = ExpiryService.calculateStatus(
        expiryDate: today.subtract(const Duration(days: 1)),
        requiresExpiry: true,
      );
      expect(status, CertificateStatus.expired);
    });

    test('Date 100 days ago returns expired', () {
      final status = ExpiryService.calculateStatus(
        expiryDate: today.subtract(const Duration(days: 100)),
        requiresExpiry: true,
      );
      expect(status, CertificateStatus.expired);
    });

    test('Date today returns expiringSoon (0 days left)', () {
      final status = ExpiryService.calculateStatus(
        expiryDate: today,
        requiresExpiry: true,
      );
      expect(status, CertificateStatus.expiringSoon);
    });

    test('Date in 15 days returns expiringSoon', () {
      final status = ExpiryService.calculateStatus(
        expiryDate: today.add(const Duration(days: 15)),
        requiresExpiry: true,
      );
      expect(status, CertificateStatus.expiringSoon);
    });

    test('Date exactly in 30 days returns expiringSoon boundary', () {
      final status = ExpiryService.calculateStatus(
        expiryDate: today.add(const Duration(days: 30)),
        requiresExpiry: true,
      );
      expect(status, CertificateStatus.expiringSoon);
    });

    test('Date in 31 days returns valid', () {
      final status = ExpiryService.calculateStatus(
        expiryDate: today.add(const Duration(days: 31)),
        requiresExpiry: true,
      );
      expect(status, CertificateStatus.valid);
    });

    test('Date in 365 days returns valid', () {
      final status = ExpiryService.calculateStatus(
        expiryDate: today.add(const Duration(days: 365)),
        requiresExpiry: true,
      );
      expect(status, CertificateStatus.valid);
    });

    test('daysUntilExpiry calculation', () {
      expect(ExpiryService.daysUntilExpiry(today.add(const Duration(days: 7))), 7);
      expect(ExpiryService.daysUntilExpiry(today.subtract(const Duration(days: 5))), -5);
      expect(ExpiryService.daysUntilExpiry(null), isNull);
    });
  });
}

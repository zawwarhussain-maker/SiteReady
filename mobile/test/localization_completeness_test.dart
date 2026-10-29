import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:siteready_gcc/l10n/app_localizations.dart';

void main() {
  group('Localization Completeness & Key Symmetry', () {
    test('English and Arabic key completeness', () {
      final enLoc = AppLocalizations(const Locale('en'));
      final arLoc = AppLocalizations(const Locale('ar'));

      final requiredKeys = [
        'brandName',
        'save',
        'cancel',
        'delete',
        'edit',
        'add',
        'status',
        'navDashboard',
        'navEmployees',
        'navCertificates',
        'navInspections',
        'navReports',
        'navSettings',
        'navSignOut',
        'signInTitle',
        'emailLabel',
        'passwordLabel',
        'complianceRate',
        'totalEmployees',
        'validCertificates',
        'expiringCertificates',
        'expiredCertificates',
        'overdueInspections',
        'openCorrectiveActions',
        'gateCleared',
        'gateBarred',
        'turnstileQrPass',
        'employeeNo',
        'fullName',
        'fullNameAr',
        'iqamaId',
        'iqamaInvalid',
        'jobTitle',
        'licenseNumber',
        'issueDate',
        'expiryDate',
        'renewCertificate',
        'viewAttachment',
        'whatsappReminder',
        'checkpointPass',
        'checkpointFail',
        'checkpointNA',
        'actionResolve',
        'resolutionNotes',
      ];

      for (final key in requiredKeys) {
        final enVal = enLoc.translate(key);
        final arVal = arLoc.translate(key);

        expect(enVal, isNotEmpty, reason: 'Key "$key" missing in English');
        expect(arVal, isNotEmpty, reason: 'Key "$key" missing in Arabic');
        expect(enVal != key, isTrue, reason: 'Key "$key" fallback was returned in English');
        expect(arVal != key, isTrue, reason: 'Key "$key" fallback was returned in Arabic');
      }
    });
  });
}

import 'package:flutter_test/flutter_test.dart';
import 'package:siteready_gcc/config/constants.dart';

void main() {
  group('Saudi Iqama / National ID 10-Digit Validation', () {
    test('Valid Saudi National ID (Starts with 1, 10 digits)', () {
      expect(AppConstants.saudiIdRegex.hasMatch('1084592014'), isTrue);
      expect(AppConstants.saudiIdRegex.hasMatch('1092837465'), isTrue);
    });

    test('Valid Saudi Iqama / Resident ID (Starts with 2, 10 digits)', () {
      expect(AppConstants.saudiIdRegex.hasMatch('2418903421'), isTrue);
      expect(AppConstants.saudiIdRegex.hasMatch('2398716540'), isTrue);
    });

    test('Invalid prefix (Starts with 3, 4, 5, etc.)', () {
      expect(AppConstants.saudiIdRegex.hasMatch('3084592014'), isFalse);
      expect(AppConstants.saudiIdRegex.hasMatch('4084592014'), isFalse);
      expect(AppConstants.saudiIdRegex.hasMatch('9084592014'), isFalse);
    });

    test('Invalid length (less or more than 10 digits)', () {
      expect(AppConstants.saudiIdRegex.hasMatch('108459201'), isFalse); // 9 digits
      expect(AppConstants.saudiIdRegex.hasMatch('10845920145'), isFalse); // 11 digits
      expect(AppConstants.saudiIdRegex.hasMatch(''), isFalse);
    });

    test('Non-numeric characters', () {
      expect(AppConstants.saudiIdRegex.hasMatch('108459201A'), isFalse);
      expect(AppConstants.saudiIdRegex.hasMatch('241-890-342'), isFalse);
      expect(AppConstants.saudiIdRegex.hasMatch('1084 592014'), isFalse);
    });
  });
}

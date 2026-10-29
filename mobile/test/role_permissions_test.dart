import 'package:flutter_test/flutter_test.dart';
import 'package:siteready_gcc/models/profile.dart';

void main() {
  group('UserRole & RBAC Authorization Logic', () {
    test('Role string parsing', () {
      expect(UserRole.fromString('owner'), UserRole.owner);
      expect(UserRole.fromString('OWNER'), UserRole.owner);
      expect(UserRole.fromString('manager'), UserRole.manager);
      expect(UserRole.fromString('MANAGER'), UserRole.manager);
      expect(UserRole.fromString('viewer'), UserRole.viewer);
      expect(UserRole.fromString('unknown'), UserRole.viewer);
    });

    test('Owner permissions matrix', () {
      const role = UserRole.owner;
      final canManageCompany = role == UserRole.owner;
      final canManageUsers = role == UserRole.owner;
      final canManageSites = role == UserRole.owner || role == UserRole.manager;
      final canManageEmployees = role == UserRole.owner || role == UserRole.manager;
      final canManageCertificates = role == UserRole.owner || role == UserRole.manager;
      final canDelete = role == UserRole.owner;

      expect(canManageCompany, isTrue);
      expect(canManageUsers, isTrue);
      expect(canManageSites, isTrue);
      expect(canManageEmployees, isTrue);
      expect(canManageCertificates, isTrue);
      expect(canDelete, isTrue);
    });

    test('Manager permissions matrix', () {
      const role = UserRole.manager;
      final canManageCompany = role == UserRole.owner;
      final canManageUsers = role == UserRole.owner;
      final canManageSites = role == UserRole.owner || role == UserRole.manager;
      final canManageEmployees = role == UserRole.owner || role == UserRole.manager;
      final canManageCertificates = role == UserRole.owner || role == UserRole.manager;
      final canDelete = role == UserRole.owner;

      expect(canManageCompany, isFalse);
      expect(canManageUsers, isFalse);
      expect(canManageSites, isTrue);
      expect(canManageEmployees, isTrue);
      expect(canManageCertificates, isTrue);
      expect(canDelete, isFalse);
    });

    test('Viewer permissions matrix', () {
      const role = UserRole.viewer;
      final canManageCompany = role == UserRole.owner;
      final canManageUsers = role == UserRole.owner;
      final canManageSites = role == UserRole.owner || role == UserRole.manager;
      final canManageEmployees = role == UserRole.owner || role == UserRole.manager;
      final canManageCertificates = role == UserRole.owner || role == UserRole.manager;
      final canDelete = role == UserRole.owner;

      expect(canManageCompany, isFalse);
      expect(canManageUsers, isFalse);
      expect(canManageSites, isFalse);
      expect(canManageEmployees, isFalse);
      expect(canManageCertificates, isFalse);
      expect(canDelete, isFalse);
    });
  });
}

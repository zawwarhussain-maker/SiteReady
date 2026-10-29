import 'dart:convert';
import '../models/employee.dart';
import '../models/certificate.dart';

enum TurnstileGateStatus { cleared, barred }

class TurnstileScanResult {
  final TurnstileGateStatus status;
  final String employeeName;
  final String badgeNo;
  final String iqamaNo;
  final String reason;
  final String reasonAr;
  final DateTime scannedAt;

  TurnstileScanResult({
    required this.status,
    required this.employeeName,
    required this.badgeNo,
    required this.iqamaNo,
    required this.reason,
    required this.reasonAr,
    required this.scannedAt,
  });

  bool get isCleared => status == TurnstileGateStatus.cleared;
}

class QrTurnstileService {
  /// Generates a standardized QR payload string for a worker badge.
  static String generateWorkerTurnstilePayload(Employee employee) {
    final payload = {
      'app': 'SiteReadyGCC',
      'version': '1.0',
      'emp_id': employee.id,
      'emp_no': employee.employeeNo,
      'iqama': employee.iqamaNationalId,
      'name': employee.fullName,
      'comp_id': employee.companyId,
      'timestamp': DateTime.now().toIso8601String(),
    };
    return jsonEncode(payload);
  }

  /// Evaluates whether an employee is cleared for site gate turnstile entry.
  static TurnstileScanResult evaluateWorkerClearance(Employee employee) {
    final now = DateTime.now();

    // Check employment status
    if (employee.employmentStatus != EmploymentStatus.active) {
      return TurnstileScanResult(
        status: TurnstileGateStatus.barred,
        employeeName: employee.fullName,
        badgeNo: employee.employeeNo,
        iqamaNo: employee.iqamaNationalId,
        reason: 'Worker status is ${employee.employmentStatus.name}. Site entry prohibited.',
        reasonAr: 'العامل ليس على رأس العمل. الدخول للموقع محظور.',
        scannedAt: now,
      );
    }

    // Check if worker has any expired certificates
    final expiredCerts = employee.certificates
        .where((c) => c.status == CertificateStatus.expired)
        .toList();

    if (expiredCerts.isNotEmpty) {
      final certNames = expiredCerts
          .map((c) => c.certificateType?.name ?? c.licenseNumber)
          .join(', ');
      return TurnstileScanResult(
        status: TurnstileGateStatus.barred,
        employeeName: employee.fullName,
        badgeNo: employee.employeeNo,
        iqamaNo: employee.iqamaNationalId,
        reason: 'Expired safety certificates ($certNames). Turnstile locked.',
        reasonAr: 'شهادات سلامة منتهية الصلاحية ($certNames). تم إيقاف تصريح البوابة.',
        scannedAt: now,
      );
    }

    // Check if employee has missing mandatory certificates
    if (employee.certificates.isEmpty) {
      return TurnstileScanResult(
        status: TurnstileGateStatus.barred,
        employeeName: employee.fullName,
        badgeNo: employee.employeeNo,
        iqamaNo: employee.iqamaNationalId,
        reason: 'No safety certifications on file. Site induction required.',
        reasonAr: 'لا توجد شهادات سلامة مسجلة. يلزم استكمال تدريب الموقع.',
        scannedAt: now,
      );
    }

    // Cleared
    return TurnstileScanResult(
      status: TurnstileGateStatus.cleared,
      employeeName: employee.fullName,
      badgeNo: employee.employeeNo,
      iqamaNo: employee.iqamaNationalId,
      reason: 'All safety competencies verified. Access granted.',
      reasonAr: 'تم التحقق من كافة كفاءات السلامة. مصرح بالدخول.',
      scannedAt: now,
    );
  }
}

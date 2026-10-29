import 'certificate_type.dart';
import 'employee.dart';

enum CertificateStatus {
  valid,
  expiringSoon,
  expired,
  missing,
  noExpiry;

  static CertificateStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'valid':
        return CertificateStatus.valid;
      case 'expiring_soon':
      case 'expiringsoon':
        return CertificateStatus.expiringSoon;
      case 'expired':
        return CertificateStatus.expired;
      case 'missing':
        return CertificateStatus.missing;
      case 'no_expiry':
      case 'noexpiry':
      default:
        return CertificateStatus.noExpiry;
    }
  }

  String toDbString() {
    switch (this) {
      case CertificateStatus.valid:
        return 'valid';
      case CertificateStatus.expiringSoon:
        return 'expiring_soon';
      case CertificateStatus.expired:
        return 'expired';
      case CertificateStatus.missing:
        return 'missing';
      case CertificateStatus.noExpiry:
        return 'no_expiry';
    }
  }
}

class CertificateRenewalRecord {
  final String id;
  final String certificateId;
  final DateTime? previousExpiryDate;
  final DateTime newExpiryDate;
  final DateTime renewedAt;
  final String? renewedByName;
  final String? notes;

  CertificateRenewalRecord({
    required this.id,
    required this.certificateId,
    this.previousExpiryDate,
    required this.newExpiryDate,
    required this.renewedAt,
    this.renewedByName,
    this.notes,
  });

  factory CertificateRenewalRecord.fromJson(Map<String, dynamic> json) {
    return CertificateRenewalRecord(
      id: json['id'] as String,
      certificateId: json['certificate_id'] as String,
      previousExpiryDate: json['previous_expiry_date'] != null
          ? DateTime.parse(json['previous_expiry_date'] as String)
          : null,
      newExpiryDate: DateTime.parse(json['new_expiry_date'] as String),
      renewedAt: json['renewed_at'] != null
          ? DateTime.parse(json['renewed_at'] as String)
          : DateTime.now(),
      renewedByName: json['renewed_by_name'] as String?,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'certificate_id': certificateId,
      'previous_expiry_date': previousExpiryDate?.toIso8601String(),
      'new_expiry_date': newExpiryDate.toIso8601String(),
      'renewed_at': renewedAt.toIso8601String(),
      'renewed_by_name': renewedByName,
      'notes': notes,
    };
  }
}

class EmployeeCertificate {
  final String id;
  final String companyId;
  final String employeeId;
  final String certificateTypeId;
  final String licenseNumber;
  final DateTime issueDate;
  final DateTime? expiryDate;
  final String? attachmentPath;
  final String? attachmentFilename;
  final CertificateStatus status;
  final String? verifiedBy;
  final DateTime? verifiedAt;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final CertificateType? certificateType;
  final Employee? employee;
  final List<CertificateRenewalRecord> renewalHistory;

  EmployeeCertificate({
    required this.id,
    required this.companyId,
    required this.employeeId,
    required this.certificateTypeId,
    required this.licenseNumber,
    required this.issueDate,
    this.expiryDate,
    this.attachmentPath,
    this.attachmentFilename,
    required this.status,
    this.verifiedBy,
    this.verifiedAt,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    this.certificateType,
    this.employee,
    this.renewalHistory = const [],
  });

  factory EmployeeCertificate.fromJson(Map<String, dynamic> json) {
    return EmployeeCertificate(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      employeeId: json['employee_id'] as String,
      certificateTypeId: json['certificate_type_id'] as String,
      licenseNumber: json['license_number'] as String? ?? '',
      issueDate: json['issue_date'] != null
          ? DateTime.parse(json['issue_date'] as String)
          : DateTime.now(),
      expiryDate: json['expiry_date'] != null
          ? DateTime.parse(json['expiry_date'] as String)
          : null,
      attachmentPath: json['attachment_path'] as String?,
      attachmentFilename: json['attachment_filename'] as String?,
      status: CertificateStatus.fromString(json['status'] as String? ?? 'valid'),
      verifiedBy: json['verified_by'] as String?,
      verifiedAt: json['verified_at'] != null
          ? DateTime.parse(json['verified_at'] as String)
          : null,
      notes: json['notes'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
      certificateType: json['certificate_type'] != null
          ? CertificateType.fromJson(json['certificate_type'] as Map<String, dynamic>)
          : null,
      employee: json['employee'] != null
          ? Employee.fromJson(json['employee'] as Map<String, dynamic>)
          : null,
      renewalHistory: json['renewal_history'] != null
          ? (json['renewal_history'] as List)
              .map((r) => CertificateRenewalRecord.fromJson(r as Map<String, dynamic>))
              .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'company_id': companyId,
      'employee_id': employeeId,
      'certificate_type_id': certificateTypeId,
      'license_number': licenseNumber,
      'issue_date': issueDate.toIso8601String().substring(0, 10),
      'expiry_date': expiryDate?.toIso8601String().substring(0, 10),
      'attachment_path': attachmentPath,
      'attachment_filename': attachmentFilename,
      'status': status.toDbString(),
      'verified_by': verifiedBy,
      'verified_at': verifiedAt?.toIso8601String(),
      'notes': notes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  EmployeeCertificate copyWith({
    String? licenseNumber,
    DateTime? issueDate,
    DateTime? expiryDate,
    String? attachmentPath,
    String? attachmentFilename,
    CertificateStatus? status,
    String? notes,
    CertificateType? certificateType,
    Employee? employee,
    List<CertificateRenewalRecord>? renewalHistory,
  }) {
    return EmployeeCertificate(
      id: id,
      companyId: companyId,
      employeeId: employeeId,
      certificateTypeId: certificateTypeId,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      issueDate: issueDate ?? this.issueDate,
      expiryDate: expiryDate ?? this.expiryDate,
      attachmentPath: attachmentPath ?? this.attachmentPath,
      attachmentFilename: attachmentFilename ?? this.attachmentFilename,
      status: status ?? this.status,
      verifiedBy: verifiedBy,
      verifiedAt: verifiedAt,
      notes: notes ?? this.notes,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
      certificateType: certificateType ?? this.certificateType,
      employee: employee ?? this.employee,
      renewalHistory: renewalHistory ?? this.renewalHistory,
    );
  }
}

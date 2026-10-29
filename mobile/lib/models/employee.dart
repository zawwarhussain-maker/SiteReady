import 'site.dart';
import 'certificate.dart';

enum EmploymentStatus {
  active,
  suspended,
  terminated,
  onLeave;

  static EmploymentStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return EmploymentStatus.active;
      case 'suspended':
        return EmploymentStatus.suspended;
      case 'terminated':
        return EmploymentStatus.terminated;
      case 'on_leave':
      case 'onleave':
      default:
        return EmploymentStatus.onLeave;
    }
  }

  String toDbString() {
    switch (this) {
      case EmploymentStatus.active:
        return 'active';
      case EmploymentStatus.suspended:
        return 'suspended';
      case EmploymentStatus.terminated:
        return 'terminated';
      case EmploymentStatus.onLeave:
        return 'on_leave';
    }
  }
}

class Employee {
  final String id;
  final String companyId;
  final String? siteId;
  final String employeeNo;
  final String fullName;
  final String? fullNameAr;
  final String jobTitle;
  final String? jobTitleAr;
  final String iqamaNationalId;
  final String nationality;
  final String? nationalityAr;
  final String? phone;
  final String? email;
  final DateTime? joiningDate;
  final EmploymentStatus employmentStatus;
  final String? photoUrl;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Site? site;
  final List<EmployeeCertificate> certificates;

  Employee({
    required this.id,
    required this.companyId,
    this.siteId,
    required this.employeeNo,
    required this.fullName,
    this.fullNameAr,
    required this.jobTitle,
    this.jobTitleAr,
    required this.iqamaNationalId,
    required this.nationality,
    this.nationalityAr,
    this.phone,
    this.email,
    this.joiningDate,
    this.employmentStatus = EmploymentStatus.active,
    this.photoUrl,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    this.site,
    this.certificates = const [],
  });

  bool get isCompliant {
    if (certificates.isEmpty) return false;
    return certificates.every((c) =>
        c.status == CertificateStatus.valid ||
        c.status == CertificateStatus.noExpiry);
  }

  bool get hasExpiredCertificates {
    return certificates.any((c) => c.status == CertificateStatus.expired);
  }

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      siteId: json['site_id'] as String?,
      employeeNo: json['employee_no'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '',
      fullNameAr: json['full_name_ar'] as String?,
      jobTitle: json['job_title'] as String? ?? '',
      jobTitleAr: json['job_title_ar'] as String?,
      iqamaNationalId: json['iqama_national_id'] as String? ?? '',
      nationality: json['nationality'] as String? ?? 'Saudi Arabia',
      nationalityAr: json['nationality_ar'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      joiningDate: json['joining_date'] != null
          ? DateTime.parse(json['joining_date'] as String)
          : null,
      employmentStatus: EmploymentStatus.fromString(
          json['employment_status'] as String? ?? 'active'),
      photoUrl: json['photo_url'] as String?,
      notes: json['notes'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
      site: json['site'] != null
          ? Site.fromJson(json['site'] as Map<String, dynamic>)
          : null,
      certificates: json['certificates'] != null
          ? (json['certificates'] as List)
              .map((c) => EmployeeCertificate.fromJson(c as Map<String, dynamic>))
              .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'company_id': companyId,
      'site_id': siteId,
      'employee_no': employeeNo,
      'full_name': fullName,
      'full_name_ar': fullNameAr,
      'job_title': jobTitle,
      'job_title_ar': jobTitleAr,
      'iqama_national_id': iqamaNationalId,
      'nationality': nationality,
      'nationality_ar': nationalityAr,
      'phone': phone,
      'email': email,
      'joining_date': joiningDate?.toIso8601String().substring(0, 10),
      'employment_status': employmentStatus.toDbString(),
      'photo_url': photoUrl,
      'notes': notes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Employee copyWith({
    String? siteId,
    String? employeeNo,
    String? fullName,
    String? fullNameAr,
    String? jobTitle,
    String? jobTitleAr,
    String? iqamaNationalId,
    String? nationality,
    String? nationalityAr,
    String? phone,
    String? email,
    DateTime? joiningDate,
    EmploymentStatus? employmentStatus,
    String? photoUrl,
    String? notes,
    Site? site,
    List<EmployeeCertificate>? certificates,
  }) {
    return Employee(
      id: id,
      companyId: companyId,
      siteId: siteId ?? this.siteId,
      employeeNo: employeeNo ?? this.employeeNo,
      fullName: fullName ?? this.fullName,
      fullNameAr: fullNameAr ?? this.fullNameAr,
      jobTitle: jobTitle ?? this.jobTitle,
      jobTitleAr: jobTitleAr ?? this.jobTitleAr,
      iqamaNationalId: iqamaNationalId ?? this.iqamaNationalId,
      nationality: nationality ?? this.nationality,
      nationalityAr: nationalityAr ?? this.nationalityAr,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      joiningDate: joiningDate ?? this.joiningDate,
      employmentStatus: employmentStatus ?? this.employmentStatus,
      photoUrl: photoUrl ?? this.photoUrl,
      notes: notes ?? this.notes,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
      site: site ?? this.site,
      certificates: certificates ?? this.certificates,
    );
  }
}

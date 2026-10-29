class CertificateType {
  final String id;
  final String companyId;
  final String name;
  final String? nameAr;
  final String? issuingAuthority;
  final bool requiresExpiry;
  final int validityMonths;
  final int reminderDaysBefore;
  final bool isMandatory;
  final DateTime createdAt;
  final DateTime updatedAt;

  CertificateType({
    required this.id,
    required this.companyId,
    required this.name,
    this.nameAr,
    this.issuingAuthority,
    this.requiresExpiry = true,
    this.validityMonths = 12,
    this.reminderDaysBefore = 30,
    this.isMandatory = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CertificateType.fromJson(Map<String, dynamic> json) {
    return CertificateType(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      name: json['name'] as String,
      nameAr: json['name_ar'] as String?,
      issuingAuthority: json['issuing_authority'] as String?,
      requiresExpiry: json['requires_expiry'] as bool? ?? true,
      validityMonths: json['validity_months'] as int? ?? 12,
      reminderDaysBefore: json['reminder_days_before'] as int? ?? 30,
      isMandatory: json['is_mandatory'] as bool? ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'company_id': companyId,
      'name': name,
      'name_ar': nameAr,
      'issuing_authority': issuingAuthority,
      'requires_expiry': requiresExpiry,
      'validity_months': validityMonths,
      'reminder_days_before': reminderDaysBefore,
      'is_mandatory': isMandatory,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

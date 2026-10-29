class Site {
  final String id;
  final String companyId;
  final String name;
  final String? nameAr;
  final String? clientName;
  final String? locationCity;
  final String? codeReference;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Site({
    required this.id,
    required this.companyId,
    required this.name,
    this.nameAr,
    this.clientName,
    this.locationCity,
    this.codeReference,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Site.fromJson(Map<String, dynamic> json) {
    return Site(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      name: json['name'] as String,
      nameAr: json['name_ar'] as String?,
      clientName: json['client_name'] as String?,
      locationCity: json['location_city'] as String?,
      codeReference: json['code_reference'] as String?,
      isActive: json['is_active'] as bool? ?? true,
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
      'client_name': clientName,
      'location_city': locationCity,
      'code_reference': codeReference,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

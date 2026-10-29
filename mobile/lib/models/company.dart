class Company {
  final String id;
  final String name;
  final String? nameAr;
  final String? crNumber;
  final String? vatNumber;
  final String defaultLanguage; // 'en' | 'ar'
  final String timezone;
  final String? logoUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  Company({
    required this.id,
    required this.name,
    this.nameAr,
    this.crNumber,
    this.vatNumber,
    this.defaultLanguage = 'en',
    this.timezone = 'Asia/Riyadh',
    this.logoUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Company.fromJson(Map<String, dynamic> json) {
    return Company(
      id: json['id'] as String,
      name: json['name'] as String,
      nameAr: json['name_ar'] as String?,
      crNumber: json['cr_number'] as String?,
      vatNumber: json['vat_number'] as String?,
      defaultLanguage: json['default_language'] as String? ?? 'en',
      timezone: json['timezone'] as String? ?? 'Asia/Riyadh',
      logoUrl: json['logo_url'] as String?,
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
      'name': name,
      'name_ar': nameAr,
      'cr_number': crNumber,
      'vat_number': vatNumber,
      'default_language': defaultLanguage,
      'timezone': timezone,
      'logo_url': logoUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Company copyWith({
    String? name,
    String? nameAr,
    String? crNumber,
    String? vatNumber,
    String? defaultLanguage,
    String? timezone,
    String? logoUrl,
  }) {
    return Company(
      id: id,
      name: name ?? this.name,
      nameAr: nameAr ?? this.nameAr,
      crNumber: crNumber ?? this.crNumber,
      vatNumber: vatNumber ?? this.vatNumber,
      defaultLanguage: defaultLanguage ?? this.defaultLanguage,
      timezone: timezone ?? this.timezone,
      logoUrl: logoUrl ?? this.logoUrl,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}

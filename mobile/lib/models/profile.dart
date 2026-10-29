enum UserRole {
  owner,
  manager,
  viewer;

  static UserRole fromString(String role) {
    switch (role.toLowerCase()) {
      case 'owner':
        return UserRole.owner;
      case 'manager':
        return UserRole.manager;
      case 'viewer':
      default:
        return UserRole.viewer;
    }
  }

  String toDbString() {
    return name;
  }
}

class Profile {
  final String id;
  final String email;
  final String fullName;
  final String? fullNameAr;
  final String? phone;
  final String? avatarUrl;
  final String preferredLanguage;
  final DateTime createdAt;
  final DateTime updatedAt;

  Profile({
    required this.id,
    required this.email,
    required this.fullName,
    this.fullNameAr,
    this.phone,
    this.avatarUrl,
    this.preferredLanguage = 'en',
    required this.createdAt,
    required this.updatedAt,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      email: json['email'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '',
      fullNameAr: json['full_name_ar'] as String?,
      phone: json['phone'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      preferredLanguage: json['preferred_language'] as String? ?? 'en',
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
      'email': email,
      'full_name': fullName,
      'full_name_ar': fullNameAr,
      'phone': phone,
      'avatar_url': avatarUrl,
      'preferred_language': preferredLanguage,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class CompanyMember {
  final String id;
  final String companyId;
  final String? userId;
  final UserRole role;
  final bool isActive;
  final String? invitedEmail;
  final DateTime? joinedAt;
  final DateTime createdAt;
  final Profile? user;

  CompanyMember({
    required this.id,
    required this.companyId,
    this.userId,
    required this.role,
    this.isActive = true,
    this.invitedEmail,
    this.joinedAt,
    required this.createdAt,
    this.user,
  });

  factory CompanyMember.fromJson(Map<String, dynamic> json) {
    return CompanyMember(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      userId: json['user_id'] as String?,
      role: UserRole.fromString(json['role'] as String? ?? 'viewer'),
      isActive: json['is_active'] as bool? ?? true,
      invitedEmail: json['invited_email'] as String?,
      joinedAt: json['joined_at'] != null
          ? DateTime.parse(json['joined_at'] as String)
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      user: json['user'] != null
          ? Profile.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }
}

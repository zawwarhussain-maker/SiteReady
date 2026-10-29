import 'profile.dart';

class AuditEvent {
  final String id;
  final String companyId;
  final String? userId;
  final String action;
  final String entityType;
  final String? entityId;
  final Map<String, dynamic>? oldValues;
  final Map<String, dynamic>? newValues;
  final DateTime createdAt;
  final Profile? user;

  AuditEvent({
    required this.id,
    required this.companyId,
    this.userId,
    required this.action,
    required this.entityType,
    this.entityId,
    this.oldValues,
    this.newValues,
    required this.createdAt,
    this.user,
  });

  factory AuditEvent.fromJson(Map<String, dynamic> json) {
    return AuditEvent(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      userId: json['user_id'] as String?,
      action: json['action'] as String? ?? '',
      entityType: json['entity_type'] as String? ?? '',
      entityId: json['entity_id'] as String?,
      oldValues: json['old_values'] as Map<String, dynamic>?,
      newValues: json['new_values'] as Map<String, dynamic>?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      user: json['user'] != null
          ? Profile.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }
}

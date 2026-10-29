import 'profile.dart';

enum ActionPriority {
  low,
  medium,
  high,
  critical;

  static ActionPriority fromString(String priority) {
    switch (priority.toLowerCase()) {
      case 'low':
        return ActionPriority.low;
      case 'medium':
        return ActionPriority.medium;
      case 'high':
        return ActionPriority.high;
      case 'critical':
      default:
        return ActionPriority.critical;
    }
  }

  String toDbString() {
    return name;
  }
}

enum ActionStatus {
  open,
  inProgress,
  resolved,
  verifiedClosed;

  static ActionStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'open':
        return ActionStatus.open;
      case 'in_progress':
      case 'inprogress':
        return ActionStatus.inProgress;
      case 'resolved':
        return ActionStatus.resolved;
      case 'verified_closed':
      case 'verifiedclosed':
      default:
        return ActionStatus.verifiedClosed;
    }
  }

  String toDbString() {
    switch (this) {
      case ActionStatus.open:
        return 'open';
      case ActionStatus.inProgress:
        return 'in_progress';
      case ActionStatus.resolved:
        return 'resolved';
      case ActionStatus.verifiedClosed:
        return 'verified_closed';
    }
  }
}

class CorrectiveAction {
  final String id;
  final String companyId;
  final String? inspectionId;
  final String? inspectionItemId;
  final String title;
  final String? titleAr;
  final String? description;
  final ActionPriority priority;
  final ActionStatus status;
  final String? assignedTo;
  final DateTime dueDate;
  final DateTime? resolvedAt;
  final String? resolutionNotes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Profile? assignee;

  CorrectiveAction({
    required this.id,
    required this.companyId,
    this.inspectionId,
    this.inspectionItemId,
    required this.title,
    this.titleAr,
    this.description,
    this.priority = ActionPriority.medium,
    this.status = ActionStatus.open,
    this.assignedTo,
    required this.dueDate,
    this.resolvedAt,
    this.resolutionNotes,
    required this.createdAt,
    required this.updatedAt,
    this.assignee,
  });

  bool get isOverdue {
    if (status == ActionStatus.resolved || status == ActionStatus.verifiedClosed) {
      return false;
    }
    final today = DateTime.now();
    return dueDate.isBefore(DateTime(today.year, today.month, today.day));
  }

  factory CorrectiveAction.fromJson(Map<String, dynamic> json) {
    return CorrectiveAction(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      inspectionId: json['inspection_id'] as String?,
      inspectionItemId: json['inspection_item_id'] as String?,
      title: json['title'] as String? ?? '',
      titleAr: json['title_ar'] as String?,
      description: json['description'] as String?,
      priority: ActionPriority.fromString(json['priority'] as String? ?? 'medium'),
      status: ActionStatus.fromString(json['status'] as String? ?? 'open'),
      assignedTo: json['assigned_to'] as String?,
      dueDate: json['due_date'] != null
          ? DateTime.parse(json['due_date'] as String)
          : DateTime.now().add(const Duration(days: 7)),
      resolvedAt: json['resolved_at'] != null
          ? DateTime.parse(json['resolved_at'] as String)
          : null,
      resolutionNotes: json['resolution_notes'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
      assignee: json['assignee'] != null
          ? Profile.fromJson(json['assignee'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'company_id': companyId,
      'inspection_id': inspectionId,
      'inspection_item_id': inspectionItemId,
      'title': title,
      'title_ar': titleAr,
      'description': description,
      'priority': priority.toDbString(),
      'status': status.toDbString(),
      'assigned_to': assignedTo,
      'due_date': dueDate.toIso8601String().substring(0, 10),
      'resolved_at': resolvedAt?.toIso8601String(),
      'resolution_notes': resolutionNotes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  CorrectiveAction copyWith({
    ActionStatus? status,
    DateTime? resolvedAt,
    String? resolutionNotes,
  }) {
    return CorrectiveAction(
      id: id,
      companyId: companyId,
      inspectionId: inspectionId,
      inspectionItemId: inspectionItemId,
      title: title,
      titleAr: titleAr,
      description: description,
      priority: priority,
      status: status ?? this.status,
      assignedTo: assignedTo,
      dueDate: dueDate,
      resolvedAt: resolvedAt ?? this.resolvedAt,
      resolutionNotes: resolutionNotes ?? this.resolutionNotes,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
      assignee: assignee,
    );
  }
}

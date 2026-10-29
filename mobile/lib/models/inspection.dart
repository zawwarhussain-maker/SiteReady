import 'site.dart';
import 'profile.dart';
import 'inspection_item.dart';
import 'corrective_action.dart';

enum InspectionStatus {
  draft,
  inProgress,
  completedPass,
  completedFail,
  cancelled;

  static InspectionStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return InspectionStatus.draft;
      case 'in_progress':
      case 'inprogress':
        return InspectionStatus.inProgress;
      case 'completed_pass':
      case 'completedpass':
        return InspectionStatus.completedPass;
      case 'completed_fail':
      case 'completedfail':
        return InspectionStatus.completedFail;
      case 'cancelled':
      default:
        return InspectionStatus.cancelled;
    }
  }

  String toDbString() {
    switch (this) {
      case InspectionStatus.draft:
        return 'draft';
      case InspectionStatus.inProgress:
        return 'in_progress';
      case InspectionStatus.completedPass:
        return 'completed_pass';
      case InspectionStatus.completedFail:
        return 'completed_fail';
      case InspectionStatus.cancelled:
        return 'cancelled';
    }
  }
}

class Inspection {
  final String id;
  final String companyId;
  final String siteId;
  final String title;
  final String? titleAr;
  final String inspectionType;
  final String? inspectorId;
  final DateTime scheduledDate;
  final DateTime? completedAt;
  final InspectionStatus status;
  final String? summaryNotes;
  final String? supervisorSignaturePath;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Site? site;
  final Profile? inspector;
  final List<InspectionItem> items;
  final List<CorrectiveAction> correctiveActions;

  Inspection({
    required this.id,
    required this.companyId,
    required this.siteId,
    required this.title,
    this.titleAr,
    this.inspectionType = 'Safety Audit',
    this.inspectorId,
    required this.scheduledDate,
    this.completedAt,
    this.status = InspectionStatus.draft,
    this.summaryNotes,
    this.supervisorSignaturePath,
    required this.createdAt,
    required this.updatedAt,
    this.site,
    this.inspector,
    this.items = const [],
    this.correctiveActions = const [],
  });

  int get passCount =>
      items.where((item) => item.result == CheckpointResult.pass).length;

  int get failCount =>
      items.where((item) => item.result == CheckpointResult.fail).length;

  int get naCount =>
      items.where((item) => item.result == CheckpointResult.na).length;

  int get evaluatedCount => passCount + failCount;

  double get scorePercentage {
    if (evaluatedCount == 0) return 0.0;
    return (passCount / evaluatedCount) * 100.0;
  }

  bool get isPassing {
    // Saudi / Aramco Standard: 100% required on mandatory checkpoints, or 0 fails
    return failCount == 0 && passCount > 0;
  }

  factory Inspection.fromJson(Map<String, dynamic> json) {
    return Inspection(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      siteId: json['site_id'] as String,
      title: json['title'] as String? ?? '',
      titleAr: json['title_ar'] as String?,
      inspectionType: json['inspection_type'] as String? ?? 'General Safety',
      inspectorId: json['inspector_id'] as String?,
      scheduledDate: json['scheduled_date'] != null
          ? DateTime.parse(json['scheduled_date'] as String)
          : DateTime.now(),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      status: InspectionStatus.fromString(json['status'] as String? ?? 'draft'),
      summaryNotes: json['summary_notes'] as String?,
      supervisorSignaturePath: json['supervisor_signature_path'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
      site: json['site'] != null
          ? Site.fromJson(json['site'] as Map<String, dynamic>)
          : null,
      inspector: json['inspector'] != null
          ? Profile.fromJson(json['inspector'] as Map<String, dynamic>)
          : null,
      items: json['items'] != null
          ? (json['items'] as List)
              .map((i) => InspectionItem.fromJson(i as Map<String, dynamic>))
              .toList()
          : [],
      correctiveActions: json['corrective_actions'] != null
          ? (json['corrective_actions'] as List)
              .map((a) => CorrectiveAction.fromJson(a as Map<String, dynamic>))
              .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'company_id': companyId,
      'site_id': siteId,
      'title': title,
      'title_ar': titleAr,
      'inspection_type': inspectionType,
      'inspector_id': inspectorId,
      'scheduled_date': scheduledDate.toIso8601String().substring(0, 10),
      'completed_at': completedAt?.toIso8601String(),
      'status': status.toDbString(),
      'summary_notes': summaryNotes,
      'supervisor_signature_path': supervisorSignaturePath,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Inspection copyWith({
    InspectionStatus? status,
    DateTime? completedAt,
    String? summaryNotes,
    String? supervisorSignaturePath,
    Site? site,
    Profile? inspector,
    List<InspectionItem>? items,
    List<CorrectiveAction>? correctiveActions,
  }) {
    return Inspection(
      id: id,
      companyId: companyId,
      siteId: siteId,
      title: title,
      titleAr: titleAr,
      inspectionType: inspectionType,
      inspectorId: inspectorId,
      scheduledDate: scheduledDate,
      completedAt: completedAt ?? this.completedAt,
      status: status ?? this.status,
      summaryNotes: summaryNotes ?? this.summaryNotes,
      supervisorSignaturePath: supervisorSignaturePath ?? this.supervisorSignaturePath,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
      site: site ?? this.site,
      inspector: inspector ?? this.inspector,
      items: items ?? this.items,
      correctiveActions: correctiveActions ?? this.correctiveActions,
    );
  }
}

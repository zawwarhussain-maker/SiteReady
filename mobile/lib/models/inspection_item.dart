enum CheckpointResult {
  pass,
  fail,
  na;

  static CheckpointResult fromString(String result) {
    switch (result.toLowerCase()) {
      case 'pass':
        return CheckpointResult.pass;
      case 'fail':
        return CheckpointResult.fail;
      case 'na':
      case 'n/a':
      default:
        return CheckpointResult.na;
    }
  }

  String toDbString() {
    switch (this) {
      case CheckpointResult.pass:
        return 'pass';
      case CheckpointResult.fail:
        return 'fail';
      case CheckpointResult.na:
        return 'na';
    }
  }
}

class InspectionItem {
  final String id;
  final String inspectionId;
  final String category;
  final String itemText;
  final String? itemTextAr;
  final CheckpointResult result;
  final String? notes;
  final String? photoPath;
  final int sortOrder;

  InspectionItem({
    required this.id,
    required this.inspectionId,
    required this.category,
    required this.itemText,
    this.itemTextAr,
    this.result = CheckpointResult.na,
    this.notes,
    this.photoPath,
    this.sortOrder = 0,
  });

  factory InspectionItem.fromJson(Map<String, dynamic> json) {
    return InspectionItem(
      id: json['id'] as String,
      inspectionId: json['inspection_id'] as String,
      category: json['category'] as String? ?? 'General Safety',
      itemText: json['item_text'] as String? ?? '',
      itemTextAr: json['item_text_ar'] as String?,
      result: CheckpointResult.fromString(json['result'] as String? ?? 'na'),
      notes: json['notes'] as String?,
      photoPath: json['photo_path'] as String?,
      sortOrder: json['sort_order'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'inspection_id': inspectionId,
      'category': category,
      'item_text': itemText,
      'item_text_ar': itemTextAr,
      'result': result.toDbString(),
      'notes': notes,
      'photo_path': photoPath,
      'sort_order': sortOrder,
    };
  }

  InspectionItem copyWith({
    CheckpointResult? result,
    String? notes,
    String? photoPath,
  }) {
    return InspectionItem(
      id: id,
      inspectionId: inspectionId,
      category: category,
      itemText: itemText,
      itemTextAr: itemTextAr,
      result: result ?? this.result,
      notes: notes ?? this.notes,
      photoPath: photoPath ?? this.photoPath,
      sortOrder: sortOrder,
    );
  }
}

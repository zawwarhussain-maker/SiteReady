import '../models/inspection.dart';
import '../models/inspection_item.dart';
import '../models/corrective_action.dart';
import '../services/supabase_service.dart';
import '../services/auth_service.dart';

class InspectionRepository {
  final SupabaseService _db = SupabaseService.instance;
  final AuthService _auth = AuthService.instance;

  Future<List<Inspection>> getInspections({String? siteId}) async {
    return await _db.getInspections(siteId: siteId);
  }

  Future<List<CorrectiveAction>> getCorrectiveActions({String? siteId}) async {
    return await _db.getCorrectiveActions(siteId: siteId);
  }

  Future<Inspection> createInspection({
    required String siteId,
    required String title,
    String? titleAr,
    required String inspectionType,
    required DateTime scheduledDate,
  }) async {
    if (!_auth.canManageInspections()) {
      throw Exception('Unauthorized: Current role cannot schedule inspections');
    }

    final company = await _db.getCompany();
    final inspectionId = 'insp_${DateTime.now().millisecondsSinceEpoch}';

    // Standardized GCC Construction Safety Checkpoints
    final defaultItems = [
      InspectionItem(
        id: '${inspectionId}_1',
        inspectionId: inspectionId,
        category: 'PPE & Head Protection',
        itemText: 'Personnel wearing compliant safety helmets with fastened chinstraps',
        itemTextAr: 'التزام كافة العمال بارتداء الخوذات الواقية المعتمدة مع ربط حزام الذقن',
        result: CheckpointResult.na,
        sortOrder: 1,
      ),
      InspectionItem(
        id: '${inspectionId}_2',
        inspectionId: inspectionId,
        category: 'Working at Heights & Scaffolding',
        itemText: 'Working platforms fully planked, toe-boards fitted, green inspection tag valid',
        itemTextAr: 'المنصات مكتملة الألواح ومزودة بحواجز الحماية وبطاقة الفحص الخضراء سارية',
        result: CheckpointResult.na,
        sortOrder: 2,
      ),
      InspectionItem(
        id: '${inspectionId}_3',
        inspectionId: inspectionId,
        category: 'Electrical & Temporary Power',
        itemText: 'Weatherproof distribution boards fitted with operational 30mA RCD / ELCB breakers',
        itemTextAr: 'لوحات توزيع الكهرباء معزولة ومزودة بقواطع تفاضلية تعمل بكفاءة 30 ملي أمبير',
        result: CheckpointResult.na,
        sortOrder: 3,
      ),
      InspectionItem(
        id: '${inspectionId}_4',
        inspectionId: inspectionId,
        category: 'Lifting & Rigging Gear',
        itemText: 'Lifting slings and shackles inspected, color-coded for current quarter, certified',
        itemTextAr: 'أحزمة ومرابط الرفع مفحوصة ومرمزة بلون الربع الحالي ومصحوبة بشهادة معايرة',
        result: CheckpointResult.na,
        sortOrder: 4,
      ),
      InspectionItem(
        id: '${inspectionId}_5',
        inspectionId: inspectionId,
        category: 'Emergency & Fire Safety',
        itemText: 'Fire extinguishers inspected, unobstructed, emergency muster points signposted',
        itemTextAr: 'طفايات الحريق مفحوصة وخالية من العوائق مع وضوح لوحات نقاط التجمع',
        result: CheckpointResult.na,
        sortOrder: 5,
      ),
    ];

    final newInspection = Inspection(
      id: inspectionId,
      companyId: company.id,
      siteId: siteId,
      title: title.trim(),
      titleAr: titleAr?.trim(),
      inspectionType: inspectionType,
      inspectorId: _auth.currentUser?.id,
      scheduledDate: scheduledDate,
      status: InspectionStatus.draft,
      items: defaultItems,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    return await _db.createInspection(newInspection);
  }

  Future<Inspection> saveDraft({
    required Inspection inspection,
    required List<InspectionItem> updatedItems,
  }) async {
    final updated = inspection.copyWith(
      status: InspectionStatus.inProgress,
      items: updatedItems,
    );
    return await _db.updateInspection(updated);
  }

  Future<Inspection> completeInspection({
    required Inspection inspection,
    required List<InspectionItem> updatedItems,
    String? summaryNotes,
    String? signaturePath,
  }) async {
    if (!_auth.canManageInspections()) {
      throw Exception('Unauthorized: Current role cannot complete inspections');
    }

    final hasFailures = updatedItems.any((i) => i.result == CheckpointResult.fail);
    final finalStatus = hasFailures
        ? InspectionStatus.completedFail
        : InspectionStatus.completedPass;

    final updated = inspection.copyWith(
      status: finalStatus,
      completedAt: DateTime.now(),
      summaryNotes: summaryNotes,
      supervisorSignaturePath: signaturePath,
      items: updatedItems,
    );

    final saved = await _db.updateInspection(updated);

    // If violations/failures were found, automatically generate corrective action tickets
    if (hasFailures) {
      final failedItems = updatedItems.where((i) => i.result == CheckpointResult.fail);
      for (final item in failedItems) {
        await _db.createCorrectiveAction(
          CorrectiveAction(
            id: 'capa_${DateTime.now().millisecondsSinceEpoch}_${item.sortOrder}',
            companyId: inspection.companyId,
            inspectionId: inspection.id,
            inspectionItemId: item.id,
            title: 'Rectify violation: ${item.category}',
            titleAr: 'معالجة مخالفة: ${item.category}',
            description: item.notes ?? item.itemText,
            priority: ActionPriority.high,
            status: ActionStatus.open,
            dueDate: DateTime.now().add(const Duration(days: 3)),
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          ),
        );
      }
    }

    return saved;
  }

  Future<CorrectiveAction> resolveAction({
    required String actionId,
    required String resolutionNotes,
  }) async {
    if (!_auth.canManageInspections()) {
      throw Exception('Unauthorized: Current role cannot resolve corrective actions');
    }
    return await _db.resolveCorrectiveAction(
      actionId: actionId,
      resolutionNotes: resolutionNotes,
    );
  }

  Future<void> deleteInspection(String id) async {
    if (!_auth.canDeleteRecords()) {
      throw Exception('Unauthorized: Only Owners can delete inspection audits');
    }
    await _db.deleteInspection(id);
  }
}

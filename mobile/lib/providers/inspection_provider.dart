import 'package:flutter/material.dart';
import '../models/inspection.dart';
import '../models/inspection_item.dart';
import '../models/corrective_action.dart';
import '../repositories/inspection_repository.dart';

class InspectionProvider extends ChangeNotifier {
  final InspectionRepository _repo = InspectionRepository();

  List<Inspection> _inspections = [];
  List<CorrectiveAction> _correctiveActions = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Inspection> get inspections => _inspections;
  List<CorrectiveAction> get correctiveActions => _correctiveActions;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  List<CorrectiveAction> get openActions => _correctiveActions
      .where((a) => a.status == ActionStatus.open || a.status == ActionStatus.inProgress)
      .toList();

  Future<void> fetchInspections({String? siteId}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _inspections = await _repo.getInspections(siteId: siteId);
      _correctiveActions = await _repo.getCorrectiveActions(siteId: siteId);
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createInspection({
    required String siteId,
    required String title,
    String? titleAr,
    required String inspectionType,
    required DateTime scheduledDate,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final created = await _repo.createInspection(
        siteId: siteId,
        title: title,
        titleAr: titleAr,
        inspectionType: inspectionType,
        scheduledDate: scheduledDate,
      );
      _inspections.insert(0, created);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> saveDraftInspection({
    required Inspection inspection,
    required List<InspectionItem> items,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final saved = await _repo.saveDraft(
        inspection: inspection,
        updatedItems: items,
      );
      final index = _inspections.indexWhere((i) => i.id == saved.id);
      if (index != -1) _inspections[index] = saved;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> completeInspection({
    required Inspection inspection,
    required List<InspectionItem> items,
    String? summaryNotes,
    String? signaturePath,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final completed = await _repo.completeInspection(
        inspection: inspection,
        updatedItems: items,
        summaryNotes: summaryNotes,
        signaturePath: signaturePath,
      );
      final index = _inspections.indexWhere((i) => i.id == completed.id);
      if (index != -1) _inspections[index] = completed;

      // Re-fetch corrective actions as new CAPA tickets may have been created
      _correctiveActions = await _repo.getCorrectiveActions();

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> resolveAction({
    required String actionId,
    required String resolutionNotes,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final resolved = await _repo.resolveAction(
        actionId: actionId,
        resolutionNotes: resolutionNotes,
      );
      final index = _correctiveActions.indexWhere((a) => a.id == resolved.id);
      if (index != -1) _correctiveActions[index] = resolved;

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteInspection(String id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _repo.deleteInspection(id);
      _inspections.removeWhere((i) => i.id == id);
      _correctiveActions.removeWhere((a) => a.inspectionId == id);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}

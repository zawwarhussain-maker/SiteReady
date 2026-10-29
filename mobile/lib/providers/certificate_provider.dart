import 'package:flutter/material.dart';
import '../models/certificate.dart';
import '../models/certificate_type.dart';
import '../repositories/certificate_repository.dart';

class CertificateProvider extends ChangeNotifier {
  final CertificateRepository _repo = CertificateRepository();

  List<EmployeeCertificate> _certificates = [];
  List<CertificateType> _certificateTypes = [];
  bool _isLoading = false;
  CertificateStatus? _statusFilter;
  String _searchQuery = '';
  String? _errorMessage;

  List<EmployeeCertificate> get certificates => _certificates;
  List<CertificateType> get certificateTypes => _certificateTypes;
  bool get isLoading => _isLoading;
  CertificateStatus? get statusFilter => _statusFilter;
  String get searchQuery => _searchQuery;
  String? get errorMessage => _errorMessage;

  List<EmployeeCertificate> get expiringSoonCertificates =>
      _certificates.where((c) => c.status == CertificateStatus.expiringSoon).toList();

  List<EmployeeCertificate> get expiredCertificates =>
      _certificates.where((c) => c.status == CertificateStatus.expired).toList();

  Future<void> fetchCertificates({String? siteId}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _certificateTypes = await _repo.getCertificateTypes();
      _certificates = await _repo.getCertificates(
        siteId: siteId,
        statusFilter: _statusFilter,
        search: _searchQuery,
      );
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setStatusFilter(CertificateStatus? status, {String? siteId}) {
    _statusFilter = status;
    fetchCertificates(siteId: siteId);
  }

  void setSearchQuery(String query, {String? siteId}) {
    _searchQuery = query;
    fetchCertificates(siteId: siteId);
  }

  Future<bool> createCertificate({
    required String employeeId,
    required String certificateTypeId,
    required String licenseNumber,
    required DateTime issueDate,
    DateTime? expiryDate,
    String? attachmentPath,
    String? attachmentFilename,
    String? notes,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final created = await _repo.createCertificate(
        employeeId: employeeId,
        certificateTypeId: certificateTypeId,
        licenseNumber: licenseNumber,
        issueDate: issueDate,
        expiryDate: expiryDate,
        attachmentPath: attachmentPath,
        attachmentFilename: attachmentFilename,
        notes: notes,
      );
      _certificates.insert(0, created);
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

  Future<bool> renewCertificate({
    required String certificateId,
    required DateTime newExpiryDate,
    String? notes,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final renewed = await _repo.renewCertificate(
        certificateId: certificateId,
        newExpiryDate: newExpiryDate,
        notes: notes,
      );
      final index = _certificates.indexWhere((c) => c.id == renewed.id);
      if (index != -1) {
        _certificates[index] = renewed;
      }
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

  Future<bool> deleteCertificate(String id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _repo.deleteCertificate(id);
      _certificates.removeWhere((c) => c.id == id);
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

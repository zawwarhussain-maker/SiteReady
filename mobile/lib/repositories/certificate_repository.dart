import '../models/certificate.dart';
import '../models/certificate_type.dart';
import '../services/supabase_service.dart';
import '../services/auth_service.dart';
import '../services/expiry_service.dart';

class CertificateRepository {
  final SupabaseService _db = SupabaseService.instance;
  final AuthService _auth = AuthService.instance;

  Future<List<EmployeeCertificate>> getCertificates({
    String? siteId,
    CertificateStatus? statusFilter,
    String? search,
  }) async {
    return await _db.getCertificates(
      siteId: siteId,
      statusFilter: statusFilter,
      search: search,
    );
  }

  Future<List<CertificateType>> getCertificateTypes() async {
    return await _db.getCertificateTypes();
  }

  Future<EmployeeCertificate> createCertificate({
    required String employeeId,
    required String certificateTypeId,
    required String licenseNumber,
    required DateTime issueDate,
    DateTime? expiryDate,
    String? attachmentPath,
    String? attachmentFilename,
    String? notes,
  }) async {
    if (!_auth.canManageCertificates()) {
      throw Exception('Unauthorized: Current role cannot add certificates');
    }

    final company = await _db.getCompany();
    final certTypes = await _db.getCertificateTypes();
    final certType = certTypes.firstWhere(
      (t) => t.id == certificateTypeId,
      orElse: () => CertificateType(
        id: certificateTypeId,
        companyId: company.id,
        name: 'General Safety',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    );

    final status = ExpiryService.calculateStatus(
      expiryDate: expiryDate,
      requiresExpiry: certType.requiresExpiry,
    );

    final newCert = EmployeeCertificate(
      id: 'cert_${DateTime.now().millisecondsSinceEpoch}',
      companyId: company.id,
      employeeId: employeeId,
      certificateTypeId: certificateTypeId,
      licenseNumber: licenseNumber.trim(),
      issueDate: issueDate,
      expiryDate: expiryDate,
      attachmentPath: attachmentPath,
      attachmentFilename: attachmentFilename,
      status: status,
      notes: notes,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    return await _db.createCertificate(newCert);
  }

  Future<EmployeeCertificate> renewCertificate({
    required String certificateId,
    required DateTime newExpiryDate,
    String? notes,
  }) async {
    if (!_auth.canManageCertificates()) {
      throw Exception('Unauthorized: Current role cannot renew certificates');
    }

    final userName = _auth.currentUser?.fullName ?? 'Safety Manager';
    return await _db.renewCertificate(
      certificateId: certificateId,
      newExpiryDate: newExpiryDate,
      renewedByName: userName,
      notes: notes,
    );
  }

  Future<void> deleteCertificate(String id) async {
    if (!_auth.canDeleteRecords()) {
      throw Exception('Unauthorized: Only Owners can delete certificate records');
    }
    await _db.deleteCertificate(id);
  }
}

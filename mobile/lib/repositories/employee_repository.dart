import '../models/employee.dart';
import '../services/supabase_service.dart';
import '../services/auth_service.dart';
import '../config/constants.dart';

class EmployeeRepository {
  final SupabaseService _db = SupabaseService.instance;
  final AuthService _auth = AuthService.instance;

  Future<List<Employee>> getEmployees({String? siteId, String? search}) async {
    return await _db.getEmployees(siteId: siteId, search: search);
  }

  Future<Employee?> getEmployeeById(String id) async {
    return await _db.getEmployeeById(id);
  }

  Future<Employee> createEmployee({
    required String employeeNo,
    required String fullName,
    String? fullNameAr,
    required String jobTitle,
    String? jobTitleAr,
    required String iqamaNationalId,
    required String nationality,
    String? nationalityAr,
    String? phone,
    String? email,
    String? siteId,
    DateTime? joiningDate,
    EmploymentStatus status = EmploymentStatus.active,
  }) async {
    if (!_auth.canManageEmployees()) {
      throw Exception('Unauthorized: Current role cannot create employee records');
    }

    // Saudi Iqama / National ID 10-digit validation check
    final trimmedId = iqamaNationalId.trim();
    if (!AppConstants.saudiIdRegex.hasMatch(trimmedId)) {
      throw ArgumentError(
        'Invalid Saudi ID: Must be exactly 10 digits starting with 1 (Citizen) or 2 (Resident / Iqama)',
      );
    }

    final company = await _db.getCompany();
    final newEmployee = Employee(
      id: 'emp_${DateTime.now().millisecondsSinceEpoch}',
      companyId: company.id,
      siteId: siteId,
      employeeNo: employeeNo.trim(),
      fullName: fullName.trim(),
      fullNameAr: fullNameAr?.trim(),
      jobTitle: jobTitle.trim(),
      jobTitleAr: jobTitleAr?.trim(),
      iqamaNationalId: trimmedId,
      nationality: nationality.trim(),
      nationalityAr: nationalityAr?.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      joiningDate: joiningDate ?? DateTime.now(),
      employmentStatus: status,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    return await _db.createEmployee(newEmployee);
  }

  Future<Employee> updateEmployee(Employee employee) async {
    if (!_auth.canManageEmployees()) {
      throw Exception('Unauthorized: Current role cannot update employee records');
    }

    // Validate Iqama
    final trimmedId = employee.iqamaNationalId.trim();
    if (!AppConstants.saudiIdRegex.hasMatch(trimmedId)) {
      throw ArgumentError(
        'Invalid Saudi ID: Must be exactly 10 digits starting with 1 or 2',
      );
    }

    return await _db.updateEmployee(employee.copyWith(iqamaNationalId: trimmedId));
  }

  Future<void> deleteEmployee(String id) async {
    if (!_auth.canDeleteRecords()) {
      throw Exception('Unauthorized: Only Owners can delete workforce records');
    }
    await _db.deleteEmployee(id);
  }
}

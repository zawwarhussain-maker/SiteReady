import 'package:flutter/material.dart';
import '../models/employee.dart';
import '../repositories/employee_repository.dart';

class EmployeeProvider extends ChangeNotifier {
  final EmployeeRepository _repo = EmployeeRepository();

  List<Employee> _employees = [];
  bool _isLoading = false;
  String _searchQuery = '';
  String? _errorMessage;

  List<Employee> get employees => _employees;
  bool get isLoading => _isLoading;
  String get searchQuery => _searchQuery;
  String? get errorMessage => _errorMessage;

  Future<void> fetchEmployees({String? siteId}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _employees = await _repo.getEmployees(
        siteId: siteId,
        search: _searchQuery,
      );
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setSearchQuery(String query, {String? siteId}) {
    _searchQuery = query;
    fetchEmployees(siteId: siteId);
  }

  Future<Employee?> getEmployeeById(String id) async {
    return await _repo.getEmployeeById(id);
  }

  Future<bool> createEmployee({
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
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final created = await _repo.createEmployee(
        employeeNo: employeeNo,
        fullName: fullName,
        fullNameAr: fullNameAr,
        jobTitle: jobTitle,
        jobTitleAr: jobTitleAr,
        iqamaNationalId: iqamaNationalId,
        nationality: nationality,
        nationalityAr: nationalityAr,
        phone: phone,
        email: email,
        siteId: siteId,
        joiningDate: joiningDate,
        status: status,
      );
      _employees.insert(0, created);
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

  Future<bool> updateEmployee(Employee employee) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final updated = await _repo.updateEmployee(employee);
      final index = _employees.indexWhere((e) => e.id == updated.id);
      if (index != -1) {
        _employees[index] = updated;
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

  Future<bool> deleteEmployee(String id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _repo.deleteEmployee(id);
      _employees.removeWhere((e) => e.id == id);
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

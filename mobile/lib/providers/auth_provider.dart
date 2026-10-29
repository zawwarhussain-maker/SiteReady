import 'package:flutter/material.dart';
import '../models/profile.dart';
import '../models/company.dart';
import '../models/site.dart';
import '../services/auth_service.dart';
import '../repositories/company_repository.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService.instance;
  final CompanyRepository _companyRepo = CompanyRepository();

  Profile? _currentUser;
  UserRole _role = UserRole.owner;
  Company? _company;
  List<Site> _sites = [];
  String _selectedSiteId = 'all';
  bool _isLoading = true;

  Profile? get currentUser => _currentUser;
  UserRole get role => _role;
  Company? get company => _company;
  List<Site> get sites => _sites;
  String get selectedSiteId => _selectedSiteId;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;

  Site? get selectedSite {
    if (_selectedSiteId == 'all') return null;
    try {
      return _sites.firstWhere((s) => s.id == _selectedSiteId);
    } catch (_) {
      return null;
    }
  }

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    await _authService.initialize();
    _currentUser = _authService.currentUser;
    _role = _authService.currentRole;

    try {
      _company = await _companyRepo.getCompany();
      _sites = await _companyRepo.getSites();
    } catch (e) {
      debugPrint('Error loading company data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setSelectedSite(String siteId) {
    _selectedSiteId = siteId;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    final success = await _authService.signIn(email, password);
    if (success) {
      _currentUser = _authService.currentUser;
      _role = _authService.currentRole;
      _company = await _companyRepo.getCompany();
      _sites = await _companyRepo.getSites();
    }

    _isLoading = false;
    notifyListeners();
    return success;
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    await _authService.signOut();
    _currentUser = null;

    _isLoading = false;
    notifyListeners();
  }

  Future<void> switchRole(UserRole newRole) async {
    await _authService.switchRole(newRole);
    _role = newRole;
    notifyListeners();
  }

  Future<void> onboardCompany({
    required String name,
    String? nameAr,
    required String crNumber,
    required String defaultLanguage,
    required String initialSiteName,
  }) async {
    _isLoading = true;
    notifyListeners();

    await _companyRepo.onboardCompany(
      name: name,
      nameAr: nameAr,
      crNumber: crNumber,
      defaultLanguage: defaultLanguage,
      initialSiteName: initialSiteName,
    );

    _company = await _companyRepo.getCompany();
    _sites = await _companyRepo.getSites();

    _isLoading = false;
    notifyListeners();
  }

  // Permission helpers
  bool get canManageCompany => _authService.canManageCompany();
  bool get canManageUsers => _authService.canManageUsers();
  bool get canManageSites => _authService.canManageSites();
  bool get canManageEmployees => _authService.canManageEmployees();
  bool get canManageCertificates => _authService.canManageCertificates();
  bool get canManageInspections => _authService.canManageInspections();
  bool get canDeleteRecords => _authService.canDeleteRecords();
}

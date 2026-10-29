import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/supabase_config.dart';
import '../models/company.dart';
import '../models/site.dart';
import '../models/employee.dart';
import '../models/certificate_type.dart';
import '../models/certificate.dart';
import '../models/inspection.dart';
import '../models/inspection_item.dart';
import '../models/corrective_action.dart';
import '../models/subscription.dart';
import '../models/dashboard_metrics.dart';
import '../services/expiry_service.dart';

class SupabaseService {
  static final SupabaseService instance = SupabaseService._internal();
  SupabaseService._internal();

  // In-memory cache & fallback data
  Company? _company;
  List<Site> _sites = [];
  List<CertificateType> _certTypes = [];
  List<Employee> _employees = [];
  List<EmployeeCertificate> _certificates = [];
  List<Inspection> _inspections = [];
  List<CorrectiveAction> _correctiveActions = [];
  Subscription? _subscription;
  Subscription? get subscription => _subscription;
  bool _isInitialized = false;

  bool get isLiveMode => SupabaseConfig.isConfigured && SupabaseConfig.client != null;

  Future<void> initializeData() async {
    if (_isInitialized) return;

    if (isLiveMode) {
      try {
        await _fetchFromSupabase();
        _isInitialized = true;
        return;
      } catch (e) {
        debugPrint('Supabase initial fetch failed: $e. Using local data store.');
      }
    }

    await _loadFromLocalOrSeed();
    _isInitialized = true;
  }

  // -------------------------
  // COMPANY
  // -------------------------
  Future<Company> getCompany() async {
    await initializeData();
    return _company!;
  }

  Future<Company> updateCompany(Map<String, dynamic> updates) async {
    await initializeData();
    _company = _company!.copyWith(
      name: updates['name'] as String?,
      nameAr: updates['name_ar'] as String?,
      crNumber: updates['cr_number'] as String?,
      vatNumber: updates['vat_number'] as String?,
      defaultLanguage: updates['default_language'] as String?,
      timezone: updates['timezone'] as String?,
    );
    await _saveLocal();
    return _company!;
  }

  // -------------------------
  // SITES
  // -------------------------
  Future<List<Site>> getSites() async {
    await initializeData();
    return List.unmodifiable(_sites);
  }

  Future<Site> createSite(String name, {String? nameAr, String? clientName, String? locationCity}) async {
    await initializeData();
    final newSite = Site(
      id: 'site_${DateTime.now().millisecondsSinceEpoch}',
      companyId: _company!.id,
      name: name,
      nameAr: nameAr,
      clientName: clientName,
      locationCity: locationCity,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    _sites.add(newSite);
    await _saveLocal();
    return newSite;
  }

  // -------------------------
  // CERTIFICATE TYPES
  // -------------------------
  Future<List<CertificateType>> getCertificateTypes() async {
    await initializeData();
    return List.unmodifiable(_certTypes);
  }

  // -------------------------
  // EMPLOYEES
  // -------------------------
  Future<List<Employee>> getEmployees({String? siteId, String? search}) async {
    await initializeData();
    var list = _employees.map((e) {
      // Re-attach populated certificates
      final certs = _certificates.where((c) => c.employeeId == e.id).toList();
      final site = _sites.cast<Site?>().firstWhere((s) => s?.id == e.siteId, orElse: () => null);
      return e.copyWith(certificates: certs, site: site);
    }).toList();

    if (siteId != null && siteId != 'all') {
      list = list.where((e) => e.siteId == siteId).toList();
    }

    if (search != null && search.trim().isNotEmpty) {
      final q = search.trim().toLowerCase();
      list = list.where((e) {
        return e.fullName.toLowerCase().contains(q) ||
            (e.fullNameAr?.toLowerCase().contains(q) ?? false) ||
            e.employeeNo.toLowerCase().contains(q) ||
            e.iqamaNationalId.contains(q) ||
            e.jobTitle.toLowerCase().contains(q);
      }).toList();
    }

    return list;
  }

  Future<Employee?> getEmployeeById(String id) async {
    await initializeData();
    try {
      final emp = _employees.firstWhere((e) => e.id == id);
      final certs = _certificates.where((c) => c.employeeId == id).map((c) {
        final ct = _certTypes.cast<CertificateType?>().firstWhere(
            (t) => t?.id == c.certificateTypeId,
            orElse: () => null);
        return c.copyWith(certificateType: ct);
      }).toList();
      final site = _sites.cast<Site?>().firstWhere((s) => s?.id == emp.siteId, orElse: () => null);
      return emp.copyWith(certificates: certs, site: site);
    } catch (_) {
      return null;
    }
  }

  Future<Employee> createEmployee(Employee employee) async {
    await initializeData();
    _employees.add(employee);
    await _saveLocal();
    return employee;
  }

  Future<Employee> updateEmployee(Employee employee) async {
    await initializeData();
    final index = _employees.indexWhere((e) => e.id == employee.id);
    if (index != -1) {
      _employees[index] = employee;
      await _saveLocal();
    }
    return employee;
  }

  Future<void> deleteEmployee(String id) async {
    await initializeData();
    _employees.removeWhere((e) => e.id == id);
    _certificates.removeWhere((c) => c.employeeId == id);
    await _saveLocal();
  }

  // -------------------------
  // CERTIFICATES
  // -------------------------
  Future<List<EmployeeCertificate>> getCertificates({
    String? siteId,
    CertificateStatus? statusFilter,
    String? search,
  }) async {
    await initializeData();
    var list = _certificates.map((c) {
      final ct = _certTypes.cast<CertificateType?>().firstWhere(
          (t) => t?.id == c.certificateTypeId,
          orElse: () => null);
      final emp = _employees.cast<Employee?>().firstWhere(
          (e) => e?.id == c.employeeId,
          orElse: () => null);
      return c.copyWith(certificateType: ct, employee: emp);
    }).toList();

    if (siteId != null && siteId != 'all') {
      list = list.where((c) => c.employee?.siteId == siteId).toList();
    }

    if (statusFilter != null) {
      list = list.where((c) => c.status == statusFilter).toList();
    }

    if (search != null && search.trim().isNotEmpty) {
      final q = search.trim().toLowerCase();
      list = list.where((c) {
        return c.licenseNumber.toLowerCase().contains(q) ||
            (c.employee?.fullName.toLowerCase().contains(q) ?? false) ||
            (c.certificateType?.name.toLowerCase().contains(q) ?? false);
      }).toList();
    }

    return list;
  }

  Future<EmployeeCertificate> createCertificate(EmployeeCertificate certificate) async {
    await initializeData();
    _certificates.add(certificate);
    await _saveLocal();
    return certificate;
  }

  Future<EmployeeCertificate> updateCertificate(EmployeeCertificate certificate) async {
    await initializeData();
    final index = _certificates.indexWhere((c) => c.id == certificate.id);
    if (index != -1) {
      _certificates[index] = certificate;
      await _saveLocal();
    }
    return certificate;
  }

  Future<void> deleteCertificate(String id) async {
    await initializeData();
    _certificates.removeWhere((c) => c.id == id);
    await _saveLocal();
  }

  Future<EmployeeCertificate> renewCertificate({
    required String certificateId,
    required DateTime newExpiryDate,
    required String renewedByName,
    String? notes,
  }) async {
    await initializeData();
    final index = _certificates.indexWhere((c) => c.id == certificateId);
    if (index == -1) throw Exception('Certificate not found');

    final cert = _certificates[index];
    final historyRecord = CertificateRenewalRecord(
      id: 'ren_${DateTime.now().millisecondsSinceEpoch}',
      certificateId: cert.id,
      previousExpiryDate: cert.expiryDate,
      newExpiryDate: newExpiryDate,
      renewedAt: DateTime.now(),
      renewedByName: renewedByName,
      notes: notes,
    );

    final newStatus = ExpiryService.calculateStatus(
      expiryDate: newExpiryDate,
      requiresExpiry: cert.certificateType?.requiresExpiry ?? true,
    );

    final updated = cert.copyWith(
      expiryDate: newExpiryDate,
      status: newStatus,
      renewalHistory: [...cert.renewalHistory, historyRecord],
    );

    _certificates[index] = updated;
    await _saveLocal();
    return updated;
  }

  // -------------------------
  // INSPECTIONS
  // -------------------------
  Future<List<Inspection>> getInspections({String? siteId}) async {
    await initializeData();
    var list = _inspections.map((i) {
      final site = _sites.cast<Site?>().firstWhere((s) => s?.id == i.siteId, orElse: () => null);
      final capas = _correctiveActions.where((a) => a.inspectionId == i.id).toList();
      return i.copyWith(site: site, correctiveActions: capas);
    }).toList();

    if (siteId != null && siteId != 'all') {
      list = list.where((i) => i.siteId == siteId).toList();
    }

    return list;
  }

  Future<Inspection> createInspection(Inspection inspection) async {
    await initializeData();
    _inspections.add(inspection);
    await _saveLocal();
    return inspection;
  }

  Future<Inspection> updateInspection(Inspection inspection) async {
    await initializeData();
    final index = _inspections.indexWhere((i) => i.id == inspection.id);
    if (index != -1) {
      _inspections[index] = inspection;
      await _saveLocal();
    }
    return inspection;
  }

  Future<void> deleteInspection(String id) async {
    await initializeData();
    _inspections.removeWhere((i) => i.id == id);
    _correctiveActions.removeWhere((a) => a.inspectionId == id);
    await _saveLocal();
  }

  // -------------------------
  // CORRECTIVE ACTIONS (CAPA)
  // -------------------------
  Future<List<CorrectiveAction>> getCorrectiveActions({String? siteId}) async {
    await initializeData();
    return List.unmodifiable(_correctiveActions);
  }

  Future<CorrectiveAction> createCorrectiveAction(CorrectiveAction action) async {
    await initializeData();
    _correctiveActions.add(action);
    await _saveLocal();
    return action;
  }

  Future<CorrectiveAction> resolveCorrectiveAction({
    required String actionId,
    required String resolutionNotes,
  }) async {
    await initializeData();
    final index = _correctiveActions.indexWhere((a) => a.id == actionId);
    if (index == -1) throw Exception('Corrective action not found');

    final updated = _correctiveActions[index].copyWith(
      status: ActionStatus.resolved,
      resolvedAt: DateTime.now(),
      resolutionNotes: resolutionNotes,
    );
    _correctiveActions[index] = updated;
    await _saveLocal();
    return updated;
  }

  // -------------------------
  // METRICS
  // -------------------------
  Future<DashboardMetrics> getMetrics({String? siteId}) async {
    final emps = await getEmployees(siteId: siteId);
    final certs = await getCertificates(siteId: siteId);
    final insps = await getInspections(siteId: siteId);
    final actions = await getCorrectiveActions(siteId: siteId);

    final totalEmployees = emps.length;
    final validCerts = certs.where((c) => c.status == CertificateStatus.valid).length;
    final expiringCerts = certs.where((c) => c.status == CertificateStatus.expiringSoon).length;
    final expiredCerts = certs.where((c) => c.status == CertificateStatus.expired).length;
    
    final overdueInsps = insps.where((i) {
      if (i.status == InspectionStatus.completedPass || i.status == InspectionStatus.completedFail) return false;
      return i.scheduledDate.isBefore(DateTime.now());
    }).length;

    final openActions = actions.where((a) => a.status == ActionStatus.open || a.status == ActionStatus.inProgress).length;

    final totalEvaluatedCerts = validCerts + expiringCerts + expiredCerts;
    final complianceRate = totalEvaluatedCerts > 0
        ? ((validCerts + expiringCerts) / totalEvaluatedCerts) * 100.0
        : 100.0;

    return DashboardMetrics(
      totalEmployees: totalEmployees,
      validCertificates: validCerts,
      expiringCertificates: expiringCerts,
      expiredCertificates: expiredCerts,
      overdueInspections: overdueInsps,
      openCorrectiveActions: openActions,
      complianceRate: double.parse(complianceRate.toStringAsFixed(1)),
    );
  }

  // -------------------------
  // SEED & PERSISTENCE
  // -------------------------
  Future<void> _fetchFromSupabase() async {
    final client = SupabaseConfig.client!;
    final companyRes = await client.from('companies').select().single();
    _company = Company.fromJson(companyRes);

    final sitesRes = await client.from('sites').select();
    _sites = (sitesRes as List).map((s) => Site.fromJson(s)).toList();

    final certTypesRes = await client.from('certificate_types').select();
    _certTypes = (certTypesRes as List).map((t) => CertificateType.fromJson(t)).toList();

    final empsRes = await client.from('employees').select('*, certificates:employee_certificates(*)');
    _employees = (empsRes as List).map((e) => Employee.fromJson(e)).toList();

    final certsRes = await client.from('employee_certificates').select();
    _certificates = (certsRes as List).map((c) => EmployeeCertificate.fromJson(c)).toList();

    final inspsRes = await client.from('inspections').select('*, items:inspection_items(*), corrective_actions(*)');
    _inspections = (inspsRes as List).map((i) => Inspection.fromJson(i)).toList();

    final actionsRes = await client.from('corrective_actions').select();
    _correctiveActions = (actionsRes as List).map((a) => CorrectiveAction.fromJson(a)).toList();
  }

  Future<void> _loadFromLocalOrSeed() async {
    final prefs = await SharedPreferences.getInstance();
    final rawCompany = prefs.getString('sr_company');

    if (rawCompany != null) {
      try {
        _company = Company.fromJson(jsonDecode(rawCompany));
        _sites = (jsonDecode(prefs.getString('sr_sites') ?? '[]') as List).map((s) => Site.fromJson(s)).toList();
        _certTypes = (jsonDecode(prefs.getString('sr_cert_types') ?? '[]') as List).map((t) => CertificateType.fromJson(t)).toList();
        _employees = (jsonDecode(prefs.getString('sr_employees') ?? '[]') as List).map((e) => Employee.fromJson(e)).toList();
        _certificates = (jsonDecode(prefs.getString('sr_certificates') ?? '[]') as List).map((c) => EmployeeCertificate.fromJson(c)).toList();
        _inspections = (jsonDecode(prefs.getString('sr_inspections') ?? '[]') as List).map((i) => Inspection.fromJson(i)).toList();
        _correctiveActions = (jsonDecode(prefs.getString('sr_corrective_actions') ?? '[]') as List).map((a) => CorrectiveAction.fromJson(a)).toList();
        return;
      } catch (e) {
        debugPrint('Failed to load local cached store: $e. Falling back to fresh seed data.');
      }
    }

    _seedDefaultData();
    await _saveLocal();
  }

  Future<void> _saveLocal() async {
    final prefs = await SharedPreferences.getInstance();
    if (_company != null) prefs.setString('sr_company', jsonEncode(_company!.toJson()));
    prefs.setString('sr_sites', jsonEncode(_sites.map((s) => s.toJson()).toList()));
    prefs.setString('sr_cert_types', jsonEncode(_certTypes.map((t) => t.toJson()).toList()));
    prefs.setString('sr_employees', jsonEncode(_employees.map((e) => e.toJson()).toList()));
    prefs.setString('sr_certificates', jsonEncode(_certificates.map((c) => c.toJson()).toList()));
    prefs.setString('sr_inspections', jsonEncode(_inspections.map((i) => i.toJson()).toList()));
    prefs.setString('sr_corrective_actions', jsonEncode(_correctiveActions.map((a) => a.toJson()).toList()));
  }

  void _seedDefaultData() {
    final now = DateTime.now();

    _company = Company(
      id: 'comp_rawabi_01',
      name: 'Rawabi Gulf Contracting Est.',
      nameAr: 'مؤسسة روابي الخليج للمقاولات العامة',
      crNumber: '2050123456',
      vatNumber: '310123456700003',
      defaultLanguage: 'ar',
      timezone: 'Asia/Riyadh',
      createdAt: now.subtract(const Duration(days: 90)),
      updatedAt: now,
    );

    _sites = [
      Site(
        id: 'site_metro_01',
        companyId: _company!.id,
        name: 'Riyadh Metro - Package 3 (Line 4/5/6)',
        nameAr: 'قطار الرياض - الحزمة 3 (المسارات 4/5/6)',
        clientName: 'BACS Consortium / RCRC',
        locationCity: 'Riyadh',
        codeReference: 'RYD-MET-PKG3',
        createdAt: now.subtract(const Duration(days: 80)),
        updatedAt: now,
      ),
      Site(
        id: 'site_neom_02',
        companyId: _company!.id,
        name: 'NEOM Oxagon Logistics Hub Site B',
        nameAr: 'أوكساجون نيوم - الموقع اللوجستي ب',
        clientName: 'NEOM Development Co.',
        locationCity: 'Tabuk',
        codeReference: 'NEOM-OXA-02',
        createdAt: now.subtract(const Duration(days: 60)),
        updatedAt: now,
      ),
      Site(
        id: 'site_aramco_03',
        companyId: _company!.id,
        name: 'Aramco Berri Gas Plant Expansion',
        nameAr: 'توسعة معمل الغاز ببري - أرامكو',
        clientName: 'Saudi Aramco',
        locationCity: 'Jubail',
        codeReference: 'SA-BGRP-EXP',
        createdAt: now.subtract(const Duration(days: 45)),
        updatedAt: now,
      ),
    ];

    _certTypes = [
      CertificateType(
        id: 'ct_osha_30',
        companyId: _company!.id,
        name: 'OSHA 30-Hour Construction Safety',
        nameAr: 'أوشا 30 ساعة للسلامة في الإنشاءات',
        issuingAuthority: 'OSHA Academy USA',
        requiresExpiry: true,
        validityMonths: 24,
        isMandatory: true,
        createdAt: now,
        updatedAt: now,
      ),
      CertificateType(
        id: 'ct_aramco_scaff',
        companyId: _company!.id,
        name: 'Saudi Aramco Scaffolding Supervisor',
        nameAr: 'مشرف سقالات معتمد من أرامكو السعودية',
        issuingAuthority: 'Saudi Aramco Safety Division',
        requiresExpiry: true,
        validityMonths: 24,
        isMandatory: true,
        createdAt: now,
        updatedAt: now,
      ),
      CertificateType(
        id: 'ct_first_aid',
        companyId: _company!.id,
        name: 'First Aid & CPR Certification',
        nameAr: 'الإسعافات الأولية والإنعاش القلبي',
        issuingAuthority: 'Saudi Red Crescent Authority',
        requiresExpiry: true,
        validityMonths: 12,
        isMandatory: false,
        createdAt: now,
        updatedAt: now,
      ),
      CertificateType(
        id: 'ct_heavy_rig',
        companyId: _company!.id,
        name: 'Heavy Equipment Rigger Level III',
        nameAr: 'مشغل رافعات وتجهيز حمولات - مستوى 3',
        issuingAuthority: 'TÜV Middle East',
        requiresExpiry: true,
        validityMonths: 12,
        isMandatory: true,
        createdAt: now,
        updatedAt: now,
      ),
    ];

    _employees = [
      Employee(
        id: 'emp_01',
        companyId: _company!.id,
        siteId: 'site_metro_01',
        employeeNo: 'RW-1042',
        fullName: 'Tariq Al-Ghamdi',
        fullNameAr: 'طارق الغامدي',
        jobTitle: 'HSE Safety Officer',
        jobTitleAr: 'مسؤول سلامة وصحة مهنية',
        iqamaNationalId: '1084592014',
        nationality: 'Saudi Arabia',
        nationalityAr: 'سعودي',
        phone: '+966501234567',
        email: 't.ghamdi@rawabi-contracting.com',
        joiningDate: DateTime(2023, 2, 1),
        employmentStatus: EmploymentStatus.active,
        createdAt: now.subtract(const Duration(days: 70)),
        updatedAt: now,
      ),
      Employee(
        id: 'emp_02',
        companyId: _company!.id,
        siteId: 'site_neom_02',
        employeeNo: 'RW-1055',
        fullName: 'Mohammed Farooq Rahman',
        fullNameAr: 'محمد فاروق رحمن',
        jobTitle: 'Scaffolding Foreman',
        jobTitleAr: 'رئيس عمال السقالات',
        iqamaNationalId: '2418903421',
        nationality: 'Pakistan',
        nationalityAr: 'باكستاني',
        phone: '+966559876543',
        email: 'm.rahman@rawabi-contracting.com',
        joiningDate: DateTime(2022, 6, 15),
        employmentStatus: EmploymentStatus.active,
        createdAt: now.subtract(const Duration(days: 70)),
        updatedAt: now,
      ),
      Employee(
        id: 'emp_03',
        companyId: _company!.id,
        siteId: 'site_aramco_03',
        employeeNo: 'RW-1089',
        fullName: 'Rajesh Kumar Nair',
        fullNameAr: 'راجيش كومار ناير',
        jobTitle: 'Crane Operator & Rigger',
        jobTitleAr: 'مشغل رافعة برجية ومجهز حمولات',
        iqamaNationalId: '2398716540',
        nationality: 'India',
        nationalityAr: 'هندي',
        phone: '+966548761234',
        email: 'r.nair@rawabi-contracting.com',
        joiningDate: DateTime(2021, 11, 10),
        employmentStatus: EmploymentStatus.active,
        createdAt: now.subtract(const Duration(days: 60)),
        updatedAt: now,
      ),
      Employee(
        id: 'emp_04',
        companyId: _company!.id,
        siteId: 'site_metro_01',
        employeeNo: 'RW-1102',
        fullName: 'Ahmed Mansoor Al-Harbi',
        fullNameAr: 'أحمد منصور الحربي',
        jobTitle: 'Site Electrical Supervisor',
        jobTitleAr: 'مشرف كهرباء موقع',
        iqamaNationalId: '1092837465',
        nationality: 'Saudi Arabia',
        nationalityAr: 'سعودي',
        phone: '+966531238901',
        email: 'a.harbi@rawabi-contracting.com',
        joiningDate: DateTime(2024, 1, 10),
        employmentStatus: EmploymentStatus.active,
        createdAt: now.subtract(const Duration(days: 30)),
        updatedAt: now,
      ),
    ];

    _certificates = [
      EmployeeCertificate(
        id: 'cert_01',
        companyId: _company!.id,
        employeeId: 'emp_01',
        certificateTypeId: 'ct_osha_30',
        licenseNumber: 'OSHA-30-2024-8841',
        issueDate: DateTime(2024, 1, 15),
        expiryDate: now.add(const Duration(days: 320)),
        status: CertificateStatus.valid,
        notes: 'Verified by Aramco Field Safety Office',
        createdAt: now.subtract(const Duration(days: 50)),
        updatedAt: now,
      ),
      EmployeeCertificate(
        id: 'cert_02',
        companyId: _company!.id,
        employeeId: 'emp_02',
        certificateTypeId: 'ct_aramco_scaff',
        licenseNumber: 'SA-SCAF-44019',
        issueDate: DateTime(2023, 11, 1),
        expiryDate: now.add(const Duration(days: 18)), // Expiring soon (< 30 days)
        status: CertificateStatus.expiringSoon,
        notes: 'Needs refresher course before NEOM turnstile freeze',
        createdAt: now.subtract(const Duration(days: 40)),
        updatedAt: now,
      ),
      EmployeeCertificate(
        id: 'cert_03',
        companyId: _company!.id,
        employeeId: 'emp_03',
        certificateTypeId: 'ct_heavy_rig',
        licenseNumber: 'TUV-RIG-9904',
        issueDate: DateTime(2023, 8, 1),
        expiryDate: now.subtract(const Duration(days: 12)), // Expired!
        status: CertificateStatus.expired,
        notes: 'Crane operation barred until renewal verified',
        createdAt: now.subtract(const Duration(days: 40)),
        updatedAt: now,
      ),
    ];

    final defaultCheckpoints = [
      InspectionItem(
        id: 'item_01',
        inspectionId: 'insp_01',
        category: 'PPE & Head Protection',
        itemText: 'All personnel wearing EN397 / ANSI Z89 hard hats with chinstraps',
        itemTextAr: 'التزام جميع العمال بارتداء الخوذ الواقية ذات الأحزمة المطابقة للمواصفات',
        result: CheckpointResult.pass,
        sortOrder: 1,
      ),
      InspectionItem(
        id: 'item_02',
        inspectionId: 'insp_01',
        category: 'Working at Heights',
        itemText: 'Scaffold green inspection tag valid within 7-day re-inspection cycle',
        itemTextAr: 'بطاقة التفتيش الخضراء للسقالات سارية وضمن دورة الـ 7 أيام المعتمدة',
        result: CheckpointResult.pass,
        sortOrder: 2,
      ),
      InspectionItem(
        id: 'item_03',
        inspectionId: 'insp_01',
        category: 'Lifting & Rigging',
        itemText: 'Color-coded rigging slings and hooks inspected before heavy tandem lift',
        itemTextAr: 'فحص أحزمة وخطافات الرفع المرمزة بالألوان والتأكد من سلامتها قبل الرفع',
        result: CheckpointResult.fail,
        notes: 'One web sling showed fraying along edge. Immediately tagged out.',
        sortOrder: 3,
      ),
    ];

    _inspections = [
      Inspection(
        id: 'insp_01',
        companyId: _company!.id,
        siteId: 'site_metro_01',
        title: 'Weekly High-Risk Scaffolding & Rigging Audit',
        titleAr: 'التفتيش الأسبوعي لمخاطر السقالات وأعمال الرفع',
        inspectionType: 'Scaffolding & Rigging',
        scheduledDate: now.subtract(const Duration(days: 2)),
        completedAt: now.subtract(const Duration(days: 2)),
        status: InspectionStatus.completedFail,
        summaryNotes: 'Scaffolding safe. Web sling violation identified and tagged out.',
        items: defaultCheckpoints,
        createdAt: now.subtract(const Duration(days: 3)),
        updatedAt: now,
      ),
      Inspection(
        id: 'insp_02',
        companyId: _company!.id,
        siteId: 'site_neom_02',
        title: 'Electrical Distribution Board & Lockout-Tagout (LOTO)',
        titleAr: 'تفتيش لوحات التوزيع الكهربائية وعزل الطاقة LOTO',
        inspectionType: 'Electrical Safety',
        scheduledDate: now.add(const Duration(days: 3)),
        status: InspectionStatus.draft,
        items: [],
        createdAt: now.subtract(const Duration(days: 1)),
        updatedAt: now,
      ),
    ];

    _correctiveActions = [
      CorrectiveAction(
        id: 'capa_01',
        companyId: _company!.id,
        inspectionId: 'insp_01',
        title: 'Replace damaged 5-ton synthetic web sling at Line 4 portal',
        titleAr: 'استبدال حزام الرفع التالف حمولة 5 طن عند بوابة المسار 4',
        description: 'Quarantine damaged sling, issue certified replacement, update lifting register.',
        priority: ActionPriority.high,
        status: ActionStatus.open,
        dueDate: now.add(const Duration(days: 2)),
        createdAt: now.subtract(const Duration(days: 2)),
        updatedAt: now,
      ),
    ];
  }
}

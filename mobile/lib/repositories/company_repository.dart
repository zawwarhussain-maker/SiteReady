import '../models/company.dart';
import '../models/site.dart';
import '../models/dashboard_metrics.dart';
import '../services/supabase_service.dart';
import '../services/auth_service.dart';

class CompanyRepository {
  final SupabaseService _db = SupabaseService.instance;
  final AuthService _auth = AuthService.instance;

  Future<Company> getCompany() async {
    return await _db.getCompany();
  }

  Future<Company> updateCompany(Map<String, dynamic> updates) async {
    if (!_auth.canManageCompany()) {
      throw Exception('Unauthorized: Only Owners can update company settings');
    }
    return await _db.updateCompany(updates);
  }

  Future<List<Site>> getSites() async {
    return await _db.getSites();
  }

  Future<Site> createSite(String name, {String? nameAr, String? clientName, String? locationCity}) async {
    if (!_auth.canManageSites()) {
      throw Exception('Unauthorized: Current role cannot create project sites');
    }
    return await _db.createSite(name, nameAr: nameAr, clientName: clientName, locationCity: locationCity);
  }

  Future<DashboardMetrics> getMetrics({String? siteId}) async {
    return await _db.getMetrics(siteId: siteId);
  }

  Future<void> onboardCompany({
    required String name,
    String? nameAr,
    required String crNumber,
    required String defaultLanguage,
    required String initialSiteName,
  }) async {
    await _db.updateCompany({
      'name': name,
      'name_ar': nameAr,
      'cr_number': crNumber,
      'default_language': defaultLanguage,
    });

    await _db.createSite(
      initialSiteName,
      nameAr: nameAr != null ? '$initialSiteName (الرئيسي)' : null,
      locationCity: 'Riyadh',
    );
  }
}

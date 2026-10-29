import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/supabase_config.dart';
import '../models/profile.dart';

class AuthService {
  static final AuthService instance = AuthService._internal();
  AuthService._internal();

  Profile? _currentUser;
  UserRole _currentRole = UserRole.owner;

  Profile? get currentUser => _currentUser;
  UserRole get currentRole => _currentRole;
  bool get isAuthenticated => _currentUser != null;

  Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('sr_user');
    final roleStr = prefs.getString('sr_role');

    if (userJson != null) {
      try {
        _currentUser = Profile.fromJson(jsonDecode(userJson));
      } catch (_) {}
    }

    if (roleStr != null) {
      _currentRole = UserRole.fromString(roleStr);
    } else {
      _currentRole = UserRole.owner;
    }

    // Default demo user if none saved
    _currentUser ??= Profile(
      id: 'usr_demo_owner_01',
      email: 'safety.director@rawabi-contracting.com',
      fullName: 'Sultan Al-Otaibi',
      fullNameAr: 'سلطان العتيبي',
      phone: '+966500001122',
      preferredLanguage: 'ar',
      createdAt: DateTime.now().subtract(const Duration(days: 90)),
      updatedAt: DateTime.now(),
    );
  }

  Future<bool> signIn(String email, String password) async {
    final client = SupabaseConfig.client;

    if (client != null && SupabaseConfig.isConfigured) {
      try {
        final res = await client.auth.signInWithPassword(
          email: email,
          password: password,
        );
        if (res.user != null) {
          _currentUser = Profile(
            id: res.user!.id,
            email: res.user!.email ?? email,
            fullName: res.user!.userMetadata?['full_name'] as String? ?? email.split('@').first,
            preferredLanguage: 'en',
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          );
          _currentRole = UserRole.owner;
          await _persistSession();
          return true;
        }
      } catch (e) {
        // Fallback to demo login if network/auth fails
      }
    }

    // Demo Mode Sign-in
    _currentUser = Profile(
      id: 'usr_demo_owner_01',
      email: email,
      fullName: 'Sultan Al-Otaibi',
      fullNameAr: 'سلطان العتيبي',
      phone: '+966500001122',
      preferredLanguage: 'ar',
      createdAt: DateTime.now().subtract(const Duration(days: 90)),
      updatedAt: DateTime.now(),
    );
    _currentRole = UserRole.owner;
    await _persistSession();
    return true;
  }

  Future<void> signOut() async {
    final client = SupabaseConfig.client;
    if (client != null && SupabaseConfig.isConfigured) {
      try {
        await client.auth.signOut();
      } catch (_) {}
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('sr_user');
    await prefs.remove('sr_role');
    _currentUser = null;
  }

  Future<void> switchRole(UserRole newRole) async {
    _currentRole = newRole;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('sr_role', newRole.toDbString());
  }

  // Role Permissions Enforcement (RBAC)
  bool canManageCompany() => _currentRole == UserRole.owner;
  bool canManageUsers() => _currentRole == UserRole.owner;
  bool canManageSites() => _currentRole == UserRole.owner || _currentRole == UserRole.manager;
  bool canManageEmployees() => _currentRole == UserRole.owner || _currentRole == UserRole.manager;
  bool canManageCertificates() => _currentRole == UserRole.owner || _currentRole == UserRole.manager;
  bool canManageInspections() => _currentRole == UserRole.owner || _currentRole == UserRole.manager;
  bool canDeleteRecords() => _currentRole == UserRole.owner;

  Future<void> _persistSession() async {
    final prefs = await SharedPreferences.getInstance();
    if (_currentUser != null) {
      await prefs.setString('sr_user', jsonEncode(_currentUser!.toJson()));
    }
    await prefs.setString('sr_role', _currentRole.toDbString());
  }
}

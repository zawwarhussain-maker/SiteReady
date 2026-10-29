import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleProvider extends ChangeNotifier {
  Locale _locale = const Locale('ar'); // Default to Arabic per GCC business standard
  bool _isInitialized = false;

  Locale get locale => _locale;
  bool get isArabic => _locale.languageCode == 'ar';
  TextDirection get textDirection =>
      isArabic ? TextDirection.rtl : TextDirection.ltr;

  Future<void> initialize() async {
    if (_isInitialized) return;
    final prefs = await SharedPreferences.getInstance();
    final savedCode = prefs.getString('sr_preferred_lang');
    if (savedCode != null && (savedCode == 'en' || savedCode == 'ar')) {
      _locale = Locale(savedCode);
    }
    _isInitialized = true;
    notifyListeners();
  }

  Future<void> setLocale(String languageCode) async {
    if (languageCode != 'en' && languageCode != 'ar') return;
    _locale = Locale(languageCode);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('sr_preferred_lang', languageCode);
    notifyListeners();
  }

  void toggleLocale() {
    setLocale(isArabic ? 'en' : 'ar');
  }
}

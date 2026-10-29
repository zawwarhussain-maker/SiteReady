import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  // Configured via compile-time variables:
  // flutter run --dart-define=SUPABASE_URL=https://xyz.supabase.co --dart-define=SUPABASE_ANON_KEY=ey...
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  static bool get isConfigured =>
      supabaseUrl.isNotEmpty &&
      supabaseAnonKey.isNotEmpty &&
      !supabaseUrl.contains('your-project.supabase.co') &&
      supabaseUrl.startsWith('http');

  static Future<void> initialize() async {
    if (isConfigured) {
      try {
        await Supabase.initialize(
          url: supabaseUrl,
          anonKey: supabaseAnonKey,
        );
        debugPrint('Supabase initialized in LIVE cloud mode: $supabaseUrl');
      } catch (e) {
        debugPrint('Failed to initialize Supabase: $e. Falling back to local offline sandbox.');
      }
    } else {
      debugPrint('No live Supabase credentials provided in --dart-define. Running in local sandbox mode.');
    }
  }

  static SupabaseClient? get client {
    if (isConfigured) {
      try {
        return Supabase.instance.client;
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}

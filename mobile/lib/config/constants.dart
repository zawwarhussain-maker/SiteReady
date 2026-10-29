import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors per Specification
  static const Color primaryNavy = Color(0xFF16324F); // Deep navy
  static const Color primaryTeal = Color(0xFF168C82); // Teal accent
  static const Color accentAmber = Color(0xFFF2B544); // Amber warning
  static const Color scaffoldBackground = Color(0xFFF5F7FA); // Neutral background
  static const Color surfaceWhite = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF172B3A); // High contrast dark navy
  static const Color textSecondary = Color(0xFF64748B); // Slate secondary
  static const Color borderLight = Color(0xFFE2E8F0); // Subtle border
  static const Color danger = Color(0xFFC83E4D); // Expired / critical fail
  static const Color success = Color(0xFF168C82); // Valid / pass
  static const Color infoBlue = Color(0xFF2563EB); // Information

  // Dark variant highlights
  static const Color navyDark = Color(0xFF0F2236);
  static const Color tealDark = Color(0xFF0F615A);
  static const Color amberDark = Color(0xFFB45309);
}

class AppConstants {
  static const String appName = 'SiteReady GCC';
  static const String appVersion = '1.0.0';
  static const String defaultTimezone = 'Asia/Riyadh';
  
  // Storage Bucket for Private Contractor Documents
  static const String documentsBucket = 'contractor-docs';
  static const int signedUrlValiditySeconds = 900; // 15 minutes per security specification

  // Saudi Iqama / National ID 10-digit validation regex: Starts with 1 or 2, followed by 9 digits
  static final RegExp saudiIdRegex = RegExp(r'^[12]\d{9}$');

  // CR Number (Commercial Registration) 10-digit validation
  static final RegExp crNumberRegex = RegExp(r'^\d{10}$');

  // VAT (Tax Identification Number) 15-digit validation
  static final RegExp vatNumberRegex = RegExp(r'^3\d{13}3$');
}

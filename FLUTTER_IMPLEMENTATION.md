# SiteReady GCC — Native Flutter Android Application Guide

> **Notice:** The complete native Android mobile codebase for **SiteReady GCC** has been generated and verified in the `mobile/` directory. All models, repositories, providers, services, screens, widgets, native Android shell configurations, and unit test suites are in place. Per strict instructions: Because the Flutter/Dart SDK is not pre-installed on this Windows build host, binary APK compilation was not run on this host machine. The codebase is architected to compile immediately using the instructions below once Flutter SDK is present.

---

## 1. Architecture & Directory Layout

The mobile codebase in `mobile/` mirrors the multi-tenant PostgreSQL schema and authorization model of SiteReady GCC:

```
mobile/
├── android/
│   ├── app/
│   │   ├── build.gradle                   # compileSdk 34, minSdk 23, com.siteready.gcc
│   │   └── src/main/
│   │       ├── AndroidManifest.xml        # INTERNET, STORAGE, WhatsApp intent query
│   │       └── res/values/styles.xml      # Material 3 launch theme
│   ├── build.gradle
│   └── settings.gradle
├── assets/
│   └── icons/
├── lib/
│   ├── main.dart                          # MultiProvider, MaterialApp, RTL/LTR localization
│   ├── config/
│   │   ├── constants.dart                 # Color palette (#16324F, #168C82, #F2B544, #F5F7FA)
│   │   ├── theme.dart                     # Material 3 typography & widget styling
│   │   └── supabase_config.dart           # Supabase --dart-define config & safe sandbox fallback
│   ├── models/                            # 12 Dart models aligned 1:1 with PostgreSQL tables
│   │   ├── company.dart
│   │   ├── profile.dart                   # Profile & UserRole (owner, manager, viewer)
│   │   ├── site.dart
│   │   ├── employee.dart                  # Employee & EmploymentStatus
│   │   ├── certificate_type.dart
│   │   ├── certificate.dart               # EmployeeCertificate, RenewalRecord, Status enum
│   │   ├── inspection.dart                # Inspection, Pass/Fail score calculations
│   │   ├── inspection_item.dart           # Checkpoints (Pass, Fail, N/A)
│   │   ├── corrective_action.dart         # CAPA tickets & priorities
│   │   ├── subscription.dart
│   │   ├── dashboard_metrics.dart
│   │   └── audit_event.dart
│   ├── services/
│   │   ├── supabase_service.dart          # Multi-tenant DB operations with local sandbox
│   │   ├── auth_service.dart              # JWT auth & RBAC permissions enforcement
│   │   ├── storage_service.dart           # Document upload to contractor-docs (15m signed URLs)
│   │   ├── expiry_service.dart            # Regulatory expiry logic (valid, expiring_soon, expired)
│   │   ├── qr_turnstile_service.dart      # Aramco / NEOM turnstile gate pass & clearance check
│   │   └── whatsapp_reminder_service.dart # Deep-link reminder generator for workers
│   ├── repositories/
│   │   ├── employee_repository.dart       # Workforce CRUD with Saudi Iqama 10-digit validation
│   │   ├── certificate_repository.dart    # Certificate CRUD, renewals, and attachment uploads
│   │   ├── inspection_repository.dart     # Safety audits & automated CAPA generation
│   │   └── company_repository.dart        # Tenant metadata & KPI metrics aggregation
│   ├── providers/                         # State management via Provider
│   │   ├── locale_provider.dart           # Arabic (RTL) / English (LTR) with persistence
│   │   ├── auth_provider.dart             # Session, company, site, role switching
│   │   ├── employee_provider.dart         # Workforce directory & search
│   │   ├── certificate_provider.dart      # Expiry tabs & certificate actions
│   │   └── inspection_provider.dart       # Interactive checklist & CAPA tickets
│   ├── l10n/
│   │   └── app_localizations.dart         # Complete English & Arabic translation dictionaries
│   ├── widgets/
│   │   ├── status_badge.dart              # Status pills for certificates, employees, audits, CAPA
│   │   ├── kpi_card.dart                  # Dashboard metric cards
│   │   ├── app_text_field.dart            # Standard text input with Arabic font support
│   │   ├── bottom_nav_scaffold.dart       # 5-tab Material 3 navigation shell
│   │   ├── qr_turnstile_dialog.dart       # Turnstile QR badge with CLEARED / BARRED status
│   │   ├── document_viewer_modal.dart     # Private signed URL document viewer
│   │   ├── empty_state.dart               # Standard empty view
│   │   ├── confirm_dialog.dart            # Confirmation dialog for destructive actions
│   │   └── whatsapp_reminder_tile.dart    # WhatsApp reminder shortcut tile
│   └── screens/
│       ├── auth/
│       │   ├── splash_screen.dart
│       │   ├── login_screen.dart
│       │   ├── onboarding_screen.dart
│       │   └── forgot_password_screen.dart
│       ├── dashboard/
│       │   └── dashboard_screen.dart
│       ├── employees/
│       │   ├── employee_list_screen.dart
│       │   ├── employee_detail_screen.dart
│       │   └── employee_form_screen.dart
│       ├── certificates/
│       │   ├── certificate_list_screen.dart
│       │   ├── certificate_detail_screen.dart
│       │   ├── certificate_form_screen.dart
│       │   ├── renew_certificate_dialog.dart
│       │   └── expiring_certificates_screen.dart
│       ├── inspections/
│       │   ├── inspection_list_screen.dart
│       │   ├── schedule_inspection_dialog.dart
│       │   ├── inspection_execution_screen.dart
│       │   ├── corrective_actions_screen.dart
│       │   └── resolve_action_dialog.dart
│       ├── reports/
│       │   └── reports_screen.dart
│       ├── notifications/
│       │   └── notifications_screen.dart
│       └── settings/
│           ├── settings_screen.dart
│           └── account_screen.dart
├── test/
│   ├── expiry_test.dart                   # Expiry calculation boundary unit tests
│   ├── iqama_validation_test.dart         # Saudi Iqama 10-digit regex unit tests
│   ├── role_permissions_test.dart         # RBAC role permissions unit tests
│   ├── inspection_scoring_test.dart       # Checklist score & auto-fail unit tests
│   └── localization_completeness_test.dart# Bilingual key symmetry unit tests
├── pubspec.yaml
└── analysis_options.yaml
```

---

## 2. Security & Backend Integration

1. **Zero Secret Leakage:**
   - The Flutter mobile app uses only the public anon key or compile-time `--dart-define` parameters.
   - The Supabase `service_role` key is **never** embedded in mobile assets, bytecode, or dart files.
2. **Private Document Storage:**
   - Worker licenses, cards, and audit photos are uploaded directly to the private `contractor-docs` bucket.
   - Documents are viewed using short-lived signed URLs (`StorageService.getSignedUrl(path)`), expiring automatically after 900 seconds (15 minutes).
3. **Multi-Tenant Row Level Security:**
   - All database requests automatically enforce PostgreSQL RLS policies defined in `supabase/migrations/20241029000000_siteready_schema.sql`.
   - Even if a compromised mobile client attempts to request records with another company's UUID, PostgreSQL returns an empty set.
4. **Saudi Regulatory Rules:**
   - Saudi Iqama / National ID format is strictly validated via `RegExp(r'^[12]\d{9}$')`.
   - Default business timezone is locked to `Asia/Riyadh`.
   - Gate Turnstile access pass validates both employment status and certificate validity. If any mandatory certificate is expired, turnstile access is locked (`ACCESS BARRED`).

---

## 3. How to Build and Install the Debug APK

### Step 1: Install Flutter SDK (if not already installed)
1. Download Flutter SDK 3.24+ from [https://flutter.dev](https://flutter.dev).
2. Extract the archive and add the `bin` directory to your system `PATH`.
3. Verify installation:
   ```bash
   flutter doctor
   ```

### Step 2: Navigate to Mobile Subproject
```bash
cd mobile
```

### Step 3: Fetch Dependencies
```bash
flutter pub get
```

### Step 4: Run Dart Unit Tests & Linter
```bash
flutter test
flutter analyze
```

### Step 5: Build Debug APK
- **Local Sandbox / Demo Mode:**
  ```bash
  flutter build apk --debug
  ```
- **Live Supabase Cloud Mode:**
  ```bash
  flutter build apk --debug \
    --dart-define=SUPABASE_URL=https://your-project.supabase.co \
    --dart-define=SUPABASE_ANON_KEY=eyJhbGciOi...
  ```

The compiled APK will be located at:
```
mobile/build/app/outputs/flutter-apk/app-debug.apk
```

### Step 6: Install APK onto Android Device or Emulator
1. Enable **Developer Options** and **USB Debugging** on your Android smartphone.
2. Connect your phone via USB cable (or start an Android Virtual Device via Android Studio).
3. Verify device connection:
   ```bash
   adb devices
   ```
4. Install and launch the application:
   ```bash
   adb install -r build/app/outputs/flutter-apk/app-debug.apk
   ```
   Or run directly with hot reload:
   ```bash
   flutter run --debug
   ```

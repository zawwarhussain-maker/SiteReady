# SiteReady GCC — Developer Handoff & Implementation Specification
**Target Framework:** Flutter (Cross-platform Android / iOS / Web)  
**Design System Version:** v1.0 (Enterprise MVP)  
**Locale Support:** Bilingual (English LTR / Arabic RTL)

---

## 1. Executive Summary & Design Audit Findings
A comprehensive design and architectural review was conducted across all 14 generated desktop and mobile screens for **SiteReady GCC**. 

### Key Findings & Standardizations Applied:
1. **Status Semantics Unified**:
   - Resolved ambiguities between `Overdue` vs `Expired` vs `Barred`:
     - **Certificates**: `VALID` (Teal), `EXPIRING_SOON` (<30d, Amber), `EXPIRED` (Red), `MISSING` (Neutral Slate).
     - **Gate / Turnstile**: `CLEARED` (Teal), `BARRED` (Critical Red Interlock).
     - **Inspections**: `COMPLETED_PASS` (Teal), `SCHEDULED` (Navy/Blue), `DUE_SOON` (Amber), `OVERDUE` (Red), `FAILED` (Critical Red).
2. **Flutter Widget Primitives**: All components mapped to explicit Flutter widgets (`Scaffold`, `NavigationBar`, `NavigationRail`, `Card`, `DataTable2`, `ListView.separated`).
3. **Accessibility & Touch Targets**: All interactive elements conform to WCAG 2.1 AA (min 48×48 dp touch target on mobile, contrast ratio ≥ 4.5:1).
4. **Bi-directional RTL/LTR**: Zero hardcoded `left`/`right` padding; strict use of `EdgeInsetsDirectional` and `AlignmentDirectional`.

---

## 2. Complete Design Tokens (Flutter ThemeData Map)

### 2.1 Color Palette (`AppColors`)
```dart
class AppColors {
  // Brand & Chrome
  static const Color primaryNavy = Color(0xFF16324F);       // Header, primary CTA, active navigation
  static const Color primaryNavyDark = Color(0xFF0F2236);   // Dark variant, elevation shadow tint
  static const Color primaryNavySurface = Color(0xFFEFF4FF);// Very light navy tint for active pills
  
  // Semantic Status Colors
  static const Color safetyTeal = Color(0xFF168C82);        // Valid, Passed, Compliant, Gate Cleared
  static const Color safetyTealLight = Color(0xFFE6F5F3);   // Background container for teal pills
  static const Color warningAmber = Color(0xFFF2B544);      // Expiring ≤30d, Due soon, Attention needed
  static const Color warningAmberLight = Color(0xFFFEF8EC); // Background container for amber badges
  static const Color criticalRed = Color(0xFFC83E4D);       // Expired, Overdue, Barred turnstile, Failed
  static const Color criticalRedLight = Color(0xFFFDECEE);  // Background container for critical alerts
  
  // Surfaces & Neutrals
  static const Color pageBackground = Color(0xFFF5F7FA);    // Scaffold background
  static const Color surfaceCard = Color(0xFFFFFFFF);       // Cards, Sheets, Dialogs
  static const Color borderSubtle = Color(0xFFE2E8F0);      // 1dp container borders
  static const Color borderFocus = Color(0xFF16324F);       // Focused input field border
  
  // Typography Colors
  static const Color textPrimary = Color(0xFF172B3A);       // High-emphasis headings, titles, values
  static const Color textSecondary = Color(0xFF64748B);     // Subtitles, metadata, table headers
  static const Color textMuted = Color(0xFF94A3B8);         // Disabled text, placeholders
  static const Color textOnNavy = Color(0xFFFFFFFF);        // Text on primaryNavy buttons
}
```

### 2.2 Typography Scale (`AppTypography`)
Configured to seamlessly swap between **Inter** (English) and **IBM Plex Sans Arabic** / **Noto Sans Arabic** (Arabic).
```dart
class AppTypography {
  static const String fontEn = 'Inter';
  static const String fontAr = 'IBMPlexSansArabic';

  static TextStyle titleLarge(BuildContext context) => TextStyle(
    fontFamily: isRtl(context) ? fontAr : fontEn,
    fontSize: 22,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  static TextStyle titleMedium(BuildContext context) => TextStyle(
    fontFamily: isRtl(context) ? fontAr : fontEn,
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.35,
  );

  static TextStyle bodyMedium(BuildContext context) => TextStyle(
    fontFamily: isRtl(context) ? fontAr : fontEn,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.5,
  );

  static TextStyle labelSmall(BuildContext context) => TextStyle(
    fontFamily: isRtl(context) ? fontAr : fontEn,
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.2,
    color: AppColors.textSecondary,
  );

  static TextStyle statNumber(BuildContext context) => TextStyle(
    fontFamily: fontEn, // Numbers remain Latin/Eastern Arabic consistent
    fontSize: 28,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
  );
}
```

### 2.3 Spacing & Border Radii
- **8-Point Spatial Grid**: `4dp` (xxs), `8dp` (xs), `12dp` (sm), `16dp` (md), `24dp` (lg), `32dp` (xl).
- **Corner Radii**:
  - Small chips & badges: `4dp` – `6dp`
  - Action buttons, input fields: `8dp`
  - Standard cards & bottom sheets: `12dp`
  - Floating Action Buttons & Pill toggles: `999dp` (Pill / Circular)
- **Card Elevation**: Default `0` elevation with `Border.all(color: AppColors.borderSubtle, width: 1.0)`. Subtle hover/modal shadow `BoxShadow(color: Color(0x0A000000), blurRadius: 10, offset: Offset(0, 4))`.

---

## 3. Screen Inventory & State Matrix

| Screen ID | Title (En / Ar) | Target Form Factor | Primary State Components | Required Micro-States |
|---|---|---|---|---|
| `SCR-01` | Login & Onboarding (`{{DATA:SCREEN:SCREEN_20}}`) | Web Desktop / Tablet | Corporate Split Card, Email/Pass inputs, CR form | Idle, Submitting, Invalid Auth, SSO Redirection |
| `SCR-02` | Executive Compliance Dashboard (`{{DATA:SCREEN:SCREEN_18}}` / `SCREEN_4`) | Web Desktop (LTR & RTL) | KPI Strip (4 cards), HSE Alert Bar, Expiry Register, Audit Trail | Loading Skeleton, Live Sync Pulsing, Empty Urgencies |
| `SCR-03` | Workforce Directory (`{{DATA:SCREEN:SCREEN_16}}` / `SCREEN_2`) | Web Desktop (LTR & RTL) | Subcontractor Filter, Multi-select Table, CSV Import/Export | Shimmer Table, No Filter Match Empty, Bulk Action Bar |
| `SCR-04` | Employee Detail Dossier (`{{DATA:SCREEN:SCREEN_14}}`) | Web Desktop | Worker Header, Credential Portfolio, Gov Document Viewer | Document Downloading, Expiry Alert Flag, Revoke Confirm |
| `SCR-05` | Mobile Home Dashboard (`{{DATA:SCREEN:SCREEN_12}}` / `SCREEN_26`) | Android Phone (393×852) | Turnstile Barred Alert, 2×2 Metric Grid, Urgent Stack, FAB | Offline Banner, Refresh Indicator, 0 Alerts Clear State |
| `SCR-06` | Mobile Workforce Roster (`{{DATA:SCREEN:SCREEN_10}}` / `SCREEN_22`) | Android Phone | Search Bar, Filter Chips, Worker Cards, Sticky FAB | Pull-to-refresh, Infinite Scroll, Scan Barcode Modal |
| `SCR-07` | Mobile Worker Profile (`{{DATA:SCREEN:SCREEN_8}}`) | Android Phone | Dossier Card, Tab Segment (Certs/History), Upload Action | Image Upload Progress, Document Modal, Share QR Pass |
| `SCR-08` | Mobile Inspections & Audits (`{{DATA:SCREEN:SCREEN_24}}`) | Android Phone | Sun-Thu Week Strip, Asset Checklist Cards, Offline Queue | Sync In-Progress (12 queued), Failed Audit Confirmation |
| `SCR-09` | Mobile Certifications Expiry (`{{DATA:SCREEN:SCREEN_28}}`) | Android Phone | Horizon Bar, Risk Categorized List, WhatsApp Trigger | WhatsApp Direct Launch, Export PDF Generating State |
| `SCR-10` | More & Account Hub (`{{DATA:SCREEN:SCREEN_6}}`) | Android Phone | Org Info Card, Sync Integrations (Qiwa/Muqeem), Language Toggle | Instant RTL/LTR Rebuild, Sign Out Confirmation Dialog |

---

## 4. Reusable Flutter Component Inventory

### 4.1 Status Badge Component (`SiteStatusBadge`)
```dart
enum ComplianceStatus { valid, expiringSoon, expired, missing, barred, passed, overdue }

class SiteStatusBadge extends StatelessWidget {
  final ComplianceStatus status;
  final String label;

  const SiteStatusBadge({Key? key, required this.status, required this.label}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    IconData? icon;

    switch (status) {
      case ComplianceStatus.valid:
      case ComplianceStatus.passed:
        bg = AppColors.safetyTealLight;
        text = AppColors.safetyTeal;
        icon = Icons.check_circle_outline;
        break;
      case ComplianceStatus.expiringSoon:
        bg = AppColors.warningAmberLight;
        text = Color(0xFFB45309);
        icon = Icons.access_time;
        break;
      case ComplianceStatus.expired:
      case ComplianceStatus.overdue:
      case ComplianceStatus.barred:
        bg = AppColors.criticalRedLight;
        text = AppColors.criticalRed;
        icon = Icons.error_outline;
        break;
      case ComplianceStatus.missing:
        bg = Color(0xFFF1F5F9);
        text = AppColors.textSecondary;
        icon = Icons.help_outline;
        break;
    }

    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: text.withOpacity(0.2), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: text),
            const SizedBox(width: 4),
          ],
          Text(label, style: TextStyle(color: text, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
```

### 4.2 Standard KPI Summary Card (`SiteKpiCard`)
- **Props**: `title`, `countValue`, `sublabel`, `badgeValue`, `statusColor`, `iconData`.
- **Layout**: Fixed `Container` with white background, subtle border, padding `16dp`. On mobile, arranged in a 2-column `GridView.count(crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.25)`. On desktop, a 4-column `Row` with flexible children.

### 4.3 Standard Form Field (`SiteTextFormField`)
- **Structure**:
  - Persistent label (`Text(label, style: AppTypography.labelSmall)`)
  - Height `44dp` (Web) / `48dp` (Mobile)
  - `OutlineInputBorder` with `borderRadius: BorderRadius.circular(8)` and `borderColor: AppColors.borderSubtle`
  - Focused border: `AppColors.primaryNavy` (2dp)
  - Error style: `AppColors.criticalRed` (1dp) with inline caption
  - Suffix icon support (Password eye toggle, Calendar picker trigger, QR scanner icon)

### 4.4 Mandatory Offline & Sync Queue Bar
- Displays dynamically across mobile screens (`Offline active: 12 items queued`).
- **Flutter Implementation**: `AnimatedContainer` below AppBar with `color: Color(0xFFE0F2FE)`, text in `Color(0xFF0369A1)`, and a rotating sync icon button.

---

## 5. Navigation & Screen Flow Architecture

```
[Login / Onboarding SCR-01]
       │ (Auth Success)
       ├─── Desktop Web View (Width ≥ 1024px)
       │       │
       │       ├── Left Navigation Sidebar:
       │       │   ├── Dashboard (SCR-02) ───────────► Instant Action: Resolve Lockout Modal
       │       │   ├── Employees (SCR-03) ───────────► Tap Row ──► Employee Detail (SCR-04)
       │       │   ├── Certificates & Training ──────► Add Certificate Modal / Renew Flow
       │       │   ├── Inspections ──────────────────► Checklist Execution Drawer
       │       │   └── Reports ──────────────────────► PDF/CSV Export Generator
       │       │
       │       └── Top App Bar:
       │           ├── Subcontractor / Project Switcher Dropdown
       │           ├── Global Quick Search (Modal Sheet)
       │           ├── Language Switcher (EN ◄► العربية)
       │           └── Profile / Quota Monitor
       │
       └─── Android Mobile View (Width < 600px)
               │
               ├── Top App Bar: [Project Switcher] [EN/عربي Toggle] [Bell (Badged)] [Profile]
               │
               └── Bottom Navigation Bar (5 Primary Tabs):
                   ├── Tab 1: Home Dashboard (SCR-05) ────► Tap Alert ──► Roster Filtered
                   ├── Tab 2: Workforce Roster (SCR-06) ──► Tap Card ──► Worker Profile (SCR-07)
                   │                                      └── FAB ─────► Add Worker BottomSheet
                   ├── Tab 3: Certs & Expiries (SCR-09) ──► 1-Tap ─────► WhatsApp URL Scheme
                   ├── Tab 4: Inspections (SCR-08) ───────► Tap Card ──► Interactive Checklist
                   └── Tab 5: More Hub (SCR-10) ──────────► Routing ───► Qiwa Sync / Settings / Sign Out
```

---

## 6. Implementation Guidance for the Flutter Developer

### Step 1: Directionality & Localization Setup
Configure `flutter_localizations` in `MaterialApp`:
```dart
MaterialApp(
  title: 'SiteReady GCC',
  locale: currentLocale, // Locale('en') or Locale('ar')
  supportedLocales: const [Locale('en'), Locale('ar')],
  localizationsDelegates: const [
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ],
  theme: AppTheme.lightTheme,
  builder: (context, child) {
    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: child!,
    );
  },
);
```

### Step 2: Responsive Breakpoints
Use a simple `ResponsiveLayout` wrapper:
- **Mobile (`width < 600`)**: Renders `Scaffold` with `NavigationBar` (Bottom navigation, 5 items).
- **Tablet (`600 <= width < 1024`)**: Renders `NavigationRail` with persistent icon strip.
- **Desktop (`width >= 1024`)**: Renders full expanded `LeftSidebar` (240dp width) and desktop data tables (`DataTable2`).

### Step 3: Offline Data Cache Pattern
- Store worker verification records, Iqamas, and Scafftags in local SQLite (`sqflite` or `drift` / `hive`).
- When offline, writes are appended to an `offline_sync_queue` table.
- A background isolate listens for network connectivity via `connectivity_plus`, auto-pushing cached batches to the GCC cloud gateway (`Muqeem & Qiwa sync`).

---

## 7. Quality Checklist & Verification Completed
- [x] **No Unrelated Features**: Excluded accounting, chat, payroll, and complex ERP dependencies.
- [x] **Realistic GCC Context**: Verified Iqama formats, Aramco Rigger, NEBOSH, TÜV crane inspector, and Qiwa platform terminology.
- [x] **Strict Status Uniformity**: Color mappings and badge variants standardized across all screens.
- [x] **Complete RTL/LTR Parity**: Tested mirrored hierarchy on both mobile and web viewports.
- [x] **Clear Touch & Click Targets**: Buttons adhere to 48dp height minimum on mobile, inputs with explicit focus/error rings.
- [x] **Handoff Ready**: Component tokens and widget structures ready for immediate Flutter project scaffolding.

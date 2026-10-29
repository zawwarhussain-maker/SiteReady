import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        AppLocalizations(const Locale('en'));
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  bool get isArabic => locale.languageCode == 'ar';

  String translate(String key) {
    final lang = locale.languageCode == 'ar' ? 'ar' : 'en';
    return _localizedValues[lang]?[key] ??
        _localizedValues['en']?[key] ??
        key;
  }

  String t(String key) => translate(key);

  static final Map<String, Map<String, String>> _localizedValues = {
    'en': {
      // Brand
      'brandName': 'SiteReady GCC',
      'brandTagline': 'Contractor Compliance & Safety Platform',
      'demoModeActive': 'Sandbox / Demo Mode Active',
      'demoModeNotice': 'Running in safe local mode. All changes persist locally.',

      // Common
      'save': 'Save',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'add': 'Add',
      'create': 'Create',
      'update': 'Update',
      'submit': 'Submit',
      'search': 'Search...',
      'filter': 'Filter',
      'all': 'All',
      'status': 'Status',
      'actions': 'Actions',
      'view': 'View',
      'export': 'Export',
      'loading': 'Loading...',
      'noRecords': 'No records found',
      'confirmDelete': 'Are you sure you want to delete this record? This action cannot be undone.',
      'requiredField': 'This field is required',
      'successSaved': 'Changes saved successfully',
      'successCreated': 'Record created successfully',
      'successDeleted': 'Record deleted successfully',
      'errorGeneric': 'An unexpected error occurred. Please try again.',
      'yes': 'Yes',
      'no': 'No',
      'close': 'Close',

      // Navigation
      'navDashboard': 'Dashboard',
      'navEmployees': 'Employees',
      'navCertificates': 'Certificates',
      'navInspections': 'Inspections',
      'navMore': 'More',
      'navReports': 'Reports',
      'navSettings': 'Settings',
      'navAccount': 'Account',
      'navSignOut': 'Sign Out',
      'navSites': 'Project Sites',
      'navNotifications': 'Notifications',

      // Auth & Onboarding
      'signInTitle': 'Sign in to SiteReady GCC',
      'signInSubtitle': 'Contractor Safety & Compliance Mobile Portal',
      'emailLabel': 'Corporate Email',
      'passwordLabel': 'Password',
      'forgotPassword': 'Forgot password?',
      'signInButton': 'Sign In',
      'noAccount': "Don't have an account?",
      'signUpLink': 'Register company',
      'signUpTitle': 'Register Your Contracting Company',
      'companyNameLabel': 'Company Name (English)',
      'companyNameArLabel': 'Company Name (Arabic)',
      'crNumberLabel': 'Commercial Registration (CR / السجل التجاري)',
      'defaultSiteLabel': 'Primary Project Site Name',
      'languagePrefLabel': 'Default Language',
      'completeOnboarding': 'Initialize Company & Enter Portal',
      'signOutConfirm': 'Are you sure you want to sign out?',
      'invalidEmail': 'Please enter a valid corporate email address',
      'invalidPassword': 'Password must be at least 6 characters',

      // Roles
      'roleOwner': 'Owner',
      'roleManager': 'Manager',
      'roleViewer': 'Viewer',
      'currentRole': 'Current Role',
      'switchRole': 'Switch Role (Testing)',

      // Dashboard & KPIs
      'complianceRate': 'Compliance Rate',
      'totalEmployees': 'Total Active Workforce',
      'validCertificates': 'Valid Certificates',
      'expiringCertificates': 'Expiring in 30 Days',
      'expiredCertificates': 'Expired (Immediate Action)',
      'overdueInspections': 'Overdue Inspections',
      'openCorrectiveActions': 'Open Corrective Actions (CAPA)',
      'gateClearance': 'Turnstile Gate Clearance',
      'gateCleared': 'GATE CLEARED',
      'gateBarred': 'ACCESS BARRED',
      'turnstileScanner': 'Gate Turnstile Pass',
      'quickActions': 'Quick Safety Actions',
      'newInspection': 'New Audit',
      'addWorker': 'Add Worker',
      'addCert': 'Add Certificate',
      'expiringAlertBanner': 'Workers with expired certificates are barred from site access.',

      // Employees
      'employeesTitle': 'Workforce Directory',
      'addEmployee': 'Register New Worker',
      'editEmployee': 'Edit Worker Dossier',
      'employeeNo': 'Badge / Employee #',
      'fullName': 'Full Name (English)',
      'fullNameAr': 'Full Name (Arabic)',
      'iqamaId': 'Saudi Iqama / National ID',
      'iqamaInvalid': 'Saudi ID must be exactly 10 digits starting with 1 or 2',
      'jobTitle': 'Designation / Trade',
      'nationality': 'Nationality',
      'phone': 'Mobile Phone',
      'site': 'Assigned Site',
      'employmentStatus': 'Status',
      'joiningDate': 'Joining Date',
      'statusActive': 'Active',
      'statusSuspended': 'Suspended',
      'statusTerminated': 'Terminated',
      'statusOnLeave': 'On Leave',
      'workerDossier': 'Worker Safety Dossier',
      'workerCertificates': 'Assigned Certifications & Licenses',
      'noWorkerCerts': 'No certificates registered for this worker.',
      'turnstileQrPass': 'Turnstile Gate Pass (QR)',
      'qrDisclaimer': 'Present this QR badge at NEOM / Aramco site security turnstiles.',

      // Certificates
      'certificatesTitle': 'Safety Licenses & Expiries',
      'addCertificate': 'Add Certificate',
      'certificateType': 'Certificate Type',
      'licenseNumber': 'License / Certificate #',
      'issueDate': 'Issue Date',
      'expiryDate': 'Expiry Date',
      'noExpiry': 'Permanent / No Expiry',
      'statusValid': 'Valid',
      'statusExpiring': 'Expiring Soon',
      'statusExpired': 'Expired',
      'statusMissing': 'Missing Doc',
      'renew': 'Renew',
      'renewCertificate': 'Renew Certificate',
      'newExpiryDate': 'New Expiry Date',
      'renewalHistory': 'Renewal Audit History',
      'attachment': 'Private Document Attachment',
      'uploadAttachment': 'Upload PDF / Image File',
      'fileAttached': 'Document securely stored in contractor-docs',
      'viewAttachment': 'View Secure Attachment',
      'whatsappReminder': 'Send WhatsApp Reminder',
      'whatsappText': 'Urgent: Your safety certificate expires soon. Please submit renewal documents.',
      'expiringInDays': 'Expiring in {days} days',
      'expiredDaysAgo': 'Expired {days} days ago',

      // Inspections
      'inspectionsTitle': 'Site Safety Audits',
      'newInspectionTitle': 'Schedule Safety Inspection',
      'inspectionType': 'Inspection Category',
      'scheduledDate': 'Scheduled Date',
      'statusDraft': 'Draft',
      'statusInProgress': 'In Progress',
      'statusPass': 'Completed (Passed)',
      'statusFail': 'Completed (Failed)',
      'statusCancelled': 'Cancelled',
      'completeInspection': 'Complete & Sign Off',
      'saveDraft': 'Save Draft Checkpoints',
      'checkpointPass': 'PASS',
      'checkpointFail': 'FAIL',
      'checkpointNA': 'N/A',
      'findings': 'Safety Findings & Observations',
      'signature': 'Supervisor Sign-off',
      'checklistHeading': 'Audit Checkpoints',
      'allCheckpointsPassed': 'All audited checkpoints passed compliance standard.',
      'checkpointsFailed': 'Violations found: Corrective actions automatically assigned.',

      // Corrective Actions
      'capaTitle': 'Corrective Actions (CAPA)',
      'actionTitle': 'Action Required',
      'actionPriority': 'Priority',
      'actionStatus': 'Status',
      'actionDueDate': 'Due Date',
      'actionAssignedTo': 'Responsible Person',
      'actionResolve': 'Mark Resolved',
      'resolutionNotes': 'Resolution Notes & Verification',
      'priorityLow': 'Low',
      'priorityMedium': 'Medium',
      'priorityHigh': 'High',
      'priorityCritical': 'Critical',
      'actionOpen': 'Open',
      'actionInProgress': 'In Progress',
      'actionResolved': 'Resolved',
      'actionClosed': 'Closed & Verified',

      // Settings & Language
      'settingsTitle': 'Settings & Preferences',
      'language': 'Language / اللغة',
      'languageEnglish': 'English',
      'languageArabic': 'العربية (RTL)',
      'activeCompany': 'Active Company',
      'activeSite': 'Current Site Context',
      'allSites': 'All Project Sites',
      'subscriptionPlan': 'Subscription Plan',
      'offlineStatus': 'Storage Mode',
      'offlineSandbox': 'Local Sandbox Store',
      'liveSupabase': 'Live Supabase Cloud',
      'aboutApp': 'About SiteReady GCC Mobile',
      'appVersionText': 'SiteReady GCC Mobile v1.0.0 (Dart/Flutter Native)',
    },
    'ar': {
      // Brand
      'brandName': 'سايت ريدي الخليج',
      'brandTagline': 'منصة امتثال وسلامة المقاولين',
      'demoModeActive': 'وضع العرض التجريبي نشط',
      'demoModeNotice': 'يعمل التطبيق في الوضع التجريبي المحلي الآمن. يتم حفظ التغييرات محلياً.',

      // Common
      'save': 'حفظ',
      'cancel': 'إلغاء',
      'delete': 'حذف',
      'edit': 'تعديل',
      'add': 'إضافة',
      'create': 'إنشاء',
      'update': 'تحديث',
      'submit': 'إرسال',
      'search': 'بحث...',
      'filter': 'تصفية',
      'all': 'الكل',
      'status': 'الحالة',
      'actions': 'الإجراءات',
      'view': 'عرض',
      'export': 'تصدير',
      'loading': 'جارٍ التحميل...',
      'noRecords': 'لا توجد سجلات مطابقة',
      'confirmDelete': 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',
      'requiredField': 'هذا الحقل إلزامي',
      'successSaved': 'تم حفظ التعديلات بنجاح',
      'successCreated': 'تم إنشاء السجل بنجاح',
      'successDeleted': 'تم حذف السجل بنجاح',
      'errorGeneric': 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      'yes': 'نعم',
      'no': 'لا',
      'close': 'إغلاق',

      // Navigation
      'navDashboard': 'الرئيسية',
      'navEmployees': 'العاملين',
      'navCertificates': 'الشهادات',
      'navInspections': 'التفتيش',
      'navMore': 'المزيد',
      'navReports': 'التقارير',
      'navSettings': 'الإعدادات',
      'navAccount': 'الحساب',
      'navSignOut': 'تسجيل الخروج',
      'navSites': 'مواقع المشاريع',
      'navNotifications': 'الإشعارات',

      // Auth & Onboarding
      'signInTitle': 'تسجيل الدخول إلى سايت ريدي',
      'signInSubtitle': 'بوابة الامتثال والسلامة المهنية للمقاولين',
      'emailLabel': 'البريد الإلكتروني للشركة',
      'passwordLabel': 'كلمة المرور',
      'forgotPassword': 'نسيت كلمة المرور؟',
      'signInButton': 'تسجيل الدخول',
      'noAccount': 'ليس لديك حساب منشأة؟',
      'signUpLink': 'تسجيل شركة جديدة',
      'signUpTitle': 'تسجيل شركة مقاولات جديدة',
      'companyNameLabel': 'اسم الشركة (بالإنجليزية)',
      'companyNameArLabel': 'اسم الشركة (بالعربية)',
      'crNumberLabel': 'رقم السجل التجاري (CR)',
      'defaultSiteLabel': 'اسم موقع المشروع الرئيسي',
      'languagePrefLabel': 'اللغة الافتراضية',
      'completeOnboarding': 'تهيئة المنشأة والدخول للنظام',
      'signOutConfirm': 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      'invalidEmail': 'يرجى إدخال بريد إلكتروني صالح',
      'invalidPassword': 'يجب ألا تقل كلمة المرور عن 6 أحرف',

      // Roles
      'roleOwner': 'مالك المنشأة',
      'roleManager': 'مدير سلامة',
      'roleViewer': 'مشاهد فقط',
      'currentRole': 'الدور الحالي',
      'switchRole': 'تبديل الدور (للاختبار)',

      // Dashboard & KPIs
      'complianceRate': 'نسبة الامتثال',
      'totalEmployees': 'إجمالي القوى العاملة',
      'validCertificates': 'شهادات سارية',
      'expiringCertificates': 'تنتهي خلال 30 يوم',
      'expiredCertificates': 'شهادات منتهية (إجراء فوري)',
      'overdueInspections': 'تفتيشات متأخرة',
      'openCorrectiveActions': 'إجراءات تصحيحية مفتوحة (CAPA)',
      'gateClearance': 'تصريح دخول البوابة',
      'gateCleared': 'مصرح بالدخول',
      'gateBarred': 'ممنوع من الدخول',
      'turnstileScanner': 'بطاقة بوابة العبور',
      'quickActions': 'إجراءات السلامة السريعة',
      'newInspection': 'تفتيش جديد',
      'addWorker': 'إضافة عامل',
      'addCert': 'إضافة شهادة',
      'expiringAlertBanner': 'يتم منع العمال ذوي الشهادات المنتهية من دخول بوابات الموقع فورياً.',

      // Employees
      'employeesTitle': 'دليل القوى العاملة',
      'addEmployee': 'تسجيل عامل جديد',
      'editEmployee': 'تعديل ملف العامل',
      'employeeNo': 'الرقم الوظيفي / الشارة',
      'fullName': 'الاسم الكامل (بالإنجليزية)',
      'fullNameAr': 'الاسم الكامل (بالعربية)',
      'iqamaId': 'رقم الإقامة / الهوية الوطنية',
      'iqamaInvalid': 'رقم الهوية/الإقامة يجب أن يتكون من 10 أرقام ويبدأ بـ 1 أو 2',
      'jobTitle': 'المهنة / المسمى الوظيفي',
      'nationality': 'الجنسية',
      'phone': 'رقم الجوال',
      'site': 'الموقع المعين',
      'employmentStatus': 'حالة العمل',
      'joiningDate': 'تاريخ الالتحاق',
      'statusActive': 'على رأس العمل',
      'statusSuspended': 'موقوف مؤقتاً',
      'statusTerminated': 'منتهي التعاقد',
      'statusOnLeave': 'في إجازة',
      'workerDossier': 'ملف السلامة المهنية للعامل',
      'workerCertificates': 'الرخص والشهادات المعتمدة',
      'noWorkerCerts': 'لا توجد شهادات مسجلة لهذا العامل حالياً.',
      'turnstileQrPass': 'تصريح بوابة العبور (QR)',
      'qrDisclaimer': 'أبرز رمز الاستجابة السريعة هذا عند بوابات الدخول الأمنية لمشاريع أرامكو ونيوم.',

      // Certificates
      'certificatesTitle': 'سجل الرخص والشهادات',
      'addCertificate': 'إضافة شهادة جديدة',
      'certificateType': 'نوع الشهادة / التدريب',
      'licenseNumber': 'رقم الشهادة / الرخصة',
      'issueDate': 'تاريخ الإصدار',
      'expiryDate': 'تاريخ الانتهاء',
      'noExpiry': 'دائمة / لا تتطلب انتهاء',
      'statusValid': 'سارية',
      'statusExpiring': 'تنتهي قريباً',
      'statusExpired': 'منتهية',
      'statusMissing': 'مستند مفقود',
      'renew': 'تجديد',
      'renewCertificate': 'تجديد الشهادة',
      'newExpiryDate': 'تاريخ الانتهاء الجديد',
      'renewalHistory': 'سجل عمليات التجديد السابقة',
      'attachment': 'المستند المرفق الخاص',
      'uploadAttachment': 'تحميل ملف PDF أو صورة',
      'fileAttached': 'تم حفظ المستند بأمان في حاوية contractor-docs الخاصة',
      'viewAttachment': 'عرض المستند الآمن',
      'whatsappReminder': 'إرسال تذكير عبر واتساب',
      'whatsappText': 'عاجل: تقترب شهادة السلامة الخاصة بك من الانتهاء. يرجى تقديم وثائق التجديد فوراً.',
      'expiringInDays': 'تنتهي خلال {days} يوم',
      'expiredDaysAgo': 'منتهية منذ {days} يوم',

      // Inspections
      'inspectionsTitle': 'عمليات التفتيش والتدقيق',
      'newInspectionTitle': 'جدولة تفتيش سلامة جديد',
      'inspectionType': 'تصنيف التفتيش',
      'scheduledDate': 'تاريخ التفتيش',
      'statusDraft': 'مسودة',
      'statusInProgress': 'قيد التنفيذ',
      'statusPass': 'مكتمل (ناجح ومطابق)',
      'statusFail': 'مكتمل (راسب / مخالف)',
      'statusCancelled': 'ملغي',
      'completeInspection': 'اعتماد وإنهاء التفتيش',
      'saveDraft': 'حفظ نقاط الفحص كمسودة',
      'checkpointPass': 'مطابق',
      'checkpointFail': 'مخالف',
      'checkpointNA': 'لا ينطبق',
      'findings': 'الملاحظات والمخالفات المرصودة',
      'signature': 'توقيع المشرف الميداني',
      'checklistHeading': 'نقاط الفحص والتحقق',
      'allCheckpointsPassed': 'جميع نقاط الفحص مستوفية لشروط السلامة المعتمدة.',
      'checkpointsFailed': 'تم رصد مخالفات: تم إصدار إجراءات تصحيحية تلقائياً.',

      // Corrective Actions
      'capaTitle': 'الإجراءات التصحيحية (CAPA)',
      'actionTitle': 'الإجراء المطلوب',
      'actionPriority': 'الأولوية',
      'actionStatus': 'حالة الإجراء',
      'actionDueDate': 'تاريخ الاستحقاق',
      'actionAssignedTo': 'المسؤول عن التنفيذ',
      'actionResolve': 'إغلاق وحل الإجراء',
      'resolutionNotes': 'بيان المعالجة والتحقق',
      'priorityLow': 'منخفضة',
      'priorityMedium': 'متوسطة',
      'priorityHigh': 'عالية',
      'priorityCritical': 'حرجة وفورية',
      'actionOpen': 'مفتوح',
      'actionInProgress': 'قيد المعالجة',
      'actionResolved': 'تم الحل',
      'actionClosed': 'مغلق ومتحقق منه',

      // Settings & Language
      'settingsTitle': 'الإعدادات والخيارات',
      'language': 'Language / اللغة',
      'languageEnglish': 'English',
      'languageArabic': 'العربية (RTL)',
      'activeCompany': 'الشركة النشطة',
      'activeSite': 'موقع المشروع النشط',
      'allSites': 'جميع مواقع المشاريع',
      'subscriptionPlan': 'باقة الاشتراك',
      'offlineStatus': 'حالة التخزين',
      'offlineSandbox': 'مخزن محلي آمن',
      'liveSupabase': 'سحابة سوبابيز الحية',
      'aboutApp': 'عن سايت ريدي الخليج',
      'appVersionText': 'سايت ريدي الخليج - تطبيق أندرويد الأصلي v1.0.0 (فلاتر / دارت)',
    },
  };
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'ar'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

extension LocalizedContext on BuildContext {
  String tr(String key) => AppLocalizations.of(this).translate(key);
}

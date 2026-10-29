/**
 * SiteReady GCC — Reactive State Store & Dispatcher
 */

class SiteReadyStore {
  constructor() {
    this.deviceView = 'split'; // Default to 'split' or 'desktop' to immediately show the power of both versions!
    this.locale = 'en';
    this.desktopRoute = 'dashboard';
    this.mobileTab = 'dashboard';
    this.selectedWorkerId = 'SR-8921';
    this.selectedSiteId = 'neom-spine-4';
    this.filterStatus = 'all';
    this.searchQuery = '';
    this.isOffline = false;
    this.offlineQueueCount = 12;
    this.isSyncing = false;
    
    // In-memory reactive data
    this.workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
    this.sites = JSON.parse(JSON.stringify(INITIAL_PROJECT_SITES));
    this.subcontractors = JSON.parse(JSON.stringify(INITIAL_SUBCONTRACTORS));
    this.inspections = JSON.parse(JSON.stringify(INITIAL_INSPECTIONS));
    this.recentActivity = JSON.parse(JSON.stringify(INITIAL_RECENT_GATE_ACTIVITY));
    
    // Subscribed listeners
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // Setters
  setDeviceView(view) {
    this.deviceView = view;
    this.notify();
  }

  setLocale(locale) {
    this.locale = locale;
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale);
    this.notify();
  }

  setDesktopRoute(route) {
    this.desktopRoute = route;
    this.notify();
  }

  setMobileTab(tab) {
    this.mobileTab = tab;
    this.notify();
  }

  setSelectedWorker(workerId) {
    this.selectedWorkerId = workerId;
    this.notify();
  }

  setSelectedSite(siteId) {
    this.selectedSiteId = siteId;
    this.notify();
  }

  setFilterStatus(status) {
    this.filterStatus = status;
    this.notify();
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.notify();
  }

  toggleOffline() {
    this.isOffline = !this.isOffline;
    if (this.isOffline) {
      this.showToast(this.t('offlineOffline'), 'warning');
    } else {
      this.showToast(this.t('offlineSyncing'), 'info');
      this.isSyncing = true;
      this.notify();
      setTimeout(() => {
        this.offlineQueueCount = 0;
        this.isSyncing = false;
        this.showToast(this.locale === 'ar' ? 'تمت مزامنة 12 سجلاً بنجاح مع البوابة الحكومية' : 'Successfully synced 12 cached records with Qiwa & Muqeem', 'success');
        this.notify();
      }, 1500);
    }
    this.notify();
  }

  syncNow() {
    this.isSyncing = true;
    this.notify();
    setTimeout(() => {
      this.isSyncing = false;
      this.recentActivity.unshift({
        id: 'act-' + Date.now(),
        timeAgo: 'Just now',
        titleEn: 'Manual Qiwa & Muqeem Gateway Sync',
        titleAr: 'مزامنة يدوية فورية مع منصتي قوى ومُقيم',
        detailEn: 'All contractor licenses and trade credentials verified',
        detailAr: 'تم التحقق من تراخيص كافة المقاولين واعتمادات العمال',
        type: 'success',
        icon: 'sync'
      });
      this.showToast(this.locale === 'ar' ? 'تم تحديث كافة السجلات والربط الحكومي لحظياً' : 'All worker credentials and government gates synchronized', 'success');
      this.notify();
    }, 1200);
  }

  // Get active translation string
  t(key) {
    const dict = I18N_DICTIONARY[this.locale] || I18N_DICTIONARY.en;
    return dict[key] || I18N_DICTIONARY.en[key] || key;
  }

  // Helpers
  getSelectedSite() {
    return this.sites.find(s => s.id === this.selectedSiteId) || this.sites[0];
  }

  getSelectedWorker() {
    return this.workers.find(w => w.id === this.selectedWorkerId) || this.workers[0];
  }

  getFilteredWorkers() {
    return this.workers.filter(w => {
      // Status filter
      if (this.filterStatus !== 'all') {
        if (w.gateStatus !== this.filterStatus) return false;
      }
      // Search query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchName = w.nameEn.toLowerCase().includes(q) || w.nameAr.includes(q);
        const matchIqama = w.iqama.includes(q);
        const matchTrade = w.tradeEn.toLowerCase().includes(q) || w.tradeAr.includes(q);
        const matchId = w.id.toLowerCase().includes(q);
        if (!matchName && !matchIqama && !matchTrade && !matchId) return false;
      }
      return true;
    });
  }

  getMetrics() {
    const total = this.workers.length;
    const compliant = this.workers.filter(w => w.gateStatus === 'compliant').length;
    const expiring = this.workers.filter(w => w.gateStatus === 'expiring').length;
    const barred = this.workers.filter(w => w.gateStatus === 'barred').length;
    const rate = total > 0 ? ((compliant / total) * 100).toFixed(1) : 0;
    return { total, compliant, expiring, barred, rate };
  }

  // Mutators
  addWorker(newWorkerData) {
    const id = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
    const worker = {
      id,
      nameEn: newWorkerData.nameEn || "New Worker",
      nameAr: newWorkerData.nameAr || newWorkerData.nameEn || "عامل جديد",
      tradeEn: newWorkerData.tradeEn || "Civil Construction Specialist",
      tradeAr: newWorkerData.tradeAr || "أخصائي إنشاءات مدنية",
      categoryEn: "General Construction",
      categoryAr: "الإنشاءات العامة",
      iqama: newWorkerData.iqama || "2" + Math.floor(100000000 + Math.random() * 900000000),
      nationality: newWorkerData.nationality || "Saudi Arabian",
      natCode: newWorkerData.nationality === "Saudi Arabian" ? "SAU" : "EXP",
      isSaudi: newWorkerData.nationality === "Saudi Arabian",
      subcontractorId: newWorkerData.subcontractorId || "al-fanar",
      subcontractorNameEn: "Al-Fanar Civils (Tier 1)",
      subcontractorNameAr: "الفنار للأعمال المدنية (فئة 1)",
      siteId: this.selectedSiteId,
      siteNameEn: this.getSelectedSite().nameEn,
      siteNameAr: this.getSelectedSite().nameAr,
      passSerial: `GP-NEOM-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      gateStatus: "compliant",
      gatePermitted: true,
      statusTextEn: "COMPLIANT — Green Gate Pass Active",
      statusTextAr: "ممتثل — تصريح البوابة الأخضر نشط",
      expiryDate: newWorkerData.expiryDate || "2026-12-31",
      validThroughTextEn: "Valid thru Dec 2026",
      validThroughTextAr: "ساري حتى ديسمبر 2026",
      photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAn95uG7Zo8tefS7dKGu4F-_R1S2CO2jGRVsQ06kvKBex898wXi2JITNE-kUYqhVI0i7e5J27xIQyjqQ8aVC1GT2lYIoL8TC_yrkqa5e2zGWttIBM89qsqxeCr1snefynGOSpQLxtsKwVuLvLWpWVikBms2rweY9LN8_BmNT1dE50QSyicTl-ZL-lB6Fo8u2lK6eAzhoU1OPeT0jhVQDA-zMdSTHYtlA1rckqCdf0G0",
      qiwaVerified: true,
      gosiStatus: "Active",
      medicalFit: true,
      medicalExpiry: "2025-12-31",
      safetyInductions: "100% Cleared",
      certificates: [
        {
          id: 'c-' + Date.now(),
          nameEn: newWorkerData.certNameEn || "General Construction Safety Induction",
          nameAr: newWorkerData.certNameAr || "شهادة السلامة الإنشائية المعتمدة",
          issuingBodyEn: "KSA Ministry of Human Resources / Qiwa",
          issuingBodyAr: "وزارة الموارد البشرية ومنصة قوى",
          licenseNo: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
          issueDate: "2024-10-01",
          expiryDate: newWorkerData.expiryDate || "2026-10-01",
          status: "valid",
          daysRemaining: 730,
          validityLabelEn: "Valid 24 mos",
          validityLabelAr: "ساري لمدة سنتين"
        }
      ],
      gateHistory: [
        { time: "Just now", gate: "Gate 04 Main Portal", eventEn: "Registration Active — NFC Token Generated", eventAr: "تم التفعيل - إصدار شريحة الدخول الميدانية", status: "pass" }
      ]
    };

    this.workers.unshift(worker);
    this.selectedWorkerId = id;

    this.recentActivity.unshift({
      id: 'act-' + Date.now(),
      timeAgo: 'Just now',
      titleEn: `New Employee Registered: ${worker.nameEn}`,
      titleAr: `تم تسجيل عامل جديد: ${worker.nameAr}`,
      detailEn: `${worker.tradeEn} • Iqama: ${worker.iqama} verified`,
      detailAr: `${worker.tradeAr} • تم التحقق من الإقامة ${worker.iqama}`,
      type: 'success',
      icon: 'person_add'
    });

    this.showToast(this.locale === 'ar' ? `تم إضافة الموظف ${worker.nameAr} بنجاح` : `Employee ${worker.nameEn} registered successfully!`, 'success');
    this.notify();
  }

  addCertificate(workerId, certData) {
    const worker = this.workers.find(w => w.id === workerId);
    if (!worker) return;

    const cert = {
      id: 'c-' + Date.now(),
      nameEn: certData.nameEn || "Certified HSE Competency",
      nameAr: certData.nameAr || certData.nameEn || "شهادة الكفاءة المهنية المعتمدة",
      issuingBodyEn: certData.issuingBodyEn || "Saudi Aramco / Civil Defense",
      issuingBodyAr: certData.issuingBodyAr || "أرامكو السعودية / الدفاع المدني",
      licenseNo: certData.licenseNo || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: certData.issueDate || "2024-10-01",
      expiryDate: certData.expiryDate || "2026-10-01",
      status: "valid",
      daysRemaining: 730,
      validityLabelEn: "Valid",
      validityLabelAr: "ساري"
    };

    worker.certificates.push(cert);
    if (worker.gateStatus === 'barred' || worker.gateStatus === 'expiring') {
      worker.gateStatus = 'compliant';
      worker.gatePermitted = true;
      worker.statusTextEn = "COMPLIANT — Green Gate Pass Active";
      worker.statusTextAr = "ممتثل — تصريح البوابة الأخضر نشط";
    }

    this.showToast(this.locale === 'ar' ? `تمت إضافة شهادة ${cert.nameAr} وتحديث حالة البوابة` : `Certificate ${cert.nameEn} added and turnstile clearance updated!`, 'success');
    this.notify();
  }

  resolveLockout(workerId, replacementWorkerId) {
    const worker = this.workers.find(w => w.id === workerId);
    if (worker) {
      worker.gateStatus = 'compliant';
      worker.gatePermitted = true;
      worker.statusTextEn = "TEMPORARY GATE OVERRIDE — Cleared by HSE Director";
      worker.statusTextAr = "تصريح استثنائي مؤقت — معتمد من مدير السلامة";
      worker.certificates.forEach(c => {
        if (c.status === 'expired') {
          c.status = 'valid';
          c.daysRemaining = 30;
          c.validityLabelEn = "Grace Period (30d)";
          c.validityLabelAr = "مهلة استثنائية (30 يوماً)";
        }
      });
    }

    this.recentActivity.unshift({
      id: 'act-' + Date.now(),
      timeAgo: 'Just now',
      titleEn: `HSE Lockout Resolved: ${worker ? worker.nameEn : 'Crew'}`,
      titleAr: `تم حل الإغلاق الأمني: ${worker ? worker.nameAr : 'طاقم العمل'}`,
      detailEn: 'Emergency biometric gate override authorized by Eng. Tariq Al-Otaibi',
      detailAr: 'تم اعتماد فتح البوابة الاستثنائي من م. طارق العتيبي',
      type: 'warning',
      icon: 'lock_open'
    });

    this.showToast(this.locale === 'ar' ? 'تم إلغاء الحظر وإعادة تكليف الطاقم الميداني' : 'Lockout resolved: Turnstile interlock cleared and crew re-assigned!', 'success');
    this.notify();
  }

  executeInspection(inspectionId, checkpointResults) {
    const inspection = this.inspections.find(i => i.id === inspectionId);
    if (!inspection) return;

    inspection.status = "passed";
    inspection.statusTextEn = "Passed & Cleared by Field Lead";
    inspection.statusTextAr = "اجتاز الفحص بنجاح ومعتمد";
    inspection.completedTime = "Just now AST";
    inspection.defectCount = 0;

    this.showToast(this.locale === 'ar' ? `تم اعتماد فحص ${inspection.titleAr}` : `Inspection ${inspection.titleEn} completed and certified!`, 'success');
    this.notify();
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('global-toast');
    if (!toast) return;

    const iconEl = toast.querySelector('.toast-icon');
    const msgEl = toast.querySelector('.toast-message');

    if (msgEl) msgEl.textContent = message;
    if (iconEl) {
      if (type === 'success') {
        iconEl.textContent = 'check_circle';
        iconEl.className = 'material-symbols-outlined text-secondary text-[22px] toast-icon';
      } else if (type === 'warning') {
        iconEl.textContent = 'warning';
        iconEl.className = 'material-symbols-outlined text-[#f2b544] text-[22px] toast-icon';
      } else if (type === 'error') {
        iconEl.textContent = 'error';
        iconEl.className = 'material-symbols-outlined text-[#c83e4d] text-[22px] toast-icon';
      } else {
        iconEl.textContent = 'info';
        iconEl.className = 'material-symbols-outlined text-[#90f4e8] text-[22px] toast-icon';
      }
    }

    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    }, 4000);
  }
}

// Global store instance
const store = new SiteReadyStore();

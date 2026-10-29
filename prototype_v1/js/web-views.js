/**
 * SiteReady GCC — Desktop Web View Renderers
 * Full Enterprise Widescreen Layouts (LTR & RTL Compliant)
 */

const WebViews = {
  // Master Layout wrapper (Sidebar + Top Bar + Main)
  render(route = 'dashboard') {
    const isAr = store.locale === 'ar';
    const activeSite = store.getSelectedSite();
    const siteTitle = isAr ? activeSite.nameAr : activeSite.nameEn;
    const clientTitle = isAr ? activeSite.clientAr : activeSite.clientEn;

    let mainContentHtml = '';
    switch (route) {
      case 'dashboard':
        mainContentHtml = this.renderDashboard();
        break;
      case 'employees':
        mainContentHtml = this.renderEmployees();
        break;
      case 'employee-detail':
        mainContentHtml = this.renderEmployeeDetail();
        break;
      case 'certificates':
        mainContentHtml = this.renderCertificates();
        break;
      case 'inspections':
        mainContentHtml = this.renderInspections();
        break;
      case 'reports':
        mainContentHtml = this.renderReports();
        break;
      case 'onboarding':
        return this.renderOnboarding();
      default:
        mainContentHtml = this.renderDashboard();
    }

    const metrics = store.getMetrics();

    return `
      <div class="flex min-h-screen bg-[#F5F7FA] text-[#172B3A] antialiased">
        <!-- Sidebar Navigation -->
        <aside class="w-64 bg-[#001D37] text-white flex flex-col justify-between shrink-0 shadow-lg select-none z-30">
          <div class="flex flex-col flex-1 overflow-y-auto">
            <!-- Brand Logo Header -->
            <div class="h-16 px-6 flex items-center justify-between bg-[#16324F]/50 border-b border-white/10 cursor-pointer" onclick="store.setDesktopRoute('dashboard')">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[#168C82] flex items-center justify-center text-white shadow-sm">
                  <span class="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[17px] font-bold tracking-tight text-white leading-none">SiteReady</span>
                  <span class="text-[10px] uppercase font-bold tracking-wider text-[#90f4e8] mt-1">${store.t('systemBadge')}</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-[#809abd] text-[18px]">shield</span>
            </div>

            <!-- Operational Modules Category -->
            <div class="px-5 pt-5 pb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#809abd]">${store.t('navModules')}</span>
            </div>

            <!-- Navigation Links -->
            <nav class="flex flex-col gap-1 px-3">
              <!-- Dashboard Link -->
              <button onclick="store.setDesktopRoute('dashboard')" 
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${route === 'dashboard' ? 'bg-[#168C82] text-white font-semibold shadow-sm' : 'text-[#809abd] hover:bg-[#16324F] hover:text-white'}">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px]">space_dashboard</span>
                  <span>${store.t('navDashboard')}</span>
                </div>
                <span class="px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#ffdad6] text-[#93000a]">${metrics.barred}</span>
              </button>

              <!-- Employees Link -->
              <button onclick="store.setDesktopRoute('employees')" 
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${route === 'employees' || route === 'employee-detail' ? 'bg-[#168C82] text-white font-semibold shadow-sm' : 'text-[#809abd] hover:bg-[#16324F] hover:text-white'}">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px]">badge</span>
                  <span>${store.t('navEmployees')}</span>
                </div>
                <span class="font-mono text-[12px] opacity-80">${metrics.total}</span>
              </button>

              <!-- Certificates Link -->
              <button onclick="store.setDesktopRoute('certificates')" 
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${route === 'certificates' ? 'bg-[#168C82] text-white font-semibold shadow-sm' : 'text-[#809abd] hover:bg-[#16324F] hover:text-white'}">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px]">workspace_premium</span>
                  <span>${store.t('navCertificates')}</span>
                </div>
                <span class="px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#ffdeab] text-[#281900]">${metrics.expiring}</span>
              </button>

              <!-- Inspections Link -->
              <button onclick="store.setDesktopRoute('inspections')" 
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${route === 'inspections' ? 'bg-[#168C82] text-white font-semibold shadow-sm' : 'text-[#809abd] hover:bg-[#16324F] hover:text-white'}">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px]">fact_check</span>
                  <span>${store.t('navInspections')}</span>
                </div>
                <span class="px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#eff4ff] text-[#001d37]">4</span>
              </button>

              <!-- Reports Link -->
              <button onclick="store.setDesktopRoute('reports')" 
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${route === 'reports' ? 'bg-[#168C82] text-white font-semibold shadow-sm' : 'text-[#809abd] hover:bg-[#16324F] hover:text-white'}">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px]">analytics</span>
                  <span>${store.t('navReports')}</span>
                </div>
              </button>

              <div class="my-3 mx-2 h-px bg-[#16324F]"></div>

              <!-- Admin Section -->
              <div class="px-2 pb-1">
                <span class="text-[11px] font-bold uppercase tracking-wider text-[#809abd]">${store.t('navAdministration')}</span>
              </div>

              <!-- Team Link -->
              <button onclick="store.showToast('${isAr ? 'إدارة صلاحيات مسؤولي السلامة والمشرفين' : 'HSE Team & Security Permissions'}')" 
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#809abd] hover:bg-[#16324F] hover:text-white transition-all">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  <span>${store.t('navTeam')}</span>
                </div>
              </button>

              <!-- Onboarding / Login Link -->
              <button onclick="store.setDesktopRoute('onboarding')" 
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#809abd] hover:bg-[#16324F] hover:text-white transition-all">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px]">login</span>
                  <span>${isAr ? 'بوابة تسجيل المقاولين (CR)' : 'Company Portal / Login'}</span>
                </div>
              </button>
            </nav>
          </div>

          <!-- Bottom Live Gate Gateway Card -->
          <div class="p-3 m-3 bg-[#16324F]/60 rounded-xl border border-white/10 flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-[#73d7cb] uppercase tracking-wider">KSA / UAE Mega-Sites</span>
              <span class="w-2 h-2 rounded-full bg-[#168C82] animate-pulse"></span>
            </div>
            <span class="text-[13px] font-semibold text-white">${store.t('syncLive')}</span>
            <span class="text-[11px] text-[#809abd]">${isAr ? 'ربط فوري نشط مع مقيم وقوى' : 'Muqeem & Qiwa Live Gateway'}</span>
          </div>
        </aside>

        <!-- Right Main View Area -->
        <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <!-- Top Desktop Header Bar -->
          <header class="h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-20 flex items-center justify-between px-6 shadow-sm">
            <!-- Left: Scope Selector & Search -->
            <div class="flex items-center gap-4">
              <!-- Site Selector Dropdown -->
              <div class="relative group">
                <button class="flex items-center gap-2 bg-[#F5F7FA] hover:bg-[#EFF4FF] border border-[#E2E8F0] px-3.5 py-1.5 rounded-xl transition-all text-start">
                  <span class="material-symbols-outlined text-[18px] text-[#168C82]">business</span>
                  <div class="flex flex-col">
                    <span class="text-[13px] font-bold text-[#172B3A] leading-tight">Al-Fanar Contracting</span>
                    <span class="text-[11px] text-[#64748B] leading-none truncate max-w-[220px]">${siteTitle}</span>
                  </div>
                  <span class="material-symbols-outlined text-[16px] text-[#64748B]">unfold_more</span>
                </button>
                <!-- Dropdown Flyout -->
                <div class="hidden group-hover:block absolute ${isAr ? 'right-0' : 'left-0'} top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-1.5 z-50">
                  <div class="text-[10px] font-bold text-[#64748B] uppercase px-3 py-1">${store.t('siteScope')}</div>
                  ${store.sites.map(s => `
                    <button onclick="store.setSelectedSite('${s.id}')" class="w-full text-start px-3 py-2 rounded-lg text-[13px] flex items-center justify-between hover:bg-[#F5F7FA] ${s.id === store.selectedSiteId ? 'bg-[#E6F5F3] text-[#168C82] font-semibold' : 'text-[#172B3A]'}">
                      <span class="truncate">${isAr ? s.nameAr : s.nameEn}</span>
                      ${s.id === store.selectedSiteId ? '<span class="material-symbols-outlined text-[16px]">check</span>' : ''}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Quick Search Input -->
              <div class="hidden md:flex items-center gap-2 bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-1.5 rounded-xl w-72 focus-within:ring-2 focus-within:ring-[#16324F]/20 focus-within:bg-white transition-all">
                <span class="material-symbols-outlined text-[18px] text-[#64748B]">search</span>
                <input 
                  type="text" 
                  value="${store.searchQuery}" 
                  oninput="store.setSearchQuery(this.value)" 
                  placeholder="${store.t('searchPlaceholder')}" 
                  class="bg-transparent border-none outline-none text-[13px] text-[#172B3A] placeholder-[#94A3B8] w-full"
                />
                <span class="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] text-[#64748B] shadow-xs">⌘K</span>
              </div>
            </div>

            <!-- Right: Controls & User Profile -->
            <div class="flex items-center gap-3">
              <!-- Language Segmental Switcher -->
              <div class="flex items-center bg-[#F5F7FA] p-0.5 rounded-lg border border-[#E2E8F0]">
                <button onclick="store.setLocale('en')" class="px-2.5 py-1 rounded text-[12px] font-bold transition-all ${!isAr ? 'bg-[#16324F] text-white shadow-xs' : 'text-[#64748B] hover:text-[#172B3A]'}">EN</button>
                <button onclick="store.setLocale('ar')" class="px-2.5 py-1 rounded text-[12px] font-bold transition-all ${isAr ? 'bg-[#16324F] text-white shadow-xs' : 'text-[#64748B] hover:text-[#172B3A]'}">العربية</button>
              </div>

              <!-- Notification Bell -->
              <button onclick="Modals.openLockoutResolver()" class="relative w-9 h-9 rounded-xl bg-[#F5F7FA] hover:bg-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#172B3A] transition-colors" title="View Lockout Alerts">
                <span class="material-symbols-outlined text-[20px]">notifications</span>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C83E4D] ring-2 ring-white"></span>
              </button>

              <div class="h-6 w-px bg-[#E2E8F0]"></div>

              <!-- HSE Director Profile -->
              <div class="flex items-center gap-2.5 pl-1 cursor-pointer" onclick="store.showToast('${isAr ? 'تم تسجيل الدخول: م. طارق العتيبي (مدير السلامة)' : 'Logged in: Eng. Tariq Al-Otaibi (HSE Director)'}')">
                <div class="w-8 h-8 rounded-full bg-[#16324F] text-white flex items-center justify-center shadow-xs">
                  <span class="material-symbols-outlined text-[18px]">person</span>
                </div>
                <div class="hidden lg:flex flex-col text-start">
                  <span class="text-[13px] font-bold text-[#172B3A] leading-tight">Eng. Tariq Al-Otaibi</span>
                  <span class="text-[11px] text-[#64748B] leading-none">${isAr ? 'مدير السلامة والصحة المهنية' : 'HSE Director'}</span>
                </div>
                <span class="material-symbols-outlined text-[16px] text-[#64748B]">expand_more</span>
              </div>
            </div>
          </header>

          <!-- Main Dynamic Body -->
          <main class="p-6 pb-16 flex-1">
            ${mainContentHtml}
          </main>
        </div>
      </div>
    `;
  },

  // 1. Dashboard View
  renderDashboard() {
    const isAr = store.locale === 'ar';
    const metrics = store.getMetrics();
    const site = store.getSelectedSite();

    return `
      <div class="flex flex-col gap-6 w-full max-w-[1440px] mx-auto">
        <!-- Subheader & Quick Action Buttons -->
        <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 text-[#64748B] text-[12px] font-medium mb-1">
              <span class="material-symbols-outlined text-[16px] text-[#168C82]">verified</span>
              <span>${store.t('lastSyncNotice')}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></span>
              <span class="font-mono text-[#168C82] font-semibold">${store.isSyncing ? store.t('syncingText') : store.t('syncStatus')}</span>
            </div>
            <div class="flex flex-wrap items-baseline gap-3">
              <h1 class="text-[26px] font-bold tracking-tight text-[#172B3A]">${store.t('greeting')}</h1>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E2E8F0] text-[12px] font-medium text-[#172B3A] shadow-xs">
                <span class="w-2 h-2 rounded-full bg-[#168C82]"></span>
                Al-Fanar Contracting — ${isAr ? site.nameAr : site.nameEn}
              </span>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center flex-wrap gap-2.5">
            <button onclick="Modals.openAddEmployee()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16324F] hover:bg-[#0F2236] text-white text-[13px] font-semibold shadow-sm transition-all active:scale-98">
              <span class="material-symbols-outlined text-[18px]">person_add</span>
              <span>${store.t('btnAddEmployee')}</span>
            </button>
            <button onclick="Modals.openAddCertificate()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F7FA] border border-[#E2E8F0] text-[#172B3A] text-[13px] font-semibold shadow-xs transition-all active:scale-98">
              <span class="material-symbols-outlined text-[18px] text-[#168C82]">workspace_premium</span>
              <span>${store.t('btnAddCertificate')}</span>
            </button>
            <button onclick="Modals.openInspectionModal()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F7FA] border border-[#E2E8F0] text-[#172B3A] text-[13px] font-semibold shadow-xs transition-all active:scale-98">
              <span class="material-symbols-outlined text-[18px] text-[#64748B]">fact_check</span>
              <span>${store.t('btnScheduleInspection')}</span>
            </button>
            <button onclick="Modals.openExportAuditPack()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EFF4FF] hover:bg-[#dce9ff] text-[#16324F] text-[13px] font-semibold transition-all">
              <span class="material-symbols-outlined text-[18px]">file_download</span>
              <span>${store.t('btnExportAuditPack')}</span>
            </button>
          </div>
        </section>

        <!-- Critical HSE Lockout Alert Banner -->
        ${metrics.barred > 0 ? `
          <section class="relative overflow-hidden rounded-xl bg-[#FDECEE] border border-[#F7B5BC] p-4 shadow-sm">
            <div class="absolute ${isAr ? 'right-0' : 'left-0'} top-0 bottom-0 w-1.5 bg-[#C83E4D]"></div>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 ${isAr ? 'pr-2' : 'pl-2'}">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-white border border-[#F7B5BC] flex items-center justify-center text-[#C83E4D] shrink-0 shadow-xs">
                  <span class="material-symbols-outlined text-[24px]">gpp_bad</span>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-[#C83E4D] text-white">${store.t('criticalHseAlert')}</span>
                    <span class="font-mono text-[12px] text-[#C83E4D] font-bold">${store.t('criticalGateSub')}</span>
                  </div>
                  <p class="text-[15px] font-bold text-[#172B3A] mt-1 leading-snug">
                    ${metrics.barred} ${isAr ? 'عمال محظورون من المناطق الحرجة: انتهاء اعتمادات أرامكو للرافعات وتصاريح الجهد الفائق' : 'Personnel Barred from High-Risk Zones: Expired Saudi Aramco Rigging & SEC High Voltage Credentials'}
                  </p>
                  <p class="text-[12px] text-[#64748B] mt-0.5">
                    ${store.t('criticalLockoutSub')}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button onclick="Modals.openLockoutResolver()" class="px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-[#172B3A] text-[12px] font-bold hover:bg-[#F5F7FA] transition-colors shadow-xs">
                  ${store.t('viewLockoutBtn')}
                </button>
                <button onclick="Modals.openLockoutResolver()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C83E4D] hover:bg-[#b03542] text-white text-[12px] font-bold shadow-sm transition-all active:scale-98">
                  <span>${store.t('resolveReassignBtn')}</span>
                  <span class="material-symbols-outlined text-[16px]">${isAr ? 'arrow_back' : 'arrow_forward'}</span>
                </button>
              </div>
            </div>
          </section>
        ` : ''}

        <!-- 4 Key Metric KPI Cards -->
        <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <!-- Card 1: Active Workforce -->
          <div class="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-bold uppercase text-[#64748B] tracking-wider">${store.t('kpiWorkforce')}</span>
              <span class="w-8 h-8 rounded-lg bg-[#E6F5F3] flex items-center justify-center text-[#168C82]">
                <span class="material-symbols-outlined text-[20px]">badge</span>
              </span>
            </div>
            <div class="mt-3">
              <div class="flex items-baseline gap-2">
                <span class="text-[28px] font-extrabold text-[#172B3A] leading-none">${metrics.total}</span>
                <span class="text-[13px] text-[#64748B]">/ 156 Badged</span>
              </div>
              <div class="w-full bg-[#F5F7FA] rounded-full h-2 mt-2.5 overflow-hidden">
                <div class="bg-[#168C82] h-full rounded-full transition-all duration-500" style="width: ${metrics.rate}%"></div>
              </div>
            </div>
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-[#F5F7FA] text-[11px] text-[#64748B]">
              <span class="text-[#168C82] font-bold">${metrics.rate}% ${isAr ? 'اجتياز البوابة' : 'gate clearance'}</span>
              <span class="font-mono">4 Off-duty</span>
            </div>
          </div>

          <!-- Card 2: Expired Certificates -->
          <div class="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-bold uppercase text-[#C83E4D] tracking-wider">${store.t('kpiExpired')}</span>
              <span class="w-8 h-8 rounded-lg bg-[#FDECEE] flex items-center justify-center text-[#C83E4D]">
                <span class="material-symbols-outlined text-[20px]">cancel</span>
              </span>
            </div>
            <div class="mt-3">
              <div class="flex items-baseline gap-2">
                <span class="text-[28px] font-extrabold text-[#C83E4D] leading-none">${metrics.barred}</span>
                <span class="text-[12px] font-bold text-[#C83E4D] bg-[#FDECEE] px-2 py-0.5 rounded-full">${isAr ? 'محظور من الدخول' : 'Access Denied'}</span>
              </div>
              <div class="w-full bg-[#F5F7FA] rounded-full h-2 mt-2.5 overflow-hidden">
                <div class="bg-[#C83E4D] h-full rounded-full" style="width: 100%"></div>
              </div>
            </div>
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-[#F5F7FA] text-[11px]">
              <span class="text-[#C83E4D] font-semibold">${isAr ? 'بوابة 04 / البوابة الدوارة ب' : 'Gate 04 / Turnstile B'}</span>
              <button onclick="Modals.openLockoutResolver()" class="text-[#16324F] font-bold underline hover:opacity-80">${isAr ? 'معالجة' : 'Resolve'}</button>
            </div>
          </div>

          <!-- Card 3: Expiring Soon -->
          <div class="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-bold uppercase text-[#b45309] tracking-wider">${store.t('kpiExpiringSoon')}</span>
              <span class="w-8 h-8 rounded-lg bg-[#FEF8EC] flex items-center justify-center text-[#F2B544]">
                <span class="material-symbols-outlined text-[20px]">alarm</span>
              </span>
            </div>
            <div class="mt-3">
              <div class="flex items-baseline gap-2">
                <span class="text-[28px] font-extrabold text-[#b45309] leading-none">${metrics.expiring}</span>
                <span class="text-[12px] font-bold text-[#b45309] bg-[#FEF8EC] px-2 py-0.5 rounded-full">${isAr ? 'فترة سماح' : 'Action Needed'}</span>
              </div>
              <div class="w-full bg-[#F5F7FA] rounded-full h-2 mt-2.5 overflow-hidden">
                <div class="bg-[#F2B544] h-full rounded-full" style="width: 35%"></div>
              </div>
            </div>
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-[#F5F7FA] text-[11px] text-[#64748B]">
              <span>${isAr ? 'رافعات تي يو في وسقالات' : 'TÜV Cranes & Scaffolding'}</span>
              <button onclick="store.setDesktopRoute('certificates')" class="text-[#16324F] font-bold underline">${isAr ? 'عرض القائمة' : 'View'}</button>
            </div>
          </div>

          <!-- Card 4: Overdue Audits -->
          <div class="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-bold uppercase text-[#64748B] tracking-wider">${store.t('kpiOverdueAudits')}</span>
              <span class="w-8 h-8 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#16324F]">
                <span class="material-symbols-outlined text-[20px]">assignment_late</span>
              </span>
            </div>
            <div class="mt-3">
              <div class="flex items-baseline gap-2">
                <span class="text-[28px] font-extrabold text-[#172B3A] leading-none">1</span>
                <span class="text-[12px] font-semibold text-[#64748B]">${isAr ? 'تدعيم خنادق الحفر' : 'Deep Excavation'}</span>
              </div>
              <div class="w-full bg-[#F5F7FA] rounded-full h-2 mt-2.5 overflow-hidden">
                <div class="bg-[#C83E4D] h-full rounded-full" style="width: 25%"></div>
              </div>
            </div>
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-[#F5F7FA] text-[11px] text-[#64748B]">
              <span class="text-[#C83E4D] font-bold">${isAr ? 'متأخر 18 ساعة' : '18h Overdue'}</span>
              <button onclick="store.setDesktopRoute('inspections')" class="text-[#16324F] font-bold underline">${isAr ? 'بدء الفحص' : 'Execute'}</button>
            </div>
          </div>
        </section>

        <!-- Subcontractor Breakdown & Recent Gate Events Split -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left: Subcontractor Roster Compliance (7 cols) -->
          <div class="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#168C82] text-[20px]">apartment</span>
                <h2 class="text-[16px] font-bold text-[#172B3A]">${isAr ? 'مستويات الامتثال حسب مقاولي الباطن' : 'Subcontractor Compliance Status'}</h2>
              </div>
              <button onclick="store.setDesktopRoute('employees')" class="text-[12px] font-bold text-[#168C82] hover:underline flex items-center gap-1">
                <span>${store.t('navEmployees')}</span>
                <span class="material-symbols-outlined text-[16px]">${isAr ? 'chevron_left' : 'chevron_right'}</span>
              </button>
            </div>

            <div class="flex flex-col gap-3">
              ${store.subcontractors.map(sc => `
                <div class="p-3 rounded-xl bg-[#F8F9FF] border border-[#E2E8F0] flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-[14px] text-[#172B3A]">${isAr ? sc.nameAr : sc.nameEn}</span>
                      <span class="font-mono text-[10px] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded text-[#64748B]">CR: ${sc.cr}</span>
                    </div>
                    <span class="font-bold text-[13px] ${sc.compliantRate >= 90 ? 'text-[#168C82]' : sc.compliantRate >= 80 ? 'text-[#b45309]' : 'text-[#C83E4D]'}">${sc.compliantRate}%</span>
                  </div>
                  <div class="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500 ${sc.compliantRate >= 90 ? 'bg-[#168C82]' : sc.compliantRate >= 80 ? 'bg-[#F2B544]' : 'bg-[#C83E4D]'}" style="width: ${sc.compliantRate}%"></div>
                  </div>
                  <div class="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>${sc.workersCount} ${isAr ? 'عامل بالموقع' : 'workers on-site'}</span>
                    <span>${sc.compliantRate >= 90 ? (isAr ? 'ممتثل بالكامل' : 'Compliant') : (isAr ? 'يتطلب متابعة' : 'Audit Required')}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Recent Gate & Audit Stream (5 cols) -->
          <div class="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#16324F] text-[20px]">history</span>
                <h2 class="text-[16px] font-bold text-[#172B3A]">${store.t('recentGateActivity')}</h2>
              </div>
              <span class="font-mono text-[11px] bg-[#F5F7FA] px-2 py-0.5 rounded text-[#64748B]">${store.t('today')}</span>
            </div>

            <div class="flex flex-col gap-2.5">
              ${store.recentActivity.slice(0, 5).map(act => `
                <div class="p-3 rounded-xl bg-[#F8F9FF] border border-[#E2E8F0] flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    act.type === 'critical' ? 'bg-[#FDECEE] text-[#C83E4D]' :
                    act.type === 'warning' ? 'bg-[#FEF8EC] text-[#b45309]' :
                    'bg-[#E6F5F3] text-[#168C82]'
                  }">
                    <span class="material-symbols-outlined text-[18px]">${act.icon}</span>
                  </div>
                  <div class="flex flex-col flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1">
                      <span class="text-[13px] font-bold text-[#172B3A] truncate">${isAr ? act.titleAr : act.titleEn}</span>
                      <span class="font-mono text-[10px] text-[#64748B] shrink-0">${act.timeAgo}</span>
                    </div>
                    <span class="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">${isAr ? act.detailAr : act.detailEn}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <button onclick="store.syncNow()" class="w-full py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#172B3A] text-[12px] font-bold flex items-center justify-center gap-2 transition-colors">
              <span class="material-symbols-outlined text-[16px]">sync</span>
              <span>${store.t('syncAction')}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // 2. Workforce & Employee Directory View
  renderEmployees() {
    const isAr = store.locale === 'ar';
    const metrics = store.getMetrics();
    const filteredWorkers = store.getFilteredWorkers();

    return `
      <div class="flex flex-col gap-5 w-full max-w-[1440px] mx-auto">
        <!-- Top Action & Breadcrumb Area -->
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5 text-[12px] text-[#64748B]">
              <span class="hover:text-[#16324F] cursor-pointer" onclick="store.setDesktopRoute('dashboard')">${store.t('navDashboard')}</span>
              <span class="material-symbols-outlined text-[14px]">${isAr ? 'chevron_left' : 'chevron_right'}</span>
              <span class="text-[#16324F] font-bold">${store.t('navEmployees')}</span>
              <span class="ml-2 px-2 py-0.5 rounded-full bg-[#E6F5F3] text-[#168C82] font-mono text-[11px] font-bold">Qiwa Live</span>
            </div>
            <div class="flex items-baseline gap-3">
              <h1 class="text-[26px] font-bold text-[#172B3A]">${isAr ? 'سجل امتثال القوى العاملة' : 'Employee Directory'}</h1>
              <span class="font-mono text-[12px] bg-[#EFF4FF] text-[#16324F] font-semibold px-2 py-0.5 rounded-lg">${metrics.total} ${isAr ? 'سجل نشط' : 'Active Records'}</span>
            </div>
            <p class="text-[13px] text-[#64748B]">
              ${isAr ? 'إدارة 152 عاملاً، وتراخيصهم المهنية، واجتياز البوابات البايومترية عبر مشاريع المملكة ونيوم.' : 'Manage site personnel, trade certifications, and biometric gate clearances across KSA & UAE mega-projects.'}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex items-center flex-wrap gap-2">
            <button onclick="store.showToast('${isAr ? 'تم استيراد ملف CSV بنجاح' : 'CSV Import template ready'}')" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F5F7FA] text-[#172B3A] text-[13px] font-semibold shadow-xs transition-all">
              <span class="material-symbols-outlined text-[18px] text-[#64748B]">upload_file</span>
              <span>${store.t('btnImportCsv')}</span>
            </button>
            <button onclick="Modals.openExportAuditPack()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F5F7FA] text-[#172B3A] text-[13px] font-semibold shadow-xs transition-all">
              <span class="material-symbols-outlined text-[18px] text-[#64748B]">ios_share</span>
              <span>${store.t('btnExportRoster')}</span>
            </button>
            <button onclick="Modals.openAddEmployee()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16324F] hover:bg-[#0F2236] text-white text-[13px] font-semibold shadow-sm transition-all active:scale-98">
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>${store.t('btnAddEmployee')}</span>
            </button>
          </div>
        </div>

        <!-- 4 Filter Stat Pills -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <!-- Total -->
          <button onclick="store.setFilterStatus('all')" class="p-4 rounded-xl text-start transition-all border ${store.filterStatus === 'all' ? 'bg-[#16324F] text-white border-[#16324F] shadow-sm' : 'bg-white text-[#172B3A] border-[#E2E8F0] hover:border-[#CBD5E1]'}">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider ${store.filterStatus === 'all' ? 'text-white/80' : 'text-[#64748B]'}">${store.t('filterAll')}</span>
              <span class="w-2.5 h-2.5 rounded-full ${store.filterStatus === 'all' ? 'bg-[#90f4e8]' : 'bg-[#16324F]'}"></span>
            </div>
            <div class="flex items-baseline justify-between mt-2">
              <span class="text-[24px] font-extrabold leading-none">${metrics.total}</span>
              <span class="text-[11px] font-bold ${store.filterStatus === 'all' ? 'text-[#90f4e8]' : 'text-[#168C82]'}">100% Audited</span>
            </div>
          </button>

          <!-- Compliant -->
          <button onclick="store.setFilterStatus('compliant')" class="p-4 rounded-xl text-start transition-all border ${store.filterStatus === 'compliant' ? 'bg-[#168C82] text-white border-[#168C82] shadow-sm' : 'bg-white text-[#172B3A] border-[#E2E8F0] hover:border-[#CBD5E1]'}">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider ${store.filterStatus === 'compliant' ? 'text-white/80' : 'text-[#168C82]'}">${store.t('filterCompliant')}</span>
              <span class="w-2.5 h-2.5 rounded-full bg-[#168C82]"></span>
            </div>
            <div class="flex items-baseline justify-between mt-2">
              <span class="text-[24px] font-extrabold leading-none ${store.filterStatus === 'compliant' ? 'text-white' : 'text-[#168C82]'}">${metrics.compliant}</span>
              <span class="text-[11px] font-bold ${store.filterStatus === 'compliant' ? 'text-white/90' : 'text-[#168C82]'}">${metrics.rate}% Rate</span>
            </div>
          </button>

          <!-- Expiring -->
          <button onclick="store.setFilterStatus('expiring')" class="p-4 rounded-xl text-start transition-all border ${store.filterStatus === 'expiring' ? 'bg-[#b45309] text-white border-[#b45309] shadow-sm' : 'bg-white text-[#172B3A] border-[#E2E8F0] hover:border-[#CBD5E1]'}">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider ${store.filterStatus === 'expiring' ? 'text-white/80' : 'text-[#b45309]'}">${store.t('filterExpiring')}</span>
              <span class="w-2.5 h-2.5 rounded-full bg-[#F2B544]"></span>
            </div>
            <div class="flex items-baseline justify-between mt-2">
              <span class="text-[24px] font-extrabold leading-none ${store.filterStatus === 'expiring' ? 'text-white' : 'text-[#b45309]'}">${metrics.expiring}</span>
              <span class="text-[11px] font-bold ${store.filterStatus === 'expiring' ? 'text-white/90' : 'text-[#b45309]'}">Grace Period</span>
            </div>
          </button>

          <!-- Barred -->
          <button onclick="store.setFilterStatus('barred')" class="p-4 rounded-xl text-start transition-all border ${store.filterStatus === 'barred' ? 'bg-[#C83E4D] text-white border-[#C83E4D] shadow-sm' : 'bg-white text-[#172B3A] border-[#E2E8F0] hover:border-[#CBD5E1]'}">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider ${store.filterStatus === 'barred' ? 'text-white/80' : 'text-[#C83E4D]'}">${store.t('filterBarred')}</span>
              <span class="w-2.5 h-2.5 rounded-full bg-[#C83E4D]"></span>
            </div>
            <div class="flex items-baseline justify-between mt-2">
              <span class="text-[24px] font-extrabold leading-none ${store.filterStatus === 'barred' ? 'text-white' : 'text-[#C83E4D]'}">${metrics.barred}</span>
              <span class="text-[11px] font-bold ${store.filterStatus === 'barred' ? 'text-white/90' : 'text-[#C83E4D]'}">Turnstile Locked</span>
            </div>
          </button>
        </div>

        <!-- Master Interactive Table Card -->
        <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-start border-collapse">
              <thead>
                <tr class="bg-[#F8F9FF] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th class="py-3.5 px-4 text-start">${store.t('thWorker')}</th>
                  <th class="py-3.5 px-4 text-start">${store.t('thTrade')}</th>
                  <th class="py-3.5 px-4 text-start">${store.t('thSubcontractor')}</th>
                  <th class="py-3.5 px-4 text-start">${store.t('thCompliance')}</th>
                  <th class="py-3.5 px-4 text-start">${store.t('thCertifications')}</th>
                  <th class="py-3.5 px-4 text-start">${store.t('thAttendance')}</th>
                  <th class="py-3.5 px-4 text-end">${store.t('thActions')}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F5F7FA] text-[13px]">
                ${filteredWorkers.length === 0 ? `
                  <tr>
                    <td colspan="7" class="py-12 text-center text-[#64748B]">
                      <span class="material-symbols-outlined text-[36px] text-[#94A3B8] mb-2">person_search</span>
                      <p class="font-medium">${isAr ? 'لم يتم العثور على موظفين مطابقين للبحث' : 'No personnel found matching the active filter or search.'}</p>
                    </td>
                  </tr>
                ` : filteredWorkers.map(w => `
                  <tr class="hover:bg-[#EFF4FF]/60 transition-colors group cursor-pointer" onclick="WebViews.selectWorkerAndOpenDossier('${w.id}')">
                    <!-- Worker Info -->
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <div class="relative w-10 h-10 rounded-xl overflow-hidden bg-[#F5F7FA] shrink-0 border border-[#E2E8F0] shadow-2xs">
                          <img src="${w.photoUrl}" alt="${w.nameEn}" class="w-full h-full object-cover"/>
                        </div>
                        <div class="flex flex-col">
                          <div class="flex items-center gap-1.5">
                            <span class="font-bold text-[#172B3A] group-hover:text-[#16324F]">${isAr ? w.nameAr : w.nameEn}</span>
                            <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${w.isSaudi ? 'bg-[#E6F5F3] text-[#168C82]' : 'bg-[#F5F7FA] text-[#64748B]'}">${w.natCode}</span>
                          </div>
                          <div class="flex items-center gap-1.5 font-mono text-[11px] text-[#64748B] mt-0.5">
                            <span class="font-bold text-[#16324F]">${w.id}</span>
                            <span>•</span>
                            <span>Iqama: ${w.iqama}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Trade -->
                    <td class="py-3 px-4">
                      <div class="flex flex-col">
                        <span class="font-semibold text-[#172B3A]">${isAr ? w.tradeAr : w.tradeEn}</span>
                        <span class="text-[11px] text-[#64748B]">${isAr ? w.categoryAr : w.categoryEn}</span>
                      </div>
                    </td>

                    <!-- Subcontractor -->
                    <td class="py-3 px-4">
                      <div class="flex flex-col">
                        <span class="font-semibold text-[#172B3A]">${isAr ? w.siteNameAr : w.siteNameEn}</span>
                        <span class="text-[11px] text-[#168C82] font-medium">${isAr ? w.subcontractorNameAr : w.subcontractorNameEn}</span>
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit ${
                        w.gateStatus === 'compliant' ? 'bg-[#E6F5F3] text-[#168C82]' :
                        w.gateStatus === 'expiring' ? 'bg-[#FEF8EC] text-[#b45309]' :
                        'bg-[#FDECEE] text-[#C83E4D]'
                      }">
                        <span class="material-symbols-outlined text-[15px]">
                          ${w.gateStatus === 'compliant' ? 'check_circle' : w.gateStatus === 'expiring' ? 'warning' : 'cancel'}
                        </span>
                        <span class="text-[11px] font-bold">
                          ${w.gateStatus === 'compliant' ? (isAr ? 'ممتثل (معتمد)' : 'Compliant (5/5)') :
                            w.gateStatus === 'expiring' ? (isAr ? 'ينتهي خلال 5 أيام' : 'Expiring in 5d') :
                            (isAr ? 'محظور من الدخول' : 'Barred Access')}
                        </span>
                      </div>
                      <span class="block font-mono text-[10px] text-[#64748B] mt-1">${isAr ? w.validThroughTextAr : w.validThroughTextEn}</span>
                    </td>

                    <!-- Certifications Badges -->
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-1 flex-wrap max-w-xs">
                        ${w.certificates.slice(0, 2).map(c => `
                          <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${c.status === 'expired' ? 'bg-[#FDECEE] text-[#C83E4D]' : 'bg-[#F5F7FA] text-[#16324F]'}">
                            ${c.nameEn.split(' ')[0]} ${c.nameEn.split(' ')[1] || ''}
                          </span>
                        `).join('')}
                        ${w.certificates.length > 2 ? `<span class="text-[11px] text-[#64748B] font-mono">+${w.certificates.length - 2}</span>` : ''}
                      </div>
                    </td>

                    <!-- Attendance -->
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        w.gatePermitted ? 'bg-[#F5F7FA] text-[#168C82]' : 'bg-[#FDECEE] text-[#C83E4D]'
                      }">
                        <span class="w-1.5 h-1.5 rounded-full ${w.gatePermitted ? 'bg-[#168C82]' : 'bg-[#C83E4D]'}"></span>
                        ${w.gatePermitted ? (isAr ? 'متواجد بالموقع' : 'Active On-Site') : (isAr ? 'محظور عند البوابة' : 'Barred Turnstile')}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="py-3 px-4 text-end" onclick="event.stopPropagation()">
                      <div class="flex items-center justify-end gap-1">
                        <button onclick="Modals.openQrGatePass('${w.id}')" class="w-8 h-8 rounded-lg hover:bg-[#EFF4FF] flex items-center justify-center text-[#64748B] hover:text-[#168C82] transition-colors" title="${store.t('btnIssueQrPass')}">
                          <span class="material-symbols-outlined text-[18px]">qr_code_2</span>
                        </button>
                        <button onclick="WebViews.selectWorkerAndOpenDossier('${w.id}')" class="w-8 h-8 rounded-lg hover:bg-[#EFF4FF] flex items-center justify-center text-[#64748B] hover:text-[#16324F] transition-colors" title="View Dossier">
                          <span class="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  selectWorkerAndOpenDossier(workerId) {
    store.setSelectedWorker(workerId);
    store.setDesktopRoute('employee-detail');
  },

  // 3. Employee Detail Dossier View (Mohammad Salem / Any Selected Worker)
  renderEmployeeDetail() {
    const isAr = store.locale === 'ar';
    const worker = store.getSelectedWorker();

    return `
      <div class="flex flex-col gap-5 w-full max-w-[1440px] mx-auto">
        <!-- Breadcrumb & Bi-directional Sync Pill -->
        <div class="flex items-center justify-between">
          <nav class="flex items-center gap-2 text-[12px] text-[#64748B]">
            <a href="javascript:void(0)" onclick="store.setDesktopRoute('employees')" class="hover:text-[#16324F] flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">groups</span>
              <span>${store.t('navEmployees')}</span>
            </a>
            <span class="material-symbols-outlined text-[14px]">${isAr ? 'chevron_left' : 'chevron_right'}</span>
            <span class="font-mono bg-[#E2E8F0] px-2 py-0.5 rounded text-[#172B3A] font-bold">${worker.id}</span>
            <span class="material-symbols-outlined text-[14px]">${isAr ? 'chevron_left' : 'chevron_right'}</span>
            <span class="text-[#172B3A] font-bold">${isAr ? worker.nameAr : worker.nameEn}</span>
          </nav>
          <div class="hidden md:flex items-center gap-2 bg-white border border-[#E2E8F0] px-3.5 py-1.5 rounded-full shadow-xs">
            <span class="w-2 h-2 rounded-full bg-[#168C82] animate-ping"></span>
            <span class="text-[11px] font-semibold text-[#168C82]">${isAr ? 'منصة قوى: تم التحقق رسمياً' : 'Qiwa ID Verified • Last Polled 14m ago'}</span>
          </div>
        </div>

        <!-- Master Worker Header Card -->
        <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center relative overflow-hidden">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
            <!-- Avatar with hardhat verified badge -->
            <div class="relative shrink-0">
              <div class="w-24 h-24 rounded-2xl overflow-hidden shadow-xs border-2 border-white bg-[#F5F7FA]">
                <img src="${worker.photoUrl}" alt="${worker.nameEn}" class="w-full h-full object-cover"/>
              </div>
              <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${worker.gatePermitted ? 'bg-[#168C82]' : 'bg-[#C83E4D]'} flex items-center justify-center text-white shadow-md ring-2 ring-white">
                <span class="material-symbols-outlined text-[16px]">${worker.gatePermitted ? 'verified' : 'block'}</span>
              </div>
            </div>

            <!-- Identity and Trade Details -->
            <div class="flex flex-col min-w-0">
              <div class="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 class="text-[24px] font-bold text-[#172B3A] tracking-tight">${isAr ? worker.nameAr : worker.nameEn}</h1>
                <span class="text-[14px] text-[#64748B]">(${isAr ? worker.nameEn : worker.nameAr})</span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                  worker.gatePermitted ? 'bg-[#E6F5F3] text-[#168C82]' : 'bg-[#FDECEE] text-[#C83E4D]'
                }">
                  <span class="w-1.5 h-1.5 rounded-full ${worker.gatePermitted ? 'bg-[#168C82]' : 'bg-[#C83E4D]'}"></span>
                  ${isAr ? worker.statusTextAr : worker.statusTextEn}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#64748B]">
                <div class="flex items-center gap-1 text-[#172B3A] font-semibold">
                  <span class="material-symbols-outlined text-[16px] text-[#168C82]">engineering</span>
                  <span>${isAr ? worker.tradeAr : worker.tradeEn}</span>
                </div>
                <span>•</span>
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">domain</span>
                  <span>${isAr ? worker.subcontractorNameAr : worker.subcontractorNameEn}</span>
                </div>
                <span>•</span>
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px] text-[#16324F]">location_on</span>
                  <span>${isAr ? worker.siteNameAr : worker.siteNameEn}</span>
                </div>
              </div>

              <!-- Metadata pills -->
              <div class="flex flex-wrap items-center gap-3 mt-3 font-mono text-[12px]">
                <div class="bg-[#F8F9FF] border border-[#E2E8F0] px-2.5 py-1 rounded-lg text-[#172B3A]">
                  <span class="text-[#64748B] text-[10px] uppercase font-bold">${store.t('iqamaNationalId')}:</span> ${worker.iqama}
                </div>
                <div class="bg-[#F8F9FF] border border-[#E2E8F0] px-2.5 py-1 rounded-lg text-[#172B3A]">
                  <span class="text-[#64748B] text-[10px] uppercase font-bold">${store.t('nationality')}:</span> ${worker.nationality} (${worker.natCode})
                </div>
                <div class="bg-[#F8F9FF] border border-[#E2E8F0] px-2.5 py-1 rounded-lg text-[#172B3A]">
                  <span class="text-[#64748B] text-[10px] uppercase font-bold">${store.t('gatePassSerial')}:</span> ${worker.passSerial}
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="Modals.openQrGatePass('${worker.id}')" class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#168C82] hover:bg-[#12726a] text-white text-[12px] font-bold shadow-sm transition-all active:scale-98">
              <span class="material-symbols-outlined text-[18px]">qr_code_2</span>
              <span>${store.t('btnIssueQrPass')}</span>
            </button>
            <button onclick="Modals.openAddCertificate('${worker.id}')" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16324F] hover:bg-[#0F2236] text-white text-[12px] font-bold shadow-sm transition-all active:scale-98">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span>${isAr ? 'إضافة شهادة' : 'Add Cert'}</span>
            </button>
            <button onclick="store.showToast('${isAr ? 'تم بدء رفع المستند المعاون' : 'Document upload dialog ready'}')" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F5F7FA] text-[#172B3A] text-[12px] font-bold transition-all shadow-xs">
              <span class="material-symbols-outlined text-[18px]">upload_file</span>
              <span>${store.t('btnUploadDoc')}</span>
            </button>
          </div>
        </div>

        <!-- 4 Summary Metric Ribbon Badges -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Metric 1: Total Certs -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">${isAr ? 'إجمالي الشهادات المعتمدة' : 'Total Certifications'}</span>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-[24px] font-extrabold text-[#172B3A]">${worker.certificates.length}</span>
                <span class="text-[11px] font-bold text-[#168C82] bg-[#E6F5F3] px-2 py-0.5 rounded-full">${isAr ? 'نشطة' : 'Active'}</span>
              </div>
              <span class="text-[11px] text-[#64748B] mt-0.5">${isAr ? '0 منتهية • 0 متأخرة' : '0 Expired • 0 Overdue'}</span>
            </div>
            <div class="w-10 h-10 rounded-xl bg-[#E6F5F3] flex items-center justify-center text-[#168C82]">
              <span class="material-symbols-outlined text-[22px]">workspace_premium</span>
            </div>
          </div>

          <!-- Metric 2: Turnstile Access -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">${isAr ? 'حالة البوابات الإلكترونية' : 'Gate Turnstile Status'}</span>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-[18px] font-bold ${worker.gatePermitted ? 'text-[#168C82]' : 'text-[#C83E4D]'}">${worker.gatePermitted ? (isAr ? 'مصرح بالدخول' : 'Permitted') : (isAr ? 'محظور' : 'Barred')}</span>
              </div>
              <span class="text-[11px] text-[#64748B] mt-0.5">${isAr ? 'صلاحية حتى يونيو 2026' : 'Valid to 30 Jun 2026'}</span>
            </div>
            <div class="w-10 h-10 rounded-xl ${worker.gatePermitted ? 'bg-[#E6F5F3] text-[#168C82]' : 'bg-[#FDECEE] text-[#C83E4D]'} flex items-center justify-center">
              <span class="material-symbols-outlined text-[22px]">${worker.gatePermitted ? 'sensor_door' : 'sensor_door_lock'}</span>
            </div>
          </div>

          <!-- Metric 3: Medical Fitness -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">${store.t('medicalFitness')}</span>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-[18px] font-bold text-[#172B3A]">${isAr ? 'لائق طبياً للعمل' : 'Fit for Duty'}</span>
              </div>
              <span class="text-[11px] text-[#64748B] mt-0.5">${isAr ? 'ساري حتى نوفمبر 2025' : 'Valid till 14 Nov 2025'}</span>
            </div>
            <div class="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#16324F]">
              <span class="material-symbols-outlined text-[22px]">health_and_safety</span>
            </div>
          </div>

          <!-- Metric 4: Safety Inductions -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">${store.t('safetyInductions')}</span>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-[24px] font-extrabold text-[#168C82]">100%</span>
                <span class="text-[11px] font-bold text-[#172B3A]">${isAr ? 'معتمد' : 'Cleared'}</span>
              </div>
              <span class="text-[11px] text-[#64748B] mt-0.5">${isAr ? 'التصريح الذهبي لنيوم نشط' : 'NEOM Gold Module Active'}</span>
            </div>
            <div class="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#16324F]">
              <span class="material-symbols-outlined text-[22px]">fact_check</span>
            </div>
          </div>
        </div>

        <!-- Certifications Portfolio Table -->
        <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div class="p-4 bg-[#F8F9FF] border-b border-[#E2E8F0] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#168C82] text-[20px]">workspace_premium</span>
              <h3 class="text-[15px] font-bold text-[#172B3A]">${store.t('activeCertPortfolio')}</h3>
              <span class="text-[11px] font-bold bg-[#E6F5F3] text-[#168C82] px-2 py-0.5 rounded-full">${worker.certificates.length} Verified</span>
            </div>
            <button onclick="Modals.openAddCertificate('${worker.id}')" class="text-[12px] font-bold text-[#16324F] hover:underline flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>${store.t('btnAddCertificate')}</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-start border-collapse text-[13px]">
              <thead>
                <tr class="bg-[#F8F9FF] text-[#64748B] text-[11px] uppercase font-bold border-b border-[#E2E8F0]">
                  <th class="py-3 px-4 text-start">Certificate & Authority</th>
                  <th class="py-3 px-4 text-start">${store.t('licenseNumber')}</th>
                  <th class="py-3 px-4 text-start">${store.t('issueExpiry')}</th>
                  <th class="py-3 px-4 text-start">${store.t('validityWindow')}</th>
                  <th class="py-3 px-4 text-start">${store.t('verificationStatus')}</th>
                  <th class="py-3 px-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F5F7FA]">
                ${worker.certificates.map(c => `
                  <tr class="hover:bg-[#F8F9FF] transition-colors">
                    <td class="py-3.5 px-4">
                      <div class="flex items-start gap-2.5">
                        <div class="w-8 h-8 rounded-lg bg-[#EFF4FF] flex items-center justify-center shrink-0 text-[#16324F] mt-0.5">
                          <span class="material-symbols-outlined text-[18px]">verified</span>
                        </div>
                        <div class="flex flex-col">
                          <span class="font-bold text-[#172B3A]">${isAr ? c.nameAr : c.nameEn}</span>
                          <span class="text-[11px] text-[#64748B]">${isAr ? c.issuingBodyAr : c.issuingBodyEn}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 font-mono font-bold text-[#16324F]">${c.licenseNo}</td>
                    <td class="py-3.5 px-4">
                      <div class="flex flex-col text-[12px]">
                        <span class="font-semibold text-[#172B3A]">Exp: ${c.expiryDate}</span>
                        <span class="text-[#64748B] text-[11px]">Issued: ${c.issueDate}</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2">
                        <div class="w-16 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div class="h-full rounded-full ${c.status === 'expired' ? 'bg-[#C83E4D]' : c.status === 'expiring' ? 'bg-[#F2B544]' : 'bg-[#168C82]'}" style="width: ${c.status === 'expired' ? '100' : '75'}%"></div>
                        </div>
                        <span class="text-[11px] font-bold ${c.status === 'expired' ? 'text-[#C83E4D]' : c.status === 'expiring' ? 'text-[#b45309]' : 'text-[#168C82]'}">
                          ${isAr ? c.validityLabelAr : c.validityLabelEn}
                        </span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F5F3] text-[#168C82]">
                        <span class="material-symbols-outlined text-[13px]">check</span>
                        <span>Qiwa Sync</span>
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-end">
                      <button onclick="store.showToast('${isAr ? 'تم تنزيل مستند الشهادة الرسمي (PDF)' : 'Downloading validated certificate credential PDF'}')" class="p-1.5 rounded-lg hover:bg-[#EFF4FF] text-[#64748B] hover:text-[#16324F] transition-colors" title="Download Certificate PDF">
                        <span class="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // 4. Training & Certifications Horizon View
  renderCertificates() {
    const isAr = store.locale === 'ar';
    const metrics = store.getMetrics();

    return `
      <div class="flex flex-col gap-6 w-full max-w-[1440px] mx-auto">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 class="text-[26px] font-bold text-[#172B3A]">${store.t('navCertificates')}</h1>
            <p class="text-[13px] text-[#64748B]">${isAr ? 'سجل انتهاء وتجديد الرخص المهنية وتراخيص السلامة لمقاولي الباطن' : 'Certification Horizon & Trade Credential Expiry Tracking'}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="Modals.openExportAuditPack()" class="px-4 py-2 rounded-xl bg-[#16324F] text-white text-[13px] font-bold shadow-sm">
              ${store.t('btnExportAuditPack')}
            </button>
            <button onclick="store.showToast('${isAr ? 'تم إرسال تنبيهات واتساب المجمعة لكافة مسؤولي المقاولين' : 'Dispatched bulk WhatsApp reminders to contractor foremen'}', 'success')" class="px-4 py-2 rounded-xl bg-[#168C82] text-white text-[13px] font-bold shadow-sm">
              ${isAr ? 'إرسال تنبيهات واتساب المجمعة' : 'Bulk WhatsApp Alerts'}
            </button>
          </div>
        </div>

        <!-- Horizon Risk Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-[#FDECEE] border border-[#F7B5BC] flex flex-col justify-between">
            <span class="text-[12px] font-bold uppercase text-[#C83E4D]">${isAr ? 'منتهية الصلاحية (ممنوع الدخول)' : 'Expired (Access Denied)'}</span>
            <span class="text-[32px] font-extrabold text-[#C83E4D] mt-2">${metrics.barred}</span>
            <span class="text-[11px] text-[#C83E4D] font-medium">${isAr ? 'يتطلب إعادة اختبار أو تجديد قوى' : 'Aramco & SEC renewal required'}</span>
          </div>

          <div class="p-4 rounded-xl bg-[#FEF8EC] border border-[#FCE2A6] flex flex-col justify-between">
            <span class="text-[12px] font-bold uppercase text-[#b45309]">${isAr ? 'تنتهي خلال 7 أيام' : 'Expiring < 7 Days'}</span>
            <span class="text-[32px] font-extrabold text-[#b45309] mt-2">8</span>
            <span class="text-[11px] text-[#b45309] font-medium">${isAr ? 'تنبيهات فورية للمقاولين' : 'Urgent renewal queue'}</span>
          </div>

          <div class="p-4 rounded-xl bg-[#EFF4FF] border border-[#dce9ff] flex flex-col justify-between">
            <span class="text-[12px] font-bold uppercase text-[#16324F]">${isAr ? 'تنتهي خلال 30 يوماً' : 'Expiring < 30 Days'}</span>
            <span class="text-[32px] font-extrabold text-[#16324F] mt-2">${metrics.expiring}</span>
            <span class="text-[11px] text-[#16324F] font-medium">${isAr ? 'جدولة التدريب والتحديث' : 'Scheduled in training calendar'}</span>
          </div>

          <div class="p-4 rounded-xl bg-[#E6F5F3] border border-[#B3E0DC] flex flex-col justify-between">
            <span class="text-[12px] font-bold uppercase text-[#168C82]">${isAr ? 'سارية الصلاحية ومعتمدة' : 'Compliant & Active'}</span>
            <span class="text-[32px] font-extrabold text-[#168C82] mt-2">380</span>
            <span class="text-[11px] text-[#168C82] font-medium">${isAr ? 'مطابقة 100% لكود البناء' : 'Full compliance with Aramco CSM'}</span>
          </div>
        </div>

        <!-- Table of Urgent Expiries -->
        <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div class="p-4 bg-[#F8F9FF] border-b border-[#E2E8F0] flex items-center justify-between">
            <span class="font-bold text-[14px] text-[#172B3A]">${isAr ? 'سجل الشهادات الحرجة ذات الأولوية العاجلة' : 'Priority Expiry Risk Register'}</span>
          </div>
          <table class="w-full text-start border-collapse text-[13px]">
            <thead>
              <tr class="bg-[#F8F9FF] text-[#64748B] text-[11px] uppercase font-bold border-b border-[#E2E8F0]">
                <th class="py-3 px-4 text-start">${store.t('thWorker')}</th>
                <th class="py-3 px-4 text-start">Credential Name</th>
                <th class="py-3 px-4 text-start">Expiry Horizon</th>
                <th class="py-3 px-4 text-start">Status</th>
                <th class="py-3 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F5F7FA]">
              ${store.workers.filter(w => w.gateStatus !== 'compliant').map(w => `
                <tr class="hover:bg-[#F8F9FF] transition-colors">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-[#172B3A]">${isAr ? w.nameAr : w.nameEn}</span>
                      <span class="text-[11px] font-mono text-[#64748B]">(${w.id})</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-[#16324F] font-semibold">${w.certificates[0] ? (isAr ? w.certificates[0].nameAr : w.certificates[0].nameEn) : 'Trade License'}</td>
                  <td class="py-3 px-4 font-mono text-[12px] ${w.gateStatus === 'barred' ? 'text-[#C83E4D] font-bold' : 'text-[#b45309]'}">
                    ${isAr ? w.validThroughTextAr : w.validThroughTextEn}
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${w.gateStatus === 'barred' ? 'bg-[#FDECEE] text-[#C83E4D]' : 'bg-[#FEF8EC] text-[#b45309]'}">
                      ${w.gateStatus === 'barred' ? (isAr ? 'محظور الدخول' : 'Barred Access') : (isAr ? 'تنبيه عاجل' : 'Expiring')}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-end">
                    <button onclick="store.showToast('${isAr ? 'تم إرسال رسالة واتساب عاجلة للمقاول' : 'Sent WhatsApp direct reminder to contractor foreman'}', 'success')" class="px-3 py-1 rounded-lg bg-[#E6F5F3] text-[#168C82] text-[12px] font-bold hover:bg-[#168C82] hover:text-white transition-colors">
                      WhatsApp Alert
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // 5. Safety Inspections View
  renderInspections() {
    const isAr = store.locale === 'ar';

    return `
      <div class="flex flex-col gap-6 w-full max-w-[1440px] mx-auto">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 class="text-[26px] font-bold text-[#172B3A]">${store.t('navInspections')}</h1>
            <p class="text-[13px] text-[#64748B]">${isAr ? 'إدارة قوائم الفحص الميداني للمعدات الثقيلة والسقالات وعزل الطاقة' : 'Field Safety Audits, Scafftag Management & Equipment Clearance'}</p>
          </div>
          <button onclick="Modals.openInspectionModal()" class="px-4 py-2 rounded-xl bg-[#16324F] text-white text-[13px] font-bold shadow-sm">
            ${store.t('btnScheduleInspection')}
          </button>
        </div>

        <!-- GCC Work Week Strip -->
        <div class="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="font-bold text-[13px] text-[#16324F] uppercase tracking-wider">GCC Work Week (Wk 42 • Oct 2024)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-lg bg-[#F5F7FA] text-[12px] font-mono font-bold text-[#64748B]">SUN 20</span>
            <span class="px-3 py-1 rounded-lg bg-[#F5F7FA] text-[12px] font-mono font-bold text-[#64748B]">MON 21</span>
            <span class="px-3 py-1 rounded-lg bg-[#16324F] text-[12px] font-mono font-bold text-white shadow-xs">TUE 22 (TODAY)</span>
            <span class="px-3 py-1 rounded-lg bg-[#F5F7FA] text-[12px] font-mono font-bold text-[#64748B]">WED 23</span>
            <span class="px-3 py-1 rounded-lg bg-[#F5F7FA] text-[12px] font-mono font-bold text-[#64748B]">THU 24</span>
          </div>
        </div>

        <!-- Inspection Cards Stack -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${store.inspections.map(ins => `
            <div class="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between gap-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    ins.status === 'passed' ? 'bg-[#E6F5F3] text-[#168C82]' :
                    ins.status === 'overdue' ? 'bg-[#FDECEE] text-[#C83E4D]' :
                    'bg-[#EFF4FF] text-[#16324F]'
                  }">
                    <span class="material-symbols-outlined text-[22px]">
                      ${ins.status === 'passed' ? 'check_circle' : ins.status === 'overdue' ? 'assignment_late' : 'event'}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-mono text-[11px] font-bold text-[#64748B]">${ins.assetTag}</span>
                    <h3 class="text-[15px] font-bold text-[#172B3A] mt-0.5">${isAr ? ins.titleAr : ins.titleEn}</h3>
                    <span class="text-[12px] text-[#64748B]">${isAr ? ins.siteAr : ins.siteEn}</span>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  ins.status === 'passed' ? 'bg-[#E6F5F3] text-[#168C82]' :
                  ins.status === 'overdue' ? 'bg-[#FDECEE] text-[#C83E4D]' :
                  'bg-[#EFF4FF] text-[#16324F]'
                }">
                  ${isAr ? ins.statusTextAr : ins.statusTextEn}
                </span>
              </div>

              <!-- Checkpoints Checklist Preview -->
              <div class="p-3 bg-[#F8F9FF] rounded-xl flex flex-col gap-1.5 text-[12px]">
                ${ins.checkpoints.slice(0, 2).map(cp => `
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px] ${cp.pass ? 'text-[#168C82]' : 'text-[#C83E4D]'}">
                      ${cp.pass ? 'check_box' : 'indeterminate_check_box'}
                    </span>
                    <span class="truncate ${cp.pass ? 'text-[#172B3A]' : 'text-[#C83E4D] font-bold'}">${isAr ? cp.itemAr : cp.itemEn}</span>
                  </div>
                `).join('')}
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-[#F5F7FA]">
                <span class="text-[11px] text-[#64748B]">${isAr ? ins.inspectorAr : ins.inspectorEn}</span>
                <button onclick="Modals.openInspectionChecklist('${ins.id}')" class="px-3.5 py-1.5 rounded-lg bg-[#16324F] hover:bg-[#0F2236] text-white text-[12px] font-bold transition-all">
                  ${ins.status === 'passed' ? (isAr ? 'عرض تقرير الفحص' : 'View Audit Log') : (isAr ? 'تنفيذ واعتماد الفحص' : 'Execute Checklist')}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 6. Reports View
  renderReports() {
    const isAr = store.locale === 'ar';

    return `
      <div class="flex flex-col gap-6 w-full max-w-[1440px] mx-auto">
        <div>
          <h1 class="text-[26px] font-bold text-[#172B3A]">${store.t('navReports')}</h1>
          <p class="text-[13px] text-[#64748B]">${isAr ? 'توليد وتصدير حزم التدقيق الرقابي وتقارير الامتثال لكبرى الهيئات' : 'Generate & Export Official Regulatory Audit Packs for GCC Clients'}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-2">
              <div class="w-12 h-12 rounded-xl bg-[#E6F5F3] text-[#168C82] flex items-center justify-center">
                <span class="material-symbols-outlined text-[26px]">verified</span>
              </div>
              <h3 class="text-[16px] font-bold text-[#172B3A]">${isAr ? 'حزمة التدقيق الشامل لأرامكو السعودية' : 'Saudi Aramco CSM Audit Dossier'}</h3>
              <p class="text-[12px] text-[#64748B]">${isAr ? 'يتضمن سجلات تراخيص الرافعات، مشغلي المعدات الثقيلة، وتقارير الفحص الفني المعتمدة.' : 'Full contractor safety verification package including heavy rigger tickets and machinery pre-op logs.'}</p>
            </div>
            <button onclick="Modals.openExportAuditPack()" class="w-full py-2.5 rounded-xl bg-[#16324F] text-white font-bold text-[13px]">
              ${isAr ? 'تصدير الحزمة (PDF/XLS)' : 'Export Aramco Dossier'}
            </button>
          </div>

          <div class="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-2">
              <div class="w-12 h-12 rounded-xl bg-[#EFF4FF] text-[#16324F] flex items-center justify-center">
                <span class="material-symbols-outlined text-[26px]">local_fire_department</span>
              </div>
              <h3 class="text-[16px] font-bold text-[#172B3A]">${isAr ? 'تقرير الدفاع المدني السعودي (كود 998)' : 'Civil Defense Code 998 Compliance'}</h3>
              <p class="text-[12px] text-[#64748B]">${isAr ? 'كشوفات مرشدي السلامة من الحرائق، خطط الإخلاء الميدانية، ومطابقة موقع نيوم.' : 'Fire marshal registers, certified site evacuation schemes, and NEOM spine compliance logs.'}</p>
            </div>
            <button onclick="Modals.openExportAuditPack()" class="w-full py-2.5 rounded-xl bg-[#16324F] text-white font-bold text-[13px]">
              ${isAr ? 'تصدير تقرير 998' : 'Export 998 Pack'}
            </button>
          </div>

          <div class="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-2">
              <div class="w-12 h-12 rounded-xl bg-[#FEF8EC] text-[#b45309] flex items-center justify-center">
                <span class="material-symbols-outlined text-[26px]">sync_alt</span>
              </div>
              <h3 class="text-[16px] font-bold text-[#172B3A]">${isAr ? 'مطابقة منصة قوى ومُقيم الحكومية' : 'Qiwa & Muqeem Gateway Audit'}</h3>
              <p class="text-[12px] text-[#64748B]">${isAr ? 'مطابقة الإقامات النشطة، عقود العمل الرقمية الموثقة، والتأمين الطبي المهني.' : 'Full digital cross-check with KSA Ministry of Human Resources database and active labor contracts.'}</p>
            </div>
            <button onclick="Modals.openExportAuditPack()" class="w-full py-2.5 rounded-xl bg-[#16324F] text-white font-bold text-[13px]">
              ${isAr ? 'تصدير مطابقة قوى' : 'Export Qiwa Registry'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // 7. Onboarding & Login Screen View
  renderOnboarding() {
    const isAr = store.locale === 'ar';

    return `
      <div class="min-h-screen bg-[#F8F9FF] flex flex-col justify-between p-6">
        <!-- Top bar -->
        <div class="flex items-center justify-between max-w-6xl w-full mx-auto mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#16324F] flex items-center justify-center text-white shadow-sm">
              <span class="material-symbols-outlined text-[22px]">shield_person</span>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-1.5">
                <span class="text-[18px] font-bold text-[#001D37]">SiteReady</span>
                <span class="bg-[#90f4e8] text-[#007168] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">GCC</span>
              </div>
              <span class="text-[11px] text-[#64748B]">${store.t('brandSubtitle')}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="store.setDesktopRoute('dashboard')" class="text-[12px] font-bold text-[#168C82] hover:underline flex items-center gap-1">
              <span>${isAr ? 'العودة للوحة التحكم' : 'Return to Dashboard'}</span>
              <span class="material-symbols-outlined text-[16px]">${isAr ? 'arrow_back' : 'arrow_forward'}</span>
            </button>
          </div>
        </div>

        <!-- Split Card Container -->
        <div class="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
          <!-- Left Visual Column (5 cols) -->
          <div class="lg:col-span-5 bg-gradient-to-b from-[#001D37] to-[#16324F] text-white p-8 flex flex-col justify-between relative">
            <div class="flex flex-col gap-6 relative z-10">
              <div class="flex flex-wrap items-center gap-2">
                <span class="bg-white/10 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">verified</span> Aramco CSM Vetted
                </span>
                <span class="bg-white/10 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">local_fire_department</span> Civil Defense (998)
                </span>
              </div>
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-[#90f4e8]">Authority Compliance Ecosystem</span>
                <h2 class="text-[26px] font-extrabold text-white mt-1 leading-tight">
                  ${isAr ? 'نظام تتبع وإدارة امتثال المقاولين والقوى العاملة في الخليج' : 'Contractor Compliance & Training Tracker for Saudi Arabia & GCC'}
                </h2>
                <p class="text-[13px] text-[#809abd] mt-3 leading-relaxed">
                  ${isAr ? 'الربط المباشر مع بوابات التفتيش الميداني، منصة قوى ومقيم، وكود البناء السعودي لضمان سلامة مواقع الإنشاءات الكبرى.' : 'Automated biometric turnstile clearances, regulatory license verification, and live integration with Qiwa and Muqeem.'}
                </p>
              </div>
            </div>

            <div class="pt-8 border-t border-white/10 text-[11px] text-[#809abd]">
              <span>KSA Civil Code Sec. 14 Verified</span>
            </div>
          </div>

          <!-- Right Form Column (7 cols) -->
          <div class="lg:col-span-7 p-8 flex flex-col justify-center">
            <div class="max-w-md w-full mx-auto flex flex-col gap-5">
              <div>
                <h3 class="text-[20px] font-bold text-[#172B3A]">${isAr ? 'تسجيل دخول المقاولين والشركات' : 'Contractor Sign In'}</h3>
                <p class="text-[12px] text-[#64748B] mt-0.5">${isAr ? 'أدخل بيانات السجل التجاري والبريد المؤسسي' : 'Access your site compliance registry & turnstile pass center'}</p>
              </div>

              <form onsubmit="event.preventDefault(); store.setDesktopRoute('dashboard'); store.showToast('${isAr ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully'}', 'success')" class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-bold text-[#172B3A]">${isAr ? 'البريد الإلكتروني المؤسسي' : 'Corporate Email'}</label>
                  <input type="email" value="tariq.otaibi@alfanar.com" required class="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#16324F]/20"/>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-bold text-[#172B3A]">${isAr ? 'كلمة المرور' : 'Password'}</label>
                  <input type="password" value="••••••••••••" required class="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#16324F]/20"/>
                </div>

                <div class="flex items-center justify-between text-[12px]">
                  <label class="flex items-center gap-2 text-[#64748B] cursor-pointer">
                    <input type="checkbox" checked class="rounded text-[#16324F]"/>
                    <span>${isAr ? 'تذكر بيانات الاعتماد' : 'Remember credentials'}</span>
                  </label>
                  <a href="javascript:void(0)" class="text-[#168C82] font-semibold hover:underline">${isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}</a>
                </div>

                <button type="submit" class="w-full py-3 rounded-xl bg-[#16324F] hover:bg-[#0F2236] text-white font-bold text-[14px] shadow-sm transition-all active:scale-98 mt-2">
                  ${isAr ? 'دخول المنظومة' : 'Enter Compliance Platform'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="text-center text-[11px] text-[#64748B] mt-6">
          <span>SiteReady GCC v1.0 • Enterprise Contractor Safety Portal</span>
        </div>
      </div>
    `;
  }
};

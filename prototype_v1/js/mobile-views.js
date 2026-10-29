/**
 * SiteReady GCC — Mobile App View Renderers
 * Authentic Smartphone Layouts (393x852 Viewport / Touch Ergonomics)
 */

const MobileViews = {
  // Master Mobile Container with Status Bar & Bottom Navigation
  render(tab = 'dashboard') {
    const isAr = store.locale === 'ar';
    const activeSite = store.getSelectedSite();
    const siteTitle = isAr ? activeSite.nameAr : activeSite.nameEn;
    const metrics = store.getMetrics();

    let tabContentHtml = '';
    switch (tab) {
      case 'dashboard':
        tabContentHtml = this.renderDashboard();
        break;
      case 'roster':
        tabContentHtml = this.renderRoster();
        break;
      case 'profile':
        tabContentHtml = this.renderProfile();
        break;
      case 'certs':
        tabContentHtml = this.renderCerts();
        break;
      case 'audits':
        tabContentHtml = this.renderAudits();
        break;
      case 'more':
        tabContentHtml = this.renderMore();
        break;
      default:
        tabContentHtml = this.renderDashboard();
    }

    return `
      <div class="mobile-screen-inner flex flex-col bg-[#F8F9FF] text-[#0b1c30] select-none font-sans">
        <!-- Dynamic Island -->
        <div class="dynamic-island cursor-pointer" onclick="store.showToast('${isAr ? 'منظومة سايت ريدي: البوابات متصلة بالشبكة' : 'SiteReady GCC: Biometric Gate Readers Active'}')">
          <div class="dynamic-island-cam"></div>
          <div class="dynamic-island-sensor"></div>
        </div>

        <!-- Phone Top Status Bar -->
        <div class="w-full px-7 pt-3 pb-1 flex items-center justify-between text-[#43474d] font-mono text-[11px] shrink-0 z-20">
          <span class="font-bold text-[#0b1c30]">09:41</span>
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
            <span class="text-[9px] font-bold">5G</span>
            <span class="material-symbols-outlined text-[13px]">wifi</span>
            <div class="flex items-center gap-0.5">
              <span class="text-[9px]">98%</span>
              <span class="material-symbols-outlined text-[14px]">battery_full</span>
            </div>
          </div>
        </div>

        <!-- Mobile App Top Bar -->
        <header class="h-14 px-4 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between gap-2 shrink-0 z-20 shadow-2xs">
          <!-- Left: Logo & Project -->
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-[#001D37] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer" onclick="store.setMobileTab('dashboard')">
              <span class="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div class="flex flex-col min-w-0 text-start">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#006a62] leading-none">SiteReady GCC</span>
              <button onclick="store.showToast('${isAr ? 'الموقع النشط: ' + siteTitle : 'Active Site: ' + siteTitle}')" class="flex items-center gap-0.5 text-start truncate">
                <span class="text-[12px] font-bold text-[#0b1c30] truncate max-w-[130px]">${siteTitle}</span>
                <span class="material-symbols-outlined text-[14px] text-[#64748B]">arrow_drop_down</span>
              </button>
            </div>
          </div>

          <!-- Right: Controls -->
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Language Switcher -->
            <button onclick="store.setLocale(store.locale === 'en' ? 'ar' : 'en')" class="h-7 px-2 rounded-lg bg-[#EFF4FF] border border-[#dce9ff] flex items-center justify-center text-[11px] font-bold text-[#001D37]">
              <span>${isAr ? 'EN' : 'عربي'}</span>
            </button>

            <!-- Notification Bell with Barred badge -->
            <button onclick="Modals.openLockoutResolver()" class="relative w-8 h-8 rounded-xl hover:bg-[#F5F7FA] flex items-center justify-center text-[#43474d]">
              <span class="material-symbols-outlined text-[19px]">notifications</span>
              ${metrics.barred > 0 ? '<span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C83E4D]"></span>' : ''}
            </button>

            <!-- Director Avatar -->
            <div class="w-7 h-7 rounded-full bg-[#001D37] text-white flex items-center justify-center text-[12px] font-bold shrink-0 shadow-2xs" onclick="store.setMobileTab('more')">
              <span class="material-symbols-outlined text-[16px]">person</span>
            </div>
          </div>
        </header>

        <!-- Offline Queue Status Strip -->
        <div class="w-full bg-[#EFF4FF] border-b border-[#dce9ff] px-4 py-1.5 flex items-center justify-between text-[11px] shrink-0">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-2 h-2 rounded-full ${store.isOffline ? 'bg-[#b45309]' : 'bg-[#168C82] animate-pulse'} shrink-0"></span>
            <span class="text-[#001D37] font-semibold truncate">
              ${store.isOffline ? (isAr ? 'الوضع غير المتصل (أوفلاين)' : 'Offline active: 12 queued') : (isAr ? 'الربط الحكومي: قوى ومُقيم مفعّل' : 'Muqeem & Qiwa Live Gate Pass')}
            </span>
          </div>
          <button onclick="store.toggleOffline()" class="text-[10px] font-bold text-[#168C82] hover:underline shrink-0">
            ${store.isOffline ? (isAr ? 'إعادة الاتصال' : 'Go Online') : (isAr ? 'محاكاة أوفلاين' : 'Test Offline')}
          </button>
        </div>

        <!-- Scrollable Tab Content Container -->
        <div class="mobile-scroll-container p-4 pb-24">
          ${tabContentHtml}
        </div>

        <!-- Bottom 5-Tab Navigation Bar -->
        <nav class="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] px-2 flex items-center justify-around z-30 shadow-md">
          <!-- Tab 1: Home -->
          <button onclick="store.setMobileTab('dashboard')" class="flex flex-col items-center justify-center flex-1 py-1 transition-colors ${tab === 'dashboard' ? 'text-[#001D37] font-bold' : 'text-[#64748B] hover:text-[#001D37]'}">
            <span class="material-symbols-outlined text-[22px] ${tab === 'dashboard' ? 'font-bold' : ''}">dashboard</span>
            <span class="text-[10px] mt-0.5">${store.t('navHome')}</span>
          </button>

          <!-- Tab 2: Roster -->
          <button onclick="store.setMobileTab('roster')" class="flex flex-col items-center justify-center flex-1 py-1 transition-colors ${tab === 'roster' || tab === 'profile' ? 'text-[#001D37] font-bold' : 'text-[#64748B] hover:text-[#001D37]'}">
            <span class="material-symbols-outlined text-[22px]">badge</span>
            <span class="text-[10px] mt-0.5">${store.t('navRoster')}</span>
          </button>

          <!-- Tab 3: Certs -->
          <button onclick="store.setMobileTab('certs')" class="flex flex-col items-center justify-center flex-1 py-1 transition-colors ${tab === 'certs' ? 'text-[#001D37] font-bold' : 'text-[#64748B] hover:text-[#001D37]'}">
            <span class="material-symbols-outlined text-[22px]">workspace_premium</span>
            <span class="text-[10px] mt-0.5">${store.t('navCerts')}</span>
          </button>

          <!-- Tab 4: Audits -->
          <button onclick="store.setMobileTab('audits')" class="flex flex-col items-center justify-center flex-1 py-1 transition-colors ${tab === 'audits' ? 'text-[#001D37] font-bold' : 'text-[#64748B] hover:text-[#001D37]'}">
            <span class="material-symbols-outlined text-[22px]">fact_check</span>
            <span class="text-[10px] mt-0.5">${store.t('navAudits')}</span>
          </button>

          <!-- Tab 5: More -->
          <button onclick="store.setMobileTab('more')" class="flex flex-col items-center justify-center flex-1 py-1 transition-colors ${tab === 'more' ? 'text-[#001D37] font-bold' : 'text-[#64748B] hover:text-[#001D37]'}">
            <span class="material-symbols-outlined text-[22px]">menu</span>
            <span class="text-[10px] mt-0.5">${store.t('navMore')}</span>
          </button>
        </nav>

        <!-- Home Indicator Bar -->
        <div class="mobile-home-indicator"></div>
      </div>
    `;
  },

  // 1. Mobile Home Dashboard
  renderDashboard() {
    const isAr = store.locale === 'ar';
    const metrics = store.getMetrics();
    const site = store.getSelectedSite();

    return `
      <div class="flex flex-col gap-3.5">
        <!-- Supervisor Welcome Card -->
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#006a62] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-[#006a62] animate-pulse"></span>
              Gate 04 Live Interlock
            </span>
            <span class="font-mono text-[10px] text-[#64748B]">AST 09:41</span>
          </div>
          <h2 class="text-[18px] font-bold text-[#001D37] leading-tight">${store.t('greeting')}</h2>
          <span class="text-[11px] text-[#64748B] truncate">Al-Fanar • ${isAr ? site.nameAr : site.nameEn}</span>
        </div>

        <!-- Severe Turnstile Barred Alert Banner -->
        ${metrics.barred > 0 ? `
          <div class="bg-[#FDECEE] border border-[#F7B5BC] rounded-2xl p-3.5 shadow-xs relative overflow-hidden flex flex-col gap-2.5">
            <div class="flex items-start gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-[#C83E4D] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span class="material-symbols-outlined text-[20px]">gpp_bad</span>
              </div>
              <div class="flex flex-col min-w-0 flex-1 text-start">
                <div class="flex items-center justify-between">
                  <span class="text-[13px] font-bold text-[#C83E4D]">${metrics.barred} ${isAr ? 'عمال محظورون عند البوابة' : 'Personnel Turnstile Barred'}</span>
                  <span class="text-[9px] font-bold bg-[#C83E4D] text-white px-1.5 py-0.5 rounded uppercase">Gate Hold</span>
                </div>
                <p class="text-[11px] text-[#172B3A] mt-0.5 leading-snug">
                  ${isAr ? 'تم رصد انتهاء اعتمادات أرامكو للرافعات وتصاريح الجهد الفائق عند القارئ البايومتري.' : 'Expired Aramco Rigging & SEC High-Voltage permits detected at automated reader.'}
                </p>
              </div>
            </div>
            <button onclick="Modals.openLockoutResolver()" class="w-full py-2 bg-[#C83E4D] hover:bg-[#b03542] text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-transform">
              <span>${store.t('resolveReassignBtn')}</span>
              <span class="material-symbols-outlined text-[16px]">${isAr ? 'arrow_back' : 'arrow_forward'}</span>
            </button>
          </div>
        ` : ''}

        <!-- 2x2 Bento Metric Grid -->
        <div class="grid grid-cols-2 gap-2.5">
          <!-- Metric 1: Active Workforce -->
          <div onclick="store.setMobileTab('roster')" class="bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between cursor-pointer active:scale-98 transition-transform">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase text-[#64748B]">${store.t('kpiWorkforce')}</span>
              <span class="material-symbols-outlined text-[#168C82] text-[18px]">badge</span>
            </div>
            <div class="mt-2 text-start">
              <span class="text-[22px] font-extrabold text-[#001D37] block leading-none">${metrics.total}</span>
              <div class="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-[#E6F5F3] text-[#168C82] text-[10px] font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-[#168C82]"></span>
                <span>${metrics.compliant} Gate Ready</span>
              </div>
            </div>
          </div>

          <!-- Metric 2: Expired Certs -->
          <div onclick="Modals.openLockoutResolver()" class="bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between cursor-pointer active:scale-98 transition-transform">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase text-[#C83E4D]">${store.t('kpiExpired')}</span>
              <span class="material-symbols-outlined text-[#C83E4D] text-[18px]">cancel</span>
            </div>
            <div class="mt-2 text-start">
              <span class="text-[22px] font-extrabold text-[#C83E4D] block leading-none">${metrics.barred}</span>
              <div class="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-[#FDECEE] text-[#C83E4D] text-[10px] font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C83E4D]"></span>
                <span>Access Denied</span>
              </div>
            </div>
          </div>

          <!-- Metric 3: Expiring Soon -->
          <div onclick="store.setMobileTab('certs')" class="bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between cursor-pointer active:scale-98 transition-transform">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase text-[#b45309]">${store.t('kpiExpiringSoon')}</span>
              <span class="material-symbols-outlined text-[#F2B544] text-[18px]">alarm</span>
            </div>
            <div class="mt-2 text-start">
              <span class="text-[22px] font-extrabold text-[#b45309] block leading-none">${metrics.expiring}</span>
              <div class="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-[#FEF8EC] text-[#b45309] text-[10px] font-bold">
                <span>Action Needed</span>
              </div>
            </div>
          </div>

          <!-- Metric 4: Overdue Audits -->
          <div onclick="store.setMobileTab('audits')" class="bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between cursor-pointer active:scale-98 transition-transform">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase text-[#64748B]">${store.t('kpiOverdueAudits')}</span>
              <span class="material-symbols-outlined text-[#C83E4D] text-[18px]">assignment_late</span>
            </div>
            <div class="mt-2 text-start">
              <span class="text-[22px] font-extrabold text-[#001D37] block leading-none">1</span>
              <div class="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-[#EFF4FF] text-[#16324F] text-[10px] font-bold">
                <span>18h Overdue</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Field Action Buttons -->
        <div class="grid grid-cols-2 gap-2">
          <button onclick="Modals.openQrScanner()" class="p-2.5 rounded-xl bg-[#001D37] text-white flex items-center justify-center gap-1.5 text-[11px] font-bold shadow-xs active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[17px]">qr_code_scanner</span>
            <span>${isAr ? 'مسح تصريح QR' : 'Scan Gate QR'}</span>
          </button>
          <button onclick="Modals.openAddEmployee()" class="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#001D37] flex items-center justify-center gap-1.5 text-[11px] font-bold shadow-xs active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[17px]">person_add</span>
            <span>${store.t('btnAddEmployee')}</span>
          </button>
        </div>

        <!-- Recent Gate Activity Feed -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-[13px] font-bold text-[#0b1c30]">${store.t('recentGateActivity')}</span>
            <span class="font-mono text-[10px] text-[#64748B]">${store.t('today')}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            ${store.recentActivity.slice(0, 3).map(act => `
              <div class="p-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center justify-between text-start">
                <div class="flex items-center gap-2.5 min-w-0 pr-1">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    act.type === 'critical' ? 'bg-[#FDECEE] text-[#C83E4D]' :
                    act.type === 'warning' ? 'bg-[#FEF8EC] text-[#b45309]' :
                    'bg-[#E6F5F3] text-[#168C82]'
                  }">
                    <span class="material-symbols-outlined text-[15px]">${act.icon}</span>
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[12px] font-bold text-[#0b1c30] truncate">${isAr ? act.titleAr : act.titleEn}</span>
                    <span class="text-[10px] text-[#64748B] truncate">${isAr ? act.detailAr : act.detailEn}</span>
                  </div>
                </div>
                <span class="font-mono text-[9px] text-[#64748B] shrink-0">${act.timeAgo}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // 2. Mobile Workforce Roster
  renderRoster() {
    const isAr = store.locale === 'ar';
    const filteredWorkers = store.getFilteredWorkers();

    return `
      <div class="flex flex-col gap-3">
        <!-- Search Bar with Scanner Icon -->
        <div class="flex items-center w-full h-11 px-3 rounded-full bg-white border border-[#E2E8F0] shadow-2xs focus-within:ring-2 focus-within:ring-[#001D37]/20 transition-shadow">
          <span class="material-symbols-outlined text-[#64748B] text-[20px] shrink-0 mr-2">search</span>
          <input 
            type="search" 
            value="${store.searchQuery}" 
            oninput="store.setSearchQuery(this.value)" 
            placeholder="${store.t('searchPlaceholder')}" 
            class="w-full bg-transparent border-none outline-none text-[12px] text-[#0b1c30] placeholder-[#94A3B8]"
          />
          <button onclick="Modals.openQrScanner()" class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#001D37] active:scale-95 transition-transform" title="Scan QR Badge">
            <span class="material-symbols-outlined text-[17px]">qr_code_scanner</span>
          </button>
        </div>

        <!-- Filter Chips (Horizontal Scrollable) -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button onclick="store.setFilterStatus('all')" class="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
            store.filterStatus === 'all' ? 'bg-[#001D37] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B]'
          }">
            <span>${store.t('filterAll')}</span>
            <span class="font-mono text-[10px] opacity-80">${store.workers.length}</span>
          </button>
          <button onclick="store.setFilterStatus('compliant')" class="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
            store.filterStatus === 'compliant' ? 'bg-[#168C82] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B]'
          }">
            <span class="w-1.5 h-1.5 rounded-full bg-[#168C82]"></span>
            <span>Gate Ready</span>
          </button>
          <button onclick="store.setFilterStatus('expiring')" class="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
            store.filterStatus === 'expiring' ? 'bg-[#b45309] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B]'
          }">
            <span class="w-1.5 h-1.5 rounded-full bg-[#F2B544]"></span>
            <span>Expiring</span>
          </button>
          <button onclick="store.setFilterStatus('barred')" class="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
            store.filterStatus === 'barred' ? 'bg-[#C83E4D] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B]'
          }">
            <span class="w-1.5 h-1.5 rounded-full bg-[#C83E4D]"></span>
            <span>Barred</span>
          </button>
        </div>

        <!-- Worker Cards Stack -->
        <div class="flex flex-col gap-2.5">
          ${filteredWorkers.map(w => `
            <article onclick="MobileViews.openWorkerProfile('${w.id}')" class="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-xs active:scale-[0.98] transition-all cursor-pointer flex flex-col gap-2 text-start">
              <div class="flex items-start gap-2.5">
                <!-- Avatar -->
                <div class="relative shrink-0">
                  <img src="${w.photoUrl}" alt="${w.nameEn}" class="w-11 h-11 rounded-full object-cover border border-[#E2E8F0]"/>
                  <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${w.gatePermitted ? 'bg-[#168C82]' : 'bg-[#C83E4D]'} text-white flex items-center justify-center">
                    <span class="material-symbols-outlined text-[10px]">${w.gatePermitted ? 'check' : 'close'}</span>
                  </div>
                </div>

                <!-- Identity Details -->
                <div class="flex flex-col flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <h3 class="text-[13px] font-bold text-[#0b1c30] truncate">${isAr ? w.nameAr : w.nameEn}</h3>
                    <span class="material-symbols-outlined text-[16px] text-[#64748B] shrink-0">${isAr ? 'chevron_left' : 'chevron_right'}</span>
                  </div>
                  <div class="flex items-center gap-1 font-mono text-[10px] text-[#64748B]">
                    <span class="font-bold text-[#001D37]">${w.id}</span>
                    <span>•</span>
                    <span class="truncate">Iqama: ${w.iqama}</span>
                  </div>
                  <div class="flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5 truncate">
                    <span class="font-medium text-[#0b1c30] truncate">${isAr ? w.tradeAr : w.tradeEn}</span>
                  </div>
                </div>
              </div>

              <!-- Compliance Audit Strip Footer -->
              <div class="flex items-center justify-between pt-2 border-t border-[#F5F7FA] text-[10px]">
                <span class="px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  w.gateStatus === 'compliant' ? 'bg-[#E6F5F3] text-[#168C82]' :
                  w.gateStatus === 'expiring' ? 'bg-[#FEF8EC] text-[#b45309]' :
                  'bg-[#FDECEE] text-[#C83E4D]'
                }">
                  <span class="material-symbols-outlined text-[11px]">${w.gateStatus === 'compliant' ? 'verified' : 'warning'}</span>
                  ${w.gateStatus === 'compliant' ? 'Compliant' : w.gateStatus === 'expiring' ? 'Expiring in 5d' : 'Barred Access'}
                </span>
                <span class="font-mono text-[#64748B]">${isAr ? w.validThroughTextAr : w.validThroughTextEn}</span>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  },

  openWorkerProfile(workerId) {
    store.setSelectedWorker(workerId);
    store.setMobileTab('profile');
  },

  // 3. Mobile Worker Profile & Dossier (SCR-07 / Mohammad Salem)
  renderProfile() {
    const isAr = store.locale === 'ar';
    const worker = store.getSelectedWorker();

    return `
      <div class="flex flex-col gap-3">
        <!-- Subheader with back button -->
        <div class="flex items-center justify-between py-1">
          <button onclick="store.setMobileTab('roster')" class="flex items-center gap-1 text-[12px] font-bold text-[#001D37]">
            <span class="material-symbols-outlined text-[18px]">${isAr ? 'arrow_forward' : 'arrow_back'}</span>
            <span>${isAr ? 'العودة للسجل' : 'Worker Dossier'}</span>
          </button>
          <div class="flex items-center gap-1.5">
            <button onclick="Modals.openQrGatePass('${worker.id}')" class="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#001D37] shadow-2xs">
              <span class="material-symbols-outlined text-[17px]">qr_code_2</span>
            </button>
            <button onclick="store.showToast('${isAr ? 'تم نسخ رابط الملف الرقمي' : 'Copied dossier verification link'}')" class="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#001D37] shadow-2xs">
              <span class="material-symbols-outlined text-[17px]">share</span>
            </button>
          </div>
        </div>

        <!-- Worker Profile Header Card -->
        <div class="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-3 text-start">
          <div class="flex items-start gap-3">
            <div class="relative shrink-0">
              <img src="${worker.photoUrl}" alt="${worker.nameEn}" class="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-2xs"/>
              <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${worker.gatePermitted ? 'bg-[#168C82]' : 'bg-[#C83E4D]'} text-white flex items-center justify-center shadow-xs">
                <span class="material-symbols-outlined text-[12px]">${worker.gatePermitted ? 'check' : 'close'}</span>
              </div>
            </div>

            <div class="flex flex-col min-w-0 flex-1">
              <h2 class="text-[15px] font-bold text-[#0b1c30] leading-snug">${isAr ? worker.nameAr : worker.nameEn}</h2>
              <span class="text-[11px] font-semibold text-[#168C82] mt-0.5 truncate">${isAr ? worker.tradeAr : worker.tradeEn}</span>
              <div class="flex items-center gap-1 text-[10px] text-[#64748B] mt-1 truncate">
                <span class="material-symbols-outlined text-[12px]">domain</span>
                <span class="truncate">${isAr ? worker.subcontractorNameAr : worker.subcontractorNameEn}</span>
              </div>
            </div>
          </div>

          <!-- Official IDs Box -->
          <div class="bg-[#F8F9FF] rounded-xl p-2.5 grid grid-cols-2 gap-2 font-mono text-[11px] border border-[#E2E8F0]">
            <div>
              <span class="text-[9px] uppercase font-bold text-[#64748B] block">${store.t('iqamaNationalId')}</span>
              <span class="font-bold text-[#0b1c30]">${worker.iqama}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase font-bold text-[#64748B] block">${store.t('nationality')}</span>
              <span class="font-bold text-[#0b1c30]">${worker.nationality} (${worker.natCode})</span>
            </div>
            <div class="col-span-2">
              <span class="text-[9px] uppercase font-bold text-[#64748B] block">${store.t('gatePassSerial')}</span>
              <span class="font-bold text-[#001D37]">${worker.passSerial}</span>
            </div>
          </div>

          <!-- Status Pill -->
          <div class="w-full p-2 rounded-xl flex items-center justify-between text-[11px] font-bold ${
            worker.gatePermitted ? 'bg-[#E6F5F3] text-[#168C82]' : 'bg-[#FDECEE] text-[#C83E4D]'
          }">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">${worker.gatePermitted ? 'check_circle' : 'gpp_bad'}</span>
              <span>${worker.gatePermitted ? (isAr ? 'تصريح الدخول الأخضر نشط' : 'COMPLIANT — Green Gate Pass') : (isAr ? 'محظور من الدخول' : 'BARRED AT TURNSTILE')}</span>
            </div>
            <span class="px-2 py-0.5 rounded-md ${worker.gatePermitted ? 'bg-[#168C82] text-white' : 'bg-[#C83E4D] text-white'} text-[9px] font-mono">
              ${worker.gatePermitted ? 'VERIFIED' : 'HOLD'}
            </span>
          </div>
        </div>

        <!-- Action Bar: Issue Pass & WhatsApp Direct -->
        <div class="grid grid-cols-2 gap-2">
          <button onclick="Modals.openQrGatePass('${worker.id}')" class="py-2.5 rounded-xl bg-[#001D37] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs">
            <span class="material-symbols-outlined text-[16px]">qr_code_2</span>
            <span>${store.t('btnIssueQrPass')}</span>
          </button>
          <button onclick="store.showToast('${isAr ? 'تم إرسال بطاقة الدخول عبر تطبيق واتساب' : 'Dispatched digital pass to worker via WhatsApp'}', 'success')" class="py-2.5 rounded-xl bg-[#168C82] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs">
            <span class="material-symbols-outlined text-[16px]">send</span>
            <span>WhatsApp Pass</span>
          </button>
        </div>

        <!-- Certifications List in Mobile -->
        <div class="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 shadow-xs flex flex-col gap-2.5 text-start">
          <div class="flex items-center justify-between">
            <span class="text-[12px] font-bold text-[#0b1c30]">${isAr ? 'الشهادات والاعتمادات المهنية' : 'Verified Certificates'}</span>
            <span class="font-mono text-[10px] text-[#168C82] font-bold">${worker.certificates.length} Active</span>
          </div>

          <div class="flex flex-col gap-2">
            ${worker.certificates.map(c => `
              <div class="p-2.5 rounded-xl bg-[#F8F9FF] border border-[#E2E8F0] flex flex-col gap-1">
                <div class="flex items-start justify-between gap-1">
                  <span class="text-[11px] font-bold text-[#0b1c30] leading-snug">${isAr ? c.nameAr : c.nameEn}</span>
                  <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    c.status === 'expired' ? 'bg-[#FDECEE] text-[#C83E4D]' : 'bg-[#E6F5F3] text-[#168C82]'
                  }">
                    ${c.status === 'expired' ? 'EXPIRED' : 'VALID'}
                  </span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-[#64748B]">
                  <span class="font-mono">${c.licenseNo}</span>
                  <span>Exp: ${c.expiryDate}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // 4. Mobile Certs & Expiries Horizon
  renderCerts() {
    const isAr = store.locale === 'ar';
    const metrics = store.getMetrics();

    return `
      <div class="flex flex-col gap-3">
        <!-- Header & Action -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[16px] font-bold text-[#001D37]">${store.t('navCerts')}</h2>
            <span class="text-[11px] text-[#64748B]">Certification Expiry Horizon</span>
          </div>
          <button onclick="Modals.openQrScanner()" class="px-2.5 py-1 rounded-lg bg-[#001D37] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
            <span class="material-symbols-outlined text-[15px]">qr_code_scanner</span>
            <span>Verify</span>
          </button>
        </div>

        <!-- 4 Count Pills Grid -->
        <div class="grid grid-cols-4 gap-1.5 text-center">
          <div class="bg-[#FDECEE] p-2 rounded-xl flex flex-col items-center">
            <span class="text-[18px] font-extrabold text-[#C83E4D] leading-none">${metrics.barred}</span>
            <span class="text-[9px] text-[#C83E4D] font-bold mt-1">Overdue</span>
          </div>
          <div class="bg-[#FEF8EC] p-2 rounded-xl flex flex-col items-center">
            <span class="text-[18px] font-extrabold text-[#b45309] leading-none">8</span>
            <span class="text-[9px] text-[#b45309] font-bold mt-1">&lt;7 Days</span>
          </div>
          <div class="bg-[#EFF4FF] p-2 rounded-xl flex flex-col items-center">
            <span class="text-[18px] font-extrabold text-[#001D37] leading-none">${metrics.expiring}</span>
            <span class="text-[9px] text-[#001D37] font-bold mt-1">&lt;30 Days</span>
          </div>
          <div class="bg-[#E6F5F3] p-2 rounded-xl flex flex-col items-center">
            <span class="text-[18px] font-extrabold text-[#168C82] leading-none">380</span>
            <span class="text-[9px] text-[#168C82] font-bold mt-1">Valid</span>
          </div>
        </div>

        <!-- Export & WhatsApp Buttons -->
        <div class="grid grid-cols-2 gap-2">
          <button onclick="Modals.openExportAuditPack()" class="py-2 px-3 bg-[#001D37] text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Export Client PDF</span>
          </button>
          <button onclick="store.showToast('${isAr ? 'تم إرسال تنبيهات واتساب المجمعة' : 'Dispatched bulk WhatsApp reminders to subcontractors'}', 'success')" class="py-2 px-3 bg-[#E6F5F3] text-[#168C82] border border-[#B3E0DC] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">send</span>
            <span>Bulk WhatsApp</span>
          </button>
        </div>

        <!-- Urgent Expiry Worker Cards -->
        <div class="flex flex-col gap-2">
          <span class="text-[12px] font-bold text-[#0b1c30] text-start">${isAr ? 'التراخيص المهنية العاجلة' : 'Immediate Attention Required'}</span>
          ${store.workers.filter(w => w.gateStatus !== 'compliant').map(w => `
            <div class="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between text-start">
              <div class="flex flex-col min-w-0 pr-2">
                <span class="text-[12px] font-bold text-[#0b1c30] truncate">${isAr ? w.nameAr : w.nameEn}</span>
                <span class="text-[10px] text-[#64748B] truncate">${w.certificates[0] ? (isAr ? w.certificates[0].nameAr : w.certificates[0].nameEn) : 'Trade Ticket'}</span>
                <span class="font-mono text-[9px] font-bold ${w.gateStatus === 'barred' ? 'text-[#C83E4D]' : 'text-[#b45309]'}">
                  ${isAr ? w.validThroughTextAr : w.validThroughTextEn}
                </span>
              </div>
              <button onclick="store.showToast('${isAr ? 'تم إرسال تنبيه مباشر عبر واتساب' : 'Dispatched WhatsApp alert to ' + w.nameEn}', 'success')" class="px-2.5 py-1 rounded-lg bg-[#E6F5F3] text-[#168C82] text-[10px] font-bold shrink-0">
                Alert
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 5. Mobile Audits & Inspections
  renderAudits() {
    const isAr = store.locale === 'ar';

    return `
      <div class="flex flex-col gap-3">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[16px] font-bold text-[#001D37]">${store.t('navInspections')}</h2>
            <span class="text-[11px] text-[#64748B]">NEOM Spine Sector 4 Audits</span>
          </div>
          <button onclick="Modals.openInspectionModal()" class="px-2.5 py-1 rounded-lg bg-[#001D37] text-white text-[11px] font-bold">
            + Schedule
          </button>
        </div>

        <!-- GCC Work Week Mini Strip -->
        <div class="grid grid-cols-5 gap-1 text-center">
          <div class="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[10px]">
            <span class="block text-[#64748B]">SUN</span>
            <span class="font-mono font-bold">20</span>
          </div>
          <div class="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[10px]">
            <span class="block text-[#64748B]">MON</span>
            <span class="font-mono font-bold">21</span>
          </div>
          <div class="p-1.5 rounded-lg bg-[#001D37] text-white text-[10px] font-bold shadow-xs">
            <span class="block text-[#90f4e8]">TUE</span>
            <span class="font-mono">22</span>
          </div>
          <div class="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[10px]">
            <span class="block text-[#64748B]">WED</span>
            <span class="font-mono font-bold">23</span>
          </div>
          <div class="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[10px]">
            <span class="block text-[#64748B]">THU</span>
            <span class="font-mono font-bold">24</span>
          </div>
        </div>

        <!-- Audits List -->
        <div class="flex flex-col gap-2.5">
          ${store.inspections.map(ins => `
            <div class="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-xs flex flex-col gap-2 text-start">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-start gap-2">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    ins.status === 'passed' ? 'bg-[#E6F5F3] text-[#168C82]' :
                    ins.status === 'overdue' ? 'bg-[#FDECEE] text-[#C83E4D]' :
                    'bg-[#EFF4FF] text-[#16324F]'
                  }">
                    <span class="material-symbols-outlined text-[17px]">${ins.status === 'passed' ? 'check' : 'warning'}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-mono text-[9px] text-[#64748B] font-bold">${ins.assetTag}</span>
                    <h3 class="text-[12px] font-bold text-[#0b1c30] leading-snug">${isAr ? ins.titleAr : ins.titleEn}</h3>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                  ins.status === 'passed' ? 'bg-[#E6F5F3] text-[#168C82]' :
                  ins.status === 'overdue' ? 'bg-[#FDECEE] text-[#C83E4D]' :
                  'bg-[#EFF4FF] text-[#16324F]'
                }">
                  ${ins.status === 'passed' ? 'Passed' : ins.status === 'overdue' ? 'Overdue' : 'Due'}
                </span>
              </div>
              <button onclick="Modals.openInspectionChecklist('${ins.id}')" class="w-full py-1.5 rounded-lg bg-[#001D37] text-white text-[11px] font-bold">
                ${ins.status === 'passed' ? 'View Results' : 'Execute Checklist'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 6. Mobile More Hub & Settings (SCR-10)
  renderMore() {
    const isAr = store.locale === 'ar';

    return `
      <div class="flex flex-col gap-3.5 text-start">
        <!-- Director Quota Card -->
        <div class="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-[#001D37] text-white flex items-center justify-center font-bold text-[18px] shrink-0 shadow-xs">
              <span class="material-symbols-outlined text-[24px]">person</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-[14px] font-bold text-[#0b1c30]">Eng. Tariq Al-Otaibi</span>
              <span class="text-[11px] text-[#64748B]">${isAr ? 'مدير السلامة • شركة الفنار' : 'HSE Director • Al-Fanar KSA'}</span>
              <span class="font-mono text-[10px] text-[#168C82]">CR #1010294821</span>
            </div>
          </div>

          <!-- Enterprise Quota Metric -->
          <div class="bg-[#F8F9FF] rounded-xl p-2.5 flex flex-col gap-1 border border-[#E2E8F0]">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-semibold text-[#0b1c30]">${store.t('enterpriseQuota')}</span>
              <span class="font-mono text-[#168C82] font-bold">152 / 200 Slots</span>
            </div>
            <div class="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
              <div class="bg-[#168C82] h-full rounded-full" style="width: 76%"></div>
            </div>
            <span class="text-[10px] text-[#64748B]">76% Active Field Workforce Quota Utilized</span>
          </div>
        </div>

        <!-- Menu Action Items Stack -->
        <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden divide-y divide-[#F5F7FA]">
          <!-- Reports -->
          <button onclick="Modals.openExportAuditPack()" class="w-full p-3 flex items-center justify-between hover:bg-[#F8F9FF] transition-colors text-start">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-[#EFF4FF] text-[#16324F] flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">folder_zip</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[12px] font-bold text-[#0b1c30]">${store.t('reportsPacks')}</span>
                <span class="text-[10px] text-[#64748B]">Export PDF/CSV client audit packages</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-[16px] text-[#64748B]">${isAr ? 'chevron_left' : 'chevron_right'}</span>
          </button>

          <!-- Qiwa Integration -->
          <button onclick="store.syncNow()" class="w-full p-3 flex items-center justify-between hover:bg-[#F8F9FF] transition-colors text-start">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-[#E6F5F3] text-[#168C82] flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">sync</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[12px] font-bold text-[#0b1c30]">${store.t('qiwaIntegration')}</span>
                <span class="text-[10px] text-[#64748B]">Endpoint connected • Sync gateway</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-[16px] text-[#64748B]">${isAr ? 'chevron_left' : 'chevron_right'}</span>
          </button>

          <!-- Language Switcher -->
          <button onclick="store.setLocale(store.locale === 'en' ? 'ar' : 'en')" class="w-full p-3 flex items-center justify-between hover:bg-[#F8F9FF] transition-colors text-start">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-[#EFF4FF] text-[#001D37] flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">translate</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[12px] font-bold text-[#0b1c30]">${isAr ? 'تغيير اللغة (English)' : 'Change Language (العربية)'}</span>
                <span class="text-[10px] text-[#64748B]">${isAr ? 'Switch to English LTR' : 'التبديل إلى العربية RTL'}</span>
              </div>
            </div>
            <span class="text-[11px] font-bold text-[#168C82] font-mono">${isAr ? 'العربية' : 'EN'}</span>
          </button>

          <!-- Sign Out -->
          <button onclick="store.setDesktopRoute('onboarding'); store.showToast('${isAr ? 'تم تسجيل الخروج بنجاح' : 'Signed out'}')" class="w-full p-3 flex items-center justify-between hover:bg-[#FDECEE] transition-colors text-start text-[#C83E4D]">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-[#FDECEE] text-[#C83E4D] flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">logout</span>
              </div>
              <span class="text-[12px] font-bold">${store.t('navSignOut')}</span>
            </div>
            <span class="material-symbols-outlined text-[16px]">${isAr ? 'chevron_left' : 'chevron_right'}</span>
          </button>
        </div>
      </div>
    `;
  }
};

/**
 * SiteReady GCC — Master Application Bootstrapper
 * Coordinates Dual Experience (Desktop Web & Mobile App)
 */

const App = {
  init() {
    // Render top presentation bar
    this.renderPresentationBar();

    // Subscribe to state updates
    store.subscribe(() => {
      this.render();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"], input[type="search"]');
        if (searchInput) searchInput.focus();
      }
      if (e.key === 'Escape') {
        Modals.close();
      }
    });

    // Initial render
    this.render();
  },

  renderPresentationBar() {
    const bar = document.getElementById('presentation-bar');
    if (!bar) return;

    const isAr = store.locale === 'ar';

    bar.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white text-start">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#168C82] flex items-center justify-center text-white shadow-xs">
            <span class="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-[15px] tracking-tight">SiteReady GCC</span>
              <span class="text-[9px] font-bold bg-[#168C82] text-white px-1.5 py-0.2 rounded uppercase">PROTOTYPE</span>
            </div>
            <span class="text-[10px] text-white/70">Dual Web & Mobile Enterprise Suite</span>
          </div>
        </div>

        <!-- Viewport Mode Switcher Buttons (Centerpiece!) -->
        <div class="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
          <!-- Split Mode (Default Recommended!) -->
          <button onclick="store.setDeviceView('split')" class="px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all ${
            store.deviceView === 'split' ? 'bg-[#168C82] text-white shadow-xs' : 'text-white/70 hover:text-white'
          }">
            <span class="material-symbols-outlined text-[16px]">view_column</span>
            <span>${store.t('viewSplit')}</span>
          </button>

          <!-- Desktop Web View -->
          <button onclick="store.setDeviceView('desktop')" class="px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all ${
            store.deviceView === 'desktop' ? 'bg-[#168C82] text-white shadow-xs' : 'text-white/70 hover:text-white'
          }">
            <span class="material-symbols-outlined text-[16px]">desktop_windows</span>
            <span>${store.t('viewDesktop')}</span>
          </button>

          <!-- Mobile App View -->
          <button onclick="store.setDeviceView('mobile')" class="px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all ${
            store.deviceView === 'mobile' ? 'bg-[#168C82] text-white shadow-xs' : 'text-white/70 hover:text-white'
          }">
            <span class="material-symbols-outlined text-[16px]">smartphone</span>
            <span>${store.t('viewMobile')}</span>
          </button>

          <!-- Fluid Auto Responsive -->
          <button onclick="store.setDeviceView('responsive')" class="px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all ${
            store.deviceView === 'responsive' ? 'bg-[#168C82] text-white shadow-xs' : 'text-white/70 hover:text-white'
          }">
            <span class="material-symbols-outlined text-[16px]">devices</span>
            <span>${store.t('viewResponsive')}</span>
          </button>
        </div>

        <!-- Right Quick Controls -->
        <div class="flex items-center gap-2.5">
          <!-- Live Sync Status & Button -->
          <button onclick="store.syncNow()" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-white/10">
            <span class="w-2 h-2 rounded-full ${store.isSyncing ? 'bg-[#F2B544] animate-spin' : 'bg-[#168C82] animate-pulse'}"></span>
            <span>${store.isSyncing ? store.t('syncingText') : 'Qiwa Gateway: Live'}</span>
          </button>

          <!-- Language Switcher Pill -->
          <div class="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10">
            <button onclick="store.setLocale('en')" class="px-2 py-1 rounded text-[11px] font-bold transition-all ${!isAr ? 'bg-[#168C82] text-white' : 'text-white/60 hover:text-white'}">EN</button>
            <button onclick="store.setLocale('ar')" class="px-2 py-1 rounded text-[11px] font-bold transition-all ${isAr ? 'bg-[#168C82] text-white' : 'text-white/60 hover:text-white'}">العربية</button>
          </div>
        </div>
      </div>
    `;
  },

  render() {
    const canvas = document.getElementById('prototype-canvas');
    if (!canvas) return;

    // Refresh presentation bar labels on locale change
    this.renderPresentationBar();

    const isAr = store.locale === 'ar';
    const view = store.deviceView;

    if (view === 'desktop') {
      canvas.innerHTML = `
        <div class="desktop-viewport-container animate-fade-in">
          ${WebViews.render(store.desktopRoute)}
        </div>
      `;
    } else if (view === 'mobile') {
      canvas.innerHTML = `
        <div class="mobile-device-shell animate-fade-in">
          ${MobileViews.render(store.mobileTab)}
        </div>
      `;
    } else if (view === 'split') {
      // Split synchronized side-by-side view!
      canvas.innerHTML = `
        <div class="split-view-container animate-fade-in">
          <!-- Left: Desktop Enterprise View -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between px-2 text-white/80 text-[12px] font-bold">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-[#90f4e8]">desktop_windows</span>
                <span>${isAr ? 'بوابة سطح المكتب للمديرين ومشرفي السلامة (Enterprise Web Portal)' : 'Enterprise Web Portal (Desktop View)'}</span>
              </span>
              <span class="text-[11px] text-white/50 font-mono">1440px Fluid</span>
            </div>
            <div class="desktop-viewport-container" style="max-height: 870px; overflow-y: auto;">
              ${WebViews.render(store.desktopRoute)}
            </div>
          </div>

          <!-- Right: Mobile Field Inspection App -->
          <div class="flex flex-col gap-2 items-center">
            <div class="w-full flex items-center justify-between px-2 text-white/80 text-[12px] font-bold">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-[#90f4e8]">smartphone</span>
                <span>${isAr ? 'تطبيق الجوال لضباط البوابات والميدان (Mobile Field App)' : 'Field Officer Mobile App (iPhone Frame)'}</span>
              </span>
              <span class="text-[11px] text-white/50 font-mono">393×852</span>
            </div>
            <div class="mobile-device-shell">
              ${MobileViews.render(store.mobileTab)}
            </div>
          </div>
        </div>
      `;
    } else {
      // Responsive auto view (adapts naturally)
      canvas.innerHTML = `
        <div class="responsive-viewport-container animate-fade-in">
          <div class="hidden lg:block">
            ${WebViews.render(store.desktopRoute)}
          </div>
          <div class="block lg:hidden max-w-md mx-auto p-2">
            <div class="mobile-device-shell">
              ${MobileViews.render(store.mobileTab)}
            </div>
          </div>
        </div>
      `;
    }
  }
};

// Auto-run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

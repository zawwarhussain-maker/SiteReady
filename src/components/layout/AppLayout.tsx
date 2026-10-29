import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Smartphone, Monitor } from 'lucide-react';
import { useI18n } from '../../lib/i18nContext';

export const AppLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const { isRtl } = useI18n();

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172B3A] flex flex-col font-sans">
      {/* Top Device Preview Bar */}
      <div className="bg-[#0F2236] text-white text-xs px-4 py-1.5 flex items-center justify-between z-50 no-print border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">
            {isRtl ? 'بيئة نظام سايت ريدي للسلامة والمقاولات' : 'SiteReady GCC Production Sandbox'}
          </span>
          <span className="hidden sm:inline-block text-slate-400 text-[11px]">
            {isRtl ? '| المعايير: أرامكو، نيوم، كود البناء السعودي SBC' : '| Aramco OHS, NEOM & Saudi Building Code'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileSimulator(!isMobileSimulator)}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
              isMobileSimulator
                ? 'bg-[#168C82] text-white shadow-sm'
                : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
            }`}
            title="Toggle between Desktop Responsive view and Mobile Phone Simulator"
          >
            {isMobileSimulator ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>
              {isMobileSimulator
                ? isRtl
                  ? 'عرض سطح المكتب'
                  : 'Desktop View'
                : isRtl
                ? 'محاكي الجوال (Flutter/Android)'
                : 'Mobile Simulator (Android)'}
            </span>
          </button>
        </div>
      </div>

      {isMobileSimulator ? (
        /* Mobile Simulator Mode (393px width, simulating Android/Flutter experience) */
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 bg-slate-900/90 overflow-x-hidden">
          <div className="w-full max-w-[400px] h-[850px] bg-[#F5F7FA] rounded-[36px] shadow-2xl border-[8px] border-slate-800 flex flex-col relative overflow-hidden">
            {/* Phone Speaker & Notch */}
            <div className="h-6 bg-slate-800 flex items-center justify-center">
              <div className="w-16 h-1.5 bg-slate-600 rounded-full"></div>
            </div>

            <Navbar onToggleMobileMenu={() => {}} />

            <main className="flex-1 overflow-y-auto pb-20 p-4">
              <Outlet />
            </main>

            <MobileNav />
          </div>
        </div>
      ) : (
        /* Standard Responsive Web Mode */
        <div className="flex flex-1 relative">
          {/* Desktop Sidebar (visible on lg+) */}
          <div className="hidden lg:block no-print">
            <Sidebar />
          </div>

          {/* Mobile Drawer (visible on small screens when open) */}
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden no-print">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setMobileDrawerOpen(false)}
              />
              <div className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} z-50`}>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col min-w-0 ${isRtl ? 'lg:mr-64' : 'lg:ml-64'} transition-all print:m-0`}>
            <div className="no-print">
              <Navbar onToggleMobileMenu={() => setMobileDrawerOpen(!mobileDrawerOpen)} />
            </div>

            <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 print:p-0">
              <Outlet />
            </main>

            <div className="no-print">
              <MobileNav />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

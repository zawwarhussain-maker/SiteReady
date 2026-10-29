import React from 'react';
import { useI18n } from '../../lib/i18nContext';
import { useAuth } from '../../lib/authContext';
import { isLiveMode } from '../../lib/supabase';
import {
  MapPin,
  Globe,
  Bell,
  Menu,
  Database,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { locale, toggleLanguage, isRtl, t } = useI18n();
  const { selectedSiteId, setSelectedSiteId, sites } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Site Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <MapPin className="w-4 h-4 text-[#168C82] flex-shrink-0" />
          <div className="relative inline-block">
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-semibold text-[#172B3A] appearance-none cursor-pointer pr-6 pl-1 focus:outline-none"
            >
              <option value="all">{t('allSites')}</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {isRtl && site.name_ar ? site.name_ar : site.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-0 top-1 pointer-events-none text-slate-500" />
          </div>
        </div>

        {/* Data Engine Indicator Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
          <Database className="w-3 h-3 text-[#168C82]" />
          <span>
            {isLiveMode
              ? isRtl
                ? 'سوبابيز مباشر (Supabase Live)'
                : 'Supabase Cloud RLS'
              : isRtl
              ? 'محرك قاعدة البيانات المحلي (جاهز للنشر)'
              : 'Local DB Store (RLS Schema Ready)'}
          </span>
          <CheckCircle2 className="w-3 h-3 text-[#168C82]" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#16324F] hover:bg-slate-50 transition-colors shadow-2xs"
          title={isRtl ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Globe className="w-3.5 h-3.5 text-[#168C82]" />
          <span>{locale === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
        </button>

        {/* Notification Bell with Badge */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={isRtl ? 'الإشعارات والتنبيهات' : 'Safety Notifications'}
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C83E4D] ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};

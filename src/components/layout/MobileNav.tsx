import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../../lib/i18nContext';
import {
  LayoutDashboard,
  Users,
  Award,
  ClipboardCheck,
  MoreHorizontal
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { t } = useI18n();

  const mobileTabs = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/employees', label: t('navEmployees'), icon: Users },
    { to: '/certificates', label: t('navCertificates'), icon: Award },
    { to: '/inspections', label: t('navInspections'), icon: ClipboardCheck },
    { to: '/settings', label: t('navSettings'), icon: MoreHorizontal }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-40 px-2 py-1 flex items-center justify-around shadow-lg safe-area-bottom">
      {mobileTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-colors flex-1 ${
                isActive
                  ? 'text-[#168C82]'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[64px] text-center">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

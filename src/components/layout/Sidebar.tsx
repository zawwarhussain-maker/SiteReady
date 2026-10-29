import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useI18n } from '../../lib/i18nContext';
import { useAuth } from '../../lib/authContext';
import {
  LayoutDashboard,
  Users,
  Award,
  ClipboardCheck,
  FileBarChart2,
  Users2,
  Settings,
  LogOut,
  HardHat,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types';

export const Sidebar: React.FC = () => {
  const { t, isRtl } = useI18n();
  const { user, company, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/employees', label: t('navEmployees'), icon: Users },
    { to: '/certificates', label: t('navCertificates'), icon: Award },
    { to: '/inspections', label: t('navInspections'), icon: ClipboardCheck },
    { to: '/reports', label: t('navReports'), icon: FileBarChart2 },
    { to: '/team', label: t('navTeam'), icon: Users2 },
    { to: '/settings', label: t('navSettings'), icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'owner':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'manager':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'viewer':
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <aside className="w-64 bg-[#16324F] text-white flex flex-col h-screen fixed top-0 bottom-0 z-30 shadow-xl border-r border-[#0F2236]/30">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[#0F2236]/40 bg-[#0F2236]/50">
        <div className="w-9 h-9 rounded-lg bg-[#168C82] flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <HardHat className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-extrabold tracking-wide text-white truncate">
            {isRtl ? 'سايت ريدي GCC' : 'SiteReady GCC'}
          </h1>
          <p className="text-[11px] text-slate-300 truncate font-medium">
            {company ? (isRtl && company.name_ar ? company.name_ar : company.name) : 'Al-Fanar Contracting'}
          </p>
        </div>
      </div>

      {/* Role Switcher Sandbox Banner */}
      <div className="px-4 py-2.5 bg-[#0F2236]/30 border-b border-[#0F2236]/40">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isRtl ? 'الصلاحية الحالية' : 'ACTIVE ROLE'}
          </span>
          <div className="relative inline-block text-left">
            <select
              value={role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded border appearance-none cursor-pointer pr-4 pl-2 ${getRoleBadgeStyle(
                role
              )} focus:outline-none`}
            >
              <option value="owner">{t('roleOwner')}</option>
              <option value="manager">{t('roleManager')}</option>
              <option value="viewer">{t('roleViewer')}</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-1 top-1.5 pointer-events-none text-slate-600" />
          </div>
        </div>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#168C82] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-[#0F2236]/40 bg-[#0F2236]/40">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-[#168C82]/30 border border-[#168C82] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {user?.full_name ? user.full_name.charAt(0) : 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {isRtl && user?.full_name_ar ? user.full_name_ar : user?.full_name || 'Eng. Tariq'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title={t('navSignOut')}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

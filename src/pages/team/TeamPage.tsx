import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { db } from '../../lib/supabase';
import { CompanyMember, UserRole } from '../../types';
import {
  Users2,
  UserPlus,
  Shield,
  Mail,
  CheckCircle2,
  Clock,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const TeamPage: React.FC = () => {
  const { role, can } = useAuth();
  const { t, isRtl, formatDate } = useI18n();

  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('manager');
  const [inviteError, setInviteError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const list = await db.getTeamMembers();
      setMembers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    const unsub = db.subscribe(loadMembers);
    return unsub;
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      setInviteError(t('requiredField'));
      return;
    }

    try {
      await db.inviteTeamMember(inviteEmail, inviteRole);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('manager');
      setInviteError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setInviteError(err.message);
      } else {
        setInviteError(t('errorGeneric'));
      }
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    if (!can('manage_company')) {
      alert(t('unauthorizedRoleChange'));
      return;
    }
    await db.updateMemberRole(memberId, newRole);
  };

  const handleToggleStatus = async (memberId: string) => {
    if (!can('manage_company')) {
      alert(t('unauthorizedRoleChange'));
      return;
    }
    await db.toggleMemberStatus(memberId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B3A] tracking-tight">
            {t('teamTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {isRtl
              ? 'إدارة أعضاء الفريق، الصلاحيات الرقابية، والأدوار التشغيلية'
              : 'Manage team access, role permissions, and company memberships'}
          </p>
        </div>

        {can('manage_company') && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16324F] text-white text-xs font-bold hover:bg-[#0F2236] transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('inviteMember')}</span>
          </button>
        )}
      </div>

      {/* Role Explanations Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-bold text-amber-900">{t('roleOwner')}</h4>
          </div>
          <p className="text-[11px] text-amber-800">
            {isRtl
              ? 'إدارة كاملة للشركة، المستخدمين، الفواتير، اشتراك الباقة، وجميع السجلات.'
              : 'Full access to company, subscription, billing, user roles, sites, and records.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-blue-700" />
            <h4 className="text-xs font-bold text-blue-900">{t('roleManager')}</h4>
          </div>
          <p className="text-[11px] text-blue-800">
            {isRtl
              ? 'إدارة العمال، تجديد الشهادات، تنفيذ الفحوصات الميدانية، واستخراج التقارير.'
              : 'Manage authorized workers, certificates, safety inspections, and export reports.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-bold text-slate-800">{t('roleViewer')}</h4>
          </div>
          <p className="text-[11px] text-slate-600">
            {isRtl
              ? 'عرض السجلات والتقارير الرقابية للقراءة والتدقيق فقط دون صلاحية تعديل.'
              : 'Read-only access for third-party auditors, clients (Aramco/NEOM), and inspectors.'}
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">{t('fullName')} / {t('emailLabel')}</th>
                <th className="py-3 px-4">{t('role')}</th>
                <th className="py-3 px-4">{t('status')}</th>
                <th className="py-3 px-4">{isRtl ? 'تاريخ الانضمام' : 'Joined Date'}</th>
                {can('manage_company') && <th className="py-3 px-4 text-end">{t('actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {members.map((mem) => {
                const u = mem.user;
                return (
                  <tr key={mem.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#16324F]">
                          {u?.full_name ? u.full_name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#172B3A]">
                            {isRtl && u?.full_name_ar ? u.full_name_ar : u?.full_name || mem.invited_email}
                          </p>
                          <p className="text-[11px] text-slate-400">{u?.email || mem.invited_email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {can('manage_company') ? (
                        <select
                          value={mem.role}
                          onChange={(e) => handleRoleChange(mem.id, e.target.value as UserRole)}
                          className="text-xs font-semibold px-2 py-1 rounded border border-[#E2E8F0] bg-slate-50 focus:outline-none"
                        >
                          <option value="owner">{t('roleOwner')}</option>
                          <option value="manager">{t('roleManager')}</option>
                          <option value="viewer">{t('roleViewer')}</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-slate-700 capitalize">{mem.role}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {mem.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('statusActive')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700">
                          <ShieldAlert className="w-3 h-3" />
                          <span>{t('statusSuspended')}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {formatDate(mem.joined_at || mem.created_at)}
                    </td>

                    {can('manage_company') && (
                      <td className="py-3 px-4 text-end">
                        <button
                          onClick={() => handleToggleStatus(mem.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                            mem.is_active
                              ? 'text-rose-700 hover:bg-rose-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {mem.is_active ? t('suspendAccess') : t('reactivateAccess')}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title={t('inviteMember')}
        subtitle={
          isRtl
            ? 'دعوة مسؤول سلامة أو مدقق خارجي إلى حساب المنشأة'
            : 'Invite safety engineer or third-party auditor to company workspace'
        }
        maxWidth="md"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          {inviteError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{inviteError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('emailLabel')} *
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              placeholder="safety.officer@alfanar.com"
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('role')} *
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white"
            >
              <option value="owner">{t('roleOwner')}</option>
              <option value="manager">{t('roleManager')}</option>
              <option value="viewer">{t('roleViewer')}</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#16324F] hover:bg-[#0F2236] rounded-lg transition-colors shadow-sm"
            >
              {isRtl ? 'إرسال الدعوة' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

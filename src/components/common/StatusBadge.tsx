import React from 'react';
import { useI18n } from '../../lib/i18nContext';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

export type BadgeVariant =
  | 'valid'
  | 'expiring_soon'
  | 'expired'
  | 'missing'
  | 'no_expiry'
  | 'cleared'
  | 'barred'
  | 'completed_pass'
  | 'completed_fail'
  | 'in_progress'
  | 'draft'
  | 'overdue'
  | 'active'
  | 'suspended'
  | 'terminated'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'open'
  | 'resolved';

interface StatusBadgeProps {
  status: BadgeVariant | string;
  label?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true
}) => {
  const { t, isRtl } = useI18n();

  let bg = 'bg-slate-100';
  let text = 'text-slate-700';
  let border = 'border-slate-200';
  let defaultLabel = label;
  let IconComponent: React.ComponentType<{ className?: string }> | null = null;

  switch (status) {
    case 'valid':
    case 'active':
    case 'completed_pass':
      bg = 'bg-[#E6F5F3]';
      text = 'text-[#168C82]';
      border = 'border-[#168C82]/30';
      defaultLabel = defaultLabel || (status === 'valid' ? t('statusValid') : status === 'active' ? t('statusActive') : t('pass'));
      IconComponent = CheckCircle2;
      break;

    case 'cleared':
      bg = 'bg-[#E6F5F3]';
      text = 'text-[#168C82]';
      border = 'border-[#168C82]/30';
      defaultLabel = defaultLabel || (isRtl ? 'تصريح الدخول مصرح به' : 'Turnstile Cleared');
      IconComponent = ShieldCheck;
      break;

    case 'expiring_soon':
    case 'medium':
      bg = 'bg-[#FEF8EC]';
      text = 'text-[#B45309]';
      border = 'border-[#F2B544]/40';
      defaultLabel = defaultLabel || t('statusExpiringSoon');
      IconComponent = Clock;
      break;

    case 'expired':
    case 'completed_fail':
    case 'overdue':
    case 'critical':
    case 'high':
      bg = 'bg-[#FDECEE]';
      text = 'text-[#C83E4D]';
      border = 'border-[#C83E4D]/30';
      defaultLabel = defaultLabel || (status === 'expired' ? t('statusExpired') : status === 'overdue' ? t('overdue') : t('fail'));
      IconComponent = AlertCircle;
      break;

    case 'barred':
      bg = 'bg-[#FDECEE]';
      text = 'text-[#C83E4D]';
      border = 'border-[#C83E4D]/30';
      defaultLabel = defaultLabel || (isRtl ? 'محظور من الدخول' : 'Access Barred');
      IconComponent = ShieldAlert;
      break;

    case 'missing':
    case 'suspended':
    case 'terminated':
      bg = 'bg-slate-100';
      text = 'text-slate-600';
      border = 'border-slate-200';
      defaultLabel = defaultLabel || (status === 'missing' ? t('statusMissing') : status === 'suspended' ? t('statusSuspended') : t('statusTerminated'));
      IconComponent = AlertTriangle;
      break;

    case 'no_expiry':
      bg = 'bg-blue-50';
      text = 'text-blue-700';
      border = 'border-blue-200';
      defaultLabel = defaultLabel || t('noExpiryRequired');
      IconComponent = CheckCircle2;
      break;

    case 'in_progress':
    case 'open':
      bg = 'bg-amber-50';
      text = 'text-amber-800';
      border = 'border-amber-200';
      defaultLabel = defaultLabel || (status === 'in_progress' ? t('inProgress') : t('statusOpen'));
      IconComponent = Clock;
      break;

    case 'resolved':
      bg = 'bg-emerald-50';
      text = 'text-emerald-700';
      border = 'border-emerald-200';
      defaultLabel = defaultLabel || t('statusResolved');
      IconComponent = CheckCircle2;
      break;

    default:
      defaultLabel = defaultLabel || String(status);
      IconComponent = null;
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${bg} ${text} ${border} ${paddingClass} whitespace-nowrap transition-colors`}
    >
      {showIcon && IconComponent && <IconComponent className={`${iconSize} flex-shrink-0`} />}
      <span>{defaultLabel}</span>
    </span>
  );
};

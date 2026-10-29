import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'teal' | 'amber' | 'danger';
  badgeText?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  sublabel,
  icon: Icon,
  variant = 'default',
  badgeText,
  onClick
}) => {
  let iconBg = 'bg-slate-100 text-[#16324F]';
  let borderAccent = 'hover:border-slate-300';
  let valueColor = 'text-[#172B3A]';

  if (variant === 'teal') {
    iconBg = 'bg-[#E6F5F3] text-[#168C82]';
    borderAccent = 'hover:border-[#168C82]/50';
  } else if (variant === 'amber') {
    iconBg = 'bg-[#FEF8EC] text-[#F2B544]';
    borderAccent = 'hover:border-[#F2B544]/50';
  } else if (variant === 'danger') {
    iconBg = 'bg-[#FDECEE] text-[#C83E4D]';
    borderAccent = 'hover:border-[#C83E4D]/50';
    valueColor = 'text-[#C83E4D]';
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm transition-all duration-200 flex flex-col justify-between ${borderAccent} ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs sm:text-sm font-medium text-[#64748B] line-clamp-1">{title}</span>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${valueColor}`}>
            {value}
          </span>
          {badgeText && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B]">
              {badgeText}
            </span>
          )}
        </div>
        {sublabel && (
          <p className="text-xs text-[#64748B] mt-1 line-clamp-1">{sublabel}</p>
        )}
      </div>
    </div>
  );
};

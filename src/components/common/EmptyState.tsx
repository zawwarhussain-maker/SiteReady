import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-white">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#172B3A]">{title}</h3>
      {description && <p className="text-xs text-[#64748B] mt-1 max-w-sm">{description}</p>}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[#16324F] text-white hover:bg-[#0F2236] transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

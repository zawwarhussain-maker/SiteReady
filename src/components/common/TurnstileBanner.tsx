import React from 'react';
import { useI18n } from '../../lib/i18nContext';
import { ShieldAlert, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface TurnstileBannerProps {
  barredCount: number;
  clearedCount: number;
  onViewBarred?: () => void;
}

export const TurnstileBanner: React.FC<TurnstileBannerProps> = ({
  barredCount,
  clearedCount,
  onViewBarred
}) => {
  const { isRtl } = useI18n();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  if (barredCount === 0) {
    return (
      <div className="bg-[#E6F5F3] border border-[#168C82]/30 rounded-xl p-3 sm:p-4 mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#168C82] text-white flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#168C82]">
              {isRtl ? 'بوابة الدخول الإلكترونية: آمنة ومصرح بها 100%' : 'Turnstile Gate Interlock: 100% Cleared'}
            </h4>
            <p className="text-xs text-slate-600">
              {isRtl
                ? `جميع العاملين النشطين (${clearedCount} عامل) يمتلكون شهادات إقامة وسلامة سارية المفعول.`
                : `All ${clearedCount} active workforce members have valid Iqamas and mandatory safety certifications.`}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-white/80 text-[#168C82] rounded-full border border-[#168C82]/20 hidden sm:inline-block">
          {isRtl ? 'متوافق مع معايير أرامكو ونيوم' : 'Compliant with Aramco & NEOM Standards'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#FDECEE] border border-[#C83E4D]/40 rounded-xl p-3 sm:p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-pulse-subtle">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#C83E4D] text-white flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#C83E4D]">
              {isRtl
                ? `تنبيه حظر الدخول: تم حظر ${barredCount} عامل عند البوابات الإلكترونية`
                : `Site Access Lockout: ${barredCount} Worker${barredCount > 1 ? 's' : ''} Barred at Turnstile`}
            </h4>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#C83E4D] text-white uppercase tracking-wider">
              {isRtl ? 'حظر أمني' : 'CRITICAL'}
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-0.5">
            {isRtl
              ? 'تم تعطيل شارات الدخول تلقائياً بسبب انتهاء صلاحية شهادات السلامة الإلزامية أو بطاقات أرامكو/الإقامة.'
              : 'Turnstile RFID badges automatically suspended due to expired safety credentials or unverified permits.'}
          </p>
        </div>
      </div>

      {onViewBarred && (
        <button
          type="button"
          onClick={onViewBarred}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C83E4D] text-white text-xs font-semibold hover:bg-[#a82e3b] transition-colors flex-shrink-0"
        >
          <span>{isRtl ? 'مراجعة العمال المحظورين' : 'Review Barred Workers'}</span>
          <ArrowIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { Building2, MapPin, Globe, ArrowRight, ArrowLeft, Check, ShieldCheck } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { onboardCompany, company } = useAuth();
  const { t, isRtl, setLocale } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(company?.name || 'Al-Fanar Contracting KSA');
  const [nameAr, setNameAr] = useState(company?.name_ar || 'شركة الفنار للمقاولات');
  const [crNumber, setCrNumber] = useState(company?.cr_number || '1010294821');
  const [vatNumber, setVatNumber] = useState('31029482100003');
  const [defaultLanguage, setDefaultLanguage] = useState<'en' | 'ar'>('en');
  const [initialSiteName, setInitialSiteName] = useState('NEOM Spine Sector 4');
  const [isLoading, setIsLoading] = useState(false);

  const handleFinishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onboardCompany({
        name,
        name_ar: nameAr,
        cr_number: crNumber,
        default_language: defaultLanguage,
        initialSiteName
      });
      setLocale(defaultLanguage);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="w-12 h-12 rounded-xl bg-[#168C82] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#172B3A]">{t('onboardingTitle')}</h2>
        <p className="text-sm text-[#64748B] mt-1">{t('onboardingSubtitle')}</p>

        {/* Multi-step pill indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              step === 1 ? 'bg-[#16324F] text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            <span>1</span>
            <span>{isRtl ? 'بيانات المنشأة' : 'Company Details'}</span>
          </div>
          <div className="w-6 h-0.5 bg-slate-300"></div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              step === 2 ? 'bg-[#16324F] text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            <span>2</span>
            <span>{isRtl ? 'موقع المشروع الأولي' : 'Initial Site'}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-[#E2E8F0]">
          {step === 1 ? (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#172B3A] border-b border-slate-100 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#168C82]" />
                <span>{isRtl ? 'بيانات السجل التجاري واللغة' : 'Commercial Registration & Language'}</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  {t('companyName')} (English) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  {isRtl ? 'اسم المنشأة بالعربية' : 'Company Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                  placeholder="شركة الفنار للمقاولات"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                    {t('crNumber')} (10 digits) *
                  </label>
                  <input
                    type="text"
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                    placeholder="1010XXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                    {isRtl ? 'الرقم الضريبي (VAT)' : 'VAT Identification Number'}
                  </label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                    placeholder="3XXXXXXXXXXXX03"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#168C82]" />
                  <span>{t('defaultLanguage')}</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setDefaultLanguage('en')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      defaultLanguage === 'en'
                        ? 'border-[#168C82] bg-[#E6F5F3] text-[#168C82]'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    English (LTR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultLanguage('ar')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      defaultLanguage === 'ar'
                        ? 'border-[#168C82] bg-[#E6F5F3] text-[#168C82]'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#16324F] text-white text-xs sm:text-sm font-bold hover:bg-[#0F2236] transition-colors"
                >
                  <span>{isRtl ? 'التالي: إنشاء الموقع' : 'Next: Initial Site'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFinishOnboarding} className="space-y-4">
              <h3 className="text-base font-bold text-[#172B3A] border-b border-slate-100 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#168C82]" />
                <span>{isRtl ? 'إنشاء موقع العمل الأول' : 'Setup First Project / Site'}</span>
              </h3>

              <p className="text-xs text-[#64748B]">
                {isRtl
                  ? 'يتم ربط عمال المقاول وفحوصات السلامة بالمواقع المخصصة (مثل مواقع نيوم، البحر الأحمر، أرامكو).'
                  : 'Workforce records, gate access, and safety inspections are assigned to specific client project sites.'}
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  {isRtl ? 'اسم المشروع أو الموقع *' : 'Initial Project Site Name *'}
                </label>
                <input
                  type="text"
                  value={initialSiteName}
                  onChange={(e) => setInitialSiteName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                  placeholder="e.g. NEOM Spine Sector 4 / Red Sea Shura"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-800">
                  <p className="font-bold">
                    {isRtl ? 'فترة تجريبية سارية: باقة المؤسسات' : 'Active 14-Day Enterprise Trial'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-emerald-700">
                    {isRtl
                      ? 'تشمل حتى 200 عامل، 10 مواقع مشاريع، وفحوصات سلامة وتقارير غير محدودة.'
                      : 'Includes up to 200 workers, 10 sites, and unlimited safety audit checklists.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#168C82] text-white text-xs sm:text-sm font-bold hover:bg-[#116e66] transition-colors shadow-md disabled:opacity-70"
                >
                  <span>{isLoading ? t('loading') : isRtl ? 'بدء الاستخدام والدخول للمنصة' : 'Complete Setup & Open Portal'}</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

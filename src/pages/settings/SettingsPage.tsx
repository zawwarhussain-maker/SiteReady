import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { db } from '../../lib/supabase';
import { Company, Site, CertificateType, Subscription } from '../../types';
import {
  Settings,
  Building2,
  MapPin,
  Award,
  CreditCard,
  Globe,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Link2,
  ShieldCheck,
  Save
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const SettingsPage: React.FC = () => {
  const { company, sites, role, can } = useAuth();
  const { t, locale, setLocale, isRtl, formatDate } = useI18n();

  const [activeTab, setActiveTab] = useState<'company' | 'sites' | 'cert_types' | 'subscription'>('company');

  // Company Form
  const [name, setName] = useState(company?.name || '');
  const [nameAr, setNameAr] = useState(company?.name_ar || '');
  const [crNumber, setCrNumber] = useState(company?.cr_number || '');
  const [vatNumber, setVatNumber] = useState(company?.vat_number || '');
  const [timezone, setTimezone] = useState(company?.timezone || 'Asia/Riyadh');
  const [companySaved, setCompanySaved] = useState(false);

  // Sites State
  const [siteList, setSiteList] = useState<Site[]>([]);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteNameAr, setNewSiteNameAr] = useState('');
  const [newSiteClient, setNewSiteClient] = useState('');
  const [newSiteCity, setNewSiteCity] = useState('');

  // Certificate Types State
  const [certTypes, setCertTypes] = useState<CertificateType[]>([]);
  const [isCertTypeModalOpen, setIsCertTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeNameAr, setNewTypeNameAr] = useState('');
  const [newTypeAuthority, setNewTypeAuthority] = useState('');
  const [newTypeValidity, setNewTypeValidity] = useState(12);
  const [newTypeMandatory, setNewTypeMandatory] = useState(true);

  // Subscription State
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const loadData = async () => {
    try {
      const [cmp, sList, cTypes, sub] = await Promise.all([
        db.getCompany(),
        db.getSites(false),
        db.getCertificateTypes(),
        db.getSubscription()
      ]);
      setName(cmp.name);
      setNameAr(cmp.name_ar || '');
      setCrNumber(cmp.cr_number || '');
      setVatNumber(cmp.vat_number || '');
      setTimezone(cmp.timezone || 'Asia/Riyadh');
      setSiteList(sList);
      setCertTypes(cTypes);
      setSubscription(sub);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.updateCompany({
      name,
      name_ar: nameAr,
      cr_number: crNumber,
      vat_number: vatNumber,
      timezone
    });
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 3000);
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName || !company) return;
    await db.createSite({
      company_id: company.id,
      name: newSiteName,
      name_ar: newSiteNameAr || undefined,
      client_name: newSiteClient || undefined,
      location_city: newSiteCity || undefined,
      is_active: true
    });
    setIsSiteModalOpen(false);
    setNewSiteName('');
    setNewSiteNameAr('');
    setNewSiteClient('');
    setNewSiteCity('');
  };

  const handleCreateCertType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName || !company) return;
    await db.createCertificateType({
      company_id: company.id,
      name: newTypeName,
      name_ar: newTypeNameAr || undefined,
      issuing_authority: newTypeAuthority || undefined,
      requires_expiry: true,
      validity_months: Number(newTypeValidity),
      reminder_days_before: 30,
      is_mandatory: newTypeMandatory
    });
    setIsCertTypeModalOpen(false);
    setNewTypeName('');
    setNewTypeNameAr('');
    setNewTypeAuthority('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B3A] tracking-tight">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          {isRtl
            ? 'إعدادات المنشأة، مواقع المشاريع، أنواع الشهادات، والاشتراك'
            : 'Company profile, project sites, credential master types, and subscription tier'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'company'
              ? 'bg-[#16324F] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isRtl ? 'ملف المنشأة' : 'Company Profile'}</span>
        </button>
        <button
          onClick={() => setActiveTab('sites')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sites'
              ? 'bg-[#16324F] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{isRtl ? 'مواقع المشاريع' : 'Project Sites'}</span>
        </button>
        <button
          onClick={() => setActiveTab('cert_types')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'cert_types'
              ? 'bg-[#16324F] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isRtl ? 'أنواع الشهادات المعتمدة' : 'Credential Types'}</span>
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'subscription'
              ? 'bg-[#16324F] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t('subscriptionTier')}</span>
        </button>
      </div>

      {/* TAB 1: Company Profile */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6 max-w-3xl">
          <form onSubmit={handleSaveCompany} className="space-y-4">
            {companySaved && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{t('successSaved')}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  {t('companyName')} (English) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!can('manage_company')}
                  required
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  {isRtl ? 'اسم المنشأة (بالعربية)' : 'Company Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  disabled={!can('manage_company')}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  {t('crNumber')} *
                </label>
                <input
                  type="text"
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                  disabled={!can('manage_company')}
                  className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  {isRtl ? 'الرقم الضريبي (VAT)' : 'VAT Registration Number'}
                </label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  disabled={!can('manage_company')}
                  className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#168C82]" />
                  <span>{t('timezone')}</span>
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={!can('manage_company')}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white disabled:bg-slate-50"
                >
                  <option value="Asia/Riyadh">Asia/Riyadh (GMT+3 - Saudi Arabia)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GMT+4 - UAE)</option>
                  <option value="Asia/Kuwait">Asia/Kuwait (GMT+3 - Kuwait)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#168C82]" />
                  <span>{t('defaultLanguage')}</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLocale('en')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      locale === 'en'
                        ? 'border-[#168C82] bg-[#E6F5F3] text-[#168C82]'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    English (LTR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale('ar')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      locale === 'ar'
                        ? 'border-[#168C82] bg-[#E6F5F3] text-[#168C82]'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                </div>
              </div>
            </div>

            {can('manage_company') && (
              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#16324F] hover:bg-[#0F2236] rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 2: Project Sites */}
      {activeTab === 'sites' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#172B3A]">
              {isRtl ? 'المواقع الإنشائية والمشاريع التابعة' : 'Authorized Construction Project Sites'}
            </h3>
            {can('manage_sites') && (
              <button
                onClick={() => setIsSiteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#168C82] text-white text-xs font-bold hover:bg-[#116e66] transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إضافة موقع مشروع' : 'Add Project Site'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {siteList.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {site.code_reference || 'SEC-01'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {t('statusActive')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#172B3A]">
                    {isRtl && site.name_ar ? site.name_ar : site.name}
                  </h4>
                  <p className="text-xs text-[#168C82] font-semibold mt-0.5">
                    {site.client_name || 'Client Project'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{site.location_city || 'Saudi Arabia'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Site Modal */}
          <Modal
            isOpen={isSiteModalOpen}
            onClose={() => setIsSiteModalOpen(false)}
            title={isRtl ? 'إضافة موقع مشروع جديد' : 'Add New Project Site'}
            maxWidth="md"
          >
            <form onSubmit={handleCreateSite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Site Name (English) *
                </label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  required
                  placeholder="e.g. Red Sea Project - Shura Island"
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Site Name (Arabic)
                </label>
                <input
                  type="text"
                  value={newSiteNameAr}
                  onChange={(e) => setNewSiteNameAr(e.target.value)}
                  placeholder="مشروع البحر الأحمر - جزيرة شُورى"
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Client / Authority
                </label>
                <input
                  type="text"
                  value={newSiteClient}
                  onChange={(e) => setNewSiteClient(e.target.value)}
                  placeholder="e.g. Red Sea Global / Aramco"
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={newSiteCity}
                  onChange={(e) => setNewSiteCity(e.target.value)}
                  placeholder="e.g. Umluj / Tabuk"
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSiteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#168C82] rounded-lg hover:bg-[#116e66]"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* TAB 3: Certificate Master Types */}
      {activeTab === 'cert_types' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#172B3A]">
              {isRtl ? 'الشهادات والتراخيص المهنية المعتمدة' : 'Authorized Competency Credentials Catalog'}
            </h3>
            {can('manage_certificates') && (
              <button
                onClick={() => setIsCertTypeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#168C82] text-white text-xs font-bold hover:bg-[#116e66] transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إضافة نوع شهادة' : 'Add Credential Type'}</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase">
                  <th className="py-3 px-4">{t('certificateType')}</th>
                  <th className="py-3 px-4">{isRtl ? 'جهة الإصدار المعتمدة' : 'Issuing Authority'}</th>
                  <th className="py-3 px-4">{isRtl ? 'مدة الصلاحية' : 'Validity'}</th>
                  <th className="py-3 px-4">{isRtl ? 'إلزامي لدخول البوابة' : 'Mandatory Gate Interlock'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {certTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-[#172B3A]">
                      {isRtl && type.name_ar ? type.name_ar : type.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{type.issuing_authority || 'Approved Body'}</td>
                    <td className="py-3 px-4 font-mono">{type.validity_months} months</td>
                    <td className="py-3 px-4">
                      {type.is_mandatory ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                          {isRtl ? 'إلزامي (حظر فوري عند الانتهاء)' : 'Mandatory Interlock'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {isRtl ? 'اختياري / تدريب إضافي' : 'Standard'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Cert Type Modal */}
          <Modal
            isOpen={isCertTypeModalOpen}
            onClose={() => setIsCertTypeModalOpen(false)}
            title={isRtl ? 'إضافة نوع شهادة جديد' : 'Define New Credential Standard'}
            maxWidth="md"
          >
            <form onSubmit={handleCreateCertType} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  required
                  placeholder="e.g. Scaffolding Inspector Level 2"
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  value={newTypeNameAr}
                  onChange={(e) => setNewTypeNameAr(e.target.value)}
                  placeholder="مفتش سقالات معتمد - المستوى 2"
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Issuing Authority
                </label>
                <input
                  type="text"
                  value={newTypeAuthority}
                  onChange={(e) => setNewTypeAuthority(e.target.value)}
                  placeholder="e.g. Saudi Aramco / TÜV / OSHA"
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={newTypeMandatory}
                  onChange={(e) => setNewTypeMandatory(e.target.checked)}
                  className="rounded text-[#168C82] focus:ring-[#168C82]"
                />
                <label htmlFor="mandatory" className="text-xs font-bold text-[#172B3A] cursor-pointer">
                  {isRtl ? 'إلزامي: يحظر دخول العامل فور انتهاء هذه الشهادة' : 'Mandatory: Block turnstile gate upon expiry'}
                </label>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCertTypeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#168C82] rounded-lg hover:bg-[#116e66]"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* TAB 4: Subscription & GCC Integration Controls */}
      {activeTab === 'subscription' && (
        <div className="space-y-6 max-w-3xl">
          {/* Subscription Tier Details */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                  {subscription?.tier.toUpperCase()} TIER
                </span>
                <h3 className="text-lg font-extrabold text-[#172B3A] mt-1">
                  {isRtl ? 'باقة المنشآت والمقاولين الكبرى' : 'Enterprise Contractor Plan'}
                </h3>
              </div>

              <span className="text-xs font-semibold text-slate-500 font-mono">
                {isRtl ? 'صلاحية الفترة التجريبية حتى: ' : 'Trial Ends: '}
                {formatDate(subscription?.trial_ends_at)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#E2E8F0] text-xs">
              <div>
                <span className="text-slate-400 block">{t('maxWorkers')}</span>
                <span className="text-xl font-extrabold text-[#172B3A]">
                  {subscription?.max_workers} {isRtl ? 'عامل' : 'workers'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('maxSites')}</span>
                <span className="text-xl font-extrabold text-[#172B3A]">
                  {subscription?.max_sites} {isRtl ? 'مواقع' : 'sites'}
                </span>
              </div>
            </div>

            {/* Honest Billing Provider Notice as required by prompt section 6 */}
            <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  {isRtl ? 'إشعار بوابة الدفع الإلكتروني (Saudi Payment Gateway)' : 'Billing Gateway Notice'}
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                {isRtl
                  ? 'بوابة الدفع بواسطة (مدى / سداد / البطاقات الائتمانية) في وضع الإعداد التجريبي للمطورين. لا يتم خصم أي مبالغ حقيقية حتى اكتمال الربط التجاري لبنك البلاد أو مصرف الراجحي.'
                  : 'Payment gateway integration (Mada / SADAD / Credit Card) is in sandbox staging. No real payments are processed until live merchant gateway credentials are authorized.'}
              </p>
            </div>
          </div>

          {/* Saudi Govt Platforms Integration Indicators */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
            <h4 className="text-sm font-bold text-[#172B3A] mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#168C82]" />
              <span>{isRtl ? 'حالة الربط مع المنصات الحكومية السعودية' : 'Saudi Government Integrations'}</span>
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-[#172B3A]">
                    {isRtl ? 'منصة قوى (Qiwa Platform API)' : 'Qiwa Platform API (Ministry of HRSD)'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isRtl ? 'التحقق الآلي من عقود العمل والتوطين ونسب نطاقات' : 'Automated workforce contract & Saudization verification'}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isRtl ? 'محاكاة تجريبية (Staging)' : 'Sandbox Simulation'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-[#172B3A]">
                    {isRtl ? 'منصة مقيم (Muqeem Pass API)' : 'Muqeem Portal Gateway (Jawazat)'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isRtl ? 'مزامنة سريان الإقامات وتأشيرات الخروج والعودة' : 'Real-time resident ID & work permit validity sync'}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isRtl ? 'محاكاة تجريبية (Staging)' : 'Sandbox Simulation'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

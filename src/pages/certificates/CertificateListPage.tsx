import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { db } from '../../lib/supabase';
import {
  EmployeeCertificate,
  CertificateType,
  Employee,
  CertificateRenewalRecord
} from '../../types';
import {
  Award,
  Search,
  Filter,
  Plus,
  Share2,
  Trash2,
  Edit,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileText,
  Upload,
  RefreshCw,
  History,
  Download,
  ExternalLink,
  ShieldCheck,
  X,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Toast, ToastMessage } from '../../components/common/Toast';
import { formatExpiryWindow } from '../../lib/certificateUtils';

export const CertificateListPage: React.FC = () => {
  const { user, selectedSiteId, can } = useAuth();
  const { t, isRtl, formatDate } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  // Core Data State
  const [certificates, setCertificates] = useState<EmployeeCertificate[]>([]);
  const [certTypes, setCertTypes] = useState<CertificateType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Add / Edit Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<EmployeeCertificate | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add / Edit Form Fields
  const [employeeId, setEmployeeId] = useState('');
  const [certTypeId, setCertTypeId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Renew Modal State
  const [selectedRenewalCert, setSelectedRenewalCert] = useState<EmployeeCertificate | null>(null);
  const [renewExpiryDate, setRenewExpiryDate] = useState('');
  const [renewNotes, setRenewNotes] = useState('');
  const [renewFile, setRenewFile] = useState<File | null>(null);
  const [renewError, setRenewError] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);

  // Renewal History Timeline Modal State
  const [selectedHistoryCert, setSelectedHistoryCert] = useState<EmployeeCertificate | null>(null);

  // Document Signed URL Viewer Modal State
  const [selectedCertDoc, setSelectedCertDoc] = useState<EmployeeCertificate | null>(null);
  const [isGeneratingDocUrl, setIsGeneratingDocUrl] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [certs, types, emps] = await Promise.all([
        db.getCertificates(selectedSiteId),
        db.getCertificateTypes(),
        db.getEmployees(selectedSiteId)
      ]);
      setCertificates(certs);
      setCertTypes(types);
      setEmployees(emps);
    } catch (err: unknown) {
      console.error('Failed to load certificates:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err instanceof Error ? err.message : t('errorGeneric')
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, [selectedSiteId]);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') || 'all');
    }
    if (searchParams.get('action') === 'new' && can('manage_certificates')) {
      handleOpenCreateModal();
    }
  }, [searchParams, employees, certTypes]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTypeFilter, activeTab]);

  const handleOpenCreateModal = () => {
    setEditingCert(null);
    if (employees.length > 0) setEmployeeId(employees[0].id);
    if (certTypes.length > 0) setCertTypeId(certTypes[0].id);
    setLicenseNumber(`LIC-${Math.floor(10000 + Math.random() * 90000)}`);
    setIssueDate(new Date().toISOString().split('T')[0]);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setExpiryDate(nextYear.toISOString().split('T')[0]);
    setNotes('');
    setUploadedFile(null);
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (cert: EmployeeCertificate) => {
    setEditingCert(cert);
    setEmployeeId(cert.employee_id);
    setCertTypeId(cert.certificate_type_id);
    setLicenseNumber(cert.license_number);
    setIssueDate(cert.issue_date);
    setExpiryDate(cert.expiry_date || '');
    setNotes(cert.notes || '');
    setUploadedFile(null);
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!employeeId || !certTypeId || !licenseNumber || !issueDate) {
      setFormError(t('requiredField'));
      return;
    }

    setIsSubmitting(true);
    try {
      let attachmentPath: string | undefined = editingCert?.attachment_path;
      let attachmentFilename: string | undefined = editingCert?.attachment_filename;

      if (uploadedFile) {
        const uploadRes = await db.uploadDocument(uploadedFile, 'certificates');
        attachmentPath = uploadRes.path;
        attachmentFilename = uploadedFile.name;
      }

      if (editingCert) {
        await db.updateCertificate(editingCert.id, {
          certificate_type_id: certTypeId,
          license_number: licenseNumber,
          issue_date: issueDate,
          expiry_date: expiryDate || undefined,
          notes,
          attachment_path: attachmentPath,
          attachment_filename: attachmentFilename
        });
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: t('successCertRenewed')
        });
      } else {
        const company = await db.getCompany();
        await db.createCertificate({
          company_id: company.id,
          employee_id: employeeId,
          certificate_type_id: certTypeId,
          license_number: licenseNumber,
          issue_date: issueDate,
          expiry_date: expiryDate || undefined,
          notes,
          attachment_path: attachmentPath,
          attachment_filename: attachmentFilename
        });
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: t('successCertCreated')
        });
      }

      setIsAddEditModalOpen(false);
      searchParams.delete('action');
      setSearchParams(searchParams);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError(t('errorGeneric'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCertificate = async (id: string, licenseNo: string) => {
    if (!can('manage_certificates')) return;
    if (window.confirm(`${t('deleteCertificateConfirm')}\n\n${licenseNo}`)) {
      try {
        await db.deleteCertificate(id);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: t('successCertDeleted')
        });
        await loadData();
      } catch (err: unknown) {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          message: err instanceof Error ? err.message : t('errorGeneric')
        });
      }
    }
  };

  // Open Renew Modal
  const handleOpenRenewModal = (cert: EmployeeCertificate) => {
    setSelectedRenewalCert(cert);
    const baseDate = cert.expiry_date ? new Date(cert.expiry_date) : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + 1);
    setRenewExpiryDate(baseDate.toISOString().split('T')[0]);
    setRenewNotes('');
    setRenewFile(null);
    setRenewError('');
  };

  // Execute Renewal
  const handleExecuteRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRenewalCert || !renewExpiryDate) {
      setRenewError(t('requiredField'));
      return;
    }

    setIsRenewing(true);
    try {
      await db.renewCertificate(
        selectedRenewalCert.id,
        renewExpiryDate,
        renewNotes,
        user?.full_name || 'HSE Officer'
      );

      if (renewFile) {
        await db.attachCertificateDocument(selectedRenewalCert.id, renewFile);
      }

      setSelectedRenewalCert(null);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: t('successCertRenewed')
      });
      await loadData();
    } catch (err: unknown) {
      setRenewError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setIsRenewing(false);
    }
  };

  // WhatsApp Alert Generator
  const handleWhatsAppAlert = (cert: EmployeeCertificate) => {
    const workerName = isRtl && cert.employee?.full_name_ar ? cert.employee.full_name_ar : cert.employee?.full_name || 'Worker';
    const certName = isRtl && cert.certificate_type?.name_ar ? cert.certificate_type.name_ar : cert.certificate_type?.name || 'Certification';
    const expiry = formatDate(cert.expiry_date);
    const phone = cert.employee?.phone?.replace(/[^0-9]/g, '') || '966501928491';

    const text = isRtl
      ? `عزيزي ${workerName}، تنبيه نظام سايت ريدي: شهادتك المهنية (${certName}) ستنتهي بتاريخ ${expiry}. يرجى مراجعة إدارة السلامة لتجديد الاعتماد والترخيص لتفادي تعليق تصريح الدخول عبر البوابات.`
      : `Dear ${workerName}, SiteReady Alert: Your safety credential (${certName}) expires on ${expiry}. Please coordinate renewal immediately to avoid gate clearance suspension.`;

    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Secure Document Download Trigger
  const handleDownloadSignedDocument = async (cert: EmployeeCertificate) => {
    if (!cert.attachment_path) return;
    setIsGeneratingDocUrl(true);
    try {
      const signedUrl = await db.getDocumentSignedUrl(cert.attachment_path);
      if (signedUrl && signedUrl !== '#') {
        window.open(signedUrl, '_blank');
      } else {
        alert(
          isRtl
            ? 'تم إنشاء وتوثيق رابط التنزيل المشفر (صالح لمدة 15 دقيقة) من مجلد المنشأة السحابي الخاص.'
            : 'Generated verified 15-minute restricted download URL from private tenant storage.'
        );
      }
    } catch (err) {
      console.error('Failed to get signed URL:', err);
    } finally {
      setIsGeneratingDocUrl(false);
    }
  };

  // Filter Logic
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      // Search text match
      const searchLower = searchQuery.toLowerCase().trim();
      if (searchLower) {
        const empName = cert.employee?.full_name.toLowerCase() || '';
        const empNameAr = cert.employee?.full_name_ar?.toLowerCase() || '';
        const empNo = cert.employee?.employee_no.toLowerCase() || '';
        const typeName = cert.certificate_type?.name.toLowerCase() || '';
        const typeNameAr = cert.certificate_type?.name_ar?.toLowerCase() || '';
        const licNo = cert.license_number.toLowerCase();
        const authority = cert.certificate_type?.issuing_authority?.toLowerCase() || '';

        const matches =
          empName.includes(searchLower) ||
          empNameAr.includes(searchLower) ||
          empNo.includes(searchLower) ||
          typeName.includes(searchLower) ||
          typeNameAr.includes(searchLower) ||
          licNo.includes(searchLower) ||
          authority.includes(searchLower);

        if (!matches) return false;
      }

      // Type Filter
      if (selectedTypeFilter !== 'all' && cert.certificate_type_id !== selectedTypeFilter) {
        return false;
      }

      // Status Tab Filter
      if (activeTab === 'valid') {
        return cert.status === 'valid' || cert.status === 'no_expiry';
      } else if (activeTab === 'expiring_soon') {
        return cert.status === 'expiring_soon';
      } else if (activeTab === 'expired') {
        return cert.status === 'expired' || cert.status === 'missing';
      }

      return true;
    });
  }, [certificates, searchQuery, selectedTypeFilter, activeTab]);

  // Paginated Slicing
  const paginatedCertificates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCertificates.slice(start, start + pageSize);
  }, [filteredCertificates, currentPage, pageSize]);

  // Summary counts
  const countAll = certificates.length;
  const countExpiringSoon = certificates.filter((c) => c.status === 'expiring_soon').length;
  const countExpired = certificates.filter((c) => c.status === 'expired' || c.status === 'missing').length;
  const countValid = certificates.filter((c) => c.status === 'valid' || c.status === 'no_expiry').length;

  return (
    <div className="space-y-5">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B3A] tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-[#168C82]" />
            <span>{t('certificatesTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {isRtl
              ? 'متابعة تواريخ انتهاء وتجديد شهادات السلامة، رخص القيادة، واعتمادات أرامكو مع أرشفة سحابية مشفرة'
              : 'Track expiry dates, renewals, and professional competency certifications with encrypted storage'}
          </p>
        </div>

        {can('manage_certificates') && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#168C82] text-white text-xs font-bold hover:bg-[#116e66] transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addCertificate')}</span>
          </button>
        )}
      </div>

      {/* Tabs & Expiry Horizons Bar */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#16324F] text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t('all')} ({countAll})
        </button>

        <button
          onClick={() => setActiveTab('expiring_soon')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'expiring_soon'
              ? 'bg-[#FEF8EC] text-[#B45309] border border-[#F2B544] font-bold shadow-sm'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t('statusExpiringSoon')}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
            {countExpiringSoon}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'expired'
              ? 'bg-[#FDECEE] text-[#C83E4D] border border-[#C83E4D] font-bold shadow-sm'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{t('statusExpired')}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 text-[10px] font-bold">
            {countExpired}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('valid')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'valid'
              ? 'bg-[#E6F5F3] text-[#168C82] border border-[#168C82] font-bold shadow-sm'
              : 'text-teal-700 hover:bg-teal-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t('statusValid')}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-teal-200 text-teal-900 text-[10px] font-bold">
            {countValid}
          </span>
        </button>
      </div>

      {/* Search & Certificate Type Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isRtl
                ? 'البحث باسم العامل، نوع الشهادة، رقم الرخصة، أو جهة الإصدار...'
                : 'Search by worker name, certificate type, license no, or authority...'
            }
            className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-[#E2E8F0] bg-slate-50 text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#16324F]"
          >
            <option value="all">{isRtl ? 'جميع أنواع الشهادات والتراخيص' : 'All Certificate Types'}</option>
            {certTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {isRtl && type.name_ar ? type.name_ar : type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-8">
            <RefreshCw className="w-4 h-4 animate-spin text-[#168C82]" />
            <span>{t('loading')}</span>
          </div>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <EmptyState
          title={t('noRecords')}
          description={
            isRtl
              ? 'لم يتم العثور على شهادات تطابق البحث أو الفلاتر المحددة.'
              : 'No certificates found matching your criteria.'
          }
          icon={Award}
          actionText={can('manage_certificates') ? t('addCertificate') : undefined}
          onAction={can('manage_certificates') ? handleOpenCreateModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4">{t('employee')}</th>
                  <th className="py-3 px-4">{t('certificateType')}</th>
                  <th className="py-3 px-4">{t('licenseNumber')}</th>
                  <th className="py-3 px-4">{t('issueDate')}</th>
                  <th className="py-3 px-4">{t('expiryDate')}</th>
                  <th className="py-3 px-4">{t('status')}</th>
                  <th className="py-3 px-4">{t('attachment')}</th>
                  <th className="py-3 px-4 text-end">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {paginatedCertificates.map((cert) => {
                  const expiryInfo = formatExpiryWindow(cert.expiry_date, isRtl ? 'ar' : 'en');
                  const emp = cert.employee;
                  const hasRenewals = cert.renewal_history && cert.renewal_history.length > 0;

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Employee Name & Link */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/employees/${cert.employee_id}`}
                          className="group block"
                        >
                          <p className="font-bold text-[#172B3A] group-hover:text-[#168C82] transition-colors">
                            {isRtl && emp?.full_name_ar ? emp.full_name_ar : emp?.full_name || 'Worker'}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {emp?.employee_no}
                          </p>
                        </Link>
                      </td>

                      {/* Certificate Type */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#16324F]">
                          {isRtl && cert.certificate_type?.name_ar
                            ? cert.certificate_type.name_ar
                            : cert.certificate_type?.name}
                        </p>
                        {cert.certificate_type?.issuing_authority && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {cert.certificate_type.issuing_authority}
                          </p>
                        )}
                      </td>

                      {/* License Number */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {cert.license_number}
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(cert.issue_date)}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {formatDate(cert.expiry_date)}
                          </p>
                          <p className="text-[11px] text-slate-400">{expiryInfo.text}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={cert.status} size="sm" />
                      </td>

                      {/* Document Attachment Button */}
                      <td className="py-3.5 px-4">
                        {cert.attachment_filename || cert.attachment_path ? (
                          <button
                            onClick={() => setSelectedCertDoc(cert)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                            title={t('viewSignedDoc')}
                          >
                            <FileText className="w-3.5 h-3.5 text-[#168C82]" />
                            <span className="truncate max-w-[100px]">
                              {cert.attachment_filename || 'document.pdf'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {isRtl ? 'لا يوجد ملف' : 'No file'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Fast Dispatch */}
                          <button
                            onClick={() => handleWhatsAppAlert(cert)}
                            title={isRtl ? 'إرسال تذكير عبر الواتساب' : 'Send WhatsApp Reminder'}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Renewal History Timeline */}
                          <button
                            onClick={() => setSelectedHistoryCert(cert)}
                            className={`p-1.5 rounded-md transition-colors ${
                              hasRenewals
                                ? 'text-blue-600 hover:bg-blue-50'
                                : 'text-slate-400 hover:text-[#16324F] hover:bg-slate-100'
                            }`}
                            title={t('renewalHistoryTitle')}
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Renew Certificate Button (Owner / Manager) */}
                          {can('manage_certificates') && (
                            <button
                              onClick={() => handleOpenRenewModal(cert)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#168C82]/10 hover:bg-[#168C82]/20 text-[#168C82] font-bold text-xs transition-colors"
                              title={t('renewCertificate')}
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span className="hidden sm:inline">{t('renewCertificate')}</span>
                            </button>
                          )}

                          {/* Edit Certificate (Owner / Manager) */}
                          {can('manage_certificates') && (
                            <button
                              onClick={() => handleOpenEditModal(cert)}
                              className="p-1.5 text-slate-400 hover:text-[#16324F] hover:bg-slate-100 rounded-md transition-colors"
                              title={t('edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Certificate (Owner / Manager) */}
                          {can('manage_certificates') && (
                            <button
                              onClick={() => handleDeleteCertificate(cert.id, cert.license_number)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title={t('delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCertificates.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Add / Edit Certificate Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingCert ? t('edit') + ' ' + t('certificateType') : t('addCertificate')}
        subtitle={
          isRtl
            ? 'تسجيل بيانات الرخصة وتاريخ الانتهاء المعتمد ورفع الوثيقة المشفرة'
            : 'Record certification license details, expiry schedule, and encrypted file upload'
        }
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCertificate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {!editingCert && (
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('employee')} *
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {isRtl && e.full_name_ar ? e.full_name_ar : e.full_name} ({e.employee_no}) -{' '}
                    {e.job_title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('certificateType')} *
            </label>
            <select
              value={certTypeId}
              onChange={(e) => setCertTypeId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white"
            >
              {certTypes.map((tItem) => (
                <option key={tItem.id} value={tItem.id}>
                  {isRtl && tItem.name_ar ? tItem.name_ar : tItem.name} (
                  {tItem.issuing_authority})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('licenseNumber')} *
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
              placeholder="e.g. ARAMCO-RIG-2024-984"
              className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('issueDate')} *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('expiryDate')}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>
          </div>

          {/* Document Upload Input */}
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('attachment')}
            </label>
            <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#168C82] rounded-xl p-3 text-center transition-colors">
              <input
                type="file"
                id="cert-file-upload"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="cert-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-600 font-medium">
                  {uploadedFile
                    ? `${t('fileSelected')}: ${uploadedFile.name}`
                    : editingCert?.attachment_filename
                    ? `${t('fileSelected')}: ${editingCert.attachment_filename}`
                    : t('dropFilesOrBrowse')}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isRtl ? 'المستندات مشفرة وتخضع لعزل المستأجر الصارم' : 'Documents are encrypted in company vault'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={isRtl ? 'ملاحظات جهة التدريب أو متطلبات الفحص...' : 'Training provider notes, audit requirements...'}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#168C82] hover:bg-[#116e66] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingCert ? t('update') : t('save')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Renew Certificate Modal */}
      <Modal
        isOpen={!!selectedRenewalCert}
        onClose={() => setSelectedRenewalCert(null)}
        title={t('renewCertificate')}
        subtitle={
          selectedRenewalCert?.certificate_type
            ? isRtl && selectedRenewalCert.certificate_type.name_ar
              ? selectedRenewalCert.certificate_type.name_ar
              : selectedRenewalCert.certificate_type.name
            : ''
        }
        maxWidth="md"
      >
        <form onSubmit={handleExecuteRenewal} className="space-y-4">
          {renewError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{renewError}</span>
            </div>
          )}

          {/* Current Details Summary Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('employee')}:</span>
              <span className="font-semibold text-slate-800">
                {isRtl && selectedRenewalCert?.employee?.full_name_ar
                  ? selectedRenewalCert.employee.full_name_ar
                  : selectedRenewalCert?.employee?.full_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('licenseNumber')}:</span>
              <span className="font-mono font-medium text-slate-700">
                {selectedRenewalCert?.license_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('previousExpiryDate')}:</span>
              <span className="font-semibold text-rose-700">
                {formatDate(selectedRenewalCert?.expiry_date)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('newExpiryDate')} *
            </label>
            <input
              type="date"
              value={renewExpiryDate}
              onChange={(e) => setRenewExpiryDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          {/* Document Upload for Renewal */}
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('attachment')} (PDF / Image)
            </label>
            <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#168C82] rounded-xl p-3 text-center transition-colors">
              <input
                type="file"
                id="renew-file-input"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setRenewFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="renew-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-600 font-medium">
                  {renewFile ? renewFile.name : t('dropFilesOrBrowse')}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('notes')}
            </label>
            <textarea
              value={renewNotes}
              onChange={(e) => setRenewNotes(e.target.value)}
              rows={2}
              placeholder={isRtl ? 'مثال: اجتياز دورة إعادة التأهيل المعتمدة لدى أرامكو' : 'e.g., Passed Aramco annual refresher certification'}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedRenewalCert(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isRenewing}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#168C82] hover:bg-[#116e66] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isRenewing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('renewCertificate')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Renewal History Timeline Modal */}
      <Modal
        isOpen={!!selectedHistoryCert}
        onClose={() => setSelectedHistoryCert(null)}
        title={t('renewalHistoryTitle')}
        subtitle={`${selectedHistoryCert?.certificate_type?.name || ''} - ${selectedHistoryCert?.license_number || ''}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {!selectedHistoryCert?.renewal_history || selectedHistoryCert.renewal_history.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                {t('noRenewalHistory')}
              </p>
            </div>
          ) : (
            <div className="relative pl-6 rtl:pl-0 rtl:pr-6 border-l-2 rtl:border-l-0 rtl:border-r-2 border-slate-200 space-y-6 my-2">
              {selectedHistoryCert.renewal_history.map((record, index) => (
                <div key={record.id || index} className="relative">
                  <div className="absolute -left-[31px] rtl:-left-auto rtl:-right-[31px] top-0 w-4 h-4 rounded-full bg-[#168C82] border-2 border-white shadow-sm flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#16324F]">
                        {formatDate(record.renewed_at)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {t('renewedBy')}: {record.renewed_by_name}
                      </span>
                    </div>

                    <div className="text-xs flex items-center gap-2 pt-1 border-t border-slate-200/60">
                      <span className="text-rose-600 line-through">
                        {formatDate(record.previous_expiry_date)}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-700 font-bold">
                        {formatDate(record.new_expiry_date)}
                      </span>
                    </div>

                    {record.notes && (
                      <p className="text-[11px] text-slate-600 italic pt-1">
                        &ldquo;{record.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedHistoryCert(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Secure Document Viewer Modal */}
      <Modal
        isOpen={!!selectedCertDoc}
        onClose={() => setSelectedCertDoc(null)}
        title={
          selectedCertDoc?.certificate_type
            ? isRtl && selectedCertDoc.certificate_type.name_ar
              ? selectedCertDoc.certificate_type.name_ar
              : selectedCertDoc.certificate_type.name
            : t('attachment')
        }
        subtitle={`${t('licenseNumber')}: ${selectedCertDoc?.license_number}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#16324F] text-white flex items-center justify-center mb-3 shadow-md">
              <Award className="w-9 h-9 text-[#168C82]" />
            </div>
            <h4 className="font-bold text-sm text-[#172B3A]">
              {selectedCertDoc?.certificate_type?.name}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {selectedCertDoc?.certificate_type?.issuing_authority || (isRtl ? 'أرامكو السعودية / الهيئة العامة للسلامة' : 'Saudi Aramco / General Safety Authority')}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <StatusBadge status={selectedCertDoc?.status || 'valid'} />
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <div className="flex justify-between">
              <strong className="text-slate-800">{t('employee')}:</strong>
              <span>
                {isRtl && selectedCertDoc?.employee?.full_name_ar
                  ? selectedCertDoc.employee.full_name_ar
                  : selectedCertDoc?.employee?.full_name}
              </span>
            </div>
            <div className="flex justify-between">
              <strong className="text-slate-800">{t('issueDate')}:</strong>
              <span>{formatDate(selectedCertDoc?.issue_date)}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-slate-800">{t('expiryDate')}:</strong>
              <span>{formatDate(selectedCertDoc?.expiry_date)}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-slate-800">{t('attachment')}:</strong>
              <span className="font-mono text-slate-700">
                {selectedCertDoc?.attachment_filename || 'document.pdf'}
              </span>
            </div>
            {selectedCertDoc?.notes && (
              <div className="pt-1.5 border-t border-slate-200">
                <strong className="text-slate-800">{t('notes')}:</strong>
                <p className="text-slate-600 mt-0.5">{selectedCertDoc.notes}</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-lg flex items-start gap-2 text-[11px] text-teal-800">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#168C82] mt-0.5" />
            <div>
              <p className="font-bold">{t('privateStorageNotice')}</p>
              <p className="text-teal-700/80">
                {isRtl
                  ? 'يتم تخزين الملفات في حاوية مشفرة معزولة لكل منشأة برمجياً وفق سياسات RLS.'
                  : 'Files are stored in private isolated storage bucket with folder RLS isolation.'}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setSelectedCertDoc(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => selectedCertDoc && handleDownloadSignedDocument(selectedCertDoc)}
              disabled={isGeneratingDocUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16324F] text-white text-xs font-bold hover:bg-[#0F2236] transition-colors disabled:opacity-50"
            >
              {isGeneratingDocUrl ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{t('downloadSignedUrl')}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

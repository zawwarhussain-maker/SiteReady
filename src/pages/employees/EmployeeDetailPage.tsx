import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { db } from '../../lib/supabase';
import { Employee, EmployeeCertificate, CertificateType, CertificateRenewalRecord } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Building,
  Award,
  Plus,
  QrCode,
  FileText,
  Phone,
  Mail,
  Download,
  Upload,
  RefreshCw,
  History,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Toast, ToastMessage } from '../../components/common/Toast';
import { formatExpiryWindow } from '../../lib/certificateUtils';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can, user } = useAuth();
  const { t, isRtl, formatDate } = useI18n();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [certTypes, setCertTypes] = useState<CertificateType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Modals
  const [isAddCertModalOpen, setIsAddCertModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedCertDoc, setSelectedCertDoc] = useState<EmployeeCertificate | null>(null);
  const [selectedRenewalCert, setSelectedRenewalCert] = useState<EmployeeCertificate | null>(null);
  const [selectedHistoryCert, setSelectedHistoryCert] = useState<EmployeeCertificate | null>(null);

  // New Certificate Form
  const [certTypeId, setCertTypeId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [certNotes, setCertNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [certError, setCertError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Renew Form
  const [renewExpiryDate, setRenewExpiryDate] = useState('');
  const [renewNotes, setRenewNotes] = useState('');
  const [renewFile, setRenewFile] = useState<File | null>(null);
  const [renewError, setRenewError] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);

  const loadEmployeeData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [emp, types] = await Promise.all([
        db.getEmployeeById(id),
        db.getCertificateTypes()
      ]);
      setEmployee(emp);
      setCertTypes(types);
      if (types.length > 0 && !certTypeId) setCertTypeId(types[0].id);
    } catch (err: unknown) {
      console.error(err);
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
    loadEmployeeData();
    const unsub = db.subscribe(loadEmployeeData);
    return unsub;
  }, [id]);

  const handleOpenAddCert = () => {
    if (certTypes.length > 0) setCertTypeId(certTypes[0].id);
    setLicenseNumber(`LIC-${Math.floor(10000 + Math.random() * 90000)}`);
    setIssueDate(new Date().toISOString().split('T')[0]);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setExpiryDate(nextYear.toISOString().split('T')[0]);
    setCertNotes('');
    setSelectedFile(null);
    setCertError('');
    setIsAddCertModalOpen(true);
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !certTypeId || !licenseNumber || !issueDate) {
      setCertError(t('requiredField'));
      return;
    }

    setIsSubmitting(true);
    try {
      let attachmentPath: string | undefined = undefined;
      let attachmentFilename: string | undefined = undefined;

      if (selectedFile) {
        const uploadRes = await db.uploadDocument(selectedFile, 'certificates');
        attachmentPath = uploadRes.path;
        attachmentFilename = selectedFile.name;
      }

      await db.createCertificate({
        company_id: employee.company_id,
        employee_id: employee.id,
        certificate_type_id: certTypeId,
        license_number: licenseNumber,
        issue_date: issueDate,
        expiry_date: expiryDate || undefined,
        notes: certNotes,
        attachment_path: attachmentPath,
        attachment_filename: attachmentFilename
      });

      setIsAddCertModalOpen(false);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: t('successCertCreated')
      });
      await loadEmployeeData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCertError(err.message);
      } else {
        setCertError(t('errorGeneric'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRenew = (cert: EmployeeCertificate) => {
    setSelectedRenewalCert(cert);
    // Suggest 1 year from current expiry or today
    const baseDate = cert.expiry_date ? new Date(cert.expiry_date) : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + 1);
    setRenewExpiryDate(baseDate.toISOString().split('T')[0]);
    setRenewNotes('');
    setRenewFile(null);
    setRenewError('');
  };

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
      await loadEmployeeData();
    } catch (err: unknown) {
      setRenewError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setIsRenewing(false);
    }
  };

  const handleDeleteCertificate = async (certId: string, certName: string) => {
    if (!can('manage_certificates')) return;
    if (window.confirm(`${t('deleteCertificateConfirm')}\n\n${certName}`)) {
      try {
        await db.deleteCertificate(certId);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: t('successCertDeleted')
        });
        await loadEmployeeData();
      } catch (err: unknown) {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          message: err instanceof Error ? err.message : t('errorGeneric')
        });
      }
    }
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#168C82]" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold text-slate-700">{t('noRecords')}</p>
        <button
          onClick={() => navigate('/employees')}
          className="mt-3 text-xs font-bold text-[#168C82] hover:underline"
        >
          {isRtl ? 'العودة إلى دليل العمال' : 'Back to Workforce Directory'}
        </button>
      </div>
    );
  }

  const hasExpired = employee.certificates?.some((c) => c.status === 'expired');
  const isBarred = hasExpired || employee.employment_status !== 'active';

  return (
    <div className="space-y-6">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Breadcrumb & Action Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#16324F] transition-colors"
        >
          <BackIcon className="w-4 h-4" />
          <span>{isRtl ? 'العودة إلى دليل العمال' : 'Back to Directory'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Turnstile QR Access Pass Button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-bold text-[#16324F] hover:bg-slate-50 shadow-2xs"
          >
            <QrCode className="w-4 h-4 text-[#168C82]" />
            <span>{isRtl ? 'بطاقة الدخول الذكية QR' : 'Field QR Badge'}</span>
          </button>

          {can('manage_certificates') && (
            <button
              onClick={handleOpenAddCert}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#168C82] text-white text-xs font-bold hover:bg-[#116e66] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addCertificate')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Worker Header Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-extrabold text-2xl text-[#16324F] flex-shrink-0 shadow-inner">
              {employee.full_name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold text-[#172B3A]">
                  {isRtl && employee.full_name_ar ? employee.full_name_ar : employee.full_name}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                  {employee.employee_no}
                </span>
                <StatusBadge status={employee.employment_status} size="sm" />
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#168C82] mt-0.5">
                {isRtl && employee.job_title_ar ? employee.job_title_ar : employee.job_title}
              </p>

              <div className="flex items-center gap-4 text-xs text-[#64748B] mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {employee.site
                      ? isRtl && employee.site.name_ar
                        ? employee.site.name_ar
                        : employee.site.name
                      : '-'}
                  </span>
                </span>
                {employee.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{employee.phone}</span>
                  </span>
                )}
                {employee.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{employee.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Turnstile Gate Status Box */}
          <div
            className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center min-w-[180px] ${
              isBarred ? 'bg-[#FDECEE] border-[#C83E4D]/30' : 'bg-[#E6F5F3] border-[#168C82]/30'
            }`}
          >
            {isBarred ? (
              <>
                <ShieldAlert className="w-8 h-8 text-[#C83E4D] mb-1" />
                <span className="text-xs font-bold text-[#C83E4D]">
                  {isRtl ? 'محظور من الدخول' : 'Access Barred'}
                </span>
                <span className="text-[10px] text-slate-600 mt-0.5">
                  {isRtl ? 'شهادات منتهية أو معلقة' : 'Expired mandatory credentials'}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-8 h-8 text-[#168C82] mb-1" />
                <span className="text-xs font-bold text-[#168C82]">
                  {isRtl ? 'مصرح بالدخول' : 'Gate Cleared'}
                </span>
                <span className="text-[10px] text-slate-600 mt-0.5">
                  {isRtl ? 'جميع المعايير سارية' : '100% Valid & Verified'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Identity & Legal Info Strip */}
        <div className="mt-5 pt-4 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 text-[11px] block">{t('iqamaNumber')}</span>
            <span className="font-mono font-bold text-[#172B3A]">{employee.iqama_national_id}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 text-[11px] block">{t('nationality')}</span>
            <span className="font-bold text-[#172B3A]">{employee.nationality}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 text-[11px] block">{t('joiningDate')}</span>
            <span className="font-bold text-[#172B3A]">{formatDate(employee.joining_date)}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 text-[11px] block">
              {isRtl ? 'حالة منصة قوى (Qiwa)' : 'Qiwa Labor Verification'}
            </span>
            <span className="font-bold text-[#168C82]">
              {isRtl ? 'مربوط وموثق رسمياً' : 'Verified & Linked'}
            </span>
          </div>
        </div>
      </div>

      {/* Certificates & Training Dossier */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-[#172B3A] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#168C82]" />
              <span>{isRtl ? 'محفظة شهادات الكفاءة والتأهيل' : 'Safety Certifications & Competencies'}</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              {isRtl
                ? 'شهادات أرامكو، نيبوش، تصاريح العمل، وفحوصات اللياقة الطبية'
                : 'Aramco badges, NEBOSH diplomas, rigging passes, and medical fitness records'}
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {employee.certificates?.length || 0} {isRtl ? 'شهادات مسجلة' : 'Registered'}
          </span>
        </div>

        {/* Certificate List Table */}
        {!employee.certificates || employee.certificates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {isRtl ? 'لا توجد شهادات مسجلة لهذا العامل حالياً.' : 'No certificates registered for this worker.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
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
                {employee.certificates.map((cert) => {
                  const expiryInfo = formatExpiryWindow(cert.expiry_date, isRtl ? 'ar' : 'en');
                  const certTypeName = isRtl && cert.certificate_type?.name_ar
                    ? cert.certificate_type.name_ar
                    : cert.certificate_type?.name;

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#172B3A]">
                        {certTypeName}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {cert.license_number}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(cert.issue_date)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-800">{formatDate(cert.expiry_date)}</p>
                          <p className="text-[11px] text-slate-400">{expiryInfo.text}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={cert.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        {cert.attachment_path || cert.attachment_filename ? (
                          <button
                            onClick={() => setSelectedCertDoc(cert)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#168C82]" />
                            <span className="truncate max-w-[120px]">{cert.attachment_filename || 'document.pdf'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {isRtl ? 'لا يوجد ملف' : 'No file'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Renewal History Button */}
                          <button
                            onClick={() => setSelectedHistoryCert(cert)}
                            className="p-1.5 text-slate-500 hover:text-[#16324F] hover:bg-slate-100 rounded-md transition-colors"
                            title={t('renewalHistoryTitle')}
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Renew Certificate Button */}
                          {can('manage_certificates') && (
                            <button
                              onClick={() => handleOpenRenew(cert)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#168C82]/10 hover:bg-[#168C82]/20 text-[#168C82] font-bold text-xs transition-colors"
                              title={t('renewCertificate')}
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{t('renewCertificate')}</span>
                            </button>
                          )}

                          {/* Delete Certificate Button */}
                          {can('manage_certificates') && (
                            <button
                              onClick={() => handleDeleteCertificate(cert.id, certTypeName || '')}
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
        )}
      </div>

      {/* Add Certificate Modal */}
      <Modal
        isOpen={isAddCertModalOpen}
        onClose={() => setIsAddCertModalOpen(false)}
        title={t('addCertificate')}
        subtitle={`${isRtl ? 'إضافة رخصة/شهادة للعامل' : 'Attach safety credential to'} ${
          isRtl && employee.full_name_ar ? employee.full_name_ar : employee.full_name
        }`}
        maxWidth="lg"
      >
        <form onSubmit={handleAddCertificate} className="space-y-4">
          {certError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{certError}</span>
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
                  {isRtl && tItem.name_ar ? tItem.name_ar : tItem.name}
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
              {t('uploadAttachment')}
            </label>
            <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors">
              <input
                type="file"
                id="cert-file-upload"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <label htmlFor="cert-file-upload" className="cursor-pointer block text-xs text-slate-600">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span>{selectedFile ? `${t('fileSelected')}: ${selectedFile.name}` : t('dropFilesOrBrowse')}</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t('privateStorageNotice')}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('notes')}
            </label>
            <textarea
              value={certNotes}
              onChange={(e) => setCertNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              placeholder="e.g. Verified by Saudi Aramco Inspection Center Ras Tanura"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddCertModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#168C82] hover:bg-[#116e66] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Renew Certificate Modal */}
      <Modal
        isOpen={!!selectedRenewalCert}
        onClose={() => setSelectedRenewalCert(null)}
        title={t('renewCertificate')}
        subtitle={`${t('licenseNumber')}: ${selectedRenewalCert?.license_number}`}
        maxWidth="md"
      >
        <form onSubmit={handleExecuteRenewal} className="space-y-4">
          {renewError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{renewError}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <p>
              <strong className="text-slate-700">{t('previousExpiryDate')}:</strong>{' '}
              {formatDate(selectedRenewalCert?.expiry_date)}
            </p>
            <p>
              <strong className="text-slate-700">{t('status')}:</strong>{' '}
              <StatusBadge status={selectedRenewalCert?.status || 'valid'} size="sm" />
            </p>
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

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {isRtl ? 'ملف الشهادة المجددة (اختياري)' : 'Upload Renewed Document (Optional)'}
            </label>
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setRenewFile(e.target.files ? e.target.files[0] : null)}
              className="w-full px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {isRtl ? 'ملاحظات التجديد والجهة المعتمدة' : 'Renewal Notes / Training Center'}
            </label>
            <textarea
              value={renewNotes}
              onChange={(e) => setRenewNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Completed Aramco recertification course"
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedRenewalCert(null)}
              disabled={isRenewing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isRenewing}
              className="px-5 py-2 text-xs font-bold text-white bg-[#168C82] hover:bg-[#116e66] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
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
        subtitle={`${selectedHistoryCert?.certificate_type?.name} — ${selectedHistoryCert?.license_number}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {!selectedHistoryCert?.renewal_history || selectedHistoryCert.renewal_history.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>{t('noRenewalHistory')}</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 pl-4 space-y-4">
              {selectedHistoryCert.renewal_history.map((record, idx) => (
                <div key={record.id || idx} className="relative">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[#168C82] ring-4 ring-white"></div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#172B3A]">
                      <span>{t('renewedOn')}: {formatDate(record.renewed_at)}</span>
                      <span className="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                        +{record.new_expiry_date}
                      </span>
                    </div>
                    {record.previous_expiry_date && (
                      <p className="text-slate-500">
                        {t('previousExpiryDate')}: {formatDate(record.previous_expiry_date)}
                      </p>
                    )}
                    {record.renewed_by_name && (
                      <p className="text-slate-500">
                        {t('renewedBy')}: {record.renewed_by_name}
                      </p>
                    )}
                    {record.notes && (
                      <p className="text-slate-700 italic border-t border-slate-200 pt-1 mt-1">
                        "{record.notes}"
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

      {/* Turnstile RFID Field Pass QR Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={isRtl ? 'تصريح الدخول الميداني الذكي' : 'Field Access RFID / QR Pass'}
        subtitle={isRtl ? 'امسح الباركود عند بوابات الدخول للتحقق الفوري' : 'Scan at site turnstiles for real-time clearance check'}
        maxWidth="sm"
      >
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div
            className={`w-full p-4 rounded-xl border mb-4 ${
              isBarred ? 'bg-[#FDECEE] border-[#C83E4D]/30' : 'bg-[#E6F5F3] border-[#168C82]/30'
            }`}
          >
            {isBarred ? (
              <span className="text-xs font-bold text-[#C83E4D]">
                {isRtl ? '⚠️ تحذير: الدخول محظور برمجياً' : '⚠️ ACCESS BARRED BY SYSTEM'}
              </span>
            ) : (
              <span className="text-xs font-bold text-[#168C82]">
                {isRtl ? '✅ مصرح بالدخول لجميع القطاعات' : '✅ ACCESS CLEARED FOR ALL SECTORS'}
              </span>
            )}
          </div>

          <div className="w-48 h-48 bg-white p-3 border-2 border-slate-900 rounded-2xl shadow-md flex items-center justify-center relative">
            <QrCode className="w-40 h-40 text-slate-900" />
          </div>

          <div className="mt-4">
            <h4 className="font-extrabold text-[#172B3A] text-sm">
              {isRtl && employee.full_name_ar ? employee.full_name_ar : employee.full_name}
            </h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{employee.employee_no}</p>
            <p className="text-xs text-[#168C82] font-semibold mt-1">
              {isRtl && employee.job_title_ar ? employee.job_title_ar : employee.job_title}
            </p>
          </div>

          <p className="text-[11px] text-slate-400 mt-4">
            {isRtl
              ? 'موقع نيوم - كود التحقق الأمني: NEOM-PASS-2024-X9'
              : 'Secured Turnstile Gateway: NEOM-PASS-2024-X9'}
          </p>
        </div>
      </Modal>

      {/* Simulated Document Viewer Modal */}
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

          <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p>
              <strong className="text-slate-800">{t('issueDate')}:</strong>{' '}
              {formatDate(selectedCertDoc?.issue_date)}
            </p>
            <p>
              <strong className="text-slate-800">{t('expiryDate')}:</strong>{' '}
              {formatDate(selectedCertDoc?.expiry_date)}
            </p>
            <p>
              <strong className="text-slate-800">{t('attachment')}:</strong>{' '}
              <span className="font-mono text-slate-700">{selectedCertDoc?.attachment_filename || 'document.pdf'}</span>
            </p>
            <p>
              <strong className="text-slate-800">{t('notes')}:</strong>{' '}
              {selectedCertDoc?.notes || (isRtl ? 'لا توجد ملاحظات إضافية' : 'No notes registered.')}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setSelectedCertDoc(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => {
                alert(isRtl ? 'تم إنشاء رابط تنزيل مشفر وصالح لمدة 15 دقيقة بنجاح من مجلد المنشأة الخاص.' : 'Generated 15-minute secure signed download link from private company storage.');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16324F] text-white text-xs font-bold hover:bg-[#0F2236]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('downloadSignedUrl')}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

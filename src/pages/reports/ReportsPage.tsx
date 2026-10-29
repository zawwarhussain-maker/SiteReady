import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { db } from '../../lib/supabase';
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Building,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  EmployeeCertificate,
  Inspection,
  CorrectiveAction,
  Employee,
  CertificateType
} from '../../types';

export const ReportsPage: React.FC = () => {
  const { selectedSiteId, company, sites, user } = useAuth();
  const { t, isRtl, formatDate } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  type ReportTabType = 'expired_certs' | 'upcoming_renewals' | 'matrix' | 'inspections' | 'actions';

  const [activeReportTab, setActiveReportTab] = useState<ReportTabType>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'expiries' || tabParam === 'expired_certs') return 'expired_certs';
    if (tabParam === 'upcoming_renewals') return 'upcoming_renewals';
    if (tabParam === 'matrix') return 'matrix';
    if (tabParam === 'inspections') return 'inspections';
    if (tabParam === 'actions') return 'actions';
    return 'expired_certs';
  });

  const [certificates, setCertificates] = useState<EmployeeCertificate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [certTypes, setCertTypes] = useState<CertificateType[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [filterSiteId, setFilterSiteId] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const siteScope = filterSiteId !== 'all' ? filterSiteId : selectedSiteId;
      const [certs, emps, types, ins, acts] = await Promise.all([
        db.getCertificates(siteScope),
        db.getEmployees(siteScope),
        db.getCertificateTypes(),
        db.getInspections(siteScope),
        db.getCorrectiveActions(siteScope)
      ]);
      setCertificates(certs);
      setEmployees(emps);
      setCertTypes(types);
      setInspections(ins);
      setActions(acts);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, [selectedSiteId, filterSiteId]);

  const handleTabChange = (tab: ReportTabType) => {
    setActiveReportTab(tab);
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  };

  // Filtered Datasets based on Date Range and Search
  const filteredExpiredCerts = useMemo(() => {
    return certificates.filter((c) => {
      if (c.status !== 'expired' && c.status !== 'missing') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const empName = c.employee?.full_name.toLowerCase() || '';
        const empNo = c.employee?.employee_no.toLowerCase() || '';
        const typeName = c.certificate_type?.name.toLowerCase() || '';
        if (!empName.includes(q) && !empNo.includes(q) && !typeName.includes(q)) return false;
      }
      if (startDate && c.expiry_date && c.expiry_date < startDate) return false;
      if (endDate && c.expiry_date && c.expiry_date > endDate) return false;
      return true;
    });
  }, [certificates, searchQuery, startDate, endDate]);

  const filteredUpcomingRenewals = useMemo(() => {
    return certificates.filter((c) => {
      if (c.status !== 'expiring_soon') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const empName = c.employee?.full_name.toLowerCase() || '';
        const empNo = c.employee?.employee_no.toLowerCase() || '';
        const typeName = c.certificate_type?.name.toLowerCase() || '';
        if (!empName.includes(q) && !empNo.includes(q) && !typeName.includes(q)) return false;
      }
      if (startDate && c.expiry_date && c.expiry_date < startDate) return false;
      if (endDate && c.expiry_date && c.expiry_date > endDate) return false;
      return true;
    });
  }, [certificates, searchQuery, startDate, endDate]);

  const filteredInspections = useMemo(() => {
    return inspections.filter((i) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const titleMatch = i.title.toLowerCase().includes(q);
        const typeMatch = i.inspection_type.toLowerCase().includes(q);
        if (!titleMatch && !typeMatch) return false;
      }
      if (startDate && i.scheduled_date < startDate) return false;
      if (endDate && i.scheduled_date > endDate) return false;
      return true;
    });
  }, [inspections, searchQuery, startDate, endDate]);

  const filteredActions = useMemo(() => {
    return actions.filter((a) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const titleMatch = a.title.toLowerCase().includes(q);
        const descMatch = a.description?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }
      if (startDate && a.due_date < startDate) return false;
      if (endDate && a.due_date > endDate) return false;
      return true;
    });
  }, [actions, searchQuery, startDate, endDate]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = e.full_name.toLowerCase().includes(q) || (e.full_name_ar && e.full_name_ar.toLowerCase().includes(q));
        const noMatch = e.employee_no.toLowerCase().includes(q);
        if (!nameMatch && !noMatch) return false;
      }
      return true;
    });
  }, [employees, searchQuery]);

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM so Excel opens Arabic correctly
    const todayStr = new Date().toISOString().split('T')[0];
    let filename = `SiteReady_${activeReportTab}_${todayStr}.csv`;

    if (activeReportTab === 'expired_certs') {
      csvContent += 'Employee No,Full Name,Job Title,Certificate Type,License No,Issue Date,Expiry Date,Status\n';
      filteredExpiredCerts.forEach((c) => {
        csvContent += `"${c.employee?.employee_no}","${c.employee?.full_name}","${c.employee?.job_title}","${c.certificate_type?.name}","${c.license_number}","${c.issue_date}","${c.expiry_date || 'N/A'}","${c.status}"\n`;
      });
    } else if (activeReportTab === 'upcoming_renewals') {
      csvContent += 'Employee No,Full Name,Job Title,Certificate Type,License No,Issue Date,Expiry Date,Status\n';
      filteredUpcomingRenewals.forEach((c) => {
        csvContent += `"${c.employee?.employee_no}","${c.employee?.full_name}","${c.employee?.job_title}","${c.certificate_type?.name}","${c.license_number}","${c.issue_date}","${c.expiry_date || 'N/A'}","${c.status}"\n`;
      });
    } else if (activeReportTab === 'matrix') {
      csvContent += 'Employee No,Full Name,Site,' + certTypes.map((t) => `"${t.name}"`).join(',') + '\n';
      filteredEmployees.forEach((emp) => {
        const row = [
          `"${emp.employee_no}"`,
          `"${emp.full_name}"`,
          `"${emp.site?.name || 'N/A'}"`
        ];
        certTypes.forEach((type) => {
          const match = emp.certificates?.find((c) => c.certificate_type_id === type.id);
          row.push(`"${match ? match.status.toUpperCase() : 'MISSING'}"`);
        });
        csvContent += row.join(',') + '\n';
      });
    } else if (activeReportTab === 'inspections') {
      csvContent += 'Site,Title,Type,Scheduled Date,Status,Summary\n';
      filteredInspections.forEach((i) => {
        csvContent += `"${i.site?.name || ''}","${i.title}","${i.inspection_type}","${i.scheduled_date}","${i.status}","${i.summary_notes || ''}"\n`;
      });
    } else if (activeReportTab === 'actions') {
      csvContent += 'Title,Priority,Status,Due Date,Description,Resolution Notes\n';
      filteredActions.forEach((a) => {
        csvContent += `"${a.title}","${a.priority}","${a.status}","${a.due_date}","${a.description || ''}","${a.resolution_notes || ''}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Report Header (visible only when printing) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {company ? (isRtl && company.name_ar ? company.name_ar : company.name) : 'Al-Fanar Contracting KSA'}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              SiteReady GCC — Official HSE & Regulatory Workforce Compliance Dossier
            </p>
            <p className="text-xs text-slate-600">
              CR: {company?.cr_number || '1010294821'} | Generated: {new Date().toLocaleString()} by {user?.full_name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 border border-slate-300 rounded">
              Aramco / NEOM OHS Standard
            </span>
          </div>
        </div>
      </div>

      {/* Screen Page Header (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B3A] tracking-tight flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-[#168C82]" />
            <span>{t('reportsTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {isRtl
              ? 'تقارير الامتثال الرقابي، مصفوفة تدريب العمال، وسجلات التدقيق المعتمدة مع التصدير إلى Excel والطباعة'
              : 'Regulatory audit registers, employee training matrix, and printable compliance packs'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs font-bold text-[#16324F] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#168C82]" />
            <span>{t('exportCSV')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#16324F] text-white text-xs font-bold hover:bg-[#0F2236] transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>{t('printReport')}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation (hidden in print) */}
      <div className="no-print flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => handleTabChange('expired_certs')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReportTab === 'expired_certs'
              ? 'bg-[#16324F] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>{t('reportExpiredCerts')}</span>
        </button>

        <button
          onClick={() => handleTabChange('upcoming_renewals')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReportTab === 'upcoming_renewals'
              ? 'bg-[#16324F] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('reportUpcomingRenewals')}</span>
        </button>

        <button
          onClick={() => handleTabChange('matrix')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReportTab === 'matrix'
              ? 'bg-[#16324F] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('reportTrainingMatrix')}</span>
        </button>

        <button
          onClick={() => handleTabChange('inspections')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReportTab === 'inspections'
              ? 'bg-[#16324F] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>{t('reportInspectionHistory')}</span>
        </button>

        <button
          onClick={() => handleTabChange('actions')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReportTab === 'actions'
              ? 'bg-[#16324F] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('reportOutstandingActions')}</span>
        </button>
      </div>

      {/* Filter Toolbar (hidden in print) */}
      <div className="no-print bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
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
                ? 'تصفية نتائج التقرير بالاسم، الرقم، أو العنوان...'
                : 'Filter report results by name, ID, or title...'
            }
            className="block w-full pl-9 pr-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSiteId}
              onChange={(e) => setFilterSiteId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-slate-50 text-slate-700 font-medium"
            >
              <option value="all">{isRtl ? 'جميع المواقع' : 'All Sites'}</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {isRtl && s.name_ar ? s.name_ar : s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <span>{isRtl ? 'من:' : 'From:'}</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 border border-[#E2E8F0] rounded-lg text-xs"
            />
            <span>{isRtl ? 'إلى:' : 'To:'}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 border border-[#E2E8F0] rounded-lg text-xs"
            />
          </div>

          {(startDate || endDate || searchQuery || filterSiteId !== 'all') && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setFilterSiteId('all');
              }}
              className="text-xs font-bold text-rose-600 hover:underline px-1"
            >
              {isRtl ? 'إعادة تعيين' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Report Content Panel */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#168C82]" />
            <span>{t('loading')}</span>
          </div>
        ) : (
          <>
            {/* TAB 1: Expired Certificates Register */}
            {activeReportTab === 'expired_certs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3 px-4">{t('employee')}</th>
                      <th className="py-3 px-4">{t('assignedSite')}</th>
                      <th className="py-3 px-4">{t('certificateType')}</th>
                      <th className="py-3 px-4">{t('licenseNumber')}</th>
                      <th className="py-3 px-4">{t('expiryDate')}</th>
                      <th className="py-3 px-4">{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {filteredExpiredCerts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          {isRtl ? 'سجل نظيف — لا توجد شهادات منتهية الصلاحية.' : 'Clean register — no expired certificates found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredExpiredCerts.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-[#172B3A]">
                            {isRtl && cert.employee?.full_name_ar
                              ? cert.employee.full_name_ar
                              : cert.employee?.full_name}
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {cert.employee?.employee_no}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {cert.employee?.site
                              ? isRtl && cert.employee.site.name_ar
                                ? cert.employee.site.name_ar
                                : cert.employee.site.name
                              : '-'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#16324F]">
                            {isRtl && cert.certificate_type?.name_ar
                              ? cert.certificate_type.name_ar
                              : cert.certificate_type?.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">{cert.license_number}</td>
                          <td className="py-3 px-4 font-semibold text-rose-700">{formatDate(cert.expiry_date)}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={cert.status} size="sm" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: Upcoming Renewals Horizon (30d) */}
            {activeReportTab === 'upcoming_renewals' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3 px-4">{t('employee')}</th>
                      <th className="py-3 px-4">{t('assignedSite')}</th>
                      <th className="py-3 px-4">{t('certificateType')}</th>
                      <th className="py-3 px-4">{t('licenseNumber')}</th>
                      <th className="py-3 px-4">{t('expiryDate')}</th>
                      <th className="py-3 px-4">{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {filteredUpcomingRenewals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          {isRtl ? 'لا توجد شهادات أوشكت على الانتهاء خلال الثلاثين يوماً القادمة.' : 'No certificates expiring within the next 30 days.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUpcomingRenewals.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-[#172B3A]">
                            {isRtl && cert.employee?.full_name_ar
                              ? cert.employee.full_name_ar
                              : cert.employee?.full_name}
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {cert.employee?.employee_no}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {cert.employee?.site
                              ? isRtl && cert.employee.site.name_ar
                                ? cert.employee.site.name_ar
                                : cert.employee.site.name
                              : '-'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#16324F]">
                            {isRtl && cert.certificate_type?.name_ar
                              ? cert.certificate_type.name_ar
                              : cert.certificate_type?.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">{cert.license_number}</td>
                          <td className="py-3 px-4 font-semibold text-amber-700">{formatDate(cert.expiry_date)}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={cert.status} size="sm" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: Employee Training Matrix */}
            {activeReportTab === 'matrix' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3 px-4 sticky left-0 bg-slate-50 z-10">{t('employee')}</th>
                      <th className="py-3 px-4">{t('jobTitle')}</th>
                      {certTypes.map((tItem) => (
                        <th key={tItem.id} className="py-3 px-4 text-center whitespace-nowrap">
                          {isRtl && tItem.name_ar ? tItem.name_ar : tItem.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-[#172B3A] sticky left-0 bg-white">
                          {isRtl && emp.full_name_ar ? emp.full_name_ar : emp.full_name}
                          <span className="text-[11px] font-mono text-slate-400 block">{emp.employee_no}</span>
                        </td>
                        <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                          {isRtl && emp.job_title_ar ? emp.job_title_ar : emp.job_title}
                        </td>
                        {certTypes.map((tItem) => {
                          const match = emp.certificates?.find((c) => c.certificate_type_id === tItem.id);
                          return (
                            <td key={tItem.id} className="py-3 px-4 text-center">
                              {match ? (
                                <StatusBadge status={match.status} size="sm" />
                              ) : (
                                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  {t('statusMissing')}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: Inspections History */}
            {activeReportTab === 'inspections' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3 px-4">{t('assignedSite')}</th>
                      <th className="py-3 px-4">{isRtl ? 'عنوان الفحص والنوع' : 'Inspection Title & Type'}</th>
                      <th className="py-3 px-4">{t('scheduledDate')}</th>
                      <th className="py-3 px-4">{t('status')}</th>
                      <th className="py-3 px-4">{isRtl ? 'الملاحظات والملخص' : 'Summary'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {filteredInspections.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          {isRtl ? 'لا توجد فحوصات مطابقة لخيارات التصفية.' : 'No inspections found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredInspections.map((ins) => (
                        <tr key={ins.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-semibold text-[#172B3A]">
                            {ins.site ? (isRtl && ins.site.name_ar ? ins.site.name_ar : ins.site.name) : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#16324F]">
                              {isRtl && ins.title_ar ? ins.title_ar : ins.title}
                            </p>
                            <p className="text-[11px] text-slate-400">{ins.inspection_type}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{formatDate(ins.scheduled_date)}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={ins.status} size="sm" />
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                            {ins.summary_notes || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 5: Corrective Actions Register */}
            {activeReportTab === 'actions' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3 px-4">{isRtl ? 'الإجراء التصحيحي' : 'Action Item'}</th>
                      <th className="py-3 px-4">{t('priority')}</th>
                      <th className="py-3 px-4">{t('dueDate')}</th>
                      <th className="py-3 px-4">{t('status')}</th>
                      <th className="py-3 px-4">{isRtl ? 'المسؤول' : 'Assignee'}</th>
                      <th className="py-3 px-4">{isRtl ? 'حالة المعالجة' : 'Resolution'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {filteredActions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          {isRtl ? 'لا توجد إجراءات تصحيحية مسجلة.' : 'No corrective actions found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredActions.map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#172B3A]">
                              {isRtl && act.title_ar ? act.title_ar : act.title}
                            </p>
                            <p className="text-[11px] text-slate-400 max-w-sm truncate">{act.description}</p>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={act.priority} size="sm" />
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{formatDate(act.due_date)}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={act.status} size="sm" />
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {act.assignee?.full_name || 'HSE Officer'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                            {act.resolution_notes || (act.status === 'open' ? (isRtl ? 'بانتظار المعالجة' : 'Pending resolution') : '-')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Official Sign-off Block for Print Output */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-xs">
        <div>
          <p className="font-bold text-slate-900 mb-8">Audited By: Field HSE Inspector</p>
          <div className="border-b border-slate-400 w-48 mb-2"></div>
          <p className="text-slate-500">Signature & Date</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-900 mb-8">Approved By: Corporate Safety Director</p>
          <div className="border-b border-slate-400 w-48 ml-auto mb-2"></div>
          <p className="text-slate-500">Official Seal & Approval Date</p>
        </div>
      </div>
    </div>
  );
};

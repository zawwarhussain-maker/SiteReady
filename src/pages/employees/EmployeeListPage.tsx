import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { db } from '../../lib/supabase';
import { Employee, EmploymentStatus } from '../../types';
import {
  Users,
  Search,
  Filter,
  Plus,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit,
  AlertCircle,
  Building,
  RefreshCw
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Toast, ToastMessage } from '../../components/common/Toast';

export const EmployeeListPage: React.FC = () => {
  const { selectedSiteId, can, sites } = useAuth();
  const { t, isRtl, formatDate } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gateFilter, setGateFilter] = useState<string>(searchParams.get('filter') || 'all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [empNo, setEmpNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullNameAr, setFullNameAr] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobTitleAr, setJobTitleAr] = useState('');
  const [iqamaId, setIqamaId] = useState('');
  const [nationality, setNationality] = useState('Saudi Arabia');
  const [phone, setPhone] = useState('+966 5');
  const [email, setEmail] = useState('');
  const [siteId, setSiteId] = useState('');
  const [empStatus, setEmpStatus] = useState<EmploymentStatus>('active');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await db.getEmployees(selectedSiteId);
      setEmployees(list);
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
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, [selectedSiteId]);

  useEffect(() => {
    if (searchParams.get('filter')) {
      setGateFilter(searchParams.get('filter') || 'all');
    }
    if (searchParams.get('action') === 'new') {
      handleOpenCreateModal();
    }
  }, [searchParams]);

  // Reset page to 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, gateFilter, siteFilter]);

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setEmpNo(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
    setFullName('');
    setFullNameAr('');
    setJobTitle('');
    setJobTitleAr('');
    setIqamaId('');
    setNationality('Saudi Arabia');
    setPhone('+966 5');
    setEmail('');
    setSiteId(sites[0]?.id || '');
    setEmpStatus('active');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpNo(emp.employee_no);
    setFullName(emp.full_name);
    setFullNameAr(emp.full_name_ar || '');
    setJobTitle(emp.job_title);
    setJobTitleAr(emp.job_title_ar || '');
    setIqamaId(emp.iqama_national_id);
    setNationality(emp.nationality);
    setPhone(emp.phone || '');
    setEmail(emp.email || '');
    setSiteId(emp.site_id || sites[0]?.id || '');
    setEmpStatus(emp.employment_status);
    setJoiningDate(emp.joining_date || '');
    setNotes(emp.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !empNo || !iqamaId || !jobTitle) {
      setFormError(t('requiredField'));
      return;
    }

    // Iqama 10 digit validation
    if (!/^\d{10}$/.test(iqamaId)) {
      setFormError(
        isRtl
          ? 'رقم الهوية الوطنية أو الإقامة يجب أن يتكون من 10 أرقام دقيقة.'
          : 'Iqama or National ID must be exactly 10 numeric digits.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const company = await db.getCompany();
      if (editingEmployee) {
        await db.updateEmployee(editingEmployee.id, {
          employee_no: empNo,
          full_name: fullName,
          full_name_ar: fullNameAr,
          job_title: jobTitle,
          job_title_ar: jobTitleAr,
          iqama_national_id: iqamaId,
          nationality,
          phone,
          email,
          site_id: siteId,
          employment_status: empStatus,
          joining_date: joiningDate,
          notes
        });
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: t('successEmployeeUpdated')
        });
      } else {
        await db.createEmployee({
          company_id: company.id,
          employee_no: empNo,
          full_name: fullName,
          full_name_ar: fullNameAr,
          job_title: jobTitle,
          job_title_ar: jobTitleAr,
          iqama_national_id: iqamaId,
          nationality,
          phone,
          email,
          site_id: siteId,
          employment_status: empStatus,
          joining_date: joiningDate,
          notes
        });
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: t('successEmployeeCreated')
        });
      }
      setIsModalOpen(false);
      searchParams.delete('action');
      setSearchParams(searchParams);
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

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!can('manage_employees')) {
      alert(t('errorGeneric'));
      return;
    }

    if (window.confirm(`${t('deleteEmployeeConfirm')}\n\n${name}`)) {
      try {
        await db.deleteEmployee(id);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: t('successEmployeeDeleted')
        });
      } catch (err: unknown) {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          message: err instanceof Error ? err.message : t('errorGeneric')
        });
      }
    }
  };

  // Filter Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search query matching
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        emp.full_name.toLowerCase().includes(searchLower) ||
        (emp.full_name_ar && emp.full_name_ar.toLowerCase().includes(searchLower)) ||
        emp.employee_no.toLowerCase().includes(searchLower) ||
        emp.iqama_national_id.includes(searchLower) ||
        emp.job_title.toLowerCase().includes(searchLower) ||
        (emp.job_title_ar && emp.job_title_ar.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'all' && emp.employment_status !== statusFilter) {
        return false;
      }

      // Site filter
      if (siteFilter !== 'all' && emp.site_id !== siteFilter) {
        return false;
      }

      // Gate turnstile filter: barred if has expired or missing cert
      const hasExpiredCert = emp.certificates?.some((c) => c.status === 'expired');
      const isBarred = hasExpiredCert || emp.employment_status !== 'active';

      if (gateFilter === 'barred' && !isBarred) return false;
      if (gateFilter === 'cleared' && isBarred) return false;

      return true;
    });
  }, [employees, searchQuery, statusFilter, siteFilter, gateFilter]);

  // Paginated Rows
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(startIndex, startIndex + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const NextArrow = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-5">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B3A] tracking-tight">
            {t('employeeDirectory')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {isRtl
              ? 'إدارة سجلات القوى العاملة، الإقامات، والتحقق من صلاحية دخول المواقع'
              : 'Workforce records, national IDs, and site gate turnstile clearance'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title={isRtl ? 'تحديث البيانات' : 'Refresh'}
            className="p-2 rounded-lg border border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#168C82]' : ''}`} />
          </button>

          {can('manage_employees') && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16324F] text-white text-xs font-bold hover:bg-[#0F2236] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addEmployee')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
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
                ? 'البحث بالاسم، الرقم الوظيفي، رقم الإقامة، أو المسمى...'
                : 'Search by worker name, ID, Iqama, or job title...'
            }
            className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Site Filter */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-[#E2E8F0] bg-slate-50 text-[#172B3A] focus:outline-none"
          >
            <option value="all">{isRtl ? 'الموقع: جميع المواقع' : 'Site: All Sites'}</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {isRtl && s.name_ar ? s.name_ar : s.name}
              </option>
            ))}
          </select>

          {/* Gate Clearance Filter */}
          <select
            value={gateFilter}
            onChange={(e) => setGateFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-[#E2E8F0] bg-slate-50 text-[#172B3A] focus:outline-none"
          >
            <option value="all">{isRtl ? 'بوابة الدخول: الكل' : 'Gate Status: All'}</option>
            <option value="cleared">{isRtl ? 'مصرح بالدخول (Cleared)' : 'Cleared (100% Valid)'}</option>
            <option value="barred">{isRtl ? 'محظور من الدخول (Barred)' : 'Barred (Expired Certs)'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-[#E2E8F0] bg-slate-50 text-[#172B3A] focus:outline-none"
          >
            <option value="all">{t('all')}</option>
            <option value="active">{t('statusActive')}</option>
            <option value="suspended">{t('statusSuspended')}</option>
            <option value="terminated">{t('statusTerminated')}</option>
          </select>
        </div>
      </div>

      {/* Workforce Table / Cards */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 animate-pulse py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                <div className="space-y-2">
                  <div className="w-40 h-3 bg-slate-200 rounded"></div>
                  <div className="w-24 h-2 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="w-28 h-4 bg-slate-100 rounded hidden sm:block"></div>
              <div className="w-20 h-6 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          title={t('noRecords')}
          description={
            isRtl
              ? 'لم يتم العثور على عمال يطابقون معايير البحث الحالية.'
              : 'No employees matched your active filter or search query.'
          }
          icon={Users}
          actionText={can('manage_employees') ? t('addEmployee') : undefined}
          onAction={can('manage_employees') ? handleOpenCreateModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4">{t('employeeNo')} / {t('fullName')}</th>
                  <th className="py-3 px-4">{t('jobTitle')}</th>
                  <th className="py-3 px-4">{t('assignedSite')}</th>
                  <th className="py-3 px-4">{t('iqamaNumber')}</th>
                  <th className="py-3 px-4">{isRtl ? 'بوابة الدخول' : 'Gate Clearance'}</th>
                  <th className="py-3 px-4">{t('status')}</th>
                  <th className="py-3 px-4 text-end">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {paginatedEmployees.map((emp) => {
                  const hasExpired = emp.certificates?.some((c) => c.status === 'expired');
                  const isBarred = hasExpired || emp.employment_status !== 'active';

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => navigate(`/employees/${emp.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#16324F] flex-shrink-0 group-hover:border-[#168C82] transition-colors">
                            {emp.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#172B3A] group-hover:text-[#168C82] transition-colors">
                              {isRtl && emp.full_name_ar ? emp.full_name_ar : emp.full_name}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">{emp.employee_no}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#172B3A]">
                        {isRtl && emp.job_title_ar ? emp.job_title_ar : emp.job_title}
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B]">
                        {emp.site ? (isRtl && emp.site.name_ar ? emp.site.name_ar : emp.site.name) : '-'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {emp.iqama_national_id}
                      </td>

                      <td className="py-3.5 px-4">
                        {isBarred ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FDECEE] text-[#C83E4D] border border-[#C83E4D]/30 font-bold text-[11px]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'محظور من الدخول' : 'Barred Interlock'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#E6F5F3] text-[#168C82] border border-[#168C82]/30 font-bold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'مصرح بالدخول' : 'Gate Cleared'}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={emp.employment_status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {can('manage_employees') && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(emp)}
                                className="p-1.5 text-slate-400 hover:text-[#16324F] hover:bg-slate-100 rounded-md transition-colors"
                                title={t('edit')}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title={t('delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/employees/${emp.id}`)}
                            className="p-1.5 text-slate-400 hover:text-[#168C82] rounded-md transition-colors"
                            title={t('view')}
                          >
                            <NextArrow className="w-4 h-4" />
                          </button>
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
            totalItems={filteredEmployees.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? t('editEmployee') : t('addEmployee')}
        subtitle={
          isRtl
            ? 'تسجيل بيانات العامل والتحقق من الهوية وموقع العمل'
            : 'Register employee identity, Saudi Iqama, and assigned site'
        }
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('employeeNo')} *
              </label>
              <input
                type="text"
                value={empNo}
                onChange={(e) => setEmpNo(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('iqamaNumber')} (10 digits) *
              </label>
              <input
                type="text"
                value={iqamaId}
                onChange={(e) => setIqamaId(e.target.value)}
                required
                maxLength={10}
                placeholder="2XXXXXXXXX or 1XXXXXXXXX"
                className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('fullName')} (English) *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {isRtl ? 'الاسم بالكامل (بالعربية)' : 'Full Name (Arabic)'}
              </label>
              <input
                type="text"
                value={fullNameAr}
                onChange={(e) => setFullNameAr(e.target.value)}
                placeholder="محمد بن سالم الشمري"
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('jobTitle')} (English) *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                placeholder="e.g. Rigging Supervisor / Heavy Crane Operator"
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {isRtl ? 'المسمى الوظيفي (بالعربية)' : 'Job Title (Arabic)'}
              </label>
              <input
                type="text"
                value={jobTitleAr}
                onChange={(e) => setJobTitleAr(e.target.value)}
                placeholder="مشرف تصبير ورافعات معتمد"
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('assignedSite')} *
              </label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isRtl && s.name_ar ? s.name_ar : s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('nationality')}
              </label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('status')}
              </label>
              <select
                value={empStatus}
                onChange={(e) => setEmpStatus(e.target.value as EmploymentStatus)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white"
              >
                <option value="active">{t('statusActive')}</option>
                <option value="suspended">{t('statusSuspended')}</option>
                <option value="terminated">{t('statusTerminated')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('phone')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 5X XXX XXXX"
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('joiningDate')}
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
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
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              placeholder="e.g. Aramco green badge cleared, medical fitness passed."
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#16324F] hover:bg-[#0F2236] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingEmployee ? t('update') : t('save')}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

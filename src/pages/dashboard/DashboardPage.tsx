import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { db } from '../../lib/supabase';
import {
  Users,
  Award,
  AlertTriangle,
  Clock,
  ClipboardCheck,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  Share2,
  Calendar,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TurnstileBanner } from '../../components/common/TurnstileBanner';
import { DashboardMetrics, EmployeeCertificate, AuditEvent, Employee } from '../../types';
import { formatExpiryWindow } from '../../lib/certificateUtils';

export const DashboardPage: React.FC = () => {
  const { selectedSiteId, role, can } = useAuth();
  const { t, isRtl, formatDate } = useI18n();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    validCertificates: 0,
    expiringCertificates: 0,
    expiredCertificates: 0,
    overdueInspections: 0,
    openCorrectiveActions: 0,
    complianceRate: 100
  });

  const [urgentCertificates, setUrgentCertificates] = useState<EmployeeCertificate[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditEvent[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [m, certs, audits, emps] = await Promise.all([
        db.getMetrics(selectedSiteId),
        db.getCertificates(selectedSiteId),
        db.getAuditEvents(),
        db.getEmployees(selectedSiteId)
      ]);

      setMetrics(m);
      setRecentAudits(audits.slice(0, 5));
      setEmployees(emps);

      // Filter urgent: expired or expiring soon (< 30 days)
      const urgent = certs
        .filter((c) => c.status === 'expired' || c.status === 'expiring_soon')
        .sort((a, b) => {
          if (!a.expiry_date) return 1;
          if (!b.expiry_date) return -1;
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        })
        .slice(0, 6);

      setUrgentCertificates(urgent);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const unsub = db.subscribe(() => {
      loadDashboardData();
    });
    return unsub;
  }, [selectedSiteId]);

  // Turnstile barred check: workers who have at least 1 expired cert
  const barredWorkerIds = new Set(
    urgentCertificates.filter((c) => c.status === 'expired').map((c) => c.employee_id)
  );
  const barredCount = barredWorkerIds.size;
  const clearedCount = Math.max(0, metrics.totalEmployees - barredCount);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleSendWhatsAppReminder = (cert: EmployeeCertificate) => {
    const workerName = isRtl && cert.employee?.full_name_ar ? cert.employee.full_name_ar : cert.employee?.full_name || 'Worker';
    const certName = isRtl && cert.certificate_type?.name_ar ? cert.certificate_type.name_ar : cert.certificate_type?.name || 'Certification';
    const expiry = formatDate(cert.expiry_date);
    const phone = cert.employee?.phone?.replace(/[^0-9]/g, '') || '966501928491';

    const message = isRtl
      ? `السلام عليكم ${workerName}، نود تذكيرك بأن شهادة السلامة (${certName}) ستنتهي بتاريخ ${expiry}. يرجى التنسيق مع إدارة السلامة لتجديدها لتجنب حظر الدخول عبر بوابات المشروع.`
      : `Hello ${workerName}, reminder that your safety credential (${certName}) expires on ${expiry}. Please coordinate with HSE to renew and prevent site gate access suspension.`;

    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B3A] tracking-tight">
              {t('executiveOverview')}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              <Sparkles className="w-3 h-3 text-[#168C82]" />
              {isRtl ? 'بيانات حية' : 'Live Synced'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {isRtl
              ? 'مراقبة الامتثال اللحظي، تنبيهات انتهاء الصلاحيات، وحالة بوابات الدخول'
              : 'Real-time contractor compliance, expiry register & site turnstile clearance'}
          </p>
        </div>

        {/* Quick Actions (only for Owner and Manager) */}
        {can('manage_employees') && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/employees?action=new')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#16324F] text-white text-xs font-bold hover:bg-[#0F2236] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addEmployee')}</span>
            </button>
            <button
              onClick={() => navigate('/certificates?action=new')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#168C82] text-white text-xs font-bold hover:bg-[#116e66] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addCertificate')}</span>
            </button>
            <button
              onClick={() => navigate('/inspections?action=new')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-[#16324F] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ClipboardCheck className="w-4 h-4 text-[#168C82]" />
              <span>{t('scheduleInspection')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Turnstile Access Interlock Banner */}
      <TurnstileBanner
        barredCount={barredCount}
        clearedCount={clearedCount}
        onViewBarred={() => navigate('/employees?filter=barred')}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KpiCard
          title={t('kpiActiveWorkforce')}
          value={metrics.totalEmployees}
          sublabel={isRtl ? 'إجمالي العمال المسجلين' : 'Active workforce'}
          icon={Users}
          variant="default"
          onClick={() => navigate('/employees')}
        />
        <KpiCard
          title={t('kpiValidCertificates')}
          value={metrics.validCertificates}
          sublabel={isRtl ? 'شهادات سارية المفعول' : 'Valid credentials'}
          icon={Award}
          variant="teal"
          onClick={() => navigate('/certificates?tab=valid')}
        />
        <KpiCard
          title={t('kpiExpiringSoon')}
          value={metrics.expiringCertificates}
          sublabel={isRtl ? 'خلال 30 يوماً' : 'Expiring ≤ 30 days'}
          icon={Clock}
          variant="amber"
          badgeText="< 30d"
          onClick={() => navigate('/certificates?tab=expiring_soon')}
        />
        <KpiCard
          title={t('kpiExpiredCertificates')}
          value={metrics.expiredCertificates}
          sublabel={isRtl ? 'تتطلب تجديد فوري' : 'Critical non-compliant'}
          icon={AlertCircle}
          variant="danger"
          badgeText={isRtl ? 'حرج' : 'Alert'}
          onClick={() => navigate('/certificates?tab=expired')}
        />
        <KpiCard
          title={t('kpiOverdueInspections')}
          value={metrics.overdueInspections}
          sublabel={isRtl ? 'فحوصات متأخرة' : 'Past schedule'}
          icon={ClipboardCheck}
          variant={metrics.overdueInspections > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/inspections?tab=inspections&filter=overdue')}
        />
        <KpiCard
          title={t('kpiOpenActions')}
          value={metrics.openCorrectiveActions}
          sublabel={isRtl ? 'إجراءات قيد المعالجة' : 'Open CAPA tickets'}
          icon={AlertTriangle}
          variant={metrics.openCorrectiveActions > 0 ? 'amber' : 'default'}
          onClick={() => navigate('/inspections?tab=actions&filter=open')}
        />
      </div>

      {/* Compliance Health Gauge Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F5F3] text-[#168C82] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#172B3A]">{t('kpiComplianceRate')}</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {metrics.complianceRate}%
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              {isRtl
                ? 'نسبة العمال المطابقين لمتطلبات التأهيل والسلامة عبر جميع مواقع المشاريع'
                : 'Overall compliance score according to Aramco & Saudi Building Code standards'}
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full md:w-72">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">{isRtl ? 'المستوى المحقق' : 'Achieved Score'}</span>
            <span className="text-[#168C82] font-bold">{metrics.complianceRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                metrics.complianceRate >= 90
                  ? 'bg-[#168C82]'
                  : metrics.complianceRate >= 70
                  ? 'bg-[#F2B544]'
                  : 'bg-[#C83E4D]'
              }`}
              style={{ width: `${Math.max(5, metrics.complianceRate)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Split: Expiry Register & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Urgent Expiries Register */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-[#172B3A]">{t('upcomingExpiriesTitle')}</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isRtl
                  ? 'الشهادات المنتهية أو القريبة من الانتهاء والتي تتطلب تجديداً عاجلاً'
                  : 'Certificates expired or due within 30 days requiring immediate action'}
              </p>
            </div>
            <button
              onClick={() => navigate('/certificates')}
              className="text-xs font-bold text-[#168C82] hover:text-[#116e66] flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {urgentCertificates.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {isRtl ? 'لا توجد شهادات منتهية أو متأخرة حالياً.' : 'No urgent or expired certificates.'}
              </div>
            ) : (
              urgentCertificates.map((cert) => {
                const expiryInfo = formatExpiryWindow(cert.expiry_date, isRtl ? 'ar' : 'en');
                const emp = cert.employee;
                return (
                  <div
                    key={cert.id}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-[#16324F] flex-shrink-0">
                        {emp?.full_name ? emp.full_name.charAt(0) : 'W'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => navigate(`/employees/${cert.employee_id}`)}
                            className="text-xs sm:text-sm font-bold text-[#172B3A] hover:text-[#168C82] transition-colors"
                          >
                            {isRtl && emp?.full_name_ar ? emp.full_name_ar : emp?.full_name}
                          </button>
                          <span className="text-[11px] text-slate-400">({emp?.employee_no})</span>
                          <StatusBadge status={cert.status} size="sm" />
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {isRtl && cert.certificate_type?.name_ar
                            ? cert.certificate_type.name_ar
                            : cert.certificate_type?.name}
                          {' • '}
                          <span className="font-mono text-slate-700">{cert.license_number}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right sm:text-end">
                        <p className="text-xs font-bold text-slate-700">{expiryInfo.text}</p>
                        <p className="text-[11px] text-slate-400">{formatDate(cert.expiry_date)}</p>
                      </div>

                      {/* WhatsApp Fast Dispatch */}
                      <button
                        onClick={() => handleSendWhatsAppReminder(cert)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                        title={isRtl ? 'إرسال تذكير عبر الواتساب' : 'Send WhatsApp Reminder'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline-block">WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (1 span): Recent Compliance Audit Events */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50/50">
            <h3 className="text-sm font-bold text-[#172B3A]">{t('recentActivityTitle')}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              {isRtl ? 'سجل العمليات والفحوصات الموثقة' : 'Immutable compliance audit trail'}
            </p>
          </div>

          <div className="divide-y divide-slate-100 p-3 flex-1 overflow-y-auto">
            {recentAudits.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">{t('noRecords')}</div>
            ) : (
              recentAudits.map((item) => (
                <div key={item.id} className="py-2.5 px-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#16324F]">{item.action.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-slate-400">{formatDate(item.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {item.user?.full_name || 'System'} • {item.entity_type}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] text-center">
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-[#168C82] hover:underline"
            >
              {isRtl ? 'تصدير سجل الامتثال الكامل (CSV / PDF)' : 'Generate Official Audit Pack'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

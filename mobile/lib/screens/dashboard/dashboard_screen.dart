import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../repositories/company_repository.dart';
import '../../models/dashboard_metrics.dart';
import '../../widgets/kpi_card.dart';
import '../employees/employee_form_screen.dart';
import '../certificates/certificate_form_screen.dart';
import '../certificates/expiring_certificates_screen.dart';
import '../inspections/schedule_inspection_dialog.dart';
import '../inspections/corrective_actions_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final CompanyRepository _companyRepo = CompanyRepository();
  DashboardMetrics _metrics = DashboardMetrics.empty();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMetrics();
  }

  Future<void> _loadMetrics() async {
    final auth = context.read<AuthProvider>();
    setState(() => _isLoading = true);
    final m = await _companyRepo.getMetrics(
      siteId: auth.selectedSiteId != 'all' ? auth.selectedSiteId : null,
    );
    if (mounted) {
      setState(() {
        _metrics = m;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _loadMetrics,
      color: AppColors.primaryTeal,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Company Welcome Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primaryNavy, AppColors.navyDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryNavy.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l10n.isArabic && auth.company?.nameAr != null
                              ? auth.company!.nameAr!
                              : (auth.company?.name ?? 'SiteReady GCC'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primaryTeal.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                auth.role.name.toUpperCase(),
                                style: const TextStyle(
                                  color: AppColors.primaryTeal,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              auth.selectedSite != null
                                  ? (l10n.isArabic && auth.selectedSite!.nameAr != null
                                      ? auth.selectedSite!.nameAr!
                                      : auth.selectedSite!.name)
                                  : l10n.t('allSites'),
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Compliance Gauge
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Column(
                      children: [
                        Text(
                          '${_metrics.complianceRate.toStringAsFixed(0)}%',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: _metrics.complianceRate >= 80
                                ? AppColors.accentAmber
                                : AppColors.danger,
                          ),
                        ),
                        Text(
                          l10n.t('complianceRate'),
                          style: TextStyle(
                            fontSize: 9,
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Warning Alert Banner (if expired certs exist)
            if (_metrics.expiredCertificates > 0)
              InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const ExpiringCertificatesScreen(initialTabIndex: 1),
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.danger.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: AppColors.danger, size: 22),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          '${_metrics.expiredCertificates} expired safety license(s) detected. Gate access barred.',
                          style: const TextStyle(
                            color: AppColors.danger,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: AppColors.danger, size: 18),
                    ],
                  ),
                ),
              ),

            // Quick Actions Bar
            Text(
              l10n.t('quickActions'),
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryNavy,
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                    ),
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (_) => const ScheduleInspectionDialog(),
                      ).then((_) => _loadMetrics());
                    },
                    icon: const Icon(Icons.add_task, size: 16),
                    label: Text(
                      l10n.t('newInspection'),
                      style: const TextStyle(fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryTeal,
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const EmployeeFormScreen()),
                      ).then((_) => _loadMetrics());
                    },
                    icon: const Icon(Icons.person_add, size: 16),
                    label: Text(
                      l10n.t('addWorker'),
                      style: const TextStyle(fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CertificateFormScreen()),
                      ).then((_) => _loadMetrics());
                    },
                    icon: const Icon(Icons.card_membership, size: 16),
                    label: Text(
                      l10n.t('addCert'),
                      style: const TextStyle(fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // KPI Grid
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.35,
              children: [
                KpiCard(
                  title: l10n.t('totalEmployees'),
                  value: _metrics.totalEmployees.toString(),
                  icon: Icons.groups,
                  accentColor: AppColors.primaryNavy,
                ),
                KpiCard(
                  title: l10n.t('validCertificates'),
                  value: _metrics.validCertificates.toString(),
                  icon: Icons.check_circle_outline,
                  accentColor: AppColors.primaryTeal,
                ),
                KpiCard(
                  title: l10n.t('expiringCertificates'),
                  value: _metrics.expiringCertificates.toString(),
                  icon: Icons.access_time,
                  accentColor: const Color(0xFFD97706),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const ExpiringCertificatesScreen(initialTabIndex: 0),
                      ),
                    );
                  },
                ),
                KpiCard(
                  title: l10n.t('expiredCertificates'),
                  value: _metrics.expiredCertificates.toString(),
                  icon: Icons.warning_amber_rounded,
                  accentColor: AppColors.danger,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const ExpiringCertificatesScreen(initialTabIndex: 1),
                      ),
                    );
                  },
                ),
                KpiCard(
                  title: l10n.t('overdueInspections'),
                  value: _metrics.overdueInspections.toString(),
                  icon: Icons.pending_actions,
                  accentColor: AppColors.danger,
                ),
                KpiCard(
                  title: l10n.t('openCorrectiveActions'),
                  value: _metrics.openCorrectiveActions.toString(),
                  icon: Icons.build_circle_outlined,
                  accentColor: const Color(0xFF2563EB),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const CorrectiveActionsScreen(),
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

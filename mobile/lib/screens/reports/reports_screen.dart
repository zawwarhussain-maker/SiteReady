import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/employee_provider.dart';
import '../../providers/inspection_provider.dart';
import '../../repositories/company_repository.dart';
import '../../models/dashboard_metrics.dart';
import '../../widgets/kpi_card.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final CompanyRepository _companyRepo = CompanyRepository();
  DashboardMetrics _metrics = DashboardMetrics.empty();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final auth = context.read<AuthProvider>();
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
    final empProvider = context.watch<EmployeeProvider>();
    final inspProvider = context.watch<InspectionProvider>();

    final totalEmps = empProvider.employees.length;
    final clearedEmps = empProvider.employees.where((e) => !e.hasExpiredCertificates && e.certificates.isNotEmpty).length;
    final barredEmps = totalEmps - clearedEmps;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(l10n.t('navReports')),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Compliance PDF report generated for Saudi Aramco / NEOM submission.'),
                  backgroundColor: AppColors.primaryNavy,
                ),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Overall Compliance Rating Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primaryNavy,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        Text(
                          l10n.t('complianceRate'),
                          style: const TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${_metrics.complianceRate.toStringAsFixed(1)}%',
                          style: const TextStyle(
                            color: AppColors.accentAmber,
                            fontSize: 36,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 12),
                        LinearProgressIndicator(
                          value: _metrics.complianceRate / 100.0,
                          backgroundColor: Colors.white24,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryTeal),
                          minHeight: 6,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Gate Clearance Summary Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceWhite,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Turnstile Access Gate Clearance',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE6F4F1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Column(
                                  children: [
                                    const Icon(Icons.check_circle, color: AppColors.primaryTeal, size: 24),
                                    const SizedBox(height: 6),
                                    Text(
                                      clearedEmps.toString(),
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.primaryTeal,
                                      ),
                                    ),
                                    Text(
                                      l10n.t('gateCleared'),
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primaryTeal,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEE2E2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Column(
                                  children: [
                                    const Icon(Icons.block, color: AppColors.danger, size: 24),
                                    const SizedBox(height: 6),
                                    Text(
                                      barredEmps.toString(),
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.danger,
                                      ),
                                    ),
                                    Text(
                                      l10n.t('gateBarred'),
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.danger,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Metrics Breakdown
                  GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.4,
                    children: [
                      KpiCard(
                        title: l10n.t('validCertificates'),
                        value: _metrics.validCertificates.toString(),
                        icon: Icons.verified,
                        accentColor: AppColors.primaryTeal,
                      ),
                      KpiCard(
                        title: l10n.t('expiringCertificates'),
                        value: _metrics.expiringCertificates.toString(),
                        icon: Icons.hourglass_bottom,
                        accentColor: const Color(0xFFD97706),
                      ),
                      KpiCard(
                        title: l10n.t('expiredCertificates'),
                        value: _metrics.expiredCertificates.toString(),
                        icon: Icons.warning,
                        accentColor: AppColors.danger,
                      ),
                      KpiCard(
                        title: l10n.t('openCorrectiveActions'),
                        value: inspProvider.openActions.length.toString(),
                        icon: Icons.build_circle,
                        accentColor: const Color(0xFF2563EB),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}

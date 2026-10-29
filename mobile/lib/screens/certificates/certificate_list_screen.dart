import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/certificate_provider.dart';
import '../../models/certificate.dart';
import '../../services/expiry_service.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/empty_state.dart';
import 'certificate_detail_screen.dart';
import 'certificate_form_screen.dart';

class CertificateListScreen extends StatefulWidget {
  const CertificateListScreen({super.key});

  @override
  State<CertificateListScreen> createState() => _CertificateListScreenState();
}

class _CertificateListScreenState extends State<CertificateListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCertificates();
    });
  }

  void _loadCertificates() {
    final auth = context.read<AuthProvider>();
    context.read<CertificateProvider>().fetchCertificates(
          siteId: auth.selectedSiteId != 'all' ? auth.selectedSiteId : null,
        );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();
    final certProvider = context.watch<CertificateProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.surfaceWhite,
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: (val) {
                          certProvider.setSearchQuery(
                            val,
                            siteId: auth.selectedSiteId != 'all' ? auth.selectedSiteId : null,
                          );
                        },
                        decoration: InputDecoration(
                          hintText: l10n.t('search'),
                          prefixIcon: const Icon(Icons.search, size: 20),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          filled: true,
                          fillColor: AppColors.scaffoldBackground,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                    if (auth.canManageCertificates) ...[
                      const SizedBox(width: 10),
                      FloatingActionButton.small(
                        elevation: 0,
                        backgroundColor: AppColors.primaryTeal,
                        foregroundColor: Colors.white,
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const CertificateFormScreen()),
                          ).then((_) => _loadCertificates());
                        },
                        child: const Icon(Icons.add),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 12),
                TabBar(
                  controller: _tabController,
                  isScrollable: true,
                  labelColor: AppColors.primaryNavy,
                  unselectedLabelColor: AppColors.textSecondary,
                  indicatorColor: AppColors.primaryTeal,
                  indicatorWeight: 3,
                  labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                  tabs: [
                    Tab(text: l10n.t('all')),
                    Tab(
                      child: Row(
                        children: [
                          Text(l10n.t('statusExpiring')),
                          if (certProvider.expiringSoonCertificates.isNotEmpty) ...[
                            const SizedBox(width: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD97706),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                certProvider.expiringSoonCertificates.length.toString(),
                                style: const TextStyle(color: Colors.white, fontSize: 10),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    Tab(
                      child: Row(
                        children: [
                          Text(l10n.t('statusExpired')),
                          if (certProvider.expiredCertificates.isNotEmpty) ...[
                            const SizedBox(width: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.danger,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                certProvider.expiredCertificates.length.toString(),
                                style: const TextStyle(color: Colors.white, fontSize: 10),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    Tab(text: l10n.t('statusValid')),
                  ],
                ),
              ],
            ),
          ),

          // Tab Views
          Expanded(
            child: certProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _CertificateListView(
                        certificates: certProvider.certificates,
                        onRefresh: _loadCertificates,
                      ),
                      _CertificateListView(
                        certificates: certProvider.expiringSoonCertificates,
                        onRefresh: _loadCertificates,
                      ),
                      _CertificateListView(
                        certificates: certProvider.expiredCertificates,
                        onRefresh: _loadCertificates,
                      ),
                      _CertificateListView(
                        certificates: certProvider.certificates
                            .where((c) => c.status == CertificateStatus.valid)
                            .toList(),
                        onRefresh: _loadCertificates,
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _CertificateListView extends StatelessWidget {
  final List<EmployeeCertificate> certificates;
  final VoidCallback onRefresh;

  const _CertificateListView({required this.certificates, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    if (certificates.isEmpty) {
      return EmptyState(
        icon: Icons.workspace_premium_outlined,
        title: l10n.t('noRecords'),
        subtitle: 'No certificates matching the current filter.',
      );
    }

    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: certificates.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final cert = certificates[index];
          final expiryDesc = ExpiryService.formatExpiryDescription(
            expiryDate: cert.expiryDate,
            isArabic: l10n.isArabic,
          );

          return InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => CertificateDetailScreen(certificateId: cert.id),
                ),
              ).then((_) => onRefresh());
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          cert.certificateType?.name ?? 'Safety License',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      StatusBadge.forCertificate(cert.status, context),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Holder: ${cert.employee?.fullName ?? 'Worker'} (${cert.employee?.employeeNo ?? ''})',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'License: ${cert.licenseNumber}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      Text(
                        expiryDesc,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: cert.status == CertificateStatus.expired
                              ? AppColors.danger
                              : cert.status == CertificateStatus.expiringSoon
                                  ? const Color(0xFFD97706)
                                  : AppColors.primaryTeal,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

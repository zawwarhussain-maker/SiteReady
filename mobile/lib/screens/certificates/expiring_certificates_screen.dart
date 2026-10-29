import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/certificate_provider.dart';
import '../../models/certificate.dart';
import '../../services/expiry_service.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/whatsapp_reminder_tile.dart';
import '../../widgets/empty_state.dart';
import 'renew_certificate_dialog.dart';

class ExpiringCertificatesScreen extends StatefulWidget {
  final int initialTabIndex;
  const ExpiringCertificatesScreen({super.key, this.initialTabIndex = 0});

  @override
  State<ExpiringCertificatesScreen> createState() => _ExpiringCertificatesScreenState();
}

class _ExpiringCertificatesScreenState extends State<ExpiringCertificatesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTabIndex,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final certProvider = context.watch<CertificateProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(l10n.t('expiringCertificates')),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primaryTeal,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700),
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.access_time, size: 16),
                  const SizedBox(width: 6),
                  Text('${l10n.t('statusExpiring')} (${certProvider.expiringSoonCertificates.length})'),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.warning_amber_rounded, size: 16),
                  const SizedBox(width: 6),
                  Text('${l10n.t('statusExpired')} (${certProvider.expiredCertificates.length})'),
                ],
              ),
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _ExpiringList(
            certificates: certProvider.expiringSoonCertificates,
            isExpiredTab: false,
          ),
          _ExpiringList(
            certificates: certProvider.expiredCertificates,
            isExpiredTab: true,
          ),
        ],
      ),
    );
  }
}

class _ExpiringList extends StatelessWidget {
  final List<EmployeeCertificate> certificates;
  final bool isExpiredTab;

  const _ExpiringList({required this.certificates, required this.isExpiredTab});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();

    if (certificates.isEmpty) {
      return EmptyState(
        icon: isExpiredTab ? Icons.check_circle_outline : Icons.sentiment_satisfied_alt,
        title: isExpiredTab
            ? 'No Expired Certificates'
            : 'No Certificates Expiring in 30 Days',
        subtitle: 'All contractor workers meet site compliance criteria.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: certificates.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final cert = certificates[index];
        final expiryDesc = ExpiryService.formatExpiryDescription(
          expiryDate: cert.expiryDate,
          isArabic: l10n.isArabic,
        );

        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isExpiredTab ? AppColors.danger.withOpacity(0.4) : AppColors.borderLight,
            ),
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
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                    ),
                  ),
                  StatusBadge.forCertificate(cert.status, context),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Worker: ${cert.employee?.fullName ?? 'Worker'} (${cert.employee?.employeeNo ?? ''})',
                style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
              ),
              Text(
                'License: ${cert.licenseNumber}',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 4),
              Text(
                expiryDesc,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: isExpiredTab ? AppColors.danger : const Color(0xFFD97706),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  if (cert.employee != null)
                    Expanded(
                      child: WhatsappReminderTile(
                        employee: cert.employee!,
                        certificate: cert,
                      ),
                    ),
                  if (auth.canManageCertificates) ...[
                    const SizedBox(width: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryTeal,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      ),
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (_) => RenewCertificateDialog(certificate: cert),
                        );
                      },
                      child: Text(l10n.t('renew'), style: const TextStyle(fontSize: 12)),
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

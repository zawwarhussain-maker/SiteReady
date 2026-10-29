import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/certificate_provider.dart';
import '../../providers/inspection_provider.dart';
import '../../widgets/empty_state.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final certProvider = context.watch<CertificateProvider>();
    final inspProvider = context.watch<InspectionProvider>();

    final expiredCerts = certProvider.expiredCertificates;
    final expiringCerts = certProvider.expiringSoonCertificates;
    final overdueActions = inspProvider.openActions.where((a) => a.isOverdue).toList();

    final totalAlerts = expiredCerts.length + expiringCerts.length + overdueActions.length;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(l10n.t('navNotifications')),
      ),
      body: totalAlerts == 0
          ? EmptyState(
              icon: Icons.notifications_none,
              title: 'All Compliance Checks Clear',
              subtitle: 'No overdue actions or expiring certificates found.',
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (expiredCerts.isNotEmpty) ...[
                  Text(
                    '${l10n.t('expiredCertificates')} (${expiredCerts.length})',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.danger),
                  ),
                  const SizedBox(height: 8),
                  ...expiredCerts.map((c) => _NotificationTile(
                        icon: Icons.warning_amber_rounded,
                        color: AppColors.danger,
                        title: 'Expired: ${c.certificateType?.name ?? c.licenseNumber}',
                        subtitle: 'Worker: ${c.employee?.fullName ?? 'Worker'} • Site Turnstile Locked',
                        date: c.expiryDate?.toIso8601String().substring(0, 10) ?? '',
                      )),
                  const SizedBox(height: 16),
                ],
                if (expiringCerts.isNotEmpty) ...[
                  Text(
                    '${l10n.t('expiringCertificates')} (${expiringCerts.length})',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFFD97706)),
                  ),
                  const SizedBox(height: 8),
                  ...expiringCerts.map((c) => _NotificationTile(
                        icon: Icons.access_time,
                        color: const Color(0xFFD97706),
                        title: 'Expiring: ${c.certificateType?.name ?? c.licenseNumber}',
                        subtitle: 'Worker: ${c.employee?.fullName ?? 'Worker'} • Submit renewal',
                        date: c.expiryDate?.toIso8601String().substring(0, 10) ?? '',
                      )),
                  const SizedBox(height: 16),
                ],
                if (overdueActions.isNotEmpty) ...[
                  const Text(
                    'Overdue Corrective Actions (CAPA)',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.danger),
                  ),
                  const SizedBox(height: 8),
                  ...overdueActions.map((a) => _NotificationTile(
                        icon: Icons.error_outline,
                        color: AppColors.danger,
                        title: a.title,
                        subtitle: 'Rectification overdue. Immediate field action required.',
                        date: a.dueDate.toIso8601String().substring(0, 10),
                      )),
                ],
              ],
            ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final String date;

  const _NotificationTile({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Text(
            date,
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../models/employee.dart';
import '../models/certificate.dart';
import '../services/whatsapp_reminder_service.dart';
import '../l10n/app_localizations.dart';

class WhatsappReminderTile extends StatelessWidget {
  final Employee employee;
  final EmployeeCertificate certificate;

  const WhatsappReminderTile({
    super.key,
    required this.employee,
    required this.certificate,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    if (employee.phone == null || employee.phone!.isEmpty) {
      return const SizedBox.shrink();
    }

    return InkWell(
      onTap: () async {
        final success = await WhatsappReminderService.sendRenewalReminder(
          employee: employee,
          certificate: certificate,
          isArabic: l10n.isArabic,
        );
        if (!success && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Could not launch WhatsApp for phone: ${employee.phone}',
              ),
            ),
          );
        }
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF25D366).withOpacity(0.12),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF25D366).withOpacity(0.4)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.chat, color: Color(0xFF1EBE5D), size: 16),
            const SizedBox(width: 6),
            Text(
              l10n.t('whatsappReminder'),
              style: const TextStyle(
                color: Color(0xFF128C7E),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/certificate_provider.dart';
import '../../models/certificate.dart';
import '../../widgets/app_text_field.dart';

class RenewCertificateDialog extends StatefulWidget {
  final EmployeeCertificate certificate;
  const RenewCertificateDialog({super.key, required this.certificate});

  @override
  State<RenewCertificateDialog> createState() => _RenewCertificateDialogState();
}

class _RenewCertificateDialogState extends State<RenewCertificateDialog> {
  late DateTime _newExpiryDate;
  final _notesController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final currentExpiry = widget.certificate.expiryDate ?? DateTime.now();
    _newExpiryDate = currentExpiry.add(const Duration(days: 365));
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleRenew() async {
    setState(() => _isLoading = true);

    final success = await context.read<CertificateProvider>().renewCertificate(
          certificateId: widget.certificate.id,
          newExpiryDate: _newExpiryDate,
          notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
        );

    if (!mounted) return;

    if (success) {
      Navigator.pop(context, true);
    } else {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to renew certificate record')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const Icon(Icons.autorenew, color: AppColors.primaryTeal, size: 24),
                const SizedBox(width: 8),
                Text(
                  l10n.t('renewCertificate'),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const Divider(height: 24),
            Text(
              'Certificate: ${widget.certificate.certificateType?.name ?? widget.certificate.licenseNumber}',
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(l10n.t('newExpiryDate'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              subtitle: Text(_newExpiryDate.toIso8601String().substring(0, 10)),
              trailing: const Icon(Icons.calendar_today, size: 20),
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _newExpiryDate,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 3650)),
                );
                if (picked != null) setState(() => _newExpiryDate = picked);
              },
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: _notesController,
              label: 'Renewal Notes / Training Provider',
              hint: 'e.g. Refresher course completed at Saudi Safety Academy',
              maxLines: 2,
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(l10n.t('cancel')),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleRenew,
                  child: _isLoading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(l10n.t('renew')),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

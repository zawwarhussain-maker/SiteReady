import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/certificate_provider.dart';
import '../../models/certificate.dart';
import '../../services/expiry_service.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/document_viewer_modal.dart';
import '../../widgets/confirm_dialog.dart';
import '../../widgets/whatsapp_reminder_tile.dart';
import 'renew_certificate_dialog.dart';

class CertificateDetailScreen extends StatefulWidget {
  final String certificateId;
  const CertificateDetailScreen({super.key, required this.certificateId});

  @override
  State<CertificateDetailScreen> createState() => _CertificateDetailScreenState();
}

class _CertificateDetailScreenState extends State<CertificateDetailScreen> {
  EmployeeCertificate? _certificate;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCertificate();
  }

  void _loadCertificate() {
    final certProvider = context.read<CertificateProvider>();
    try {
      final cert = certProvider.certificates.firstWhere((c) => c.id == widget.certificateId);
      setState(() {
        _certificate = cert;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.t('certificatesTitle'))),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_certificate == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.t('certificatesTitle'))),
        body: Center(child: Text(l10n.t('noRecords'))),
      );
    }

    final cert = _certificate!;
    final expiryDesc = ExpiryService.formatExpiryDescription(
      expiryDate: cert.expiryDate,
      isArabic: l10n.isArabic,
    );

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(cert.certificateType?.name ?? 'Certificate Details'),
        actions: [
          if (auth.canDeleteRecords)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () async {
                final confirm = await ConfirmDialog.show(
                  context: context,
                  title: l10n.t('delete'),
                  message: l10n.t('confirmDelete'),
                );
                if (confirm && mounted) {
                  await context.read<CertificateProvider>().deleteCertificate(cert.id);
                  if (mounted) Navigator.pop(context);
                }
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Banner Card
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      StatusBadge.forCertificate(cert.status, context),
                      Text(
                        expiryDesc,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: cert.status == CertificateStatus.expired
                              ? AppColors.danger
                              : const Color(0xFFD97706),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    cert.certificateType?.name ?? 'Safety Qualification',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Issuing Authority: ${cert.certificateType?.issuingAuthority ?? 'National Safety Council'}',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                  const Divider(height: 24),
                  _InfoRow(label: l10n.t('licenseNumber'), value: cert.licenseNumber),
                  const SizedBox(height: 8),
                  _InfoRow(
                    label: l10n.t('issueDate'),
                    value: cert.issueDate.toIso8601String().substring(0, 10),
                  ),
                  const SizedBox(height: 8),
                  _InfoRow(
                    label: l10n.t('expiryDate'),
                    value: cert.expiryDate != null
                        ? cert.expiryDate!.toIso8601String().substring(0, 10)
                        : l10n.t('noExpiry'),
                  ),
                  if (cert.notes != null && cert.notes!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    _InfoRow(label: 'Notes / Verification', value: cert.notes!),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Worker Card
            if (cert.employee != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.primaryNavy.withOpacity(0.1),
                      child: Text(
                        cert.employee!.fullName.isNotEmpty
                            ? cert.employee!.fullName[0].toUpperCase()
                            : 'W',
                        style: const TextStyle(
                          color: AppColors.primaryNavy,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.isArabic && cert.employee!.fullNameAr != null
                                ? cert.employee!.fullNameAr!
                                : cert.employee!.fullName,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                          ),
                          Text(
                            '${cert.employee!.employeeNo} • ${cert.employee!.jobTitle}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),

            // Action Buttons (Renew & View Attachment)
            if (auth.canManageCertificates)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryTeal,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (_) => RenewCertificateDialog(certificate: cert),
                  ).then((_) => _loadCertificate());
                },
                icon: const Icon(Icons.autorenew, size: 18),
                label: Text(l10n.t('renewCertificate')),
              ),
            const SizedBox(height: 10),

            // Private Document Attachment Viewer Button
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (_) => DocumentViewerModal(
                    attachmentPath: cert.attachmentPath ?? 'comp_01/cert_sample.pdf',
                    attachmentFilename: cert.attachmentFilename ?? '${cert.licenseNumber}.pdf',
                  ),
                );
              },
              icon: const Icon(Icons.lock_outline, size: 18, color: AppColors.primaryNavy),
              label: Text(l10n.t('viewAttachment')),
            ),
            const SizedBox(height: 12),

            // WhatsApp Reminder Button
            if (cert.employee != null &&
                (cert.status == CertificateStatus.expiringSoon ||
                    cert.status == CertificateStatus.expired))
              WhatsappReminderTile(employee: cert.employee!, certificate: cert),

            const SizedBox(height: 20),

            // Renewal History Audit Trail
            if (cert.renewalHistory.isNotEmpty) ...[
              Text(
                l10n.t('renewalHistory'),
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 10),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: cert.renewalHistory.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final item = cert.renewalHistory[index];
                    return ListTile(
                      dense: true,
                      leading: const Icon(Icons.history, color: AppColors.primaryTeal),
                      title: Text(
                        'Renewed until: ${item.newExpiryDate.toIso8601String().substring(0, 10)}',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                      subtitle: Text(
                        'By: ${item.renewedByName ?? 'Manager'} • ${item.renewedAt.toIso8601String().substring(0, 10)}',
                        style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                      ),
                    );
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        Text(
          value,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

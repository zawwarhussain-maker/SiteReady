import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/employee_provider.dart';
import '../../models/employee.dart';
import '../../models/certificate.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/qr_turnstile_dialog.dart';
import '../../widgets/confirm_dialog.dart';
import '../../widgets/whatsapp_reminder_tile.dart';
import '../certificates/certificate_form_screen.dart';
import 'employee_form_screen.dart';

class EmployeeDetailScreen extends StatefulWidget {
  final String employeeId;
  const EmployeeDetailScreen({super.key, required this.employeeId});

  @override
  State<EmployeeDetailScreen> createState() => _EmployeeDetailScreenState();
}

class _EmployeeDetailScreenState extends State<EmployeeDetailScreen> {
  Employee? _employee;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadEmployee();
  }

  Future<void> _loadEmployee() async {
    final empProvider = context.read<EmployeeProvider>();
    setState(() => _isLoading = true);
    final emp = await empProvider.getEmployeeById(widget.employeeId);
    if (mounted) {
      setState(() {
        _employee = emp;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.t('workerDossier'))),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_employee == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.t('workerDossier'))),
        body: Center(child: Text(l10n.t('noRecords'))),
      );
    }

    final emp = _employee!;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(l10n.t('workerDossier')),
        actions: [
          if (auth.canManageEmployees)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => EmployeeFormScreen(employee: emp),
                  ),
                ).then((_) => _loadEmployee());
              },
            ),
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
                  await context.read<EmployeeProvider>().deleteEmployee(emp.id);
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
            // Top Profile Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: AppColors.primaryNavy.withOpacity(0.1),
                    child: Text(
                      emp.fullName.isNotEmpty ? emp.fullName[0].toUpperCase() : 'W',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    l10n.isArabic && emp.fullNameAr != null ? emp.fullNameAr! : emp.fullName,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${emp.employeeNo} • ${emp.jobTitle}',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 12),
                  StatusBadge.forEmployment(emp.employmentStatus, context),
                  const SizedBox(height: 16),

                  // QR Pass Trigger Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryNavy,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (_) => QrTurnstileDialog(employee: emp),
                        );
                      },
                      icon: const Icon(Icons.qr_code, size: 20),
                      label: Text(l10n.t('turnstileQrPass')),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Identity & Site Details Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                children: [
                  _DetailRow(
                    label: l10n.t('iqamaId'),
                    value: emp.iqamaNationalId,
                    icon: Icons.credit_card,
                  ),
                  const Divider(height: 16),
                  _DetailRow(
                    label: l10n.t('nationality'),
                    value: l10n.isArabic && emp.nationalityAr != null
                        ? emp.nationalityAr!
                        : emp.nationality,
                    icon: Icons.flag_outlined,
                  ),
                  const Divider(height: 16),
                  _DetailRow(
                    label: l10n.t('site'),
                    value: emp.site != null
                        ? (l10n.isArabic && emp.site!.nameAr != null
                            ? emp.site!.nameAr!
                            : emp.site!.name)
                        : 'Unassigned Site',
                    icon: Icons.location_on_outlined,
                  ),
                  if (emp.phone != null && emp.phone!.isNotEmpty) ...[
                    const Divider(height: 16),
                    _DetailRow(
                      label: l10n.t('phone'),
                      value: emp.phone!,
                      icon: Icons.phone_outlined,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Certificates Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n.t('workerCertificates'),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                ),
                if (auth.canManageCertificates)
                  TextButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => CertificateFormScreen(preselectedEmployeeId: emp.id),
                        ),
                      ).then((_) => _loadEmployee());
                    },
                    icon: const Icon(Icons.add, size: 16),
                    label: Text(l10n.t('addCert')),
                  ),
              ],
            ),
            const SizedBox(height: 8),

            // Certificates List
            if (emp.certificates.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Center(
                  child: Text(
                    l10n.t('noWorkerCerts'),
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                ),
              )
            else
              ...emp.certificates.map(
                (cert) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
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
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
                          ),
                          StatusBadge.forCertificate(cert.status, context),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'License #: ${cert.licenseNumber}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      if (cert.expiryDate != null)
                        Text(
                          'Expires: ${cert.expiryDate!.toIso8601String().substring(0, 10)}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      if (cert.status == CertificateStatus.expiringSoon ||
                          cert.status == CertificateStatus.expired) ...[
                        const SizedBox(height: 10),
                        WhatsappReminderTile(employee: emp, certificate: cert),
                      ],
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _DetailRow({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 10),
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const Spacer(),
        Text(
          value,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

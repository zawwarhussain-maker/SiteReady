import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../config/constants.dart';
import '../models/employee.dart';
import '../services/qr_turnstile_service.dart';
import '../l10n/app_localizations.dart';

class QrTurnstileDialog extends StatelessWidget {
  final Employee employee;

  const QrTurnstileDialog({super.key, required this.employee});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final evaluation = QrTurnstileService.evaluateWorkerClearance(employee);
    final qrPayload = QrTurnstileService.generateWorkerTurnstilePayload(employee);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.qr_code_scanner, color: AppColors.primaryTeal, size: 24),
                    const SizedBox(width: 8),
                    Text(
                      l10n.t('turnstileQrPass'),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const Divider(height: 24),

            // Clearance Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: evaluation.isCleared
                    ? const Color(0xFFE6F4F1)
                    : const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: evaluation.isCleared ? AppColors.primaryTeal : AppColors.danger,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    evaluation.isCleared ? Icons.check_circle : Icons.dangerous,
                    color: evaluation.isCleared ? AppColors.primaryTeal : AppColors.danger,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    evaluation.isCleared ? l10n.t('gateCleared') : l10n.t('gateBarred'),
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                      color: evaluation.isCleared ? AppColors.primaryTeal : AppColors.danger,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // QR Code
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: QrImageView(
                data: qrPayload,
                version: QrVersions.auto,
                size: 180.0,
                backgroundColor: Colors.white,
                eyeStyle: const QrEyeStyle(
                  eyeShape: QrEyeShape.square,
                  color: AppColors.primaryNavy,
                ),
                dataModuleStyle: const QrDataModuleStyle(
                  dataModuleShape: QrDataModuleShape.square,
                  color: AppColors.primaryNavy,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Employee Details
            Text(
              l10n.isArabic && employee.fullNameAr != null
                  ? employee.fullNameAr!
                  : employee.fullName,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            Text(
              '${employee.employeeNo} • ${employee.jobTitle}',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            Text(
              'Iqama / ID: ${employee.iqamaNationalId}',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),

            // Verification Reason
            Text(
              l10n.isArabic ? evaluation.reasonAr : evaluation.reason,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: evaluation.isCleared ? AppColors.primaryTeal : AppColors.danger,
              ),
            ),
            const SizedBox(height: 12),

            // Disclaimer
            Text(
              l10n.t('qrDisclaimer'),
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}

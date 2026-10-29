import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../models/certificate.dart';
import '../models/employee.dart';
import '../models/inspection.dart';
import '../models/corrective_action.dart';
import '../l10n/app_localizations.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color textColor;
  final IconData? icon;

  const StatusBadge({
    super.key,
    required this.label,
    required this.backgroundColor,
    required this.textColor,
    this.icon,
  });

  factory StatusBadge.forCertificate(CertificateStatus status, BuildContext context) {
    switch (status) {
      case CertificateStatus.valid:
        return StatusBadge(
          label: context.tr('statusValid'),
          backgroundColor: const Color(0xFFE6F4F1),
          textColor: AppColors.primaryTeal,
          icon: Icons.check_circle_outline,
        );
      case CertificateStatus.expiringSoon:
        return StatusBadge(
          label: context.tr('statusExpiring'),
          backgroundColor: const Color(0xFFFEF3C7),
          textColor: AppColors.amberDark,
          icon: Icons.access_time,
        );
      case CertificateStatus.expired:
        return StatusBadge(
          label: context.tr('statusExpired'),
          backgroundColor: const Color(0xFFFEE2E2),
          textColor: AppColors.danger,
          icon: Icons.warning_amber_rounded,
        );
      case CertificateStatus.missing:
        return StatusBadge(
          label: context.tr('statusMissing'),
          backgroundColor: const Color(0xFFF1F5F9),
          textColor: AppColors.textSecondary,
          icon: Icons.help_outline,
        );
      case CertificateStatus.noExpiry:
        return StatusBadge(
          label: context.tr('noExpiry'),
          backgroundColor: const Color(0xFFE2E8F0),
          textColor: AppColors.textPrimary,
          icon: Icons.all_inclusive,
        );
    }
  }

  factory StatusBadge.forEmployment(EmploymentStatus status, BuildContext context) {
    switch (status) {
      case EmploymentStatus.active:
        return StatusBadge(
          label: context.tr('statusActive'),
          backgroundColor: const Color(0xFFE6F4F1),
          textColor: AppColors.primaryTeal,
          icon: Icons.fiber_manual_record,
        );
      case EmploymentStatus.suspended:
        return StatusBadge(
          label: context.tr('statusSuspended'),
          backgroundColor: const Color(0xFFFEE2E2),
          textColor: AppColors.danger,
          icon: Icons.pause_circle_outline,
        );
      case EmploymentStatus.terminated:
        return StatusBadge(
          label: context.tr('statusTerminated'),
          backgroundColor: const Color(0xFFF1F5F9),
          textColor: AppColors.textSecondary,
          icon: Icons.cancel_outlined,
        );
      case EmploymentStatus.onLeave:
        return StatusBadge(
          label: context.tr('statusOnLeave'),
          backgroundColor: const Color(0xFFFEF3C7),
          textColor: AppColors.amberDark,
          icon: Icons.beach_access,
        );
    }
  }

  factory StatusBadge.forInspection(InspectionStatus status, BuildContext context) {
    switch (status) {
      case InspectionStatus.completedPass:
        return StatusBadge(
          label: context.tr('statusPass'),
          backgroundColor: const Color(0xFFE6F4F1),
          textColor: AppColors.primaryTeal,
          icon: Icons.verified_outlined,
        );
      case InspectionStatus.completedFail:
        return StatusBadge(
          label: context.tr('statusFail'),
          backgroundColor: const Color(0xFFFEE2E2),
          textColor: AppColors.danger,
          icon: Icons.gpp_bad_outlined,
        );
      case InspectionStatus.inProgress:
        return StatusBadge(
          label: context.tr('statusInProgress'),
          backgroundColor: const Color(0xFFEFF6FF),
          textColor: AppColors.infoBlue,
          icon: Icons.pending_outlined,
        );
      case InspectionStatus.draft:
        return StatusBadge(
          label: context.tr('statusDraft'),
          backgroundColor: const Color(0xFFF1F5F9),
          textColor: AppColors.textSecondary,
          icon: Icons.edit_note,
        );
      case InspectionStatus.cancelled:
        return StatusBadge(
          label: context.tr('statusCancelled'),
          backgroundColor: const Color(0xFFF1F5F9),
          textColor: AppColors.textSecondary,
          icon: Icons.cancel_outlined,
        );
    }
  }

  factory StatusBadge.forAction(ActionStatus status, BuildContext context) {
    switch (status) {
      case ActionStatus.open:
        return StatusBadge(
          label: context.tr('actionOpen'),
          backgroundColor: const Color(0xFFFEE2E2),
          textColor: AppColors.danger,
          icon: Icons.error_outline,
        );
      case ActionStatus.inProgress:
        return StatusBadge(
          label: context.tr('actionInProgress'),
          backgroundColor: const Color(0xFFFEF3C7),
          textColor: AppColors.amberDark,
          icon: Icons.hourglass_top,
        );
      case ActionStatus.resolved:
      case ActionStatus.verifiedClosed:
        return StatusBadge(
          label: context.tr('actionResolved'),
          backgroundColor: const Color(0xFFE6F4F1),
          textColor: AppColors.primaryTeal,
          icon: Icons.check_circle_outline,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}

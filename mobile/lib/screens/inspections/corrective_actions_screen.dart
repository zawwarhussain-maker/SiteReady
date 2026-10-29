import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/inspection_provider.dart';
import '../../models/corrective_action.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/empty_state.dart';
import 'resolve_action_dialog.dart';

class CorrectiveActionsScreen extends StatefulWidget {
  const CorrectiveActionsScreen({super.key});

  @override
  State<CorrectiveActionsScreen> createState() => _CorrectiveActionsScreenState();
}

class _CorrectiveActionsScreenState extends State<CorrectiveActionsScreen> {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<InspectionProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(l10n.t('capaTitle')),
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.correctiveActions.isEmpty
              ? EmptyState(
                  icon: Icons.check_circle_outline,
                  title: 'Zero Open Violations',
                  subtitle: 'No corrective actions are pending resolution.',
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: provider.correctiveActions.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final action = provider.correctiveActions[index];
                    final isResolved = action.status == ActionStatus.resolved ||
                        action.status == ActionStatus.verifiedClosed;

                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceWhite,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: action.isOverdue
                              ? AppColors.danger.withOpacity(0.4)
                              : AppColors.borderLight,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: action.priority == ActionPriority.critical ||
                                          action.priority == ActionPriority.high
                                      ? AppColors.danger.withOpacity(0.12)
                                      : const Color(0xFFFEF3C7),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  action.priority.name.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: action.priority == ActionPriority.critical ||
                                            action.priority == ActionPriority.high
                                        ? AppColors.danger
                                        : AppColors.amberDark,
                                  ),
                                ),
                              ),
                              StatusBadge.forAction(action.status, context),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            l10n.isArabic && action.titleAr != null ? action.titleAr! : action.title,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                          ),
                          if (action.description != null && action.description!.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              action.description!,
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    action.isOverdue ? Icons.error : Icons.calendar_today,
                                    size: 13,
                                    color: action.isOverdue ? AppColors.danger : AppColors.textSecondary,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Due: ${action.dueDate.toIso8601String().substring(0, 10)}${action.isOverdue ? ' (OVERDUE)' : ''}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: action.isOverdue ? FontWeight.w700 : FontWeight.w500,
                                      color: action.isOverdue ? AppColors.danger : AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                              if (!isResolved && auth.canManageInspections)
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primaryTeal,
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  ),
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (_) => ResolveActionDialog(action: action),
                                    );
                                  },
                                  child: Text(
                                    l10n.t('actionResolve'),
                                    style: const TextStyle(fontSize: 11),
                                  ),
                                ),
                            ],
                          ),
                          if (isResolved && action.resolutionNotes != null) ...[
                            const Divider(height: 16),
                            Text(
                              'Resolution: ${action.resolutionNotes}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.primaryTeal,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}

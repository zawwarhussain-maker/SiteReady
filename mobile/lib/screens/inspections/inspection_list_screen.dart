import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/inspection_provider.dart';
import '../../models/inspection.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/empty_state.dart';
import 'schedule_inspection_dialog.dart';
import 'inspection_execution_screen.dart';
import 'corrective_actions_screen.dart';

class InspectionListScreen extends StatefulWidget {
  const InspectionListScreen({super.key});

  @override
  State<InspectionListScreen> createState() => _InspectionListScreenState();
}

class _InspectionListScreenState extends State<InspectionListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInspections();
    });
  }

  void _loadInspections() {
    final auth = context.read<AuthProvider>();
    context.read<InspectionProvider>().fetchInspections(
          siteId: auth.selectedSiteId != 'all' ? auth.selectedSiteId : null,
        );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<InspectionProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: Column(
        children: [
          // Top Action Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: AppColors.surfaceWhite,
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CorrectiveActionsScreen()),
                      );
                    },
                    icon: const Icon(Icons.build_circle_outlined, size: 18, color: AppColors.primaryNavy),
                    label: Text(
                      '${l10n.t('capaTitle')} (${provider.openActions.length})',
                      style: const TextStyle(fontSize: 12),
                    ),
                  ),
                ),
                if (auth.canManageInspections) ...[
                  const SizedBox(width: 10),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryTeal,
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                    ),
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (_) => const ScheduleInspectionDialog(),
                      ).then((_) => _loadInspections());
                    },
                    icon: const Icon(Icons.add, size: 18),
                    label: Text(l10n.t('newInspection'), style: const TextStyle(fontSize: 12)),
                  ),
                ],
              ],
            ),
          ),

          // Inspections List
          Expanded(
            child: provider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : provider.inspections.isEmpty
                    ? EmptyState(
                        icon: Icons.fact_check_outlined,
                        title: l10n.t('noRecords'),
                        subtitle: 'No safety inspections or audits recorded.',
                        actionLabel: auth.canManageInspections ? l10n.t('newInspection') : null,
                        onAction: auth.canManageInspections
                            ? () {
                                showDialog(
                                  context: context,
                                  builder: (_) => const ScheduleInspectionDialog(),
                                ).then((_) => _loadInspections());
                              }
                            : null,
                      )
                    : RefreshIndicator(
                        onRefresh: () async => _loadInspections(),
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: provider.inspections.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final insp = provider.inspections[index];
                            return _InspectionCard(
                              inspection: insp,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        InspectionExecutionScreen(inspectionId: insp.id),
                                  ),
                                ).then((_) => _loadInspections());
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _InspectionCard extends StatelessWidget {
  final Inspection inspection;
  final VoidCallback onTap;

  const _InspectionCard({required this.inspection, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return InkWell(
      onTap: onTap,
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
                    l10n.isArabic && inspection.titleAr != null
                        ? inspection.titleAr!
                        : inspection.title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                StatusBadge.forInspection(inspection.status, context),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Type: ${inspection.inspectionType} • Site: ${inspection.site?.name ?? 'Assigned Site'}',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.event, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      inspection.scheduledDate.toIso8601String().substring(0, 10),
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                if (inspection.items.isNotEmpty)
                  Text(
                    'Score: ${inspection.scorePercentage.toStringAsFixed(0)}% (${inspection.passCount} Pass / ${inspection.failCount} Fail)',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: inspection.failCount > 0 ? AppColors.danger : AppColors.primaryTeal,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

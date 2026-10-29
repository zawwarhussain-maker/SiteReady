import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/inspection_provider.dart';
import '../../models/inspection.dart';
import '../../models/inspection_item.dart';
import '../../widgets/status_badge.dart';

class InspectionExecutionScreen extends StatefulWidget {
  final String inspectionId;
  const InspectionExecutionScreen({super.key, required this.inspectionId});

  @override
  State<InspectionExecutionScreen> createState() => _InspectionExecutionScreenState();
}

class _InspectionExecutionScreenState extends State<InspectionExecutionScreen> {
  Inspection? _inspection;
  List<InspectionItem> _items = [];
  final _summaryNotesController = TextEditingController();
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadInspection();
  }

  void _loadInspection() {
    final provider = context.read<InspectionProvider>();
    try {
      final insp = provider.inspections.firstWhere((i) => i.id == widget.inspectionId);
      setState(() {
        _inspection = insp;
        _items = List.from(insp.items);
        _summaryNotesController.text = insp.summaryNotes ?? '';
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _summaryNotesController.dispose();
    super.dispose();
  }

  void _updateCheckpointResult(int index, CheckpointResult result) {
    setState(() {
      _items[index] = _items[index].copyWith(result: result);
    });
  }

  void _updateCheckpointNotes(int index, String notes) {
    setState(() {
      _items[index] = _items[index].copyWith(notes: notes);
    });
  }

  Future<void> _handleSaveDraft() async {
    if (_inspection == null) return;
    setState(() => _isSaving = true);

    final provider = context.read<InspectionProvider>();
    final success = await provider.saveDraftInspection(
      inspection: _inspection!,
      items: _items,
    );

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Inspection checkpoints saved as draft.')),
      );
    }
  }

  Future<void> _handleComplete() async {
    if (_inspection == null) return;
    setState(() => _isSaving = true);

    final provider = context.read<InspectionProvider>();
    final success = await provider.completeInspection(
      inspection: _inspection!,
      items: _items,
      summaryNotes: _summaryNotesController.text.trim(),
      signaturePath: 'sig_${DateTime.now().millisecondsSinceEpoch}.png',
    );

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (success) {
      _loadInspection();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Audit signed off. Corrective action tickets generated for failures.'),
          backgroundColor: AppColors.primaryNavy,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.t('inspectionsTitle'))),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_inspection == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.t('inspectionsTitle'))),
        body: Center(child: Text(l10n.t('noRecords'))),
      );
    }

    final insp = _inspection!;
    final isCompleted = insp.status == InspectionStatus.completedPass ||
        insp.status == InspectionStatus.completedFail;

    final passCount = _items.where((i) => i.result == CheckpointResult.pass).length;
    final failCount = _items.where((i) => i.result == CheckpointResult.fail).length;
    final naCount = _items.where((i) => i.result == CheckpointResult.na).length;
    final evaluated = passCount + failCount;
    final score = evaluated > 0 ? (passCount / evaluated) * 100 : 0.0;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(l10n.isArabic && insp.titleAr != null ? insp.titleAr! : insp.title),
        actions: [
          StatusBadge.forInspection(insp.status, context),
          const SizedBox(width: 12),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Score Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: failCount > 0
                          ? const Color(0xFFFEE2E2)
                          : const Color(0xFFE6F4F1),
                    ),
                    child: Center(
                      child: Text(
                        '${score.toStringAsFixed(0)}%',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: failCount > 0 ? AppColors.danger : AppColors.primaryTeal,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          insp.title,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Site: ${insp.site?.name ?? 'Assigned Site'} • Date: ${insp.scheduledDate.toIso8601String().substring(0, 10)}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            _ScoreBadge(label: '$passCount Pass', color: AppColors.primaryTeal),
                            const SizedBox(width: 6),
                            _ScoreBadge(label: '$failCount Fail', color: AppColors.danger),
                            const SizedBox(width: 6),
                            _ScoreBadge(label: '$naCount N/A', color: AppColors.textSecondary),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Checkpoints Header
            Text(
              l10n.t('checklistHeading'),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),

            // Checkpoints List
            ...List.generate(_items.length, (index) {
              final item = _items[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: item.result == CheckpointResult.fail
                        ? AppColors.danger.withOpacity(0.4)
                        : AppColors.borderLight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primaryNavy.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            item.category,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryNavy,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.isArabic && item.itemTextAr != null ? item.itemTextAr! : item.itemText,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 12),

                    // 3-Way Result Toggle
                    Row(
                      children: [
                        _ResultButton(
                          label: l10n.t('checkpointPass'),
                          isSelected: item.result == CheckpointResult.pass,
                          color: AppColors.primaryTeal,
                          onTap: isCompleted ? null : () => _updateCheckpointResult(index, CheckpointResult.pass),
                        ),
                        const SizedBox(width: 8),
                        _ResultButton(
                          label: l10n.t('checkpointFail'),
                          isSelected: item.result == CheckpointResult.fail,
                          color: AppColors.danger,
                          onTap: isCompleted ? null : () => _updateCheckpointResult(index, CheckpointResult.fail),
                        ),
                        const SizedBox(width: 8),
                        _ResultButton(
                          label: l10n.t('checkpointNA'),
                          isSelected: item.result == CheckpointResult.na,
                          color: AppColors.textSecondary,
                          onTap: isCompleted ? null : () => _updateCheckpointResult(index, CheckpointResult.na),
                        ),
                      ],
                    ),

                    if (item.result == CheckpointResult.fail || (item.notes != null && item.notes!.isNotEmpty)) ...[
                      const SizedBox(height: 10),
                      TextField(
                        controller: TextEditingController(text: item.notes)
                          ..selection = TextSelection.collapsed(offset: (item.notes ?? '').length),
                        onChanged: (val) => _updateCheckpointNotes(index, val),
                        enabled: !isCompleted,
                        decoration: InputDecoration(
                          hintText: 'Describe safety observation / corrective requirement...',
                          hintStyle: const TextStyle(fontSize: 12),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          filled: true,
                          fillColor: AppColors.scaffoldBackground,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              );
            }),

            const SizedBox(height: 12),

            // Supervisor Summary Notes
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.t('findings'),
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _summaryNotesController,
                    maxLines: 3,
                    enabled: !isCompleted,
                    decoration: InputDecoration(
                      hintText: 'Enter field safety inspector summary and observations...',
                      contentPadding: const EdgeInsets.all(12),
                      filled: true,
                      fillColor: AppColors.scaffoldBackground,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Action Buttons
            if (!isCompleted && auth.canManageInspections) ...[
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _isSaving ? null : _handleSaveDraft,
                      child: Text(l10n.t('saveDraft')),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryNavy),
                      onPressed: _isSaving ? null : _handleComplete,
                      child: _isSaving
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Text(l10n.t('completeInspection')),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ScoreBadge extends StatelessWidget {
  final String label;
  final Color color;

  const _ScoreBadge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700),
      ),
    );
  }
}

class _ResultButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final Color color;
  final VoidCallback? onTap;

  const _ResultButton({
    required this.label,
    required this.isSelected,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? color : color.withOpacity(0.08),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? color : color.withOpacity(0.2),
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: isSelected ? Colors.white : color,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

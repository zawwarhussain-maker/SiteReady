import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/inspection_provider.dart';
import '../../models/corrective_action.dart';
import '../../widgets/app_text_field.dart';

class ResolveActionDialog extends StatefulWidget {
  final CorrectiveAction action;
  const ResolveActionDialog({super.key, required this.action});

  @override
  State<ResolveActionDialog> createState() => _ResolveActionDialogState();
}

class _ResolveActionDialogState extends State<ResolveActionDialog> {
  final _notesController = TextEditingController(text: 'Damaged item replaced with certified unit and signed off.');
  bool _isLoading = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleResolve() async {
    if (_notesController.text.trim().isEmpty) return;
    setState(() => _isLoading = true);

    final success = await context.read<InspectionProvider>().resolveAction(
          actionId: widget.action.id,
          resolutionNotes: _notesController.text.trim(),
        );

    if (!mounted) return;

    if (success) {
      Navigator.pop(context, true);
    } else {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to resolve corrective action')),
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
                const Icon(Icons.check_circle_outline, color: AppColors.primaryTeal, size: 24),
                const SizedBox(width: 8),
                Text(
                  l10n.t('actionResolve'),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const Divider(height: 24),
            Text(
              'Action: ${widget.action.title}',
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            ),
            const SizedBox(height: 14),
            AppTextField(
              controller: _notesController,
              label: l10n.t('resolutionNotes'),
              hint: 'Describe actions taken to rectify the violation...',
              maxLines: 3,
              validator: (val) => val == null || val.trim().isEmpty ? l10n.t('requiredField') : null,
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
                  onPressed: _isLoading ? null : _handleResolve,
                  child: _isLoading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(l10n.t('submit')),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

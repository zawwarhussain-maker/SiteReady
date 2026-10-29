import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/inspection_provider.dart';
import '../../widgets/app_text_field.dart';

class ScheduleInspectionDialog extends StatefulWidget {
  const ScheduleInspectionDialog({super.key});

  @override
  State<ScheduleInspectionDialog> createState() => _ScheduleInspectionDialogState();
}

class _ScheduleInspectionDialogState extends State<ScheduleInspectionDialog> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController(text: 'Routine Weekly Safety & PPE Audit');
  final _titleArController = TextEditingController(text: 'التفتيش الدوري الأسبوعي للسلامة ومهمات الوقاية');
  String _inspectionType = 'General Safety';
  String? _selectedSiteId;
  DateTime _scheduledDate = DateTime.now();
  bool _isLoading = false;

  final List<String> _types = [
    'General Safety',
    'Scaffolding & Working at Heights',
    'Electrical & Temporary Power',
    'Lifting & Rigging Operations',
    'Fire Safety & Emergency Preparedness',
    'Excavation & Trenching',
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _titleArController.dispose();
    super.dispose();
  }

  Future<void> _handleSchedule() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();

    final siteId = _selectedSiteId ?? (auth.sites.isNotEmpty ? auth.sites.first.id : 'site_01');
    setState(() => _isLoading = true);

    final success = await context.read<InspectionProvider>().createInspection(
          siteId: siteId,
          title: _titleController.text.trim(),
          titleAr: _titleArController.text.trim().isNotEmpty ? _titleArController.text.trim() : null,
          inspectionType: _inspectionType,
          scheduledDate: _scheduledDate,
        );

    if (!mounted) return;

    if (success) {
      Navigator.pop(context, true);
    } else {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to schedule inspection')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  const Icon(Icons.fact_check, color: AppColors.primaryTeal, size: 24),
                  const SizedBox(width: 8),
                  Text(
                    l10n.t('newInspectionTitle'),
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              const Divider(height: 24),
              AppTextField(
                controller: _titleController,
                label: 'Inspection Title (English)',
                validator: (val) => val == null || val.trim().isEmpty ? l10n.t('requiredField') : null,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _titleArController,
                label: 'Inspection Title (Arabic) / عنوان التفتيش',
              ),
              const SizedBox(height: 12),
              // Site Selector
              Text(
                l10n.t('site'),
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedSiteId ?? (auth.sites.isNotEmpty ? auth.sites.first.id : null),
                    hint: const Text('Select Project Site'),
                    onChanged: (val) => setState(() => _selectedSiteId = val),
                    items: auth.sites
                        .map((s) => DropdownMenuItem(
                              value: s.id,
                              child: Text(
                                l10n.isArabic && s.nameAr != null ? s.nameAr! : s.name,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ))
                        .toList(),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Category Selector
              Text(
                l10n.t('inspectionType'),
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _inspectionType,
                    onChanged: (val) {
                      if (val != null) setState(() => _inspectionType = val);
                    },
                    items: _types
                        .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                        .toList(),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(l10n.t('scheduledDate'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                subtitle: Text(_scheduledDate.toIso8601String().substring(0, 10)),
                trailing: const Icon(Icons.calendar_today, size: 20),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _scheduledDate,
                    firstDate: DateTime.now().subtract(const Duration(days: 30)),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) setState(() => _scheduledDate = picked);
                },
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
                    onPressed: _isLoading ? null : _handleSchedule,
                    child: _isLoading
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(l10n.t('create')),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

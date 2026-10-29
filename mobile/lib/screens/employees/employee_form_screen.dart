import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/employee_provider.dart';
import '../../models/employee.dart';
import '../../widgets/app_text_field.dart';

class EmployeeFormScreen extends StatefulWidget {
  final Employee? employee;
  const EmployeeFormScreen({super.key, this.employee});

  @override
  State<EmployeeFormScreen> createState() => _EmployeeFormScreenState();
}

class _EmployeeFormScreenState extends State<EmployeeFormScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _empNoController;
  late TextEditingController _fullNameController;
  late TextEditingController _fullNameArController;
  late TextEditingController _iqamaController;
  late TextEditingController _jobTitleController;
  late TextEditingController _jobTitleArController;
  late TextEditingController _nationalityController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;

  String? _selectedSiteId;
  EmploymentStatus _status = EmploymentStatus.active;
  String? _errorMessage;

  bool get isEditing => widget.employee != null;

  @override
  void initState() {
    super.initState();
    final emp = widget.employee;
    _empNoController = TextEditingController(text: emp?.employeeNo ?? 'RW-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}');
    _fullNameController = TextEditingController(text: emp?.fullName ?? '');
    _fullNameArController = TextEditingController(text: emp?.fullNameAr ?? '');
    _iqamaController = TextEditingController(text: emp?.iqamaNationalId ?? '');
    _jobTitleController = TextEditingController(text: emp?.jobTitle ?? '');
    _jobTitleArController = TextEditingController(text: emp?.jobTitleAr ?? '');
    _nationalityController = TextEditingController(text: emp?.nationality ?? 'Saudi Arabia');
    _phoneController = TextEditingController(text: emp?.phone ?? '+9665');
    _emailController = TextEditingController(text: emp?.email ?? '');
    _selectedSiteId = emp?.siteId;
    if (emp != null) _status = emp.employmentStatus;
  }

  @override
  void dispose() {
    _empNoController.dispose();
    _fullNameController.dispose();
    _fullNameArController.dispose();
    _iqamaController.dispose();
    _jobTitleController.dispose();
    _jobTitleArController.dispose();
    _nationalityController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _errorMessage = null);

    final provider = context.read<EmployeeProvider>();
    bool success;

    if (isEditing) {
      final updated = widget.employee!.copyWith(
        employeeNo: _empNoController.text.trim(),
        fullName: _fullNameController.text.trim(),
        fullNameAr: _fullNameArController.text.trim().isNotEmpty ? _fullNameArController.text.trim() : null,
        iqamaNationalId: _iqamaController.text.trim(),
        jobTitle: _jobTitleController.text.trim(),
        jobTitleAr: _jobTitleArController.text.trim().isNotEmpty ? _jobTitleArController.text.trim() : null,
        nationality: _nationalityController.text.trim(),
        phone: _phoneController.text.trim(),
        email: _emailController.text.trim(),
        siteId: _selectedSiteId,
        employmentStatus: _status,
      );
      success = await provider.updateEmployee(updated);
    } else {
      success = await provider.createEmployee(
        employeeNo: _empNoController.text.trim(),
        fullName: _fullNameController.text.trim(),
        fullNameAr: _fullNameArController.text.trim().isNotEmpty ? _fullNameArController.text.trim() : null,
        iqamaNationalId: _iqamaController.text.trim(),
        jobTitle: _jobTitleController.text.trim(),
        jobTitleAr: _jobTitleArController.text.trim().isNotEmpty ? _jobTitleArController.text.trim() : null,
        nationality: _nationalityController.text.trim(),
        phone: _phoneController.text.trim(),
        email: _emailController.text.trim(),
        siteId: _selectedSiteId,
        status: _status,
      );
    }

    if (!mounted) return;

    if (success) {
      Navigator.pop(context);
    } else {
      setState(() {
        _errorMessage = provider.errorMessage ?? 'Failed to save worker record';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<EmployeeProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(isEditing ? l10n.t('editEmployee') : l10n.t('addEmployee')),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: AppColors.danger, fontSize: 13),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              AppTextField(
                controller: _empNoController,
                label: l10n.t('employeeNo'),
                validator: (val) => val == null || val.trim().isEmpty ? l10n.t('requiredField') : null,
              ),
              const SizedBox(height: 14),
              AppTextField(
                controller: _fullNameController,
                label: l10n.t('fullName'),
                hint: 'e.g. Tariq Al-Ghamdi',
                validator: (val) => val == null || val.trim().isEmpty ? l10n.t('requiredField') : null,
              ),
              const SizedBox(height: 14),
              AppTextField(
                controller: _fullNameArController,
                label: l10n.t('fullNameAr'),
                hint: 'مثال: طارق الغامدي',
              ),
              const SizedBox(height: 14),
              // Saudi Iqama / National ID with Regex validation
              AppTextField(
                controller: _iqamaController,
                label: l10n.t('iqamaId'),
                hint: '10 digits starting with 1 or 2',
                keyboardType: TextInputType.number,
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return l10n.t('requiredField');
                  if (!AppConstants.saudiIdRegex.hasMatch(val.trim())) {
                    return l10n.t('iqamaInvalid');
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
              AppTextField(
                controller: _jobTitleController,
                label: l10n.t('jobTitle'),
                hint: 'e.g. Scaffolding Inspector',
                validator: (val) => val == null || val.trim().isEmpty ? l10n.t('requiredField') : null,
              ),
              const SizedBox(height: 14),
              AppTextField(
                controller: _jobTitleArController,
                label: 'Job Title (Arabic) / المسمى المهني',
                hint: 'مثال: فاحص سقالات',
              ),
              const SizedBox(height: 14),
              AppTextField(
                controller: _nationalityController,
                label: l10n.t('nationality'),
                hint: 'e.g. Saudi Arabia, Egypt, India',
              ),
              const SizedBox(height: 14),
              AppTextField(
                controller: _phoneController,
                label: l10n.t('phone'),
                hint: '+9665xxxxxxxx',
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 14),
              // Site Dropdown
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
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
                        value: _selectedSiteId,
                        hint: Text(l10n.t('allSites')),
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
                ],
              ),
              const SizedBox(height: 14),
              // Status Dropdown
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.t('employmentStatus'),
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
                      child: DropdownButton<EmploymentStatus>(
                        isExpanded: true,
                        value: _status,
                        onChanged: (val) {
                          if (val != null) setState(() => _status = val);
                        },
                        items: EmploymentStatus.values
                            .map((st) => DropdownMenuItem(
                                  value: st,
                                  child: Text(st.name.toUpperCase()),
                                ))
                            .toList(),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: provider.isLoading ? null : _handleSubmit,
                child: provider.isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(l10n.t('save')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/employee_provider.dart';
import '../../providers/certificate_provider.dart';
import '../../services/storage_service.dart';
import '../../widgets/app_text_field.dart';

class CertificateFormScreen extends StatefulWidget {
  final String? preselectedEmployeeId;
  const CertificateFormScreen({super.key, this.preselectedEmployeeId});

  @override
  State<CertificateFormScreen> createState() => _CertificateFormScreenState();
}

class _CertificateFormScreenState extends State<CertificateFormScreen> {
  final _formKey = GlobalKey<FormState>();

  String? _selectedEmployeeId;
  String? _selectedTypeId;
  final _licenseController = TextEditingController();
  final _notesController = TextEditingController();

  DateTime _issueDate = DateTime.now();
  DateTime? _expiryDate = DateTime.now().add(const Duration(days: 365));
  bool _noExpiry = false;

  PlatformFile? _pickedFile;
  bool _isUploadingFile = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _selectedEmployeeId = widget.preselectedEmployeeId;
  }

  @override
  void dispose() {
    _licenseController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickAttachment() async {
    final file = await StorageService.pickDocument();
    if (file != null) {
      setState(() {
        _pickedFile = file;
      });
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedEmployeeId == null) {
      setState(() => _errorMessage = 'Please select a workforce employee');
      return;
    }
    if (_selectedTypeId == null) {
      setState(() => _errorMessage = 'Please select a certificate type');
      return;
    }

    setState(() {
      _errorMessage = null;
      _isUploadingFile = true;
    });

    final auth = context.read<AuthProvider>();
    final certProvider = context.read<CertificateProvider>();

    String? attachmentPath;
    String? attachmentFilename;

    if (_pickedFile != null) {
      final uploadRes = await StorageService.uploadDocument(
        companyId: auth.company?.id ?? 'comp_01',
        folder: 'certificates',
        file: _pickedFile!,
      );
      attachmentPath = uploadRes.path;
      attachmentFilename = uploadRes.filename;
    }

    final success = await certProvider.createCertificate(
      employeeId: _selectedEmployeeId!,
      certificateTypeId: _selectedTypeId!,
      licenseNumber: _licenseController.text.trim(),
      issueDate: _issueDate,
      expiryDate: _noExpiry ? null : _expiryDate,
      attachmentPath: attachmentPath,
      attachmentFilename: attachmentFilename,
      notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
    );

    if (!mounted) return;

    if (success) {
      Navigator.pop(context);
    } else {
      setState(() {
        _isUploadingFile = false;
        _errorMessage = certProvider.errorMessage ?? 'Failed to register certificate';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final empProvider = context.watch<EmployeeProvider>();
    final certProvider = context.watch<CertificateProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(l10n.t('addCertificate')),
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

              // Employee Dropdown
              Text(
                l10n.t('navEmployees'),
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
                    value: _selectedEmployeeId,
                    hint: const Text('Select Worker'),
                    onChanged: (val) => setState(() => _selectedEmployeeId = val),
                    items: empProvider.employees
                        .map((e) => DropdownMenuItem(
                              value: e.id,
                              child: Text(
                                '${e.fullName} (${e.employeeNo})',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ))
                        .toList(),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Certificate Type Dropdown
              Text(
                l10n.t('certificateType'),
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
                    value: _selectedTypeId,
                    hint: const Text('Select Qualification / License'),
                    onChanged: (val) => setState(() => _selectedTypeId = val),
                    items: certProvider.certificateTypes
                        .map((ct) => DropdownMenuItem(
                              value: ct.id,
                              child: Text(
                                ct.name,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ))
                        .toList(),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // License #
              AppTextField(
                controller: _licenseController,
                label: l10n.t('licenseNumber'),
                hint: 'e.g. OSHA-30-9981 or SA-SCAF-4401',
                validator: (val) => val == null || val.trim().isEmpty ? l10n.t('requiredField') : null,
              ),
              const SizedBox(height: 14),

              // Issue Date Picker
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(l10n.t('issueDate'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                subtitle: Text(_issueDate.toIso8601String().substring(0, 10)),
                trailing: const Icon(Icons.calendar_today, size: 20),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _issueDate,
                    firstDate: DateTime(2000),
                    lastDate: DateTime.now(),
                  );
                  if (picked != null) setState(() => _issueDate = picked);
                },
              ),
              const Divider(height: 14),

              // Expiry Checkbox & Picker
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(l10n.t('noExpiry'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                value: _noExpiry,
                onChanged: (val) => setState(() => _noExpiry = val),
              ),

              if (!_noExpiry) ...[
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(l10n.t('expiryDate'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  subtitle: Text(_expiryDate?.toIso8601String().substring(0, 10) ?? 'Select date'),
                  trailing: const Icon(Icons.event, size: 20),
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _expiryDate ?? DateTime.now().add(const Duration(days: 365)),
                      firstDate: DateTime.now().subtract(const Duration(days: 365)),
                      lastDate: DateTime.now().add(const Duration(days: 3650)),
                    );
                    if (picked != null) setState(() => _expiryDate = picked);
                  },
                ),
                const Divider(height: 14),
              ],

              // Document Attachment Picker
              Text(
                l10n.t('attachment'),
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.attach_file, color: AppColors.primaryTeal),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _pickedFile != null
                            ? _pickedFile!.name
                            : 'No document attached (Optional PDF / JPG)',
                        style: TextStyle(
                          fontSize: 13,
                          color: _pickedFile != null ? AppColors.textPrimary : AppColors.textSecondary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    TextButton(
                      onPressed: _pickAttachment,
                      child: Text(_pickedFile != null ? 'Change' : 'Pick File'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              AppTextField(
                controller: _notesController,
                label: 'Notes / Verifying Officer',
                hint: 'e.g. Scanned copy verified against Aramco portal',
                maxLines: 2,
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: _isUploadingFile ? null : _handleSubmit,
                child: _isUploadingFile
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

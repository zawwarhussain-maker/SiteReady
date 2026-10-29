import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/bottom_nav_scaffold.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController(text: 'Al-Fanar Construction Co.');
  final _nameArController = TextEditingController(text: 'شركة الفنار للمقاولات العامة');
  final _crController = TextEditingController(text: '1010987654');
  final _siteController = TextEditingController(text: 'Diriyah Gate Infrastructure Site');
  String _defaultLang = 'ar';
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _nameArController.dispose();
    _crController.dispose();
    _siteController.dispose();
    super.dispose();
  }

  Future<void> _handleOnboarding() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _errorMessage = null);

    final auth = context.read<AuthProvider>();
    final locale = context.read<LocaleProvider>();

    try {
      await auth.onboardCompany(
        name: _nameController.text.trim(),
        nameAr: _nameArController.text.trim().isNotEmpty ? _nameArController.text.trim() : null,
        crNumber: _crController.text.trim(),
        defaultLanguage: _defaultLang,
        initialSiteName: _siteController.text.trim(),
      );

      await locale.setLocale(_defaultLang);

      if (!mounted) return;

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const BottomNavScaffold()),
        (route) => false,
      );
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(l10n.t('signUpTitle')),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
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
                  controller: _nameController,
                  label: l10n.t('companyNameLabel'),
                  hint: 'e.g. Saudi Bina Contracting Ltd.',
                  validator: (val) => val == null || val.trim().isEmpty ? l10n.t('requiredField') : null,
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _nameArController,
                  label: l10n.t('companyNameArLabel'),
                  hint: 'مثال: شركة البناء السعودية للمقاولات',
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _crController,
                  label: l10n.t('crNumberLabel'),
                  hint: '10 digits (e.g. 1010123456)',
                  keyboardType: TextInputType.number,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return l10n.t('requiredField');
                    if (!AppConstants.crNumberRegex.hasMatch(val.trim())) {
                      return 'Commercial Registration must be exactly 10 digits';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _siteController,
                  label: l10n.t('defaultSiteLabel'),
                  hint: 'e.g. Riyadh Metro Depot 3',
                  validator: (val) => val == null || val.trim().isEmpty ? l10n.t('requiredField') : null,
                ),
                const SizedBox(height: 16),
                Text(
                  l10n.t('languagePrefLabel'),
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: RadioListTile<String>(
                        title: const Text('العربية (RTL)'),
                        value: 'ar',
                        groupValue: _defaultLang,
                        contentPadding: EdgeInsets.zero,
                        onChanged: (val) => setState(() => _defaultLang = val!),
                      ),
                    ),
                    Expanded(
                      child: RadioListTile<String>(
                        title: const Text('English'),
                        value: 'en',
                        groupValue: _defaultLang,
                        contentPadding: EdgeInsets.zero,
                        onChanged: (val) => setState(() => _defaultLang = val!),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: auth.isLoading ? null : _handleOnboarding,
                  child: auth.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(l10n.t('completeOnboarding')),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

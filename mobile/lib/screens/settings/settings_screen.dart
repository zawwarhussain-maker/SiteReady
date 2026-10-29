import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/locale_provider.dart';
import '../../models/profile.dart';
import '../../widgets/confirm_dialog.dart';
import '../auth/login_screen.dart';
import '../reports/reports_screen.dart';
import '../notifications/notifications_screen.dart';
import 'account_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final localeProvider = context.watch<LocaleProvider>();
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // User & Role Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.primaryNavy,
                  child: Text(
                    auth.currentUser?.fullName.isNotEmpty == true
                        ? auth.currentUser!.fullName[0].toUpperCase()
                        : 'U',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        auth.currentUser?.fullName ?? 'Contractor Admin',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        auth.currentUser?.email ?? 'admin@company.com',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primaryTeal.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${l10n.t('currentRole')}: ${auth.role.name.toUpperCase()}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryTeal,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const AccountScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Hub Shortcuts Card
          Container(
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.assessment_outlined, color: AppColors.primaryNavy),
                  title: Text(l10n.t('navReports'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ReportsScreen()),
                    );
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.notifications_outlined, color: AppColors.primaryNavy),
                  title: Text(l10n.t('navNotifications'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Language & Localization Section
          Text(
            l10n.t('language'),
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              children: [
                RadioListTile<String>(
                  title: Row(
                    children: [
                      const Text('العربية', style: TextStyle(fontWeight: FontWeight.w600)),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primaryTeal.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('RTL Default', style: TextStyle(fontSize: 10, color: AppColors.primaryTeal)),
                      ),
                    ],
                  ),
                  subtitle: const Text('مواءمة كاملة مع أنظمة مقاولي السعودية والخليج'),
                  value: 'ar',
                  groupValue: localeProvider.locale.languageCode,
                  onChanged: (val) {
                    if (val != null) localeProvider.setLocale(val);
                  },
                ),
                const Divider(height: 1),
                RadioListTile<String>(
                  title: const Text('English (LTR)', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Saudi Aramco & International Contractor Standard'),
                  value: 'en',
                  groupValue: localeProvider.locale.languageCode,
                  onChanged: (val) {
                    if (val != null) localeProvider.setLocale(val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Role Switcher for Testing RBAC
          Text(
            l10n.t('switchRole'),
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Switch active role to verify permissions matrix (Owner has full CRUD, Manager manages field audits/workers, Viewer is read-only):',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 10),
                Row(
                  children: UserRole.values.map((r) {
                    final isCurrent = auth.role == r;
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isCurrent ? AppColors.primaryNavy : const Color(0xFFF1F5F9),
                            foregroundColor: isCurrent ? Colors.white : AppColors.textPrimary,
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            elevation: 0,
                          ),
                          onPressed: () => auth.switchRole(r),
                          child: Text(
                            r.name.toUpperCase(),
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // About & Storage Info
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.t('aboutApp'),
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                ),
                const SizedBox(height: 6),
                Text(
                  l10n.t('appVersionText'),
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
                const Divider(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.t('offlineStatus'),
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                    Text(
                      'PostgreSQL / Supabase RLS Private Bucket',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryTeal),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Sign Out Button
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFEE2E2),
              foregroundColor: AppColors.danger,
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () async {
              final confirm = await ConfirmDialog.show(
                context: context,
                title: l10n.t('navSignOut'),
                message: l10n.t('signOutConfirm'),
                confirmLabel: l10n.t('navSignOut'),
                isDestructive: true,
              );
              if (confirm && context.mounted) {
                await auth.logout();
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            icon: const Icon(Icons.logout, size: 18),
            label: Text(l10n.t('navSignOut'), style: const TextStyle(fontWeight: FontWeight.w700)),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/constants.dart';
import '../l10n/app_localizations.dart';
import '../providers/auth_provider.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/employees/employee_list_screen.dart';
import '../screens/certificates/certificate_list_screen.dart';
import '../screens/inspections/inspection_list_screen.dart';
import '../screens/settings/settings_screen.dart';

class BottomNavScaffold extends StatefulWidget {
  final int initialIndex;
  const BottomNavScaffold({super.key, this.initialIndex = 0});

  @override
  State<BottomNavScaffold> createState() => _BottomNavScaffoldState();
}

class _BottomNavScaffoldState extends State<BottomNavScaffold> {
  late int _currentIndex;

  final List<Widget> _screens = const [
    DashboardScreen(),
    EmployeeListScreen(),
    CertificateListScreen(),
    InspectionListScreen(),
    SettingsScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primaryTeal.withOpacity(0.2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Icon(Icons.verified_user, color: AppColors.primaryTeal, size: 20),
            ),
            const SizedBox(width: 10),
            Text(
              l10n.t('brandName'),
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
            ),
          ],
        ),
        actions: [
          // Site Filter Pill
          if (auth.sites.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: auth.selectedSiteId,
                    dropdownColor: AppColors.primaryNavy,
                    icon: const Icon(Icons.arrow_drop_down, color: AppColors.surfaceWhite, size: 18),
                    style: const TextStyle(color: AppColors.surfaceWhite, fontSize: 12, fontWeight: FontWeight.w500),
                    onChanged: (val) {
                      if (val != null) auth.setSelectedSite(val);
                    },
                    items: [
                      DropdownMenuItem(
                        value: 'all',
                        child: Text(l10n.t('allSites')),
                      ),
                      ...auth.sites.map((s) => DropdownMenuItem(
                            value: s.id,
                            child: Text(
                              l10n.isArabic && s.nameAr != null ? s.nameAr! : s.name,
                              overflow: TextOverflow.ellipsis,
                            ),
                          )),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.dashboard_outlined),
            activeIcon: const Icon(Icons.dashboard),
            label: l10n.t('navDashboard'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.badge_outlined),
            activeIcon: const Icon(Icons.badge),
            label: l10n.t('navEmployees'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.workspace_premium_outlined),
            activeIcon: const Icon(Icons.workspace_premium),
            label: l10n.t('navCertificates'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.fact_check_outlined),
            activeIcon: const Icon(Icons.fact_check),
            label: l10n.t('navInspections'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.more_horiz),
            activeIcon: const Icon(Icons.more_horiz),
            label: l10n.t('navMore'),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/constants.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/employee_provider.dart';
import '../../models/employee.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/empty_state.dart';
import 'employee_detail_screen.dart';
import 'employee_form_screen.dart';

class EmployeeListScreen extends StatefulWidget {
  const EmployeeListScreen({super.key});

  @override
  State<EmployeeListScreen> createState() => _EmployeeListScreenState();
}

class _EmployeeListScreenState extends State<EmployeeListScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadEmployees();
    });
  }

  void _loadEmployees() {
    final auth = context.read<AuthProvider>();
    context.read<EmployeeProvider>().fetchEmployees(
          siteId: auth.selectedSiteId != 'all' ? auth.selectedSiteId : null,
        );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final auth = context.watch<AuthProvider>();
    final empProvider = context.watch<EmployeeProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.surfaceWhite,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      empProvider.setSearchQuery(
                        val,
                        siteId: auth.selectedSiteId != 'all' ? auth.selectedSiteId : null,
                      );
                    },
                    decoration: InputDecoration(
                      hintText: l10n.t('search'),
                      prefixIcon: const Icon(Icons.search, size: 20),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      filled: true,
                      fillColor: AppColors.scaffoldBackground,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                if (auth.canManageEmployees) ...[
                  const SizedBox(width: 10),
                  FloatingActionButton.small(
                    elevation: 0,
                    backgroundColor: AppColors.primaryTeal,
                    foregroundColor: Colors.white,
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const EmployeeFormScreen()),
                      ).then((_) => _loadEmployees());
                    },
                    child: const Icon(Icons.add),
                  ),
                ],
              ],
            ),
          ),

          // Worker List
          Expanded(
            child: empProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : empProvider.employees.isEmpty
                    ? EmptyState(
                        icon: Icons.people_outline,
                        title: l10n.t('noRecords'),
                        subtitle: 'No contractor workforce registered under this site.',
                        actionLabel: auth.canManageEmployees ? l10n.t('addWorker') : null,
                        onAction: auth.canManageEmployees
                            ? () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const EmployeeFormScreen()),
                                ).then((_) => _loadEmployees());
                              }
                            : null,
                      )
                    : RefreshIndicator(
                        onRefresh: () async => _loadEmployees(),
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: empProvider.employees.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final emp = empProvider.employees[index];
                            return _EmployeeListCard(
                              employee: emp,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => EmployeeDetailScreen(employeeId: emp.id),
                                  ),
                                ).then((_) => _loadEmployees());
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

class _EmployeeListCard extends StatelessWidget {
  final Employee employee;
  final VoidCallback onTap;

  const _EmployeeListCard({required this.employee, required this.onTap});

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
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.primaryNavy.withOpacity(0.1),
              child: Text(
                employee.fullName.isNotEmpty ? employee.fullName[0].toUpperCase() : 'W',
                style: const TextStyle(
                  color: AppColors.primaryNavy,
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          l10n.isArabic && employee.fullNameAr != null
                              ? employee.fullNameAr!
                              : employee.fullName,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      StatusBadge.forEmployment(employee.employmentStatus, context),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${employee.employeeNo} • ${l10n.isArabic && employee.jobTitleAr != null ? employee.jobTitleAr! : employee.jobTitle}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        employee.hasExpiredCertificates
                            ? Icons.error_outline
                            : Icons.check_circle_outline,
                        size: 13,
                        color: employee.hasExpiredCertificates
                            ? AppColors.danger
                            : AppColors.primaryTeal,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        employee.hasExpiredCertificates
                            ? 'Has expired licenses (Barred)'
                            : '${employee.certificates.length} qualifications active',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: employee.hasExpiredCertificates
                              ? AppColors.danger
                              : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, color: AppColors.textSecondary, size: 20),
          ],
        ),
      ),
    );
  }
}

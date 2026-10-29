class DashboardMetrics {
  final int totalEmployees;
  final int validCertificates;
  final int expiringCertificates;
  final int expiredCertificates;
  final int overdueInspections;
  final int openCorrectiveActions;
  final double complianceRate;

  DashboardMetrics({
    required this.totalEmployees,
    required this.validCertificates,
    required this.expiringCertificates,
    required this.expiredCertificates,
    required this.overdueInspections,
    required this.openCorrectiveActions,
    required this.complianceRate,
  });

  factory DashboardMetrics.empty() {
    return DashboardMetrics(
      totalEmployees: 0,
      validCertificates: 0,
      expiringCertificates: 0,
      expiredCertificates: 0,
      overdueInspections: 0,
      openCorrectiveActions: 0,
      complianceRate: 100.0,
    );
  }

  factory DashboardMetrics.fromJson(Map<String, dynamic> json) {
    return DashboardMetrics(
      totalEmployees: json['totalEmployees'] as int? ?? 0,
      validCertificates: json['validCertificates'] as int? ?? 0,
      expiringCertificates: json['expiringCertificates'] as int? ?? 0,
      expiredCertificates: json['expiredCertificates'] as int? ?? 0,
      overdueInspections: json['overdueInspections'] as int? ?? 0,
      openCorrectiveActions: json['openCorrectiveActions'] as int? ?? 0,
      complianceRate: (json['complianceRate'] as num?)?.toDouble() ?? 100.0,
    );
  }
}

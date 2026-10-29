enum SubscriptionTier {
  trial,
  starter,
  professional,
  enterprise;

  static SubscriptionTier fromString(String tier) {
    switch (tier.toLowerCase()) {
      case 'trial':
        return SubscriptionTier.trial;
      case 'starter':
        return SubscriptionTier.starter;
      case 'professional':
        return SubscriptionTier.professional;
      case 'enterprise':
      default:
        return SubscriptionTier.enterprise;
    }
  }

  String toDbString() => name;
}

enum SubscriptionStatus {
  trial,
  active,
  pastDue,
  cancelled,
  expired;

  static SubscriptionStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'trial':
        return SubscriptionStatus.trial;
      case 'active':
        return SubscriptionStatus.active;
      case 'past_due':
      case 'pastdue':
        return SubscriptionStatus.pastDue;
      case 'cancelled':
        return SubscriptionStatus.cancelled;
      case 'expired':
      default:
        return SubscriptionStatus.expired;
    }
  }

  String toDbString() {
    switch (this) {
      case SubscriptionStatus.trial:
        return 'trial';
      case SubscriptionStatus.active:
        return 'active';
      case SubscriptionStatus.pastDue:
        return 'past_due';
      case SubscriptionStatus.cancelled:
        return 'cancelled';
      case SubscriptionStatus.expired:
        return 'expired';
    }
  }
}

class Subscription {
  final String id;
  final String companyId;
  final SubscriptionTier tier;
  final SubscriptionStatus status;
  final int maxWorkers;
  final int maxSites;
  final DateTime trialEndsAt;
  final DateTime currentPeriodEnd;
  final DateTime createdAt;
  final DateTime updatedAt;

  Subscription({
    required this.id,
    required this.companyId,
    required this.tier,
    required this.status,
    required this.maxWorkers,
    required this.maxSites,
    required this.trialEndsAt,
    required this.currentPeriodEnd,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      tier: SubscriptionTier.fromString(json['tier'] as String? ?? 'trial'),
      status: SubscriptionStatus.fromString(json['status'] as String? ?? 'trial'),
      maxWorkers: json['max_workers'] as int? ?? 50,
      maxSites: json['max_sites'] as int? ?? 3,
      trialEndsAt: json['trial_ends_at'] != null
          ? DateTime.parse(json['trial_ends_at'] as String)
          : DateTime.now().add(const Duration(days: 14)),
      currentPeriodEnd: json['current_period_end'] != null
          ? DateTime.parse(json['current_period_end'] as String)
          : DateTime.now().add(const Duration(days: 14)),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
    );
  }
}

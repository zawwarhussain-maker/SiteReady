import 'package:url_launcher/url_launcher.dart';
import '../models/employee.dart';
import '../models/certificate.dart';

class WhatsappReminderService {
  /// Builds a WhatsApp deep-link URL and launches it.
  static Future<bool> sendRenewalReminder({
    required Employee employee,
    required EmployeeCertificate certificate,
    required bool isArabic,
  }) async {
    final phone = employee.phone?.replaceAll(RegExp(r'[^\d+]'), '');
    if (phone == null || phone.isEmpty) {
      return false;
    }

    final certName = certificate.certificateType?.name ?? 'Safety License';
    final expiryFormatted = certificate.expiryDate != null
        ? certificate.expiryDate!.toIso8601String().substring(0, 10)
        : 'Immediate';

    final message = isArabic
        ? 'السلام عليكم ${employee.fullNameAr ?? employee.fullName}،\n'
          'نود تذكيرك بأن شهادة السلامة الخاصة بك ($certName) تنتهي بتاريخ ($expiryFormatted).\n'
          'يرجى تزويد إدارة السلامة بوثائق التجديد لتجنب إيقاف تصريح دخول بوابة الموقع.'
        : 'Dear ${employee.fullName},\n'
          'This is an official notice that your safety qualification "$certName" expires on ($expiryFormatted).\n'
          'Please submit renewal verification to avoid disruption to your site gate access pass.';

    final uri = Uri.parse(
      'https://wa.me/$phone?text=${Uri.encodeComponent(message)}',
    );

    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
    return false;
  }
}

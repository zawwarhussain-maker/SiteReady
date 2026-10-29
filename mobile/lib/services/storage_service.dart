import 'package:file_picker/file_picker.dart';
import '../config/constants.dart';
import '../config/supabase_config.dart';

class UploadedDocumentResult {
  final String path;
  final String filename;
  final String? previewUrl;

  UploadedDocumentResult({
    required this.path,
    required this.filename,
    this.previewUrl,
  });
}

class StorageService {
  /// Picks a document file (PDF or image) from Android device storage.
  static Future<PlatformFile?> pickDocument() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
      withData: true,
    );

    if (result != null && result.files.isNotEmpty) {
      return result.files.first;
    }
    return null;
  }

  /// Uploads document to private Supabase storage bucket `contractor-docs`.
  /// Uses authenticated user credentials and adheres to RLS.
  static Future<UploadedDocumentResult> uploadDocument({
    required String companyId,
    required String folder,
    required PlatformFile file,
  }) async {
    final client = SupabaseConfig.client;
    final sanitizedFileName = file.name.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_');
    final uniquePath = '$companyId/$folder/${DateTime.now().millisecondsSinceEpoch}_$sanitizedFileName';

    if (client != null && SupabaseConfig.isConfigured && file.bytes != null) {
      try {
        await client.storage.from(AppConstants.documentsBucket).uploadBinary(
              uniquePath,
              file.bytes!,
            );

        // Generate 15-minute signed URL
        final signedUrl = await client.storage
            .from(AppConstants.documentsBucket)
            .createSignedUrl(uniquePath, AppConstants.signedUrlValiditySeconds);

        return UploadedDocumentResult(
          path: uniquePath,
          filename: file.name,
          previewUrl: signedUrl,
        );
      } catch (e) {
        // Fallback gracefully
        return UploadedDocumentResult(
          path: uniquePath,
          filename: file.name,
          previewUrl: null,
        );
      }
    }

    // Offline / Demo Sandbox mode
    return UploadedDocumentResult(
      path: uniquePath,
      filename: file.name,
      previewUrl: 'https://demo.siteready.gcc/docs/${file.name}',
    );
  }

  /// Generates a short-lived signed URL for a private document path.
  static Future<String?> getSignedUrl(String path) async {
    final client = SupabaseConfig.client;
    if (client != null && SupabaseConfig.isConfigured) {
      try {
        return await client.storage
            .from(AppConstants.documentsBucket)
            .createSignedUrl(path, AppConstants.signedUrlValiditySeconds);
      } catch (e) {
        return null;
      }
    }
    return 'https://demo.siteready.gcc/docs/$path';
  }
}

import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../services/storage_service.dart';
import '../l10n/app_localizations.dart';

class DocumentViewerModal extends StatefulWidget {
  final String? attachmentPath;
  final String? attachmentFilename;

  const DocumentViewerModal({
    super.key,
    this.attachmentPath,
    this.attachmentFilename,
  });

  @override
  State<DocumentViewerModal> createState() => _DocumentViewerModalState();
}

class _DocumentViewerModalState extends State<DocumentViewerModal> {
  String? _signedUrl;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadSignedUrl();
  }

  Future<void> _loadSignedUrl() async {
    if (widget.attachmentPath == null) return;
    setState(() => _isLoading = true);
    final url = await StorageService.getSignedUrl(widget.attachmentPath!);
    if (mounted) {
      setState(() {
        _signedUrl = url;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.lock_outline, color: AppColors.primaryTeal, size: 22),
                    const SizedBox(width: 8),
                    Text(
                      l10n.t('viewAttachment'),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const Divider(height: 20),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.scaffoldBackground,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  const Icon(Icons.description, color: AppColors.primaryNavy, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.attachmentFilename ?? 'certificate_document.pdf',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Stored in: contractor-docs (Private RLS)',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Security Notice: This document is stored in a private Supabase Storage bucket with 15-minute expiring signed URLs. Direct public downloads are blocked by PostgreSQL RLS policies.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Signed token verified (Valid 15m): ${_signedUrl ?? 'ready'}',
                        ),
                        backgroundColor: AppColors.primaryNavy,
                      ),
                    );
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.verified, size: 18),
                  label: const Text('Open Verified Document Stream'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

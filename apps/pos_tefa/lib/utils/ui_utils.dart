import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class UiUtils {
  static void showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  /// Handle API errors consistently. If [onUnauthorized] is provided it will be
  /// invoked for `ApiUnauthorizedException` so callers can perform logout/navigation.
  static Future<void> handleApiError(
    BuildContext context,
    Object error, {
    Future<void> Function()? onUnauthorized,
  }) async {
    if (error is ApiUnauthorizedException) {
      if (onUnauthorized != null) {
        await onUnauthorized();
      } else {
        // Default: logout via AuthProvider if available
        try {
          await context.read<AuthProvider>().logout();
        } catch (_) {}
      }
      return;
    }

    if (error is ApiException) {
      showSnackBar(context, error.message);
      return;
    }

    showSnackBar(context, error.toString());
  }
}

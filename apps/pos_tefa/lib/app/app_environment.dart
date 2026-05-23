enum AppEnvironment { dev, prod }

extension AppEnvironmentX on AppEnvironment {
  String get flavorName => name;

  String get appName => switch (this) {
    AppEnvironment.dev => 'POS TEFA Dev',
    AppEnvironment.prod => 'POS TEFA',
  };

  String get defaultApiBaseUrl => switch (this) {
    AppEnvironment.dev => const String.fromEnvironment(
      'APP_API_BASE_URL_DEV',
      defaultValue: 'https://api-tefa.furqonaugust.site/api',
    ),
    AppEnvironment.prod => const String.fromEnvironment(
      'APP_API_BASE_URL_PROD',
      defaultValue: 'https://api.workspace-anla.workers.dev/api',
    ),
  };
}

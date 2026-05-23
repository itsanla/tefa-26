import 'app_environment.dart';

class AppConfig {
  AppConfig._();

  static AppEnvironment _environment = AppEnvironment.dev;

  static void initialize(AppEnvironment environment) {
    _environment = environment;
  }

  static AppEnvironment get environment => _environment;

  static String get appName => _environment.appName;

  static String get apiBaseUrl => _environment.defaultApiBaseUrl;
}

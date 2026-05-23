import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import 'app.dart';
import 'app_config.dart';
import 'app_environment.dart';

void bootstrapPosTefaApp(AppEnvironment environment) {
  WidgetsFlutterBinding.ensureInitialized();
  AppConfig.initialize(environment);

  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: const MainApp(),
    ),
  );
}

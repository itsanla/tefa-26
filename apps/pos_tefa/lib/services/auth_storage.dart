import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/app_models.dart';

class AuthStorage {
  AuthStorage({FlutterSecureStorage? secureStorage})
    : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  static const String tokenKey = 'auth_token';
  static const String userKey = 'auth_user';

  final FlutterSecureStorage _secureStorage;

  Future<void> saveSession(AuthSession session) async {
    await _secureStorage.write(key: tokenKey, value: session.token);
    await _secureStorage.write(
      key: userKey,
      value: jsonEncode(session.user.toJson()),
    );
  }

  Future<AuthSession?> readSession() async {
    final token = await _secureStorage.read(key: tokenKey);
    final userJson = await _secureStorage.read(key: userKey);

    if (token == null ||
        token.isEmpty ||
        userJson == null ||
        userJson.isEmpty) {
      return null;
    }

    return AuthSession(
      token: token,
      user: AppUser.fromJson(jsonDecode(userJson) as Map<String, dynamic>),
    );
  }

  Future<void> clear() async {
    await _secureStorage.delete(key: tokenKey);
    await _secureStorage.delete(key: userKey);
  }
}

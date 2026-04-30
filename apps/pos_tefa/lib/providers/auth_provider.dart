import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/app_models.dart';
import '../services/api_service.dart';
import '../services/auth_storage.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider({ApiService? apiService, AuthStorage? authStorage})
    : _apiService = apiService ?? ApiService(),
      _authStorage = authStorage ?? AuthStorage() {
    unawaited(_bootstrap());
  }

  final ApiService _apiService;
  final AuthStorage _authStorage;

  AuthSession? _session;
  bool _isBootstrapping = true;
  bool _isAuthenticating = false;
  String? _errorMessage;

  AuthSession? get session => _session;
  bool get isBootstrapping => _isBootstrapping;
  bool get isAuthenticating => _isAuthenticating;
  String? get errorMessage => _errorMessage;

  Future<void> _bootstrap() async {
    try {
      _session = await _authStorage.readSession();
    } catch (error) {
      _errorMessage = 'Gagal memuat sesi login: $error';
      _session = null;
    } finally {
      _isBootstrapping = false;
      notifyListeners();
    }
  }

  Future<bool> login({required String email, required String password}) async {
    if (_isAuthenticating) {
      return false;
    }

    _isAuthenticating = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final session = await _apiService.login(email: email, password: password);
      await _authStorage.saveSession(session);
      _session = session;
      return true;
    } on ApiException catch (error) {
      _errorMessage = error.message;
      return false;
    } catch (error) {
      _errorMessage = 'Login gagal: $error';
      return false;
    } finally {
      _isAuthenticating = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authStorage.clear();
    _session = null;
    _errorMessage = null;
    notifyListeners();
  }
}

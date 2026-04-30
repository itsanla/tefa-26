import 'dart:collection';

import 'package:flutter/foundation.dart';

import '../models/penjualan.dart';
import '../services/api_service.dart';

class SalesProvider extends ChangeNotifier {
  SalesProvider({ApiService? apiService}) : _apiService = apiService ?? ApiService();

  final ApiService _apiService;

  final List<Penjualan> _sales = <Penjualan>[];
  bool _isLoading = true;
  String? _errorMessage;
  String _statusMessage = 'Memuat data penjualan...';
  String _searchQuery = '';
  int? _printingSaleId;

  UnmodifiableListView<Penjualan> get sales =>
      UnmodifiableListView<Penjualan>(_sales);
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get statusMessage => _statusMessage;
  String get searchQuery => _searchQuery;
  int? get printingSaleId => _printingSaleId;

  List<Penjualan> get filteredSales {
    if (_searchQuery.trim().isEmpty) {
      return List<Penjualan>.unmodifiable(_sales);
    }

    final query = _searchQuery.toLowerCase();
    return _sales
        .where((sale) {
          return sale.id.toString().contains(query) ||
              sale.keterangan.toLowerCase().contains(query);
        })
        .toList(growable: false);
  }

  int get totalValue => _sales.fold<int>(0, (sum, sale) => sum + sale.totalHarga);

  void setSearchQuery(String value) {
    if (_searchQuery == value) {
      return;
    }

    _searchQuery = value;
    notifyListeners();
  }

  void setPrintingSaleId(int? saleId) {
    if (_printingSaleId == saleId) {
      return;
    }

    _printingSaleId = saleId;
    notifyListeners();
  }

  Future<void> loadSales(String token) async {
    _isLoading = true;
    _errorMessage = null;
    _statusMessage = 'Memuat data penjualan...';
    notifyListeners();

    try {
      final sales = await _apiService.getPenjualan(token);
      _sales
        ..clear()
        ..addAll(sales);
      _statusMessage = sales.isEmpty
          ? 'Belum ada data penjualan yang tersimpan.'
          : 'Data penjualan berhasil dimuat.';
    } on ApiUnauthorizedException catch (error) {
      _errorMessage = error.message;
      _statusMessage = error.message;
      rethrow;
    } on ApiException catch (error) {
      _errorMessage = error.message;
      _statusMessage = error.message;
      rethrow;
    } catch (error) {
      _errorMessage = 'Gagal memuat data penjualan: $error';
      _statusMessage = _errorMessage!;
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<PenjualanDetail> loadSaleDetail(String token, int saleId) {
    return _apiService.getPenjualanDetail(token, saleId);
  }

  void clear() {
    _sales.clear();
    _isLoading = true;
    _errorMessage = null;
    _statusMessage = 'Memuat data penjualan...';
    _searchQuery = '';
    _printingSaleId = null;
    notifyListeners();
  }
}
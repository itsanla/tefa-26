import 'dart:collection';

import 'package:flutter/foundation.dart';

import '../models/cart_item.dart';
import '../models/produksi.dart';
import '../services/api_service.dart';

class AddSaleProvider extends ChangeNotifier {
  AddSaleProvider({ApiService? apiService}) : _apiService = apiService ?? ApiService();

  final ApiService _apiService;

  final List<Produksi> _productions = <Produksi>[];
  final List<CartItem> _items = <CartItem>[];

  Produksi? _selectedProduction;
  bool _isLoading = true;
  bool _isSaving = false;
  String? _errorMessage;
  String _quantityText = '1';
  String _note = '';
  int _quantityResetKey = 0;

  UnmodifiableListView<Produksi> get productions =>
      UnmodifiableListView<Produksi>(_productions);
  UnmodifiableListView<CartItem> get items =>
      UnmodifiableListView<CartItem>(_items);
  Produksi? get selectedProduction => _selectedProduction;
  bool get isLoading => _isLoading;
  bool get isSaving => _isSaving;
  String? get errorMessage => _errorMessage;
  String get quantityText => _quantityText;
  String get note => _note;
  int get quantityResetKey => _quantityResetKey;

  int get totalQuantity => _items.fold<int>(0, (sum, item) => sum + item.quantity);

  int get totalValue => _items.fold<int>(0, (sum, item) => sum + item.subtotal);

  bool get hasItems => _items.isNotEmpty;

  void startNewSale() {
    _items.clear();
    _selectedProduction = _productions.isEmpty ? null : _productions.first;
    _quantityText = '1';
    _note = '';
    _quantityResetKey++;
    _errorMessage = null;
    notifyListeners();
  }

  void updateSelectedProduction(Produksi? production) {
    if (_selectedProduction?.id == production?.id) {
      return;
    }

    _selectedProduction = production;
    notifyListeners();
  }

  void updateQuantity(String value) {
    _quantityText = value;
  }

  void updateNote(String value) {
    _note = value;
  }

  Future<void> loadProductions(String token) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final productions = await _apiService.getProductions(token);
      _productions
        ..clear()
        ..addAll(productions);
      _selectedProduction = productions.isNotEmpty ? productions.first : null;
      _errorMessage = productions.isEmpty
          ? 'Belum ada data produksi yang tersedia.'
          : null;
    } on ApiUnauthorizedException catch (error) {
      _errorMessage = error.message;
      rethrow;
    } on ApiException catch (error) {
      _errorMessage = error.message;
      rethrow;
    } catch (error) {
      _errorMessage = 'Gagal memuat daftar produksi: $error';
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  String? addItem() {
    final production = _selectedProduction;
    if (production == null) {
      return 'Pilih produksi terlebih dahulu';
    }

    final quantity = int.tryParse(_quantityText) ?? 0;
    if (quantity <= 0) {
      return 'Jumlah harus lebih besar dari 0';
    }

    final existingIndex = _items.indexWhere(
      (item) => item.produksi.id == production.id,
    );

    if (existingIndex >= 0) {
      final existing = _items[existingIndex];
      _items[existingIndex] = existing.copyWith(
        quantity: existing.quantity + quantity,
      );
    } else {
      _items.add(CartItem(produksi: production, quantity: quantity));
    }

    _quantityText = '1';
    _quantityResetKey++;
    _errorMessage = null;
    notifyListeners();
    return null;
  }

  void removeItem(int productionId) {
    _items.removeWhere((item) => item.produksi.id == productionId);
    notifyListeners();
  }

  Future<String> submit(String token) async {
    if (_items.isEmpty) {
      throw ApiException('Tambahkan minimal satu item penjualan');
    }

    _isSaving = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final payload = _items
          .map(
            (item) => {
              'id_komodity': item.produksi.idKomoditas,
              'id_produksi': item.produksi.id,
              'jumlah_terjual': item.quantity,
            },
          )
          .toList(growable: false);

      final message = await _apiService.createPenjualan(
        token: token,
        keterangan: _note.trim(),
        items: payload,
      );

      startNewSale();
      return message;
    } on ApiUnauthorizedException catch (error) {
      _errorMessage = error.message;
      rethrow;
    } on ApiException catch (error) {
      _errorMessage = error.message;
      rethrow;
    } catch (error) {
      _errorMessage = 'Gagal membuat penjualan: $error';
      rethrow;
    } finally {
      _isSaving = false;
      notifyListeners();
    }
  }

  void clear() {
    _productions.clear();
    _items.clear();
    _selectedProduction = null;
    _isLoading = true;
    _isSaving = false;
    _errorMessage = null;
    _quantityText = '1';
    _note = '';
    _quantityResetKey++;
    notifyListeners();
  }
}
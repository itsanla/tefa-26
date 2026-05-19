import 'dart:collection';

import 'package:flutter/foundation.dart';

import '../models/cart_item.dart';
import '../models/produksi.dart';
import '../services/api_service.dart';

class AddSaleProvider extends ChangeNotifier {
  AddSaleProvider({ApiService? apiService})
    : _apiService = apiService ?? ApiService();

  final ApiService _apiService;

  final List<Produksi> _productions = <Produksi>[];
  final List<CartItem> _items = <CartItem>[];

  Produksi? _selectedProduction;
  bool _isLoading = true;
  bool _isSaving = false;
  String? _errorMessage;
  String _beratText = '1';
  String _jumlahTerjualText = '1';
  String _note = '';
  String _paymentMethod = 'lunas';
  String _firstInstallmentText = '';
  String _selectedSatuanJual = 'kilogram';
  int _beratResetKey = 0;
  int _jumlahTerjualResetKey = 0;

  UnmodifiableListView<Produksi> get productions =>
      UnmodifiableListView<Produksi>(_productions);
  UnmodifiableListView<CartItem> get items =>
      UnmodifiableListView<CartItem>(_items);
  Produksi? get selectedProduction => _selectedProduction;
  bool get isLoading => _isLoading;
  bool get isSaving => _isSaving;
  String? get errorMessage => _errorMessage;
  String get beratText => _beratText;
  String get jumlahTerjualText => _jumlahTerjualText;
  String get note => _note;
  String get paymentMethod => _paymentMethod;
  String get firstInstallmentText => _firstInstallmentText;
  String get selectedSatuanJual => _selectedSatuanJual;
  int get beratResetKey => _beratResetKey;
  int get jumlahTerjualResetKey => _jumlahTerjualResetKey;
  bool get isInstallmentPayment => _paymentMethod == 'angsuran';
  bool get canSelectSatuanJual => _selectedProduction != null;

  double get totalJumlahTerjual =>
      _items.fold<double>(0, (sum, item) => sum + item.jumlahTerjual);

  double get totalValue =>
      _items.fold<double>(0, (sum, item) => sum + item.subtotal);

  bool get hasItems => _items.isNotEmpty;

  String formatQuantity(double value) {
    if (value % 1 == 0) {
      return value.toStringAsFixed(0);
    }

    return value.toString();
  }

  void startNewSale() {
    _items.clear();
    _selectedProduction = _productions.isEmpty ? null : _productions.first;
    _selectedSatuanJual = 'kilogram';
    _beratText = '1';
    _jumlahTerjualText = '1';
    _note = '';
    _beratResetKey++;
    _jumlahTerjualResetKey++;
    _errorMessage = null;
    notifyListeners();
  }

  void updateSelectedProduction(Produksi? production) {
    if (_selectedProduction?.id == production?.id) {
      return;
    }

    _selectedProduction = production;
    _selectedSatuanJual = 'kilogram';
    notifyListeners();
  }

  void updateSelectedSatuanJual(String value) {
    if (_selectedSatuanJual == value) {
      return;
    }

    _selectedSatuanJual = value;
    if (value == 'buah') {
      _beratText = '1';
    }
    notifyListeners();
  }

  void updateBerat(String value) {
    _beratText = value;
  }

  void updatejumlahTerjual(String value) {
    _jumlahTerjualText = value;
  }

  void updateNote(String value) {
    _note = value;
  }

  void updatePaymentMethod(String value) {
    if (_paymentMethod == value) {
      return;
    }

    _paymentMethod = value;
    if (_paymentMethod != 'angsuran') {
      _firstInstallmentText = '';
    }
    notifyListeners();
  }

  void updateFirstInstallment(String value) {
    _firstInstallmentText = value;
  }

  int? get firstInstallmentAmount {
    if (!isInstallmentPayment) {
      return null;
    }

    return int.tryParse(
      _firstInstallmentText.replaceAll(RegExp(r'[^0-9]'), ''),
    );
  }

  String get paymentSummaryLabel {
    switch (_paymentMethod) {
      case 'hutang':
        return 'Pembayaran: Hutang';
      case 'angsuran':
        final amount = firstInstallmentAmount;
        final installmentText = amount == null
            ? 'Uang muka belum diisi'
            : 'Uang muka: $amount';
        return 'Pembayaran: Angsuran ($installmentText)';
      case 'lunas':
      default:
        return 'Pembayaran: Lunas';
    }
  }

  String get composedNote {
    final trimmedNote = _note.trim();
    final parts = <String>[
      paymentSummaryLabel,
      if (trimmedNote.isNotEmpty) trimmedNote,
    ];

    return parts.join(' | ');
  }

  Future<void> loadProductions(String token) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.getProductionsPage(
        token,
        page: 1,
        pageSize: 10,
      );
      final productions = response.items;
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

    final berat = double.tryParse(_beratText.replaceAll(',', '.').trim()) ?? 0;
    if (_selectedSatuanJual == 'kilogram' && berat <= 0) {
      return 'Jumlah berat harus lebih besar dari 0';
    }

    final jumlahTerjual = int.tryParse(_jumlahTerjualText.trim()) ?? 0;
    if (jumlahTerjual <= 0) {
      return 'Jumlah buah harus lebih besar dari 0';
    }

    final existingIndex = _items.indexWhere(
      (item) => item.produksi.id == production.id,
    );

    if (existingIndex >= 0) {
      final existing = _items[existingIndex];
      final mergedBerat = _selectedSatuanJual == 'kilogram'
          ? existing.berat + berat
          : 0.0;
      _items[existingIndex] = existing.copyWith(
        berat: mergedBerat,
        jumlahTerjual: existing.jumlahTerjual + jumlahTerjual,
        satuanJual: _selectedSatuanJual,
      );
    } else {
      _items.add(
        CartItem(
          produksi: production,
          idKomodity: production.idKomoditas,
          berat: _selectedSatuanJual == 'kilogram' ? berat : 0.0,
          jumlahTerjual: jumlahTerjual,
          satuanJual: _selectedSatuanJual,
        ),
      );
    }

    _beratText = '1';
    _jumlahTerjualText = '1';
    _selectedSatuanJual = 'kilogram';
    _beratResetKey++;
    _jumlahTerjualResetKey++;
    _errorMessage = null;
    notifyListeners();
    return null;
  }

  void removeItem(int productionId) {
    _items.removeWhere((item) => item.produksi.id == productionId);
    notifyListeners();
  }

  void updateItem(int productionId, CartItem updatedItem) {
    final index = _items.indexWhere((item) => item.produksi.id == productionId);
    if (index >= 0) {
      _items[index] = updatedItem;
      notifyListeners();
    }
  }

  Future<String> submit(String token) async {
    if (_items.isEmpty) {
      throw ApiException('Tambahkan minimal satu item penjualan');
    }

    if (isInstallmentPayment &&
        (firstInstallmentAmount == null || firstInstallmentAmount! <= 0)) {
      throw ApiException('Masukkan nominal uang muka');
    }

    _isSaving = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final payload = _items
          .map((item) {
            final itemPayload = <String, dynamic>{
              'id_komodity': item.idKomodity,
              'id_produksi': item.produksi.id,
              'jumlah_terjual': item.jumlahTerjual,
              'satuan_jual': item.satuanJual,
            };

            if (item.satuanJual == 'kilogram') {
              itemPayload['berat'] = item.berat;
            }

            return itemPayload;
          })
          .toList(growable: false);

      final message = await _apiService.createPenjualan(
        token: token,
        keterangan: composedNote,
        items: payload,
        status: _paymentMethod,
        uangMuka: isInstallmentPayment ? firstInstallmentAmount : null,
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
    _selectedSatuanJual = 'kilogram';
    _beratText = '1';
    _jumlahTerjualText = '1';
    _note = '';
    _paymentMethod = 'lunas';
    _firstInstallmentText = '';
    _beratResetKey++;
    _jumlahTerjualResetKey++;
    notifyListeners();
  }
}

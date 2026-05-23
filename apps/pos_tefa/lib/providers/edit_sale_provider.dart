import 'dart:collection';

import 'package:flutter/foundation.dart';

import '../models/cart_item.dart';
import '../models/penjualan.dart';
import '../models/produksi.dart';
import '../models/value_enums.dart';
import '../services/api_service.dart';

class EditSaleProvider extends ChangeNotifier {
  EditSaleProvider({ApiService? apiService})
    : _apiService = apiService ?? ApiService();

  final ApiService _apiService;

  final List<Produksi> _productions = <Produksi>[];
  final List<CartItem> _items = <CartItem>[];

  Produksi? _selectedProduction;
  bool _isLoading = true;
  bool _isSaving = false;
  String _note = '';
  PaymentStatus _paymentStatus = PaymentStatus.lunas;
  final String _firstInstallmentText = '';

  UnmodifiableListView<Produksi> get productions =>
      UnmodifiableListView<Produksi>(_productions);
  UnmodifiableListView<CartItem> get items =>
      UnmodifiableListView<CartItem>(_items);
  Produksi? get selectedProduction => _selectedProduction;
  bool get isLoading => _isLoading;
  bool get isSaving => _isSaving;
  String get note => _note;
  PaymentStatus get paymentStatus => _paymentStatus;
  String get firstInstallmentText => _firstInstallmentText;
  bool get isInstallment => _paymentStatus == PaymentStatus.angsuran;

  double get totalQuantity =>
      _items.fold<double>(0, (sum, item) => sum + item.jumlahTerjual);
  double get totalValue =>
      _items.fold<double>(0, (sum, item) => sum + item.subtotal);

  String formatQuantity(double value) {
    if (value % 1 == 0) {
      return value.toStringAsFixed(0);
    }
    return value.toString();
  }

  Future<void> loadInitialData(String token, PenjualanDetail detail) async {
    _isLoading = true;
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

      final productionById = <int, Produksi>{
        for (final production in productions) production.id: production,
      };

      _items
        ..clear()
        ..addAll(
          detail.items.map((detailItem) {
            final production =
                productionById[detailItem.idProduksi] ?? detailItem.produksi;
            return CartItem(
              produksi: production,
              idKomodity: detailItem.idKomodity,
              berat: detailItem.berat,
              jumlahTerjual: detailItem.jumlahTerjual,
              satuanJual: detailItem.satuanJual,
            );
          }),
        );

      _note = detail.keterangan;
      _paymentStatus = detail.status.isEmpty
          ? PaymentStatus.lunas
          : PaymentStatusExt.fromString(detail.status);
      _selectedProduction = _productions.isEmpty ? null : _productions.first;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void updateSelectedProduction(Produksi? production) {
    if (_selectedProduction?.id == production?.id) {
      return;
    }

    _selectedProduction = production;
    notifyListeners();
  }

  Future<ProduksiListResponse> fetchProductionsPage(
    String token, {
    int page = 1,
    int pageSize = 10,
    String search = '',
  }) {
    return _apiService.getProductionsPage(
      token,
      page: page,
      pageSize: pageSize,
      search: search,
    );
  }

  String? addItemFromInputs(
    Produksi production,
    String satuanJual,
    double berat,
    int jumlahTerjual,
  ) {
    if (satuanJual == Unit.kilogram.value && berat <= 0) {
      return 'Jumlah berat harus lebih besar dari 0';
    }

    if (jumlahTerjual <= 0) {
      return 'Jumlah buah harus lebih besar dari 0';
    }

    final existingIndex = _items.indexWhere(
      (item) => item.produksi.id == production.id,
    );

    if (existingIndex >= 0) {
      final existing = _items[existingIndex];
      final mergedBerat = satuanJual == Unit.kilogram.value
          ? existing.berat + berat
          : 0.0;
      _items[existingIndex] = existing.copyWith(
        berat: mergedBerat,
        jumlahTerjual: existing.jumlahTerjual + jumlahTerjual,
        satuanJual: satuanJual,
      );
    } else {
      _items.add(
        CartItem(
          produksi: production,
          idKomodity: production.idKomoditas,
          berat: satuanJual == Unit.kilogram.value ? berat : 0.0,
          jumlahTerjual: jumlahTerjual,
          satuanJual: satuanJual,
        ),
      );
    }

    notifyListeners();
    return null;
  }

  void removeItem(int productionId) {
    _items.removeWhere((item) => item.produksi.id == productionId);
    notifyListeners();
  }

  void updateItem(int productionId, CartItem updated) {
    final index = _items.indexWhere((item) => item.produksi.id == productionId);
    if (index >= 0) {
      _items[index] = updated;
      notifyListeners();
    }
  }

  Future<String> submit(
    String token,
    int id,
    String status,
    String note,
    int? uangMuka,
  ) async {
    if (_items.isEmpty) {
      throw ApiException('Tambahkan minimal satu item penjualan');
    }

    if (status == PaymentStatus.angsuran.value &&
        (uangMuka == null || uangMuka <= 0)) {
      throw ApiException('Masukkan nominal uang muka');
    }

    _isSaving = true;
    notifyListeners();

    try {
      final itemsPayload = _items
          .map((item) {
            final payload = <String, dynamic>{
              'id_komodity': item.idKomodity,
              'id_produksi': item.produksi.id,
              'jumlah_terjual': item.jumlahTerjual,
              'satuan_jual': item.satuanJual,
            };
            if (UnitExt.fromString(item.satuanJual) == Unit.kilogram) {
              payload['berat'] = item.berat;
            }
            return payload;
          })
          .toList(growable: false);

      final payload = <String, dynamic>{
        'keterangan': note,
        'items': itemsPayload,
        'status': status,
      };
      if (uangMuka != null) {
        payload['uang_muka'] = uangMuka;
      }

      return await _apiService.updatePenjualan(
        token: token,
        id: id,
        payload: payload,
      );
    } finally {
      _isSaving = false;
      notifyListeners();
    }
  }
}

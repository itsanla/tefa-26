import 'package:flutter_test/flutter_test.dart';

import 'package:pos_tefa/providers/add_sale_provider.dart';
import 'package:pos_tefa/services/api_service.dart';
import 'package:pos_tefa/models/produksi.dart';
import 'package:pos_tefa/models/value_enums.dart';

class MockApiService extends ApiService {
  MockApiService();

  @override
  Future<ProduksiListResponse> getProductionsPage(
    String token, {
    int page = 1,
    int pageSize = 10,
    String search = '',
  }) async {
    final produksi = Produksi(
      id: 1,
      idAsal: 1,
      idKomoditas: 1,
      kodeProduksi: 'P001',
      ukuran: 'L',
      kualitas: 'A',
      jumlah: 10,
      hargaPersatuan: 10000,
      hargaPerBuah: 5000,
      asalProduksi: null,
      komoditas: null,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    return ProduksiListResponse(items: [produksi], totalItems: 1);
  }

  @override
  Future<String> createPenjualan({
    required String token,
    required String keterangan,
    required List<Map<String, dynamic>> items,
    String? status,
    int? uangMuka,
  }) async {
    return 'Penjualan tersimpan';
  }
}

void main() {
  group('AddSaleProvider', () {
    test('addItem and submit happy path', () async {
      final api = MockApiService();
      final provider = AddSaleProvider(apiService: api);

      await provider.loadProductions('token');
      provider.startNewSale();

      // set values
      provider.updateSelectedSatuanJual(Unit.kilogram);
      provider.updateBerat('2.5');
      provider.updatejumlahTerjual('3');

      final addMessage = provider.addItem();
      expect(addMessage, isNull);
      expect(provider.items.length, 1);

      final resp = await provider.submit('token');
      expect(resp, 'Penjualan tersimpan');
      expect(provider.items.isEmpty, true);
    });

    test('submit without items throws ApiException', () async {
      final api = MockApiService();
      final provider = AddSaleProvider(apiService: api);

      await expectLater(provider.submit('token'), throwsA(isA<ApiException>()));
    });
  });
}

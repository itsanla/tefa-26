import 'package:pos_tefa/models/produksi.dart';

class CartItem {
  const CartItem({
    required this.produksi,
    required this.idKomodity,
    required this.berat,
    required this.jumlahTerjual,
    required this.satuanJual,
  });

  final Produksi produksi;
  final int idKomodity;
  final double berat;
  final int jumlahTerjual;
  final String satuanJual;

  CartItem copyWith({
    double? berat,
    int? jumlahTerjual,
    String? satuanJual,
    int? idKomodity,
  }) {
    return CartItem(
      produksi: produksi,
      idKomodity: idKomodity ?? this.idKomodity,
      berat: berat ?? this.berat,
      jumlahTerjual: jumlahTerjual ?? this.jumlahTerjual,
      satuanJual: satuanJual ?? this.satuanJual,
    );
  }

  double get subtotal {
    if (satuanJual == 'buah') {
      return (jumlahTerjual * produksi.hargaPerBuah).toDouble();
    }

    return berat * produksi.hargaPersatuan;
  }
}

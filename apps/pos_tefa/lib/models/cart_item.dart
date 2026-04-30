import 'package:pos_tefa/models/produksi.dart';

class CartItem {
  const CartItem({required this.produksi, required this.quantity});

  final Produksi produksi;
  final int quantity;

  CartItem copyWith({int? quantity}) {
    return CartItem(produksi: produksi, quantity: quantity ?? this.quantity);
  }

  int get subtotal => quantity * produksi.hargaPersatuan;
}

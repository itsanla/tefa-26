import 'package:flutter/material.dart';

import '../models/cart_item.dart';
import '../utils/helpers.dart';
import '../models/value_enums.dart';

typedef FormatQuantity = String Function(double);

class ItemRow extends StatelessWidget {
  const ItemRow({
    super.key,
    required this.item,
    required this.isSaving,
    this.onEdit,
    this.onRemove,
    required this.formatQuantity,
  });

  final CartItem item;
  final bool isSaving;
  final void Function(CartItem)? onEdit;
  final void Function(int)? onRemove;
  final FormatQuantity formatQuantity;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE6ECE9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${item.produksi.kodeProduksi} — ${item.produksi.komoditas?.nama ?? '-'}',
              style: Theme.of(
                context,
              ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              'Ukuran: ${item.produksi.ukuran}  •  Kualitas: ${item.produksi.kualitas}',
            ),
            Text(
              'Satuan Jual: ${UnitExt.fromString(item.satuanJual) == Unit.kilogram ? 'Per Kilogram' : 'Per Buah'}',
            ),
            if (UnitExt.fromString(item.satuanJual) == Unit.kilogram)
              Text(
                'Berat: ${formatQuantity(item.berat)} ${item.produksi.komoditas?.satuan ?? ''}',
              ),
            Text('Jumlah buah: ${item.jumlahTerjual}'),
            Text('Subtotal: ${Helpers.formatRupiah(item.subtotal)}'),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: Wrap(
                spacing: 8,
                children: [
                  TextButton.icon(
                    onPressed: isSaving ? null : () => onEdit?.call(item),
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('Edit'),
                  ),
                  TextButton.icon(
                    onPressed: isSaving
                        ? null
                        : () => onRemove?.call(item.produksi.id),
                    icon: const Icon(Icons.delete_outline),
                    label: const Text('Hapus'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../models/cart_item.dart';
import 'item_row.dart';

class ItemList extends StatelessWidget {
  const ItemList({
    super.key,
    required this.items,
    required this.isSaving,
    this.onEdit,
    this.onRemove,
    required this.formatQuantity,
    this.emptyMessage,
  });

  final List<CartItem> items;
  final bool isSaving;
  final void Function(CartItem)? onEdit;
  final void Function(int)? onRemove;
  final String Function(double) formatQuantity;
  final String? emptyMessage;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE6ECE9)),
        ),
        child: Text(
          emptyMessage ?? 'Belum ada item. Tambahkan minimal satu item.',
        ),
      );
    }

    return Column(
      children: items
          .map((item) {
            return ItemRow(
              item: item,
              isSaving: isSaving,
              onEdit: onEdit,
              onRemove: onRemove,
              formatQuantity: formatQuantity,
            );
          })
          .toList(growable: false),
    );
  }
}

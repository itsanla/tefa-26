import 'package:flutter/material.dart';

import '../models/cart_item.dart';
import '../models/value_enums.dart';

Future<CartItem?> showEditItemDialog(
  BuildContext context,
  CartItem item, {
  String Function(double)? formatQuantity,
}) async {
  return showDialog<CartItem>(
    context: context,
    builder: (dialogContext) {
      return _EditItemDialog(item: item, formatQuantity: formatQuantity);
    },
  );
}

class _EditItemDialog extends StatefulWidget {
  const _EditItemDialog({required this.item, this.formatQuantity});

  final CartItem item;
  final String Function(double)? formatQuantity;

  @override
  State<_EditItemDialog> createState() => _EditItemDialogState();
}

class _EditItemDialogState extends State<_EditItemDialog> {
  late final TextEditingController _beratController;
  late final TextEditingController _jumlahController;
  late Unit _selectedSatuanJual;

  @override
  void initState() {
    super.initState();
    _beratController = TextEditingController(
      text: widget.formatQuantity != null
          ? widget.formatQuantity!(widget.item.berat)
          : (widget.item.berat % 1 == 0
                ? widget.item.berat.toStringAsFixed(0)
                : widget.item.berat.toString()),
    );
    _jumlahController = TextEditingController(
      text: widget.item.jumlahTerjual.toString(),
    );
    _selectedSatuanJual = UnitExt.fromString(widget.item.satuanJual);
  }

  @override
  void dispose() {
    _beratController.dispose();
    _jumlahController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StatefulBuilder(
      builder: (dialogContext, setState) {
        return AlertDialog(
          title: const Text('Edit Item'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '${widget.item.produksi.kodeProduksi} — ${widget.item.produksi.komoditas?.nama ?? '-'}',
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<Unit>(
                isExpanded: true,
                initialValue: _selectedSatuanJual,
                decoration: const InputDecoration(
                  labelText: 'Satuan Jual',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(
                    value: Unit.kilogram,
                    child: Text('Per Kilogram (kg)'),
                  ),
                  DropdownMenuItem(value: Unit.buah, child: Text('Per Buah')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _selectedSatuanJual = value;
                    });
                  }
                },
              ),
              const SizedBox(height: 12),
              if (_selectedSatuanJual == Unit.kilogram)
                TextFormField(
                  controller: _beratController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: const InputDecoration(
                    labelText: 'Jumlah berat (kg)',
                    border: OutlineInputBorder(),
                  ),
                ),
              if (_selectedSatuanJual == Unit.kilogram)
                const SizedBox(height: 12),
              TextFormField(
                controller: _jumlahController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Jumlah buah',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Batal'),
            ),
            FilledButton(
              onPressed: () {
                final berat =
                    double.tryParse(
                      _beratController.text.replaceAll(',', '.').trim(),
                    ) ??
                    0;
                final jumlah = int.tryParse(_jumlahController.text.trim()) ?? 0;

                if (_selectedSatuanJual == Unit.kilogram && berat <= 0) {
                  ScaffoldMessenger.of(dialogContext).showSnackBar(
                    const SnackBar(
                      content: Text('Berat harus lebih besar dari 0'),
                    ),
                  );
                  return;
                }

                if (jumlah <= 0) {
                  ScaffoldMessenger.of(dialogContext).showSnackBar(
                    const SnackBar(
                      content: Text('Jumlah buah harus lebih besar dari 0'),
                    ),
                  );
                  return;
                }

                final finalBerat = _selectedSatuanJual == Unit.kilogram
                    ? berat
                    : 0.0;

                Navigator.of(dialogContext).pop(
                  widget.item.copyWith(
                    berat: finalBerat,
                    jumlahTerjual: jumlah,
                    satuanJual: _selectedSatuanJual.value,
                  ),
                );
              },
              child: const Text('Simpan'),
            ),
          ],
        );
      },
    );
  }
}

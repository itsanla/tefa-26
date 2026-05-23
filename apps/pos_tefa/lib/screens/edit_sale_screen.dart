import 'package:flutter/material.dart';

import '../models/cart_item.dart';
import '../models/produksi.dart';
import '../models/penjualan.dart';
import '../services/api_service.dart';
import '../widgets/currency_input_field.dart';
import '../models/value_enums.dart';
import '../widgets/edit_sale_production_picker.dart';
import '../widgets/edit_item_dialog.dart';
import '../utils/ui_utils.dart';
import '../providers/edit_sale_provider.dart';
import '../widgets/item_list.dart';
import '../widgets/summary_card.dart';

class EditSaleScreen extends StatefulWidget {
  const EditSaleScreen({super.key, required this.token, required this.detail});

  final String token;
  final PenjualanDetail detail;

  @override
  State<EditSaleScreen> createState() => _EditSaleScreenState();
}

class _EditSaleScreenState extends State<EditSaleScreen> {
  final ApiService _api = ApiService();

  final EditSaleProvider _provider = EditSaleProvider();

  Unit _selectedSatuanJual = Unit.kilogram;
  String _beratText = '1';
  String _jumlahTerjualText = '1';
  String _note = '';
  PaymentStatus _selectedStatus = PaymentStatus.lunas;
  String _firstInstallmentText = '';

  @override
  void initState() {
    super.initState();
    _note = widget.detail.keterangan;
    _selectedStatus = widget.detail.status.isEmpty
        ? PaymentStatus.lunas
        : PaymentStatusExt.fromString(widget.detail.status);
    _firstInstallmentText = '';
    _provider.addListener(_onProviderChanged);
    Future.microtask(() async {
      try {
        await _provider.loadInitialData(widget.token, widget.detail);
        if (!mounted) return;
        setState(() {
          _note = _provider.note;
          _selectedStatus = _provider.paymentStatus;
          _firstInstallmentText = _provider.firstInstallmentText;
        });
      } on ApiUnauthorizedException {
        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Sesi berakhir.')));
        Navigator.of(context).pop(false);
        return;
      } on ApiException catch (error) {
        if (!mounted) return;
        UiUtils.handleApiError(context, error);
      } catch (error) {
        if (!mounted) return;
        UiUtils.handleApiError(context, error);
      }
    });
  }

  @override
  void dispose() {
    _provider.removeListener(_onProviderChanged);
    _provider.dispose();
    super.dispose();
  }

  void _onProviderChanged() {
    if (!mounted) return;
    setState(() {});
  }

  String _formatQuantity(double value) {
    if (value % 1 == 0) {
      return value.toStringAsFixed(0);
    }
    return value.toString();
  }

  String _productionLabel(Produksi? production) {
    if (production == null) {
      return 'Pilih produksi';
    }

    return '${production.kodeProduksi} — ${production.komoditas?.nama ?? 'N/A'} (${production.komoditas?.satuan ?? 'N/A'})';
  }

  Future<void> _openProductionPicker() async {
    final selected = await showEditSaleProductionPicker(
      context,
      widget.token,
      _api,
    );
    if (selected != null) {
      _provider.updateSelectedProduction(selected);
      setState(() {
        _selectedSatuanJual = Unit.kilogram;
      });
    }
  }

  String get _composedNote => _note;

  void _addItem() {
    final production = _provider.selectedProduction;
    if (production == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih produksi terlebih dahulu')),
      );
      return;
    }

    final berat = double.tryParse(_beratText.replaceAll(',', '.').trim()) ?? 0;
    final jumlahTerjual = int.tryParse(_jumlahTerjualText.trim()) ?? 0;

    final message = _provider.addItemFromInputs(
      production,
      _selectedSatuanJual.value,
      berat,
      jumlahTerjual,
    );
    if (message != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      return;
    }

    setState(() {
      _beratText = '1';
      _jumlahTerjualText = '1';
      _selectedSatuanJual = Unit.kilogram;
    });
  }

  void _removeItem(int productionId) {
    _provider.removeItem(productionId);
  }

  Future<void> _editItem(CartItem item) async {
    final updated = await showEditItemDialog(
      context,
      item,
      formatQuantity: _formatQuantity,
    );

    if (updated == null) return;

    _provider.updateItem(item.produksi.id, updated);
  }

  Future<void> _submit() async {
    if (_provider.items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tambahkan minimal satu item penjualan')),
      );
      return;
    }
    try {
      final uang = _selectedStatus == PaymentStatus.angsuran
          ? int.tryParse(
              _firstInstallmentText.replaceAll(RegExp(r'[^0-9]'), ''),
            )
          : null;

      final message = await _provider.submit(
        widget.token,
        widget.detail.id,
        _selectedStatus.value,
        _composedNote,
        uang,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      Navigator.of(context).pop(true);
    } on ApiUnauthorizedException {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Sesi berakhir.')));
      Navigator.of(context).pop(false);
    } on ApiException catch (e) {
      if (!mounted) return;
      UiUtils.handleApiError(context, e);
    } catch (e) {
      if (!mounted) return;
      UiUtils.handleApiError(context, e);
    } finally {
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Penjualan')),
      body: _provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  'Edit Item Penjualan',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  readOnly: true,
                  key: ValueKey(_provider.selectedProduction?.id ?? 'none'),
                  initialValue: _productionLabel(_provider.selectedProduction),
                  decoration: InputDecoration(
                    labelText: 'Pilih Produksi',
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.search_rounded),
                      onPressed: _provider.isSaving
                          ? null
                          : _openProductionPicker,
                    ),
                  ),
                  onTap: _provider.isSaving ? null : _openProductionPicker,
                ),
                const SizedBox(height: 8),
                if (_provider.selectedProduction != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      vertical: 8,
                      horizontal: 12,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF7FFFB),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFDFF5EE)),
                    ),
                    child: Text(
                      'Stok tersedia: ${_provider.selectedProduction!.jumlah} buah',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                if (_provider.selectedProduction != null) ...[
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
                      DropdownMenuItem(
                        value: Unit.buah,
                        child: Text('Per Buah'),
                      ),
                    ],
                    onChanged: _provider.isSaving
                        ? null
                        : (value) {
                            if (value == null) return;
                            setState(() {
                              _selectedSatuanJual = value;
                            });
                          },
                  ),
                ],
                const SizedBox(height: 12),
                if (_provider.selectedProduction != null &&
                    _selectedSatuanJual == Unit.kilogram)
                  TextFormField(
                    key: ValueKey('berat-$_beratText'),
                    initialValue: _beratText,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: const InputDecoration(
                      labelText: 'Jumlah berat (kg)',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) {
                      _beratText = value;
                    },
                  ),
                if (_provider.selectedProduction != null &&
                    _selectedSatuanJual == Unit.kilogram)
                  const SizedBox(height: 12),
                TextFormField(
                  key: ValueKey('jumlah-$_jumlahTerjualText'),
                  initialValue: _jumlahTerjualText,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Jumlah buah',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    _jumlahTerjualText = value;
                  },
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: _provider.isSaving ? null : _addItem,
                  icon: const Icon(Icons.add_rounded),
                  label: const Text('Tambah Item'),
                ),
                const SizedBox(height: 20),
                Text(
                  'Daftar Item',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 10),
                ItemList(
                  items: _provider.items.toList(growable: false),
                  isSaving: _provider.isSaving,
                  onEdit: (item) => _editItem(item),
                  onRemove: (id) => _removeItem(id),
                  formatQuantity: _formatQuantity,
                  emptyMessage:
                      'Belum ada item. Tambahkan minimal satu item untuk menyimpan perubahan penjualan.',
                ),
                const SizedBox(height: 12),
                SummaryCard(
                  totalItems: _provider.totalQuantity,
                  totalValue: _provider.totalValue,
                  formatQuantity: _formatQuantity,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<PaymentStatus>(
                  key: ValueKey(_selectedStatus.value),
                  initialValue: _selectedStatus,
                  decoration: const InputDecoration(
                    labelText: 'Status Pembayaran',
                    border: OutlineInputBorder(),
                  ),
                  items: [
                    DropdownMenuItem(
                      value: PaymentStatus.lunas,
                      child: Text(PaymentStatus.lunas.label),
                    ),
                    DropdownMenuItem(
                      value: PaymentStatus.hutang,
                      child: Text(PaymentStatus.hutang.label),
                    ),
                    DropdownMenuItem(
                      value: PaymentStatus.angsuran,
                      child: Text(PaymentStatus.angsuran.label),
                    ),
                  ],
                  onChanged: _provider.isSaving
                      ? null
                      : (v) {
                          if (v == null) return;
                          setState(() {
                            _selectedStatus = v;
                          });
                        },
                ),
                const SizedBox(height: 8),
                Text(
                  'Mengubah status akan mereset riwayat pembayaran sebelumnya.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.orange,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (_selectedStatus == PaymentStatus.angsuran) ...[
                  const SizedBox(height: 8),
                  CurrencyInputField(
                    labelText: 'Uang muka',
                    initialValue: _firstInstallmentText,
                    prefixText: 'Rp ',
                    onChanged: (v) => _firstInstallmentText = v,
                  ),
                ],
                const SizedBox(height: 12),
                TextFormField(
                  initialValue: _note,
                  decoration: const InputDecoration(
                    labelText: 'Keterangan (opsional)',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                  onChanged: (value) {
                    _note = value;
                  },
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: _provider.isSaving ? null : _submit,
                  icon: _provider.isSaving
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.save_rounded),
                  label: Text(
                    _provider.isSaving ? 'Menyimpan...' : 'Simpan Perubahan',
                  ),
                ),
              ],
            ),
    );
  }
}

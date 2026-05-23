import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/cart_item.dart';
import '../models/produksi.dart';
import '../providers/add_sale_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/summary_card.dart';
import '../utils/ui_utils.dart';
import '../widgets/currency_input_field.dart';
import '../widgets/production_picker.dart';
import '../widgets/edit_item_dialog.dart';
import '../models/value_enums.dart';
import '../widgets/item_list.dart';

class AddSaleScreen extends StatefulWidget {
  const AddSaleScreen({super.key, required this.token});

  final String token;

  @override
  State<AddSaleScreen> createState() => _AddSaleScreenState();
}

class _AddSaleScreenState extends State<AddSaleScreen> {
  final AddSaleProvider _provider = AddSaleProvider();

  late final TextEditingController _productionController;
  late final TextEditingController _beratController;
  late final TextEditingController _jumlahController;
  late final TextEditingController _firstInstallmentController;
  late final TextEditingController _noteController;

  late final FocusNode _productionFocusNode;
  late final FocusNode _beratFocusNode;
  late final FocusNode _jumlahFocusNode;
  late final FocusNode _firstInstallmentFocusNode;
  late final FocusNode _noteFocusNode;

  int _lastBeratResetKey = 0;
  int _lastJumlahResetKey = 0;

  @override
  void initState() {
    super.initState();
    _productionController = TextEditingController();
    _beratController = TextEditingController();
    _jumlahController = TextEditingController();
    _firstInstallmentController = TextEditingController();
    _noteController = TextEditingController();

    _productionFocusNode = FocusNode();
    _beratFocusNode = FocusNode();
    _jumlahFocusNode = FocusNode();
    _firstInstallmentFocusNode = FocusNode();
    _noteFocusNode = FocusNode();

    _beratController.addListener(() {
      _provider.updateBerat(_beratController.text);
    });
    _jumlahController.addListener(() {
      _provider.updatejumlahTerjual(_jumlahController.text);
    });
    _firstInstallmentController.addListener(() {
      _provider.updateFirstInstallment(_firstInstallmentController.text);
    });
    _noteController.addListener(() {
      _provider.updateNote(_noteController.text);
    });

    _provider.addListener(_onProviderChanged);

    Future.microtask(_loadProductions);
  }

  @override
  void dispose() {
    _provider.removeListener(_onProviderChanged);
    _provider.dispose();
    _productionController.dispose();
    _beratController.dispose();
    _jumlahController.dispose();
    _firstInstallmentController.dispose();
    _noteController.dispose();
    _productionFocusNode.dispose();
    _beratFocusNode.dispose();
    _jumlahFocusNode.dispose();
    _firstInstallmentFocusNode.dispose();
    _noteFocusNode.dispose();
    super.dispose();
  }

  void _onProviderChanged() {
    if (!mounted) return;

    // sync production label
    final label = _productionLabel(_provider.selectedProduction);
    if (_productionController.text != label && !_productionFocusNode.hasFocus) {
      _productionController.text = label;
    }
    if (_provider.beratResetKey != _lastBeratResetKey &&
        !_beratFocusNode.hasFocus) {
      _beratController.text = _provider.beratText;
      _lastBeratResetKey = _provider.beratResetKey;
    }
    if (_provider.jumlahTerjualResetKey != _lastJumlahResetKey &&
        !_jumlahFocusNode.hasFocus) {
      _jumlahController.text = _provider.jumlahTerjualText;
      _lastJumlahResetKey = _provider.jumlahTerjualResetKey;
    }
    if (_firstInstallmentController.text != _provider.firstInstallmentText &&
        !_firstInstallmentFocusNode.hasFocus) {
      _firstInstallmentController.text = _provider.firstInstallmentText;
    }
    if (_noteController.text != _provider.note && !_noteFocusNode.hasFocus) {
      _noteController.text = _provider.note;
    }
  }

  Future<void> _loadProductions() async {
    try {
      await _provider.loadProductions(widget.token);
      _provider.startNewSale();
    } on ApiUnauthorizedException {
      if (!mounted) return;
      await UiUtils.handleApiError(
        context,
        ApiUnauthorizedException(),
        onUnauthorized: () async {
          await context.read<AuthProvider>().logout();
          if (mounted) Navigator.of(context).pop(false);
        },
      );
    } on ApiException catch (error) {
      if (!mounted) return;
      UiUtils.handleApiError(context, error);
    } catch (error) {
      if (!mounted) return;
      UiUtils.handleApiError(context, error);
    }
  }

  Future<void> _submit() async {
    try {
      final message = await _provider.submit(widget.token);
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      Navigator.of(context).pop(true);
    } on ApiUnauthorizedException {
      if (!mounted) return;
      await UiUtils.handleApiError(
        context,
        ApiUnauthorizedException(),
        onUnauthorized: () async {
          await context.read<AuthProvider>().logout();
          if (mounted) Navigator.of(context).pop(false);
        },
      );
    } on ApiException catch (error) {
      if (!mounted) return;
      UiUtils.handleApiError(context, error);
    } catch (error) {
      if (!mounted) return;
      UiUtils.handleApiError(context, error);
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  String _productionLabel(Produksi? production) {
    if (production == null) {
      return 'Pilih produksi';
    }

    return '${production.kodeProduksi} — ${production.komoditas?.nama ?? 'N/A'} (${production.komoditas?.satuan ?? 'N/A'})';
  }

  Future<void> _openProductionPicker(AddSaleProvider provider) async {
    final selected = await showProductionPicker(
      context,
      widget.token,
      provider,
    );
    if (selected != null) {
      provider.updateSelectedProduction(selected);
    }
  }

  Future<void> _editItem(AddSaleProvider provider, CartItem item) async {
    final updated = await showEditItemDialog(
      context,
      item,
      formatQuantity: provider.formatQuantity,
    );
    if (updated == null) return;
    provider.updateItem(item.produksi.id, updated);
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: _provider,
      child: Consumer<AddSaleProvider>(
        builder: (context, provider, child) {
          return Scaffold(
            appBar: AppBar(title: const Text('Buat Penjualan')),
            body: provider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Text(
                        'Tambah Item Penjualan',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 12),
                      if (provider.errorMessage != null)
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.red.shade100),
                          ),
                          child: Text(
                            provider.errorMessage!,
                            style: TextStyle(color: Colors.red.shade700),
                          ),
                        ),
                      if (provider.errorMessage != null)
                        const SizedBox(height: 12),
                      TextFormField(
                        controller: _productionController,
                        focusNode: _productionFocusNode,
                        readOnly: true,
                        decoration: InputDecoration(
                          labelText: 'Pilih Produksi',
                          border: const OutlineInputBorder(),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.search_rounded),
                            onPressed: provider.isSaving
                                ? null
                                : () => _openProductionPicker(provider),
                          ),
                        ),
                        onTap: provider.isSaving
                            ? null
                            : () => _openProductionPicker(provider),
                      ),
                      const SizedBox(height: 8),
                      if (provider.selectedProduction != null)
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
                            'Stok tersedia: ${provider.selectedProduction!.jumlah} buah',
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                        ),
                      if (provider.selectedProduction != null &&
                          provider.canSelectSatuanJual) ...[
                        const SizedBox(height: 12),
                        DropdownButtonFormField<Unit>(
                          isExpanded: true,
                          initialValue: provider.selectedSatuanJual,
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
                          onChanged: (value) {
                            if (value != null) {
                              provider.updateSelectedSatuanJual(value);
                            }
                          },
                        ),
                      ],
                      const SizedBox(height: 12),
                      if (provider.selectedProduction != null &&
                          provider.selectedSatuanJual == Unit.kilogram)
                        TextFormField(
                          controller: _beratController,
                          focusNode: _beratFocusNode,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          decoration: const InputDecoration(
                            labelText: 'Jumlah berat (kg)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      if (provider.selectedProduction != null &&
                          provider.selectedSatuanJual == Unit.kilogram)
                        const SizedBox(height: 12),
                      TextFormField(
                        controller: _jumlahController,
                        focusNode: _jumlahFocusNode,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Jumlah buah',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      FilledButton.icon(
                        onPressed: provider.isSaving
                            ? null
                            : () {
                                final message = provider.addItem();
                                if (message != null) {
                                  _showMessage(message);
                                }
                              },
                        icon: const Icon(Icons.add_rounded),
                        label: const Text('Tambah Item'),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Daftar Item',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 10),
                      ItemList(
                        items: provider.items.toList(growable: false),
                        isSaving: provider.isSaving,
                        onEdit: (item) => _editItem(provider, item),
                        onRemove: (id) => provider.removeItem(id),
                        formatQuantity: provider.formatQuantity,
                        emptyMessage:
                            'Belum ada item. Tambahkan minimal satu item untuk membuat penjualan.',
                      ),
                      const SizedBox(height: 12),
                      SummaryCard(
                        totalItems: provider.totalJumlahTerjual,
                        totalValue: provider.totalValue,
                        formatQuantity: provider.formatQuantity,
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<PaymentStatus>(
                        key: ValueKey(provider.paymentMethod),
                        initialValue: provider.paymentMethod,
                        decoration: const InputDecoration(
                          labelText: 'Status',
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
                        onChanged: (value) {
                          if (value != null) {
                            provider.updatePaymentMethod(value);
                          }
                        },
                      ),
                      if (provider.isInstallmentPayment) ...[
                        const SizedBox(height: 12),
                        CurrencyInputField(
                          labelText: 'Nominal uang muka',
                          controller: _firstInstallmentController,
                          focusNode: _firstInstallmentFocusNode,
                          onChanged: provider.updateFirstInstallment,
                          prefixText: 'Rp ',
                        ),
                      ],
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _noteController,
                        focusNode: _noteFocusNode,
                        decoration: const InputDecoration(
                          labelText: 'Keterangan (opsional)',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: provider.isSaving ? null : _submit,
                        icon: provider.isSaving
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
                          provider.isSaving
                              ? 'Menyimpan...'
                              : 'Simpan Penjualan',
                        ),
                      ),
                    ],
                  ),
          );
        },
      ),
    );
  }
}

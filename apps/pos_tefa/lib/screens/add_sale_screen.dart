import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/produksi.dart';
import '../providers/add_sale_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../utils/helpers.dart';

class AddSaleScreen extends StatefulWidget {
  const AddSaleScreen({super.key, required this.token});

  final String token;

  @override
  State<AddSaleScreen> createState() => _AddSaleScreenState();
}

class _AddSaleScreenState extends State<AddSaleScreen> {
  final AddSaleProvider _provider = AddSaleProvider();

  @override
  void initState() {
    super.initState();
    Future.microtask(_loadProductions);
  }

  @override
  void dispose() {
    _provider.dispose();
    super.dispose();
  }

  Future<void> _loadProductions() async {
    try {
      await _provider.loadProductions(widget.token);
      _provider.startNewSale();
    } on ApiUnauthorizedException {
      if (!mounted) return;
      await context.read<AuthProvider>().logout();
      if (mounted) {
        Navigator.of(context).pop(false);
      }
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat daftar produksi: $error')),
      );
    }
  }

  Future<void> _submit() async {
    try {
      final message = await _provider.submit(widget.token);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
      Navigator.of(context).pop(true);
    } on ApiUnauthorizedException {
      if (!mounted) return;
      await context.read<AuthProvider>().logout();
      if (mounted) {
        Navigator.of(context).pop(false);
      }
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal membuat penjualan: $error')),
      );
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
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
                      if (provider.errorMessage != null) const SizedBox(height: 12),
                      DropdownButtonFormField<Produksi>(
                        key: ValueKey(provider.selectedProduction?.id ?? 'none'),
                        isExpanded: true,
                        initialValue: provider.selectedProduction,
                        decoration: const InputDecoration(
                          labelText: 'Pilih Produksi',
                          border: OutlineInputBorder(),
                        ),
                        items: provider.productions
                            .map(
                              (production) => DropdownMenuItem(
                                value: production,
                                child: Text(
                                  '${production.kodeProduksi} — ${production.komoditas?.nama ?? 'N/A'} (${production.komoditas?.satuan ?? 'N/A'})',
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            )
                            .toList(growable: false),
                        onChanged: provider.updateSelectedProduction,
                      ),
                      const SizedBox(height: 8),
                      if (provider.selectedProduction != null)
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF7FFFB),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFDFF5EE)),
                          ),
                          child: Text(
                            'Stok tersedia: ${provider.selectedProduction!.jumlah} ${provider.selectedProduction!.komoditas?.satuan ?? ''}',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                        ),
                      const SizedBox(height: 12),
                      TextFormField(
                        key: ValueKey(provider.quantityResetKey),
                        initialValue: provider.quantityText,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Jumlah terjual',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: provider.updateQuantity,
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
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 10),
                      if (provider.items.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE6ECE9)),
                          ),
                          child: const Text(
                            'Belum ada item. Tambahkan minimal satu item untuk membuat penjualan.',
                          ),
                        )
                      else
                        ...provider.items.map(
                          (item) => Padding(
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
                                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                          fontWeight: FontWeight.w800,
                                        ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Ukuran: ${item.produksi.ukuran}  •  Kualitas: ${item.produksi.kualitas}',
                                  ),
                                  Text(
                                    'Qty: ${item.quantity} ${item.produksi.komoditas?.satuan ?? ''}',
                                  ),
                                  Text(
                                    'Subtotal: ${Helpers.formatRupiah(item.subtotal)}',
                                  ),
                                  const SizedBox(height: 8),
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: TextButton.icon(
                                      onPressed: provider.isSaving
                                          ? null
                                          : () => provider.removeItem(item.produksi.id),
                                      icon: const Icon(Icons.delete_outline),
                                      label: const Text('Hapus'),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0F7F6),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFBFDCD6)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Ringkasan',
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w800,
                                  ),
                            ),
                            const SizedBox(height: 6),
                            Text('Total item: ${provider.totalQuantity}'),
                            Text('Total nilai: ${Helpers.formatRupiah(provider.totalValue)}'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        initialValue: provider.note,
                        decoration: const InputDecoration(
                          labelText: 'Keterangan (opsional)',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 2,
                        onChanged: provider.updateNote,
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
                          provider.isSaving ? 'Menyimpan...' : 'Simpan Penjualan',
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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/cart_item.dart';
import '../models/produksi.dart';
import '../providers/add_sale_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../utils/helpers.dart';
import '../widgets/currency_input_field.dart';

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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.message)));
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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      Navigator.of(context).pop(true);
    } on ApiUnauthorizedException {
      if (!mounted) return;
      await context.read<AuthProvider>().logout();
      if (mounted) {
        Navigator.of(context).pop(false);
      }
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.message)));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal membuat penjualan: $error')),
      );
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

  bool _matchesProductionQuery(Produksi production, String query) {
    final normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.isEmpty) {
      return true;
    }

    final fields = <String>[
      production.kodeProduksi,
      production.komoditas?.nama ?? '',
      production.komoditas?.satuan ?? '',
      production.ukuran,
      production.kualitas,
    ];

    return fields.any((field) => field.toLowerCase().contains(normalizedQuery));
  }

  Future<void> _openProductionPicker(AddSaleProvider provider) async {
    final queryController = TextEditingController();
    final scrollController = ScrollController();
    final loadedProductions = <Produksi>[];
    final api = ApiService();
    StateSetter? sheetSetState;
    var currentPage = 1;
    var hasMore = true;
    var isLoadingMore = false;
    var initialLoadStarted = false;
    String searchQuery = '';

    Future<void> loadProductions({bool reset = false}) async {
      if (sheetSetState == null || isLoadingMore) {
        return;
      }

      if (reset) {
        currentPage = 1;
        hasMore = true;
        loadedProductions.clear();
      }

      if (!hasMore) {
        return;
      }

      isLoadingMore = true;
      sheetSetState!.call(() {});

      try {
        final response = await api.getProductionsPage(
          widget.token,
          page: currentPage,
          pageSize: 10,
          search: searchQuery,
        );

        loadedProductions.addAll(response.items);

        final totalItems = response.totalItems;
        if (response.items.length < 10 ||
            (totalItems != null && loadedProductions.length >= totalItems)) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } on ApiException catch (error) {
        _showMessage(error.message);
      } catch (error) {
        _showMessage('Gagal memuat produksi: $error');
      } finally {
        isLoadingMore = false;
        sheetSetState?.call(() {});

        if (hasMore && scrollController.hasClients) {
          final nearBottom =
              scrollController.position.extentAfter < 200 &&
              scrollController.position.maxScrollExtent > 0;
          if (nearBottom) {
            // ignore: discarded_futures
            Future.microtask(() => loadProductions());
          }
        }
      }
    }

    scrollController.addListener(() {
      if (!scrollController.hasClients || isLoadingMore || !hasMore) {
        return;
      }

      final thresholdReached =
          scrollController.position.pixels >=
          scrollController.position.maxScrollExtent - 200;
      if (thresholdReached) {
        // ignore: discarded_futures
        loadProductions();
      }
    });

    await showModalBottomSheet<Produksi>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (sheetContext, setStateSheet) {
            sheetSetState = setStateSheet;

            if (!initialLoadStarted) {
              initialLoadStarted = true;
              Future.microtask(() => loadProductions(reset: true));
            }

            final filteredProductions = loadedProductions
                .where(
                  (production) =>
                      _matchesProductionQuery(production, queryController.text),
                )
                .toList(growable: false);

            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Pilih Produksi',
                    style: Theme.of(sheetContext).textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: queryController,
                    decoration: const InputDecoration(
                      labelText: 'Cari produksi',
                      hintText: 'Kode, komoditas, ukuran, atau kualitas',
                      prefixIcon: Icon(Icons.search_rounded),
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) {
                      searchQuery = value.trim();
                      loadProductions(reset: true);
                    },
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: MediaQuery.of(sheetContext).size.height * 0.55,
                    child: filteredProductions.isEmpty
                        ? isLoadingMore && loadedProductions.isEmpty
                              ? const Center(child: CircularProgressIndicator())
                              : const Center(
                                  child: Text('Produksi tidak ditemukan'),
                                )
                        : ListView.separated(
                            controller: scrollController,
                            itemCount: filteredProductions.length,
                            separatorBuilder: (context, index) =>
                                const Divider(height: 1),
                            itemBuilder: (context, index) {
                              final production = filteredProductions[index];
                              final isSelected =
                                  provider.selectedProduction?.id ==
                                  production.id;

                              return ListTile(
                                selected: isSelected,
                                leading: CircleAvatar(
                                  backgroundColor: const Color(0xFFE7F4EE),
                                  child: Text(
                                    production.kodeProduksi.isNotEmpty
                                        ? production.kodeProduksi[0]
                                        : '?',
                                  ),
                                ),
                                title: Text(
                                  production.kodeProduksi,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                subtitle: Text(
                                  '${production.komoditas?.nama ?? 'N/A'} • ${production.ukuran} • ${production.kualitas}',
                                ),
                                trailing: isSelected
                                    ? const Icon(Icons.check_circle_rounded)
                                    : null,
                                onTap: () {
                                  Navigator.of(sheetContext).pop(production);
                                },
                              );
                            },
                          ),
                  ),
                  if (isLoadingMore) ...[
                    const SizedBox(height: 12),
                    const Center(child: CircularProgressIndicator()),
                  ] else if (hasMore && loadedProductions.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    const Center(
                      child: Text('Gulir untuk memuat data berikutnya'),
                    ),
                  ],
                ],
              ),
            );
          },
        );
      },
    ).then((selected) {
      if (selected != null) {
        provider.updateSelectedProduction(selected);
      }
    });

    queryController.dispose();
    scrollController.dispose();
  }

  Future<void> _editItem(AddSaleProvider provider, CartItem item) async {
    final beratController = TextEditingController(
      text: provider.formatQuantity(item.berat),
    );
    final jumlahController = TextEditingController(
      text: item.jumlahTerjual.toString(),
    );
    String selectedSatuanJual = item.satuanJual;

    final updated = await showDialog<CartItem>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (dialogContext, setState) {
            return AlertDialog(
              title: const Text('Edit Item'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${item.produksi.kodeProduksi} — ${item.produksi.komoditas?.nama ?? '-'}',
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    isExpanded: true,
                    initialValue: selectedSatuanJual,
                    decoration: const InputDecoration(
                      labelText: 'Satuan Jual',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: 'kilogram',
                        child: Text('Per Kilogram (kg)'),
                      ),
                      DropdownMenuItem(value: 'buah', child: Text('Per Buah')),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          selectedSatuanJual = value;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  if (selectedSatuanJual == 'kilogram')
                    TextFormField(
                      controller: beratController,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: const InputDecoration(
                        labelText: 'Jumlah berat (kg)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  if (selectedSatuanJual == 'kilogram')
                    const SizedBox(height: 12),
                  TextFormField(
                    controller: jumlahController,
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
                          beratController.text.replaceAll(',', '.').trim(),
                        ) ??
                        0;
                    final jumlah =
                        int.tryParse(jumlahController.text.trim()) ?? 0;

                    if (selectedSatuanJual == 'kilogram' && berat <= 0) {
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

                    final finalBerat = selectedSatuanJual == 'kilogram'
                        ? berat
                        : 0.0;

                    Navigator.of(dialogContext).pop(
                      item.copyWith(
                        berat: finalBerat,
                        jumlahTerjual: jumlah,
                        satuanJual: selectedSatuanJual,
                      ),
                    );
                  },
                  child: const Text('Simpan'),
                ),
              ],
            );
          },
        );
      },
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
                        readOnly: true,
                        key: ValueKey(
                          provider.selectedProduction?.id ?? 'none',
                        ),
                        initialValue: _productionLabel(
                          provider.selectedProduction,
                        ),
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
                        DropdownButtonFormField<String>(
                          isExpanded: true,
                          initialValue: provider.selectedSatuanJual,
                          decoration: const InputDecoration(
                            labelText: 'Satuan Jual',
                            border: OutlineInputBorder(),
                          ),
                          items: const [
                            DropdownMenuItem(
                              value: 'kilogram',
                              child: Text('Per Kilogram (kg)'),
                            ),
                            DropdownMenuItem(
                              value: 'buah',
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
                          provider.selectedSatuanJual == 'kilogram')
                        TextFormField(
                          key: ValueKey(provider.beratResetKey),
                          initialValue: provider.beratText,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          decoration: const InputDecoration(
                            labelText: 'Jumlah berat (kg)',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: provider.updateBerat,
                        ),
                      if (provider.selectedProduction != null &&
                          provider.selectedSatuanJual == 'kilogram')
                        const SizedBox(height: 12),
                      TextFormField(
                        key: ValueKey('buah-${provider.jumlahTerjualResetKey}'),
                        initialValue: provider.jumlahTerjualText,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Jumlah buah',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: provider.updatejumlahTerjual,
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
                                border: Border.all(
                                  color: const Color(0xFFE6ECE9),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${item.produksi.kodeProduksi} — ${item.produksi.komoditas?.nama ?? '-'}',
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleSmall
                                        ?.copyWith(fontWeight: FontWeight.w800),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Ukuran: ${item.produksi.ukuran}  •  Kualitas: ${item.produksi.kualitas}',
                                  ),
                                  Text(
                                    'Satuan Jual: ${item.satuanJual == 'kilogram' ? 'Per Kilogram' : 'Per Buah'}',
                                  ),
                                  if (item.satuanJual == 'kilogram')
                                    Text(
                                      'Berat: ${provider.formatQuantity(item.berat)} ${item.produksi.komoditas?.satuan ?? ''}',
                                    ),
                                  Text('Jumlah buah: ${item.jumlahTerjual}'),
                                  Text(
                                    'Subtotal: ${Helpers.formatRupiah(item.subtotal)}',
                                  ),
                                  const SizedBox(height: 8),
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: Wrap(
                                      spacing: 8,
                                      children: [
                                        TextButton.icon(
                                          onPressed: provider.isSaving
                                              ? null
                                              : () => _editItem(provider, item),
                                          icon: const Icon(Icons.edit_outlined),
                                          label: const Text('Edit'),
                                        ),
                                        TextButton.icon(
                                          onPressed: provider.isSaving
                                              ? null
                                              : () => provider.removeItem(
                                                  item.produksi.id,
                                                ),
                                          icon: const Icon(
                                            Icons.delete_outline,
                                          ),
                                          label: const Text('Hapus'),
                                        ),
                                      ],
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
                              style: Theme.of(context).textTheme.titleSmall
                                  ?.copyWith(fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Total item: ${provider.formatQuantity(provider.totalJumlahTerjual)}',
                            ),
                            Text(
                              'Total nilai: ${Helpers.formatRupiah(provider.totalValue)}',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        key: ValueKey(provider.paymentMethod),
                        initialValue: provider.paymentMethod,
                        decoration: const InputDecoration(
                          labelText: 'Status',
                          border: OutlineInputBorder(),
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'lunas',
                            child: Text('Lunas'),
                          ),
                          DropdownMenuItem(
                            value: 'hutang',
                            child: Text('Hutang'),
                          ),
                          DropdownMenuItem(
                            value: 'angsuran',
                            child: Text('Angsuran'),
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
                          initialValue: provider.firstInstallmentText,
                          onChanged: provider.updateFirstInstallment,
                          prefixText: 'Rp ',
                        ),
                      ],
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

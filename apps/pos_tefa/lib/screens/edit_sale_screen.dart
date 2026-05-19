import 'dart:developer';

import 'package:flutter/material.dart';

import '../models/cart_item.dart';
import '../models/produksi.dart';
import '../models/penjualan.dart';
import '../services/api_service.dart';
import '../widgets/currency_input_field.dart';
import '../utils/helpers.dart';

class EditSaleScreen extends StatefulWidget {
  const EditSaleScreen({super.key, required this.token, required this.detail});

  final String token;
  final PenjualanDetail detail;

  @override
  State<EditSaleScreen> createState() => _EditSaleScreenState();
}

class _EditSaleScreenState extends State<EditSaleScreen> {
  final ApiService _api = ApiService();

  final List<Produksi> _productions = <Produksi>[];
  final List<CartItem> _items = <CartItem>[];

  Produksi? _selectedProduction;
  String _selectedSatuanJual = 'kilogram';
  String _beratText = '1';
  String _jumlahTerjualText = '1';
  String _note = '';
  String _selectedStatus = 'lunas';
  String _firstInstallmentText = '';

  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _note = widget.detail.keterangan;
    _selectedStatus = widget.detail.status.isEmpty
        ? 'lunas'
        : widget.detail.status;
    _firstInstallmentText = '';
    Future.microtask(_loadProductionsAndSeedItems);
  }

  @override
  void dispose() {
    super.dispose();
  }

  double get _totalQuantity =>
      _items.fold<double>(0, (sum, item) => sum + item.jumlahTerjual);

  double get _totalValue =>
      _items.fold<double>(0, (sum, item) => sum + item.subtotal);

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

  Future<void> _openProductionPicker() async {
    final queryController = TextEditingController();
    final scrollController = ScrollController();
    final loadedProductions = <Produksi>[];
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
        final response = await _api.getProductionsPage(
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
        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.message)));
      } catch (error) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memuat produksi: $error')),
        );
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
                                  _selectedProduction?.id == production.id;

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
        setState(() {
          _selectedProduction = selected;
          _selectedSatuanJual = 'kilogram';
        });
      }
    });

    queryController.dispose();
    scrollController.dispose();
  }

  String get _composedNote => _note;

  void _mergeDetailProductionsIntoCache(List<PenjualanDetailItem> detailItems) {
    final productionIds = _productions
        .map((production) => production.id)
        .toSet();

    for (final detailItem in detailItems) {
      if (productionIds.add(detailItem.idProduksi)) {
        _productions.add(detailItem.produksi);
      }
    }
  }

  Future<void> _loadProductionsAndSeedItems() async {
    setState(() => _isLoading = true);

    try {
      final productionsResponse = await _api.getProductionsPage(
        widget.token,
        page: 1,
        pageSize: 10,
      );
      final productions = productionsResponse.items;
      if (!mounted) return;

      final productionById = <int, Produksi>{
        for (final p in productions) p.id: p,
      };

      _productions
        ..clear()
        ..addAll(productions);

      _mergeDetailProductionsIntoCache(widget.detail.items);

      _items
        ..clear()
        ..addAll(
          widget.detail.items.map((detailItem) {
            final production =
                productionById[detailItem.idProduksi] ?? detailItem.produksi;
            return CartItem(
              produksi: production,
              idKomodity: detailItem.idKomodity,
              berat: detailItem.berat,
              jumlahTerjual: detailItem.jumlahTerjual,
              satuanJual: detailItem.satuanJual,
            );
          }),
        );

      _selectedProduction = _productions.isEmpty ? null : _productions.first;
    } on ApiUnauthorizedException {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Sesi berakhir.')));
      Navigator.of(context).pop(false);
      return;
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
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _addItem() {
    final production = _selectedProduction;
    if (production == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih produksi terlebih dahulu')),
      );
      return;
    }

    final berat = double.tryParse(_beratText.replaceAll(',', '.').trim()) ?? 0;
    final jumlahTerjual = int.tryParse(_jumlahTerjualText.trim()) ?? 0;
    if (jumlahTerjual <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Jumlah buah harus lebih besar dari 0')),
      );
      return;
    }

    if (_selectedSatuanJual == 'kilogram' && berat <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Jumlah berat harus lebih besar dari 0')),
      );
      return;
    }

    setState(() {
      final existingIndex = _items.indexWhere(
        (item) => item.produksi.id == production.id,
      );

      if (existingIndex >= 0) {
        final existing = _items[existingIndex];
        final mergedBerat = _selectedSatuanJual == 'kilogram'
            ? existing.berat + berat
            : 0.0;
        _items[existingIndex] = existing.copyWith(
          berat: mergedBerat,
          jumlahTerjual: existing.jumlahTerjual + jumlahTerjual,
          satuanJual: _selectedSatuanJual,
        );
      } else {
        _items.add(
          CartItem(
            produksi: production,
            idKomodity: production.idKomoditas,
            berat: _selectedSatuanJual == 'kilogram' ? berat : 0.0,
            jumlahTerjual: jumlahTerjual,
            satuanJual: _selectedSatuanJual,
          ),
        );
      }

      _beratText = '1';
      _jumlahTerjualText = '1';
      _selectedSatuanJual = 'kilogram';
    });
  }

  void _removeItem(int productionId) {
    setState(() {
      _items.removeWhere((item) => item.produksi.id == productionId);
    });
  }

  Future<void> _editItem(CartItem item) async {
    final beratController = TextEditingController(
      text: _formatQuantity(item.berat),
    );
    final jumlahController = TextEditingController(
      text: item.jumlahTerjual.toString(),
    );
    String selectedSatuanJual = item.satuanJual;

    final updated = await showDialog<CartItem>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (dialogContext, setStateDialog) {
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
                        setStateDialog(() {
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

                    if (jumlah <= 0) {
                      ScaffoldMessenger.of(dialogContext).showSnackBar(
                        const SnackBar(
                          content: Text('Jumlah buah harus lebih besar dari 0'),
                        ),
                      );
                      return;
                    }

                    if (selectedSatuanJual == 'kilogram' && berat <= 0) {
                      ScaffoldMessenger.of(dialogContext).showSnackBar(
                        const SnackBar(
                          content: Text('Berat harus lebih besar dari 0'),
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

    setState(() {
      final index = _items.indexWhere(
        (entry) => entry.produksi.id == item.produksi.id,
      );
      if (index >= 0) {
        _items[index] = updated;
      }
    });
  }

  Future<void> _submit() async {
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tambahkan minimal satu item penjualan')),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final itemsPayload = _items
          .map((item) {
            final itemPayload = <String, dynamic>{
              'id_komodity': item.idKomodity,
              'id_produksi': item.produksi.id,
              'jumlah_terjual': item.jumlahTerjual,
              'satuan_jual': item.satuanJual,
            };

            if (item.satuanJual == 'kilogram') {
              itemPayload['berat'] = item.berat;
            }

            return itemPayload;
          })
          .toList(growable: false);

      if (_selectedStatus == 'angsuran') {
        final uang = int.tryParse(
          _firstInstallmentText.replaceAll(RegExp(r'[^0-9]'), ''),
        );
        if (uang == null || uang <= 0) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Masukkan nominal uang muka yang valid untuk angsuran',
              ),
            ),
          );
          return;
        }
        final payload = {
          'keterangan': _composedNote,
          'items': itemsPayload,
          'status': _selectedStatus,
          'uang_muka': uang,
        };

        final message = await _api.updatePenjualan(
          token: widget.token,
          id: widget.detail.id,
          payload: payload,
        );

        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(message)));
        Navigator.of(context).pop(true);
        return;
      }

      final payload = {
        'keterangan': _composedNote,
        'items': itemsPayload,
        'status': _selectedStatus,
      };

      final message = await _api.updatePenjualan(
        token: widget.token,
        id: widget.detail.id,
        payload: payload,
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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memperbarui penjualan: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Penjualan')),
      body: _isLoading
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
                  key: ValueKey(_selectedProduction?.id ?? 'none'),
                  initialValue: _productionLabel(_selectedProduction),
                  decoration: InputDecoration(
                    labelText: 'Pilih Produksi',
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.search_rounded),
                      onPressed: _isSaving ? null : _openProductionPicker,
                    ),
                  ),
                  onTap: _isSaving ? null : _openProductionPicker,
                ),
                const SizedBox(height: 8),
                if (_selectedProduction != null)
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
                      'Stok tersedia: ${_selectedProduction!.jumlah} buah',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                if (_selectedProduction != null) ...[
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    isExpanded: true,
                    initialValue: _selectedSatuanJual,
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
                    onChanged: _isSaving
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
                if (_selectedProduction != null &&
                    _selectedSatuanJual == 'kilogram')
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
                if (_selectedProduction != null &&
                    _selectedSatuanJual == 'kilogram')
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
                  onPressed: _isSaving ? null : _addItem,
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
                if (_items.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE6ECE9)),
                    ),
                    child: const Text(
                      'Belum ada item. Tambahkan minimal satu item untuk menyimpan perubahan penjualan.',
                    ),
                  )
                else
                  ..._items.map(
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
                              style: Theme.of(context).textTheme.titleSmall
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
                                'Berat: ${_formatQuantity(item.berat)} ${item.produksi.komoditas?.satuan ?? ''}',
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
                                    onPressed: _isSaving
                                        ? null
                                        : () => _editItem(item),
                                    icon: const Icon(Icons.edit_outlined),
                                    label: const Text('Edit'),
                                  ),
                                  TextButton.icon(
                                    onPressed: _isSaving
                                        ? null
                                        : () => _removeItem(item.produksi.id),
                                    icon: const Icon(Icons.delete_outline),
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
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text('Total item: ${_formatQuantity(_totalQuantity)}'),
                      Text('Total nilai: ${Helpers.formatRupiah(_totalValue)}'),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _selectedStatus,
                  decoration: const InputDecoration(
                    labelText: 'Status Pembayaran',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'lunas',
                      child: Text('Lunas — Bayar penuh di tempat'),
                    ),
                    DropdownMenuItem(
                      value: 'hutang',
                      child: Text('Hutang — Tidak ada pembayaran awal'),
                    ),
                    DropdownMenuItem(
                      value: 'angsuran',
                      child: Text('Angsuran — Bayar sebagian (DP)'),
                    ),
                  ],
                  onChanged: _isSaving
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
                if (_selectedStatus == 'angsuran') ...[
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
                  onPressed: _isSaving ? null : _submit,
                  icon: _isSaving
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.save_rounded),
                  label: Text(_isSaving ? 'Menyimpan...' : 'Simpan Perubahan'),
                ),
              ],
            ),
    );
  }
}

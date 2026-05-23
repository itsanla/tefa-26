import 'package:flutter/material.dart';

import '../models/produksi.dart';
import '../providers/add_sale_provider.dart';
import '../services/api_service.dart';
import '../utils/ui_utils.dart';

Future<Produksi?> showProductionPicker(
  BuildContext context,
  String token,
  AddSaleProvider provider,
) async {
  final queryController = TextEditingController();
  final scrollController = ScrollController();
  final loadedProductions = <Produksi>[];
  // Use provider to fetch pages so API calls live in business logic.
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
      final response = await provider.fetchProductionsPage(
        token,
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
      if (context.mounted) {
        UiUtils.showSnackBar(context, error.message);
      }
    } catch (error) {
      if (context.mounted) {
        UiUtils.showSnackBar(context, 'Gagal memuat produksi: $error');
      }
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

  final result = await showModalBottomSheet<Produksi>(
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
                (production) => production.kodeProduksi.toLowerCase().contains(
                  queryController.text.trim().toLowerCase(),
                ),
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
                  style: Theme.of(sheetContext).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
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
  );

  queryController.dispose();
  scrollController.dispose();
  return result;
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/app_models.dart';
import '../models/penjualan.dart';
import '../providers/sales_provider.dart';
import '../utils/helpers.dart';
import '../widgets/sale_card.dart';
import '../widgets/stat_chip_widget.dart';

class SalesListSection extends StatelessWidget {
  const SalesListSection({
    super.key,
    required this.session,
    required this.onRefresh,
    required this.onOpenPrinter,
    required this.onSelectSale,
    required this.onCreateSale,
  });

  final AuthSession session;
  final Future<void> Function() onRefresh;
  final VoidCallback onOpenPrinter;
  final Function(Penjualan) onSelectSale;
  final VoidCallback onCreateSale;

  @override
  Widget build(BuildContext context) {
    return Consumer<SalesProvider>(
      builder: (context, provider, child) {
        final items = provider.filteredSales;

        return RefreshIndicator(
          onRefresh: onRefresh,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            children: [
              // Header with stats
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F766E), Color(0xFF134E4A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Penjualan',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        StatChipWidget(
                          label: '${provider.sales.length} penjualan',
                          color: Colors.white,
                        ),
                        StatChipWidget(
                          label: Helpers.formatRupiah(provider.totalValue),
                          color: Colors.white,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Search field
              TextField(
                onChanged: provider.setSearchQuery,
                decoration: InputDecoration(
                  hintText: 'Cari penjualan atau keterangan',
                  prefixIcon: const Icon(Icons.search_rounded),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Error message
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
              if (provider.errorMessage != null) const SizedBox(height: 16),

              // Printer status
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F7F6),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFBFDCD6)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        provider.statusMessage,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                    TextButton(
                      onPressed: onOpenPrinter,
                      child: const Text('Buka Printer'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Create sale button
              FilledButton(
                onPressed: onCreateSale,
                child: const Text('Buat Penjualan'),
              ),
              const SizedBox(height: 16),

              // Sales list title
              Text(
                'Daftar Penjualan',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const SizedBox(height: 12),

              // Sales list or loading/empty state
              if (provider.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 36),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (items.isEmpty)
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE6ECE9)),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Data penjualan tidak ditemukan',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Coba ubah kata kunci pencarian atau muat ulang data.',
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: onRefresh,
                        child: const Text('Muat ulang'),
                      ),
                    ],
                  ),
                )
              else
                ...items.map(
                  (sale) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: SaleCard(
                      sale: sale,
                      onTap: () => onSelectSale(sale),
                    ),
                  ),
                ),
              const SizedBox(height: 80),
            ],
          ),
        );
      },
    );
  }
}

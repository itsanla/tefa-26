import 'package:flutter/material.dart';
import 'package:pos_tefa/models/penjualan.dart';
import 'package:pos_tefa/utils/helpers.dart';
import 'package:pos_tefa/widgets/list_row_widget.dart';
import 'package:pos_tefa/widgets/stat_chip_widget.dart';

class SaleCard extends StatelessWidget {
  final Penjualan sale;
  final VoidCallback onTap;

  const SaleCard({super.key, required this.sale, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Ink(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE6ECE9)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ListRowWidget(
                label: 'Total Harga',
                value: Helpers.formatRupiah(sale.totalHarga),
                emphasize: true,
              ),
              const SizedBox(height: 8),
              ListRowWidget(
                label: 'Total Produk',
                value: sale.jumlahProduk.toString(),
                emphasize: true,
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 110,
                    child: Text(
                      "Kode Produksi",
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.black54,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const Text(': '),
                  Expanded(
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: sale.kodeProduksiList.isEmpty
                          ? [
                              StatChipWidget(
                                label: '-',
                                color: Colors.blue.shade300,
                              ),
                            ]
                          : [
                              StatChipWidget(
                                label: sale.kodeProduksiList.first,
                                color: Colors.blue.shade300,
                              ),
                              if (sale.kodeProduksiList.length > 1)
                                StatChipWidget(
                                  label: '+${sale.kodeProduksiList.length - 1}',
                                  color: Colors.blue.shade300,
                                ),
                            ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ListRowWidget(label: 'Tanggal', value: sale.displayDate),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Tap untuk lihat detail',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.black45,
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    color: Color(0xFF0F766E),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../models/app_models.dart';
import '../models/penjualan.dart';
import '../providers/sales_provider.dart';
import '../services/api_service.dart';
import '../services/receipt_printer.dart';
import '../utils/helpers.dart';
import 'detail_row_widget.dart';

class SaleDetailModal extends StatelessWidget {
  const SaleDetailModal({
    super.key,
    required this.detail,
    required this.provider,
    required this.session,
    required this.onSessionExpired,
  });

  final PenjualanDetail detail;
  final SalesProvider provider;
  final AuthSession session;
  final Future<void> Function() onSessionExpired;

  Future<bool> _showPrintPreview(BuildContext context) async {
    final preview = ReceiptPrinter().buildPenjualanPreview(detail);

    return await showDialog<bool>(
          context: context,
          builder: (dialogContext) {
            return AlertDialog(
              title: const Text('Preview Struk'),
              content: SizedBox(
                width: 360,
                child: SingleChildScrollView(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8F8F8),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE0E0E0)),
                    ),
                    child: SelectableText(
                      preview,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 12,
                        height: 1.45,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogContext).pop(false),
                  child: const Text('Batal'),
                ),
                FilledButton.icon(
                  onPressed: () => Navigator.of(dialogContext).pop(true),
                  icon: const Icon(Icons.print_rounded),
                  label: const Text('Print'),
                ),
              ],
            );
          },
        ) ??
        false;
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Detail Penjualan #${detail.id}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 12),
              DetailRowWidget(
                label: 'Total Harga',
                value: Helpers.formatRupiah(detail.totalHarga),
              ),
              DetailRowWidget(
                label: 'Keterangan',
                value: detail.keterangan.trim().isEmpty ? '-' : detail.keterangan,
              ),
              const SizedBox(height: 8),
              Text(
                'Item',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.black54,
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 8),
              ...detail.items.map((item) {
                final produksi = item.produksi;
                final komoditas = item.komoditas;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${komoditas.nama} — ${produksi.kodeProduksi}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Ukuran: ${produksi.ukuran}  •  Kualitas: ${produksi.kualitas}',
                      ),
                      Text(
                        'Qty: ${item.jumlahTerjual} ${komoditas.satuan}',
                      ),
                      Text(
                        'Harga: ${Helpers.formatRupiah(item.hargaSatuan)}  •  Subtotal: ${Helpers.formatRupiah(item.subTotal)}',
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 14),
              FilledButton.icon(
                onPressed: provider.printingSaleId == detail.id
                    ? null
                    : () async {
                        final shouldPrint = await _showPrintPreview(context);
                        if (!shouldPrint || !context.mounted) return;

                        provider.setPrintingSaleId(detail.id);
                        try {
                          final printer = ReceiptPrinter();
                          final result = await printer.printPenjualanReceipt(detail);
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(result.message)),
                          );
                        } on ApiUnauthorizedException {
                          if (!context.mounted) return;
                          await onSessionExpired();
                        } catch (error) {
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Gagal print penjualan: $error')),
                          );
                        } finally {
                          if (context.mounted) {
                            provider.setPrintingSaleId(null);
                          }
                        }
                      },
                icon: provider.printingSaleId == detail.id
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.print_rounded),
                label: Text(
                  provider.printingSaleId == detail.id ? 'Mencetak...' : 'Print Struk',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

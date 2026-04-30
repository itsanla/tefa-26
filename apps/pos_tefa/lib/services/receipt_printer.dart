import 'package:esc_pos_utils_plus/esc_pos_utils_plus.dart';
import 'package:pos_tefa/models/penjualan.dart';
import 'package:pos_tefa/models/sale_receipt.dart';
import 'package:pos_tefa/utils/helpers.dart';
import 'package:print_bluetooth_thermal/print_bluetooth_thermal.dart';

class PrintReceiptResult {
  const PrintReceiptResult({required this.success, required this.message});

  final bool success;
  final String message;
}

class ReceiptPrinter {
  String buildPenjualanPreview(PenjualanDetail sale) {
    final buffer = StringBuffer();

    buffer.writeln('SMK NEGERI 2 BATUSANGKAR');
    buffer.writeln('Teaching Factory (TEFA)');
    buffer.writeln(_repeat('-', 32));
    buffer.writeln(Helpers.formatTanggal(sale.createdAt));
    buffer.writeln(_repeat('-', 32));

    if (sale.items.length > 1) {
      buffer.writeln('Detail Item');
      for (var i = 0; i < sale.items.length; i++) {
        final item = sale.items[i];
        buffer.writeln('Item ${i + 1}');
        _writeLabelValue(buffer, 'Komoditas', item.komoditas.nama);
        _writeLabelValue(
          buffer,
          'Asal Produksi',
          item.produksi.asalProduksi?.nama ?? '-',
        );
        _writeLabelValue(buffer, 'Kode Produksi', item.produksi.kodeProduksi);
        _writeLabelValue(buffer, 'Ukuran', item.produksi.ukuran);
        _writeLabelValue(buffer, 'Kualitas', item.produksi.kualitas);
        _writeLabelValue(
          buffer,
          'Harga/Satuan',
          Helpers.formatRupiah(item.hargaSatuan),
        );
        _writeLabelValue(
          buffer,
          'Jumlah',
          '${item.jumlahTerjual} ${item.komoditas.satuan}',
        );
        _writeLabelValue(
          buffer,
          'Subtotal',
          Helpers.formatRupiah(item.subTotal),
        );
        if (i < sale.items.length - 1) {
          buffer.writeln(_repeat('-', 32));
        }
      }
    } else if (sale.items.isNotEmpty) {
      final item = sale.items.first;
      _writeLabelValue(buffer, 'Komoditas', item.komoditas.nama);
      _writeLabelValue(
        buffer,
        'Asal Produksi',
        item.produksi.asalProduksi?.nama ?? '-',
      );
      _writeLabelValue(buffer, 'Kode Produksi', item.produksi.kodeProduksi);
      _writeLabelValue(buffer, 'Ukuran', item.produksi.ukuran);
      _writeLabelValue(buffer, 'Kualitas', item.produksi.kualitas);
      buffer.writeln(_repeat('-', 32));
      _writeLabelValue(
        buffer,
        'Harga/Satuan',
        Helpers.formatRupiah(item.hargaSatuan),
      );
      _writeLabelValue(
        buffer,
        'Jumlah',
        '${item.jumlahTerjual} ${item.komoditas.satuan}',
      );
    }

    buffer.writeln(_repeat('-', 32));
    buffer.writeln('TOTAL: ${Helpers.formatRupiah(sale.totalHarga)}');
    buffer.writeln(_repeat('-', 32));

    if (sale.keterangan.trim().isNotEmpty) {
      buffer.writeln('Keterangan:');
      buffer.writeln(sale.keterangan.trim());
      buffer.writeln(_repeat('-', 32));
    }

    buffer.writeln('Terima kasih atas pembelian Anda!');
    buffer.writeln('-- SMKN 2 Batusangkar --');

    return buffer.toString().trimRight();
  }

  Future<PrintReceiptResult> printPenjualanReceipt(PenjualanDetail sale) async {
    final connected = await PrintBluetoothThermal.connectionStatus;
    if (!connected) {
      return const PrintReceiptResult(
        success: false,
        message:
            'Printer thermal belum terhubung. Buka tab Printer untuk connect terlebih dahulu.',
      );
    }

    try {
      final profile = await CapabilityProfile.load();
      final generator = Generator(PaperSize.mm58, profile);
      final bytes = _buildPenjualanDetailBytes(generator, sale);
      final printed = await PrintBluetoothThermal.writeBytes(bytes);

      return PrintReceiptResult(
        success: printed,
        message: printed
            ? 'Struk berhasil dikirim ke printer.'
            : 'Printer tidak merespons. Cek koneksi bluetooth.',
      );
    } catch (error) {
      return PrintReceiptResult(
        success: false,
        message: 'Gagal print struk: $error',
      );
    }
  }

  Future<PrintReceiptResult> printSaleReceipt(SaleReceipt receipt) async {
    final connected = await PrintBluetoothThermal.connectionStatus;
    if (!connected) {
      return const PrintReceiptResult(
        success: false,
        message:
            'Printer thermal belum terhubung. Buka tab Printer untuk connect terlebih dahulu.',
      );
    }

    try {
      final profile = await CapabilityProfile.load();
      final generator = Generator(PaperSize.mm58, profile);
      final bytes = _buildBytes(generator, receipt);
      final printed = await PrintBluetoothThermal.writeBytes(bytes);

      return PrintReceiptResult(
        success: printed,
        message: printed
            ? 'Struk berhasil dikirim ke printer.'
            : 'Printer tidak merespons. Cek koneksi bluetooth.',
      );
    } catch (error) {
      return PrintReceiptResult(
        success: false,
        message: 'Gagal print struk: $error',
      );
    }
  }

  List<int> _buildPenjualanDetailBytes(
    Generator generator,
    PenjualanDetail sale,
  ) {
    final bytes = <int>[];

    bytes.addAll(generator.reset());
    bytes.addAll(
      generator.text(
        'SMK NEGERI 2 BATUSANGKAR',
        styles: const PosStyles(
          align: PosAlign.center,
          bold: true,
          height: PosTextSize.size1,
          width: PosTextSize.size1,
        ),
      ),
    );
    bytes.addAll(
      generator.text(
        'Teaching Factory (TEFA)',
        styles: const PosStyles(align: PosAlign.center),
      ),
    );
    bytes.addAll(generator.hr(ch: '-', linesAfter: 0));
    bytes.addAll(
      generator.text(
        Helpers.formatTanggal(sale.createdAt),
        styles: const PosStyles(align: PosAlign.center),
        linesAfter: 0,
      ),
    );
    bytes.addAll(generator.hr(ch: '-', linesAfter: 0));

    final isMultiItems = sale.items.length > 1;

    if (isMultiItems) {
      bytes.addAll(
        generator.text(
          'Detail Item',
          styles: const PosStyles(bold: true),
          linesAfter: 0,
        ),
      );
      for (var i = 0; i < sale.items.length; i++) {
        final item = sale.items[i];
        bytes.addAll(
          generator.text(
            'Item ${i + 1}',
            styles: const PosStyles(bold: true),
            linesAfter: 0,
          ),
        );
        bytes.addAll(
          _labelValueRow(generator, 'Komoditas', item.komoditas.nama),
        );
        bytes.addAll(
          _labelValueRow(
            generator,
            'Asal Produksi',
            item.produksi.asalProduksi?.nama ?? '-',
          ),
        );
        bytes.addAll(
          _labelValueRow(
            generator,
            'Kode Produksi',
            item.produksi.kodeProduksi,
          ),
        );
        bytes.addAll(_labelValueRow(generator, 'Ukuran', item.produksi.ukuran));
        bytes.addAll(
          _labelValueRow(generator, 'Kualitas', item.produksi.kualitas),
        );
        bytes.addAll(
          _labelValueRow(
            generator,
            'Harga/Satuan',
            Helpers.formatRupiah(item.hargaSatuan),
          ),
        );
        bytes.addAll(
          _labelValueRow(
            generator,
            'Jumlah',
            '${item.jumlahTerjual} ${item.komoditas.satuan}',
          ),
        );
        bytes.addAll(
          _labelValueRow(
            generator,
            'Subtotal',
            Helpers.formatRupiah(item.subTotal),
          ),
        );

        if (i < sale.items.length - 1) {
          bytes.addAll(generator.hr(ch: '-', linesAfter: 0));
        }
      }
    } else if (sale.items.isNotEmpty) {
      final item = sale.items.first;
      bytes.addAll(_labelValueRow(generator, 'Komoditas', item.komoditas.nama));
      bytes.addAll(
        _labelValueRow(
          generator,
          'Asal Produksi',
          item.produksi.asalProduksi?.nama ?? '-',
        ),
      );
      bytes.addAll(
        _labelValueRow(generator, 'Kode Produksi', item.produksi.kodeProduksi),
      );
      bytes.addAll(_labelValueRow(generator, 'Ukuran', item.produksi.ukuran));
      bytes.addAll(
        _labelValueRow(generator, 'Kualitas', item.produksi.kualitas),
      );
      bytes.addAll(generator.hr(ch: '-', linesAfter: 0));
      bytes.addAll(
        _labelValueRow(
          generator,
          'Harga/Satuan',
          Helpers.formatRupiah(item.hargaSatuan),
        ),
      );
      bytes.addAll(
        _labelValueRow(
          generator,
          'Jumlah',
          '${item.jumlahTerjual} ${item.komoditas.satuan}',
        ),
      );
    }

    bytes.addAll(generator.hr(ch: '-', linesAfter: 0));
    bytes.addAll(
      generator.row([
        PosColumn(
          text: 'TOTAL',
          width: 6,
          styles: const PosStyles(bold: true, align: PosAlign.left),
        ),
        PosColumn(
          text: Helpers.formatRupiah(sale.totalHarga),
          width: 6,
          styles: const PosStyles(bold: true, align: PosAlign.right),
        ),
      ]),
    );
    bytes.addAll(generator.hr(ch: '-', linesAfter: 0));

    if (sale.keterangan.trim().isNotEmpty) {
      bytes.addAll(
        generator.text(
          'Keterangan :',
          styles: const PosStyles(),
          linesAfter: 0,
        ),
      );
      bytes.addAll(
        generator.text(
          sale.keterangan.trim(),
          styles: const PosStyles(),
          linesAfter: 0,
        ),
      );
      bytes.addAll(generator.hr(ch: '-', linesAfter: 0));
    }

    bytes.addAll(
      generator.text(
        'Terima kasih atas pembelian Anda!',
        styles: const PosStyles(align: PosAlign.center),
      ),
    );
    bytes.addAll(
      generator.text(
        '-- SMKN 2 Batusangkar --',
        styles: const PosStyles(align: PosAlign.center),
      ),
    );
    bytes.addAll(generator.feed(2));
    bytes.addAll(generator.cut());

    return bytes;
  }

  List<int> _labelValueRow(Generator generator, String label, String value) {
    return generator.row([
      PosColumn(text: label, width: 6, styles: const PosStyles()),
      PosColumn(
        text: value,
        width: 6,
        styles: const PosStyles(align: PosAlign.right),
      ),
    ]);
  }

  void _writeLabelValue(StringBuffer buffer, String label, String value) {
    buffer.writeln('$label: $value');
  }

  String _repeat(String char, int count) =>
      List<String>.filled(count, char).join();

  List<int> _buildBytes(Generator generator, SaleReceipt receipt) {
    final bytes = <int>[];

    bytes.addAll(generator.reset());
    bytes.addAll(
      generator.text(
        receipt.storeName,
        styles: const PosStyles(
          align: PosAlign.center,
          bold: true,
          height: PosTextSize.size2,
          width: PosTextSize.size2,
        ),
      ),
    );
    bytes.addAll(
      generator.text(
        receipt.address,
        styles: const PosStyles(align: PosAlign.center),
        linesAfter: 0,
      ),
    );
    bytes.addAll(
      generator.text(
        'Telp: ${receipt.phone}',
        styles: const PosStyles(align: PosAlign.center),
      ),
    );
    bytes.addAll(generator.hr());
    bytes.addAll(
      generator.row([
        PosColumn(
          text: 'No Struk',
          width: 4,
          styles: const PosStyles(align: PosAlign.left),
        ),
        PosColumn(
          text: receipt.receiptNumber,
          width: 8,
          styles: const PosStyles(align: PosAlign.right),
        ),
      ]),
    );
    bytes.addAll(
      generator.row([
        PosColumn(text: 'Tanggal', width: 4, styles: const PosStyles()),
        PosColumn(
          text: receipt.displayDate,
          width: 8,
          styles: const PosStyles(align: PosAlign.right),
        ),
      ]),
    );
    bytes.addAll(
      generator.row([
        PosColumn(text: 'Kasir', width: 4, styles: const PosStyles()),
        PosColumn(
          text: receipt.cashier,
          width: 8,
          styles: const PosStyles(align: PosAlign.right),
        ),
      ]),
    );
    bytes.addAll(generator.hr());
    bytes.addAll(
      generator.row([
        PosColumn(text: 'Item', width: 6, styles: const PosStyles(bold: true)),
        PosColumn(
          text: 'Qty',
          width: 2,
          styles: const PosStyles(align: PosAlign.right, bold: true),
        ),
        PosColumn(
          text: 'Harga',
          width: 2,
          styles: const PosStyles(align: PosAlign.right, bold: true),
        ),
        PosColumn(
          text: 'Jumlah',
          width: 2,
          styles: const PosStyles(align: PosAlign.right, bold: true),
        ),
      ]),
    );
    bytes.addAll(generator.hr());

    for (final line in receipt.lines) {
      bytes.addAll(
        generator.row([
          PosColumn(
            text: line.name,
            width: 6,
            styles: const PosStyles(align: PosAlign.left),
          ),
          PosColumn(
            text: line.quantity.toString(),
            width: 2,
            styles: const PosStyles(align: PosAlign.right),
          ),
          PosColumn(
            text: Helpers.formatCurrency(line.unitPrice),
            width: 2,
            styles: const PosStyles(align: PosAlign.right),
          ),
          PosColumn(
            text: Helpers.formatCurrency(line.amount),
            width: 2,
            styles: const PosStyles(align: PosAlign.right),
          ),
        ]),
      );
    }

    bytes.addAll(generator.hr());
    bytes.addAll(
      _totalRow(
        generator,
        'Subtotal',
        Helpers.formatCurrency(receipt.subtotal),
      ),
    );
    bytes.addAll(
      _totalRow(generator, 'Pajak (10%)', Helpers.formatCurrency(receipt.tax)),
    );
    bytes.addAll(
      generator.row([
        PosColumn(text: 'Total', width: 8, styles: const PosStyles(bold: true)),
        PosColumn(
          text: Helpers.formatCurrency(receipt.total),
          width: 4,
          styles: const PosStyles(align: PosAlign.right, bold: true),
        ),
      ]),
    );
    bytes.addAll(
      _totalRow(generator, 'Tunai', Helpers.formatCurrency(receipt.cashPaid)),
    );
    bytes.addAll(
      _totalRow(generator, 'Kembalian', Helpers.formatCurrency(receipt.change)),
    );
    bytes.addAll(generator.hr());
    bytes.addAll(
      generator.text(
        receipt.thankYouNote,
        styles: const PosStyles(align: PosAlign.center),
      ),
    );
    bytes.addAll(
      generator.text(
        receipt.termsNote,
        styles: const PosStyles(align: PosAlign.center),
      ),
    );
    bytes.addAll(generator.feed(2));
    bytes.addAll(generator.cut());

    return bytes;
  }

  List<int> _totalRow(Generator generator, String label, String value) {
    return generator.row([
      PosColumn(text: label, width: 8, styles: const PosStyles()),
      PosColumn(
        text: value,
        width: 4,
        styles: const PosStyles(align: PosAlign.right),
      ),
    ]);
  }
}

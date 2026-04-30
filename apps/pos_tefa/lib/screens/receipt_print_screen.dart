import 'dart:io';

import 'package:esc_pos_utils_plus/esc_pos_utils_plus.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:pos_tefa/utils/helpers.dart';
import 'package:print_bluetooth_thermal/print_bluetooth_thermal.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/receipt_data.dart';

String buildLayoutStrukPreviewText(ReceiptData receipt) {
  final buffer = StringBuffer();

  String line(String label, String value) => '$label: $value';

  String dash() => List<String>.filled(32, '-').join();

  String itemTitle(int index) => 'Item ${index + 1}';

  String codeFor(int index) => 'TEST-${(index + 1).toString().padLeft(3, '0')}';

  buffer.writeln('SMK NEGERI 2 BATUSANGKAR');
  buffer.writeln('Teaching Factory (TEFA)');
  buffer.writeln(dash());
  buffer.writeln(Helpers.formatTanggal(receipt.createdAt));
  buffer.writeln(dash());

  if (receipt.items.length > 1) {
    buffer.writeln('Detail Item');
    for (var i = 0; i < receipt.items.length; i++) {
      final item = receipt.items[i];
      buffer.writeln(itemTitle(i));
      buffer.writeln(line('Komoditas', item.name));
      buffer.writeln(line('Asal Produksi', 'Teaching Factory (TEFA)'));
      buffer.writeln(line('Kode Produksi', codeFor(i)));
      buffer.writeln(line('Ukuran', 'Default'));
      buffer.writeln(line('Kualitas', 'A'));
      buffer.writeln(
        line('Harga/Satuan', Helpers.formatRupiah(item.unitPrice)),
      );
      buffer.writeln(line('Jumlah', '${item.quantity} pcs'));
      buffer.writeln(line('Subtotal', Helpers.formatRupiah(item.total)));
      if (i < receipt.items.length - 1) {
        buffer.writeln(dash());
      }
    }
  } else if (receipt.items.isNotEmpty) {
    final item = receipt.items.first;
    buffer.writeln(line('Komoditas', item.name));
    buffer.writeln(line('Asal Produksi', 'Teaching Factory (TEFA)'));
    buffer.writeln(line('Kode Produksi', codeFor(0)));
    buffer.writeln(line('Ukuran', 'Default'));
    buffer.writeln(line('Kualitas', 'A'));
    buffer.writeln(dash());
    buffer.writeln(line('Harga/Satuan', Helpers.formatRupiah(item.unitPrice)));
    buffer.writeln(line('Jumlah', '${item.quantity} pcs'));
  }

  buffer.writeln(dash());
  buffer.writeln('TOTAL: ${Helpers.formatRupiah(receipt.total)}');
  buffer.writeln(dash());

  if (receipt.thankYouNote.trim().isNotEmpty) {
    buffer.writeln('Ket: ${receipt.thankYouNote}');
    buffer.writeln(dash());
  }

  buffer.writeln('Terima kasih atas pembelian Anda!');
  buffer.writeln('-- SMKN 2 Batusangkar --');

  return buffer.toString();
}

class ReceiptPrintScreen extends StatefulWidget {
  const ReceiptPrintScreen({super.key});

  @override
  State<ReceiptPrintScreen> createState() => _ReceiptPrintScreenState();
}

class _ReceiptPrintScreenState extends State<ReceiptPrintScreen> {
  static const String _savedPrinterKey = 'saved_printer_mac';

  final ReceiptData _receipt = ReceiptData.sample();
  final List<BluetoothInfo> _pairedDevices = <BluetoothInfo>[];

  SharedPreferences? _preferences;
  String? _selectedMac;
  String? _connectedMac;
  String _statusMessage = 'Memuat perangkat bluetooth...';
  bool _isBluetoothEnabled = false;
  bool _isConnected = false;
  bool _isBusy = false;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    setState(() {
      _isBusy = true;
      _statusMessage = 'Menyiapkan printer thermal...';
    });

    try {
      _preferences = await SharedPreferences.getInstance();
      await _requestBluetoothPermissions();
      await _refreshPrinterState();
      await _autoConnectLastPrinter();
    } catch (error) {
      _statusMessage = 'Gagal menyiapkan printer: $error';
    } finally {
      if (mounted) {
        setState(() {
          _isBusy = false;
        });
      }
    }
  }

  Future<void> _requestBluetoothPermissions() async {
    if (!Platform.isAndroid) {
      return;
    }

    await [Permission.bluetoothConnect, Permission.bluetoothScan].request();
  }

  Future<void> _refreshPrinterState() async {
    final bluetoothEnabled = await PrintBluetoothThermal.bluetoothEnabled;
    final connectionStatus = await PrintBluetoothThermal.connectionStatus;
    final devices = await PrintBluetoothThermal.pairedBluetooths;

    if (!mounted) {
      return;
    }

    setState(() {
      _isBluetoothEnabled = bluetoothEnabled;
      _isConnected = connectionStatus;
      _pairedDevices
        ..clear()
        ..addAll(devices);

      if (_selectedMac != null && _findDeviceByMac(_selectedMac!) == null) {
        _selectedMac = null;
      }

      if (!bluetoothEnabled) {
        _statusMessage =
            'Bluetooth belum aktif. Nyalakan bluetooth di perangkat Android.';
      } else if (_isConnected && _connectedMac != null) {
        final connectedDevice = _findDeviceByMac(_connectedMac!);
        _statusMessage = connectedDevice == null
            ? 'Printer terakhir masih terhubung.'
            : 'Terhubung ke ${connectedDevice.name} (${connectedDevice.macAdress}).';
      } else {
        _statusMessage = 'Bluetooth aktif. Pilih printer yang sudah dipairing.';
      }
    });
  }

  Future<void> _autoConnectLastPrinter() async {
    final savedMac = _preferences?.getString(_savedPrinterKey);
    if (savedMac == null || savedMac.isEmpty) {
      return;
    }

    if (_isConnected && _connectedMac == savedMac) {
      return;
    }

    final selectedDevice = _findDeviceByMac(savedMac);
    if (selectedDevice != null) {
      _selectedMac = savedMac;
    }

    final printer =
        selectedDevice ??
        BluetoothInfo(name: 'Printer terakhir', macAdress: savedMac);
    await _connectToPrinter(printer, isAutoConnect: true);
  }

  BluetoothInfo? _findDeviceByMac(String mac) {
    for (final device in _pairedDevices) {
      if (device.macAdress == mac) {
        return device;
      }
    }
    return null;
  }

  BluetoothInfo? get _selectedDevice =>
      _selectedMac == null ? null : _findDeviceByMac(_selectedMac!);

  Future<void> _connectSelectedPrinter() async {
    final selectedDevice = _selectedDevice;
    if (selectedDevice == null) {
      setState(() {
        _statusMessage = 'Pilih printer bluetooth yang sudah dipairing.';
      });
      return;
    }

    await _connectToPrinter(selectedDevice);
  }

  Future<void> _connectToPrinter(
    BluetoothInfo device, {
    bool isAutoConnect = false,
  }) async {
    setState(() {
      _isBusy = true;
      _statusMessage = isAutoConnect
          ? 'Mencoba reconnect ke printer terakhir...'
          : 'Menghubungkan ke ${device.name}...';
    });

    final connected = await PrintBluetoothThermal.connect(
      macPrinterAddress: device.macAdress,
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _isConnected = connected;
      _connectedMac = connected ? device.macAdress : null;
      _statusMessage = connected
          ? 'Terhubung ke ${device.name} (${device.macAdress}).'
          : 'Gagal terhubung ke ${device.name}. Pastikan printer menyala dan sudah dipairing.';
      _isBusy = false;
    });

    if (connected) {
      await _preferences?.setString(_savedPrinterKey, device.macAdress);
    }
  }

  Future<void> _disconnectPrinter() async {
    setState(() {
      _isBusy = true;
      _statusMessage = 'Memutus koneksi printer...';
    });

    await PrintBluetoothThermal.disconnect;

    if (!mounted) {
      return;
    }

    setState(() {
      _isConnected = false;
      _connectedMac = null;
      _statusMessage = 'Koneksi printer diputus.';
      _isBusy = false;
    });
  }

  Future<void> _printReceipt() async {
    if (!_isConnected) {
      setState(() {
        _statusMessage = 'Hubungkan printer terlebih dahulu sebelum print.';
      });
      return;
    }

    setState(() {
      _isBusy = true;
      _statusMessage = 'Menyiapkan data struk...';
    });

    try {
      final profile = await CapabilityProfile.load();
      final generator = Generator(PaperSize.mm58, profile);
      final bytes = _buildReceiptBytes(generator, _receipt);
      final printed = await PrintBluetoothThermal.writeBytes(bytes);

      if (!mounted) {
        return;
      }

      setState(() {
        _statusMessage = printed
            ? 'Struk berhasil dikirim ke printer.'
            : 'Printer tidak merespons. Cek koneksi bluetooth.';
      });
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _statusMessage = 'Gagal print struk: $error';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isBusy = false;
        });
      }
    }
  }

  List<int> _buildReceiptBytes(Generator generator, ReceiptData receipt) {
    final bytes = <int>[];
    final lines = buildLayoutStrukPreviewText(receipt).split('\n');

    bytes.addAll(generator.reset());

    for (final rawLine in lines) {
      final line = rawLine.trimRight();
      if (line.isEmpty) {
        bytes.addAll(generator.feed(1));
        continue;
      }

      if (_isDividerLine(line)) {
        bytes.addAll(generator.hr(ch: '-', linesAfter: 0));
        continue;
      }

      if (line == receipt.storeName) {
        bytes.addAll(
          generator.text(
            line,
            styles: const PosStyles(
              align: PosAlign.center,
              bold: true,
              height: PosTextSize.size1,
              width: PosTextSize.size1,
            ),
          ),
        );
        continue;
      }

      if (line == receipt.address || line == 'Telp: ${receipt.phone}') {
        bytes.addAll(
          generator.text(
            line,
            styles: const PosStyles(align: PosAlign.center),
            linesAfter: 0,
          ),
        );
        continue;
      }

      if (_isDateLine(line) || line == 'Detail Item') {
        bytes.addAll(
          generator.text(
            line,
            styles: const PosStyles(align: PosAlign.center),
            linesAfter: 0,
          ),
        );
        continue;
      }

      if (line.startsWith('Item ')) {
        bytes.addAll(
          generator.text(
            line,
            styles: const PosStyles(bold: true),
            linesAfter: 0,
          ),
        );
        continue;
      }

      if (line.startsWith('TOTAL:')) {
        bytes.addAll(
          generator.text(
            line,
            styles: const PosStyles(bold: true),
            linesAfter: 0,
          ),
        );
        continue;
      }

      if (line.startsWith('Terima kasih') || line.startsWith('-- SMKN')) {
        bytes.addAll(
          generator.text(line, styles: const PosStyles(align: PosAlign.center)),
        );
        continue;
      }

      bytes.addAll(
        generator.text(line, styles: const PosStyles(), linesAfter: 0),
      );
    }

    bytes.addAll(generator.feed(2));
    bytes.addAll(generator.cut());

    return bytes;
  }

  bool _isDividerLine(String line) => RegExp(r'^-+$').hasMatch(line);

  bool _isDateLine(String line) {
    return RegExp(r'^\d{2} [A-Za-z]+ \d{4} \d{2}:\d{2}$').hasMatch(line);
  }

  String _statusLabel() {
    if (!_isBluetoothEnabled) {
      return 'Bluetooth mati';
    }

    if (_isConnected) {
      return 'Terhubung';
    }

    return 'Siap connect';
  }

  Color _statusColor(BuildContext context) {
    if (!_isBluetoothEnabled) {
      return Colors.red.shade700;
    }

    if (_isConnected) {
      return Colors.green.shade700;
    }

    return Theme.of(context).colorScheme.primary;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final connectedDevice = _connectedMac == null
        ? null
        : _findDeviceByMac(_connectedMac!);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6F5),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0F766E), Color(0xFF134E4A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(28),
                  bottomRight: Radius.circular(28),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Test Print Struk',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Preview ini mengikuti bentuk struk yang dipakai aplikasi sebenarnya.',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.9),
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      _StatusChip(
                        label: _statusLabel(),
                        backgroundColor: Colors.white,
                        foregroundColor: _statusColor(context),
                      ),
                      _StatusChip(
                        label: 'Struk asli',
                        backgroundColor: Colors.white.withValues(alpha: 0.18),
                        foregroundColor: Colors.white,
                      ),
                      _StatusChip(
                        label: 'Test print',
                        backgroundColor: Colors.white.withValues(alpha: 0.18),
                        foregroundColor: Colors.white,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _PanelCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                'Koneksi Printer',
                                style: theme.textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            IconButton(
                              tooltip: 'Refresh perangkat',
                              onPressed: _isBusy ? null : _bootstrap,
                              icon: const Icon(Icons.refresh_rounded),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<String>(
                          isExpanded: true,
                          initialValue: _selectedMac,
                          decoration: const InputDecoration(
                            labelText: 'Printer yang dipairing',
                            border: OutlineInputBorder(),
                          ),
                          items: _pairedDevices
                              .map(
                                (device) => DropdownMenuItem<String>(
                                  value: device.macAdress,
                                  child: Expanded(
                                    child: Text(
                                      '${device.name.isEmpty ? 'Unknown' : device.name} (${device.macAdress})',
                                    ),
                                  ),
                                ),
                              )
                              .toList(),
                          onChanged: _isBusy
                              ? null
                              : (value) {
                                  setState(() {
                                    _selectedMac = value;
                                  });
                                },
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _statusMessage,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            FilledButton.icon(
                              onPressed: _isBusy || _selectedDevice == null
                                  ? null
                                  : _connectSelectedPrinter,
                              icon: const Icon(
                                Icons.bluetooth_connected_rounded,
                              ),
                              label: const Text('Connect'),
                            ),
                            OutlinedButton.icon(
                              onPressed: _isBusy || !_isConnected
                                  ? null
                                  : _disconnectPrinter,
                              icon: const Icon(Icons.link_off_rounded),
                              label: const Text('Disconnect'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _pairedDevices.isEmpty
                              ? 'Belum ada printer paired. Pair dulu lewat pengaturan Bluetooth Android.'
                              : '${_pairedDevices.length} perangkat paired ditemukan.',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.black54,
                          ),
                        ),
                        if (connectedDevice != null) ...[
                          const SizedBox(height: 6),
                          Text(
                            'Terkoneksi ke: ${connectedDevice.name} (${connectedDevice.macAdress})',
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _PanelCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                'Preview Test Print',
                                style: theme.textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            const Icon(Icons.receipt_long_rounded),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _ReceiptPreview(receipt: _receipt),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 20,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: _isBusy ? null : _printReceipt,
                        icon: const Icon(Icons.print_rounded),
                        label: const Text('Print Struk'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PanelCard extends StatelessWidget {
  const _PanelCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE6ECE9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({
    required this.label,
    required this.backgroundColor,
    required this.foregroundColor,
  });

  final String label;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(color: foregroundColor, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _ReceiptPreview extends StatelessWidget {
  const _ReceiptPreview({required this.receipt});

  final ReceiptData receipt;

  @override
  Widget build(BuildContext context) {
    final previewText = buildLayoutStrukPreviewText(receipt);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFCFCFC),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE6ECE9)),
      ),
      child: SelectableText(
        previewText,
        style: const TextStyle(
          fontFamily: 'Courier New',
          fontSize: 12,
          height: 1.45,
          color: Colors.black87,
        ),
      ),
    );
  }
}

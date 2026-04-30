class ReceiptItem {
  const ReceiptItem({
    required this.name,
    required this.quantity,
    required this.unitPrice,
  });

  final String name;
  final int quantity;
  final int unitPrice;

  int get total => quantity * unitPrice;
}

class ReceiptData {
  const ReceiptData({
    required this.storeName,
    required this.address,
    required this.phone,
    required this.receiptNumber,
    required this.cashier,
    required this.createdAt,
    required this.items,
    required this.taxRate,
    required this.cashPaid,
    required this.thankYouNote,
    required this.termsNote,
  });

  final String storeName;
  final String address;
  final String phone;
  final String receiptNumber;
  final String cashier;
  final DateTime createdAt;
  final List<ReceiptItem> items;
  final double taxRate;
  final int cashPaid;
  final String thankYouNote;
  final String termsNote;

  factory ReceiptData.sample() {
    return ReceiptData(
      storeName: 'SMK NEGERI 2 BATUSANGKAR',
      address: 'Teaching Factory (TEFA)',
      phone: '-',
      receiptNumber: 'TEST-PRINT-001',
      cashier: 'Admin',
      createdAt: DateTime(2026, 4, 29, 8, 0),
      items: const [
        ReceiptItem(name: 'Semangka', quantity: 2, unitPrice: 15000),
        ReceiptItem(name: 'Alpukat', quantity: 1, unitPrice: 5000),
        ReceiptItem(name: 'Stroberi', quantity: 1, unitPrice: 12000),
      ],
      taxRate: 0.10,
      cashPaid: 70000,
      thankYouNote: 'Terima kasih atas pembelian Anda!',
      termsNote: '-- SMKN 2 Batusangkar --',
    );
  }

  int get subtotal => items.fold<int>(0, (total, item) => total + item.total);

  int get tax => (subtotal * taxRate).round();

  int get total => subtotal + tax;

  int get change => cashPaid - total;

  String get displayDate =>
      '${createdAt.day.toString().padLeft(2, '0')}-${createdAt.month.toString().padLeft(2, '0')}-${createdAt.year} '
      '${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}';
}

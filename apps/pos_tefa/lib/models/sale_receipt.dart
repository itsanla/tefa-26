class SaleReceiptLine {
  const SaleReceiptLine({
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.amount,
  });

  final String name;
  final int quantity;
  final int unitPrice;
  final int amount;
}

class SaleReceipt {
  const SaleReceipt({
    required this.storeName,
    required this.address,
    required this.phone,
    required this.receiptNumber,
    required this.cashier,
    required this.createdAt,
    required this.lines,
    required this.cashPaid,
    required this.taxRate,
    required this.thankYouNote,
    required this.termsNote,
  });

  final String storeName;
  final String address;
  final String phone;
  final String receiptNumber;
  final String cashier;
  final DateTime createdAt;
  final List<SaleReceiptLine> lines;
  final int cashPaid;
  final double taxRate;
  final String thankYouNote;
  final String termsNote;

  int get subtotal => lines.fold<int>(0, (sum, line) => sum + line.amount);

  int get tax => (subtotal * taxRate).round();

  int get total => subtotal + tax;

  int get change => cashPaid - total;

  String get displayDate =>
      '${createdAt.day.toString().padLeft(2, '0')}-${createdAt.month.toString().padLeft(2, '0')}-${createdAt.year} '
      '${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}';
}

class Helpers {
  static int toInt(Object? value, {int fallback = 0}) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? fallback;
    return fallback;
  }

  static DateTime? parseDateTime(Object? value) {
    if (value == null) return null;
    if (value is int) {
      return DateTime.fromMillisecondsSinceEpoch(value * 1000, isUtc: true);
    }
    if (value is num) {
      return DateTime.fromMillisecondsSinceEpoch(
        value.toInt() * 1000,
        isUtc: true,
      );
    }
    if (value is String) {
      return DateTime.tryParse(value);
    }
    return null;
  }

  static String formatCurrency(int value) {
    final digits = value.abs().toString();
    final reversed = digits.split('').reversed.toList();
    final buffer = StringBuffer();

    for (var index = 0; index < reversed.length; index++) {
      if (index > 0 && index % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(reversed[index]);
    }

    final formatted = buffer.toString().split('').reversed.join();
    return '${value < 0 ? '-' : ''}$formatted';
  }

  static String formatRupiah(int value) => 'Rp ${formatCurrency(value)}';

  static String formatTanggal(DateTime? value) {
    final local = (value ?? DateTime.now()).toLocal();
    const monthNames = <String>[
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    return '${local.day.toString().padLeft(2, '0')} '
        '${monthNames[local.month - 1]} '
        '${local.year} '
        '${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
  }
}

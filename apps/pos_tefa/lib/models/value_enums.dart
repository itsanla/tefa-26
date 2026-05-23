enum Unit { kilogram, buah }

extension UnitExt on Unit {
  String get value {
    switch (this) {
      case Unit.buah:
        return 'buah';
      case Unit.kilogram:
        return 'kilogram';
    }
  }

  String get label {
    switch (this) {
      case Unit.buah:
        return 'Per Buah';
      case Unit.kilogram:
        return 'Per Kilogram (kg)';
    }
  }

  static Unit fromString(String? value) {
    if (value == null) return Unit.kilogram;
    final v = value.trim().toLowerCase();
    if (v == 'buah') return Unit.buah;
    return Unit.kilogram;
  }
}

enum PaymentStatus { lunas, hutang, angsuran }

extension PaymentStatusExt on PaymentStatus {
  String get value {
    switch (this) {
      case PaymentStatus.hutang:
        return 'hutang';
      case PaymentStatus.angsuran:
        return 'angsuran';
      case PaymentStatus.lunas:
        return 'lunas';
    }
  }

  String get label {
    switch (this) {
      case PaymentStatus.hutang:
        return 'Hutang';
      case PaymentStatus.angsuran:
        return 'Angsuran';
      case PaymentStatus.lunas:
        return 'Lunas';
    }
  }

  static PaymentStatus fromString(String? value) {
    if (value == null) return PaymentStatus.lunas;
    final v = value.trim().toLowerCase();
    if (v == 'hutang') return PaymentStatus.hutang;
    if (v == 'angsuran') return PaymentStatus.angsuran;
    return PaymentStatus.lunas;
  }
}

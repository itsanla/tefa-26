import 'package:pos_tefa/utils/helpers.dart';

class AsalProduksi {
  const AsalProduksi({
    required this.id,
    required this.nama,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final String nama;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory AsalProduksi.fromJson(Map<String, dynamic> json) {
    return AsalProduksi(
      id: Helpers.toInt(json['id']),
      nama: (json['nama'] ?? '') as String,
      createdAt: Helpers.parseDateTime(json['created_at']),
      updatedAt: Helpers.parseDateTime(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nama': nama,
    if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
    if (updatedAt != null) 'updated_at': updatedAt!.toIso8601String(),
  };
}

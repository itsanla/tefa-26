import 'package:pos_tefa/utils/helpers.dart';

class Jenis {
  const Jenis({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final String name;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory Jenis.fromJson(Map<String, dynamic> json) {
    return Jenis(
      id: Helpers.toInt(json['id']),
      name: (json['name'] ?? '') as String,
      createdAt: Helpers.parseDateTime(json['created_at']),
      updatedAt: Helpers.parseDateTime(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
    if (updatedAt != null) 'updated_at': updatedAt!.toIso8601String(),
  };
}

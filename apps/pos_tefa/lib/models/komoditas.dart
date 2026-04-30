import 'package:pos_tefa/models/jenis.dart';
import 'package:pos_tefa/utils/helpers.dart';

class Komoditas {
  const Komoditas({
    required this.id,
    required this.idJenis,
    required this.nama,
    required this.deskripsi,
    required this.foto,
    required this.satuan,
    required this.jumlah,
    required this.jenis,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final int idJenis;
  final String nama;
  final String deskripsi;
  final String foto;
  final String satuan;
  final int jumlah;
  final Jenis? jenis;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory Komoditas.fromJson(Map<String, dynamic> json) {
    final jenisObj = json['jenis'] as Map<String, dynamic>?;
    return Komoditas(
      id: Helpers.toInt(json['id']),
      idJenis: Helpers.toInt(json['id_jenis']),
      nama: (json['nama'] ?? '') as String,
      deskripsi: (json['deskripsi'] ?? '') as String,
      foto: (json['foto'] ?? '') as String,
      satuan: (json['satuan'] ?? '') as String,
      jumlah: Helpers.toInt(json['jumlah']),
      jenis: jenisObj != null ? Jenis.fromJson(jenisObj) : null,
      createdAt: Helpers.parseDateTime(json['created_at']),
      updatedAt: Helpers.parseDateTime(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'id_jenis': idJenis,
    'nama': nama,
    'deskripsi': deskripsi,
    'foto': foto,
    'satuan': satuan,
    'jumlah': jumlah,
    if (jenis != null) 'jenis': jenis!.toJson(),
    if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
    if (updatedAt != null) 'updated_at': updatedAt!.toIso8601String(),
  };
}

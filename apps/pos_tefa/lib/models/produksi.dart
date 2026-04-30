import 'package:pos_tefa/models/asal_produksi.dart';
import 'package:pos_tefa/models/komoditas.dart';
import 'package:pos_tefa/utils/helpers.dart';

class Produksi {
  const Produksi({
    required this.id,
    required this.idAsal,
    required this.idKomoditas,
    required this.kodeProduksi,
    required this.ukuran,
    required this.kualitas,
    required this.jumlah,
    required this.hargaPersatuan,
    required this.asalProduksi,
    required this.komoditas,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final int idAsal;
  final int idKomoditas;
  final String kodeProduksi;
  final String ukuran;
  final String kualitas;
  final int jumlah;
  final int hargaPersatuan;
  final AsalProduksi? asalProduksi;
  final Komoditas? komoditas;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory Produksi.fromJson(Map<String, dynamic> json) {
    final asalObj = json['asal_produksi'] as Map<String, dynamic>?;
    final komodObj = json['komoditas'] as Map<String, dynamic>?;

    return Produksi(
      id: Helpers.toInt(json['id']),
      idAsal: Helpers.toInt(json['id_asal']),
      idKomoditas: Helpers.toInt(json['id_komoditas']),
      kodeProduksi: (json['kode_produksi'] ?? '') as String,
      ukuran: (json['ukuran'] ?? '') as String,
      kualitas: (json['kualitas'] ?? '') as String,
      jumlah: Helpers.toInt(json['jumlah']),
      hargaPersatuan: Helpers.toInt(json['harga_persatuan']),
      asalProduksi: asalObj != null ? AsalProduksi.fromJson(asalObj) : null,
      komoditas: komodObj != null ? Komoditas.fromJson(komodObj) : null,
      createdAt: Helpers.parseDateTime(json['created_at']),
      updatedAt: Helpers.parseDateTime(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'id_asal': idAsal,
    'id_komoditas': idKomoditas,
    'kode_produksi': kodeProduksi,
    'ukuran': ukuran,
    'kualitas': kualitas,
    'jumlah': jumlah,
    'harga_persatuan': hargaPersatuan,
    if (asalProduksi != null) 'asal_produksi': asalProduksi!.toJson(),
    if (komoditas != null) 'komoditas': komoditas!.toJson(),
    if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
    if (updatedAt != null) 'updated_at': updatedAt!.toIso8601String(),
  };
}

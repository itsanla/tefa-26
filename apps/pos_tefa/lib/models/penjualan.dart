import 'package:pos_tefa/models/komoditas.dart';
import 'package:pos_tefa/models/produksi.dart';
import 'package:pos_tefa/utils/helpers.dart';

class Penjualan {
  const Penjualan({
    required this.id,
    required this.totalHarga,
    required this.keterangan,
    required this.jumlahProduk,
    required this.kodeProduksiList,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final int totalHarga;
  final String keterangan;
  final int jumlahProduk;
  final List<String> kodeProduksiList;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory Penjualan.fromJson(Map<String, dynamic> json) {
    return Penjualan(
      id: Helpers.toInt(json['id']),
      totalHarga: Helpers.toInt(json['total_harga']),
      keterangan: (json['keterangan'] ?? '') as String,
      jumlahProduk: Helpers.toInt(json['jumlah_produk']),
      kodeProduksiList: List<String>.from(json['kode_produksi_list']),
      createdAt: Helpers.parseDateTime(json['createdAt']),
      updatedAt: Helpers.parseDateTime(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'total_harga': totalHarga,
    'keterangan': keterangan,
    if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
  };

  String get displayDate {
    if (createdAt == null) return '-';
    final local = createdAt!.toLocal();
    return '${local.day.toString().padLeft(2, '0')} '
        '${_monthNames[local.month - 1]} '
        '${local.year} '
        '${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
  }

  static const List<String> _monthNames = <String>[
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
}

/// Detail item within a penjualan (from GET /api/penjualan/:id items array)
class PenjualanDetailItem {
  final int id;
  final int idKomodity;
  final int idProduksi;
  final int jumlahTerjual;
  final int hargaSatuan;
  final int subTotal;
  final Komoditas komoditas;
  final Produksi produksi;

  PenjualanDetailItem({
    required this.id,
    required this.idKomodity,
    required this.idProduksi,
    required this.jumlahTerjual,
    required this.hargaSatuan,
    required this.subTotal,
    required this.komoditas,
    required this.produksi,
  });

  factory PenjualanDetailItem.fromJson(Map<String, dynamic> json) {
    return PenjualanDetailItem(
      id: Helpers.toInt(json['id']),
      idKomodity: Helpers.toInt(json['idKomodity']),
      idProduksi: Helpers.toInt(json['idProduksi']),
      jumlahTerjual: Helpers.toInt(json['jumlah_terjual']),
      hargaSatuan: Helpers.toInt(json['harga_satuan']),
      subTotal: Helpers.toInt(json['sub_total']),
      komoditas: Komoditas.fromJson(json['komoditas']),
      produksi: Produksi.fromJson(json['produksi']),
    );
  }
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'idKomodity': idKomodity,
      'idProduksi': idProduksi,
      'jumlahTerjual': jumlahTerjual,
      'hargaSatuan': hargaSatuan,
      'subTotal': subTotal,
      'komoditas': komoditas.toJson(),
      'produksi': produksi.toJson(),
    };
  }
}

class PenjualanDetail {
  const PenjualanDetail({
    required this.id,
    required this.totalHarga,
    required this.keterangan,
    required this.items,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final int totalHarga;
  final String keterangan;
  final List<PenjualanDetailItem> items;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory PenjualanDetail.fromJson(Map<String, dynamic> json) {
    final itemsData = json['items'];
    final itemsList = <PenjualanDetailItem>[];

    if (itemsData is List) {
      itemsList.addAll(
        itemsData.whereType<Map<String, dynamic>>().map(
          PenjualanDetailItem.fromJson,
        ),
      );
    }

    return PenjualanDetail(
      id: Helpers.toInt(json['id']),
      totalHarga: Helpers.toInt(json['total_harga']),
      keterangan: (json['keterangan'] ?? '') as String,
      items: itemsList,
      createdAt: Helpers.parseDateTime(json['created_at']),
      updatedAt: Helpers.parseDateTime(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'total_harga': totalHarga,
    'keterangan': keterangan,
    'items': items.map((i) => i.toJson()).toList(),
    if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
    if (updatedAt != null) 'updated_at': updatedAt!.toIso8601String(),
  };
}

typedef PenjualanItem = PenjualanDetailItem;

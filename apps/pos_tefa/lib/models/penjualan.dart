import 'package:pos_tefa/models/komoditas.dart';
import 'package:pos_tefa/models/produksi.dart';
import 'package:pos_tefa/utils/helpers.dart';

class Penjualan {
  const Penjualan({
    required this.id,
    required this.totalHarga,
    required this.keterangan,
    required this.status,
    required this.jumlahProduk,
    required this.kodeProduksiList,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final int totalHarga;
  final String keterangan;
  final String status;
  final int jumlahProduk;
  final List<String> kodeProduksiList;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory Penjualan.fromJson(Map<String, dynamic> json) {
    return Penjualan(
      id: Helpers.toInt(json['id']),
      totalHarga: Helpers.toInt(json['total_harga']),
      keterangan: (json['keterangan'] ?? '') as String,
      status: (json['status'] ?? '') as String,
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
    'status': status,
    if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
  };

  String get displayDate {
    return Helpers.formatTanggal(createdAt);
  }
}

class PenjualanDetailItem {
  final int id;
  final int idKomodity;
  final int idProduksi;
  final int jumlahTerjual;
  final double berat;
  final String satuanJual;
  final int hargaSatuan;
  final int subTotal;
  final Komoditas komoditas;
  final Produksi produksi;

  PenjualanDetailItem({
    required this.id,
    required this.idKomodity,
    required this.idProduksi,
    required this.jumlahTerjual,
    required this.berat,
    required this.satuanJual,
    required this.hargaSatuan,
    required this.subTotal,
    required this.komoditas,
    required this.produksi,
  });

  factory PenjualanDetailItem.fromJson(Map<String, dynamic> json) {
    return PenjualanDetailItem(
      id: Helpers.toInt(json['id']),
      idKomodity: Helpers.toInt(json['id_komodity'] ?? json['idKomodity']),
      idProduksi: Helpers.toInt(json['id_produksi'] ?? json['idProduksi']),
      jumlahTerjual: Helpers.toInt(json['jumlah_terjual']),
      berat: _toDouble(json['berat']),
      satuanJual: (json['satuan_jual'] ?? 'kilogram').toString(),
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
      'berat': berat,
      'satuanJual': satuanJual,
      'hargaSatuan': hargaSatuan,
      'subTotal': subTotal,
      'komoditas': komoditas.toJson(),
      'produksi': produksi.toJson(),
    };
  }
}

class Pembayaran {
  final int id;
  final int jumlahBayar;
  final String keterangan;
  final DateTime? createdAt;

  Pembayaran({
    required this.id,
    required this.jumlahBayar,
    required this.keterangan,
    required this.createdAt,
  });

  factory Pembayaran.fromJson(Map<String, dynamic> json) {
    return Pembayaran(
      id: Helpers.toInt(json['id']),
      jumlahBayar: Helpers.toInt(json['jumlah_bayar']),
      keterangan: (json['keterangan'] ?? '') as String,
      createdAt: Helpers.parseDateTime(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'jumlah_bayar': jumlahBayar,
    'keterangan': keterangan,
    if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
  };

  String get formattedDate {
    return Helpers.formatTanggal(createdAt);
  }
}

class PenjualanDetail {
  const PenjualanDetail({
    required this.id,
    required this.totalHarga,
    required this.keterangan,
    required this.items,
    required this.status,
    required this.totalTerbayar,
    required this.pembayaran,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final int totalHarga;
  final String keterangan;
  final List<PenjualanDetailItem> items;
  final String status;
  final int totalTerbayar;
  final List<Pembayaran> pembayaran;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  bool get canPay => status == 'hutang' || status == 'angsuran';
  int get sisaTagihan {
    final remaining = totalHarga - totalTerbayar;
    return remaining > 0 ? remaining : 0;
  }

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

    final pembayaranData = json['pembayaran'];
    final pembayaranList = <Pembayaran>[];

    if (pembayaranData is List) {
      pembayaranList.addAll(
        pembayaranData.whereType<Map<String, dynamic>>().map(
          Pembayaran.fromJson,
        ),
      );
    }

    return PenjualanDetail(
      id: Helpers.toInt(json['id']),
      totalHarga: Helpers.toInt(json['total_harga']),
      keterangan: (json['keterangan'] ?? '') as String,
      items: itemsList,
      status: (json['status'] ?? '').toString(),
      totalTerbayar: Helpers.toInt(
        json['total_terbayar'] ?? json['total_bayar'],
      ),
      pembayaran: pembayaranList,
      createdAt: Helpers.parseDateTime(json['createdAt'] ?? json['created_at']),
      updatedAt: Helpers.parseDateTime(json['updatedAt'] ?? json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'total_harga': totalHarga,
    'keterangan': keterangan,
    'status': status,
    'total_terbayar': totalTerbayar,
    'items': items.map((i) => i.toJson()).toList(),
    'pembayaran': pembayaran.map((p) => p.toJson()).toList(),
    if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
  };
}

typedef PenjualanItem = PenjualanDetailItem;

double _toDouble(Object? value, {double fallback = 0}) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? fallback;
  return fallback;
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/app_models.dart';
import '../models/penjualan.dart';
import '../providers/sales_provider.dart';
import '../services/api_service.dart';
import '../widgets/sale_detail_modal.dart';
import '../widgets/sales_list_section.dart';
import 'add_sale_screen.dart';

class SalesScreen extends StatefulWidget {
  const SalesScreen({
    super.key,
    required this.session,
    required this.onOpenPrinter,
    required this.onSessionExpired,
  });

  final AuthSession session;
  final VoidCallback onOpenPrinter;
  final Future<void> Function() onSessionExpired;

  @override
  State<SalesScreen> createState() => _SalesScreenState();
}

class _SalesScreenState extends State<SalesScreen> {
  final SalesProvider _provider = SalesProvider();

  @override
  void initState() {
    super.initState();
    Future.microtask(_loadSales);
  }

  @override
  void dispose() {
    _provider.dispose();
    super.dispose();
  }

  Future<void> _loadSales() async {
    try {
      await _provider.loadSales(widget.session.token);
    } on ApiUnauthorizedException {
      if (!mounted) return;
      await widget.onSessionExpired();
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat data penjualan: $error')),
      );
    }
  }

  Future<void> _openSaleDetail(Penjualan sale) async {
    try {
      final detail = await _provider.loadSaleDetail(widget.session.token, sale.id);
      if (!mounted) return;

      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        backgroundColor: Colors.white,
        builder: (sheetContext) => SaleDetailModal(
          detail: detail,
          provider: _provider,
          session: widget.session,
          onSessionExpired: widget.onSessionExpired,
        ),
      );
    } on ApiUnauthorizedException {
      if (!mounted) return;
      await widget.onSessionExpired();
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat detail penjualan: $error')),
      );
    }
  }

  Future<void> _handleCreateSale() async {
    _provider.clear();
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => AddSaleScreen(token: widget.session.token),
      ),
    );

    if (created == true && mounted) {
      await _loadSales();
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: _provider,
      child: SalesListSection(
        session: widget.session,
        onRefresh: _loadSales,
        onOpenPrinter: widget.onOpenPrinter,
        onSelectSale: _openSaleDetail,
        onCreateSale: _handleCreateSale,
      ),
    );
  }
}

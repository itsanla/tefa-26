import 'package:flutter/material.dart';
import '../utils/helpers.dart';

typedef FormatQuantity = String Function(double);

class SummaryCard extends StatelessWidget {
  const SummaryCard({
    super.key,
    required this.totalItems,
    required this.totalValue,
    required this.formatQuantity,
  });

  final double totalItems;
  final double totalValue;
  final FormatQuantity formatQuantity;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F7F6),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBFDCD6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ringkasan',
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text('Total item: ${formatQuantity(totalItems)}'),
          Text('Total nilai: ${Helpers.formatRupiah(totalValue)}'),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/scheduler.dart';

import '../utils/helpers.dart';

class CurrencyInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue;
    }

    final digitsOnly = newValue.text.replaceAll(RegExp(r'[^\d]'), '');
    if (digitsOnly.isEmpty) {
      return newValue.copyWith(text: '');
    }

    final formatted = Helpers.formatCurrency(int.parse(digitsOnly));

    return newValue.copyWith(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

class CurrencyInputField extends StatelessWidget {
  const CurrencyInputField({
    super.key,
    required this.labelText,
    this.initialValue = '',
    this.onChanged,
    this.prefixText,
    this.decoration,
    this.controller,
    this.focusNode,
  });

  final String labelText;
  final String initialValue;
  final ValueChanged<String>? onChanged;
  final String? prefixText;
  final InputDecoration? decoration;
  final TextEditingController? controller;
  final FocusNode? focusNode;

  /// Parse a formatted currency string (e.g. "12.345") into an integer value.
  /// Returns null when parsing fails or string is empty.
  static int? parseToInt(String text) {
    final digits = text.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isEmpty) return null;
    return int.tryParse(digits);
  }

  @override
  Widget build(BuildContext context) {
    // If controller provided and empty, populate it from initialValue once.
    if (controller != null &&
        controller!.text.isEmpty &&
        initialValue.isNotEmpty) {
      SchedulerBinding.instance.addPostFrameCallback((_) {
        if (controller!.text.isEmpty) {
          final parsed =
              int.tryParse(initialValue.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
          controller!.text = Helpers.formatCurrency(parsed);
        }
      });
    }

    return TextFormField(
      focusNode: focusNode,
      controller: controller,
      initialValue: controller == null
          ? (initialValue.isNotEmpty
                ? Helpers.formatCurrency(
                    int.tryParse(
                          initialValue.replaceAll(RegExp(r'[^0-9]'), ''),
                        ) ??
                        0,
                  )
                : null)
          : null,
      keyboardType: TextInputType.number,
      inputFormatters: [CurrencyInputFormatter()],
      decoration:
          decoration ??
          InputDecoration(
            labelText: labelText,
            border: const OutlineInputBorder(),
            prefixText: prefixText,
          ),
      onChanged: onChanged,
    );
  }
}

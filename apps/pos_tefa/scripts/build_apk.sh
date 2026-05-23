#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <dev|prod> <api_base_url>"
  exit 1
fi

flavor="$1"
api_base_url="$2"

case "$flavor" in
  dev)
    entrypoint="lib/main_dev.dart"
    define_key="APP_API_BASE_URL_DEV"
    ;;
  prod)
    entrypoint="lib/main_prod.dart"
    define_key="APP_API_BASE_URL_PROD"
    ;;
  *)
    echo "Unsupported flavor: $flavor"
    exit 1
    ;;
esac

flutter build apk \
  --flavor "$flavor" \
  -t "$entrypoint" \
  --dart-define="$define_key=$api_base_url"

source_apk="build/app/outputs/flutter-apk/app-${flavor}-release.apk"
target_apk="build/app/outputs/flutter-apk/pos_tefa-${flavor}-release.apk"

if [[ ! -f "$source_apk" ]]; then
  echo "Built APK not found: $source_apk"
  exit 1
fi

mv "$source_apk" "$target_apk"
echo "APK written to: $target_apk"

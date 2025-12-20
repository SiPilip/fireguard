#!/bin/bash
# Quick commands untuk PWA FireGuard

echo "🔥 FireGuard PWA - Quick Commands"
echo ""

# Menu
echo "Pilih action:"
echo "1. Build production"
echo "2. Start production server"
echo "3. Test dengan ngrok (untuk testing di HP)"
echo "4. Generate icons baru"
echo "5. Clear cache & rebuild"
echo ""
read -p "Pilih (1-5): " choice

case $choice in
  1)
    echo "Building production..."
    npm run build
    ;;
  2)
    echo "Starting production server..."
    npm start
    ;;
  3)
    echo "Starting server dengan ngrok..."
    npm start &
    sleep 3
    ./ngrok.exe http 3000
    ;;
  4)
    read -p "Path ke icon (kosongkan untuk placeholder): " icon_path
    if [ -z "$icon_path" ]; then
      python scripts/generate-icons.py
    else
      python scripts/generate-icons.py "$icon_path"
    fi
    ;;
  5)
    echo "Clearing cache..."
    rm -rf .next
    rm -rf node_modules/.cache
    echo "Rebuilding..."
    npm run build
    ;;
  *)
    echo "Invalid choice"
    ;;
esac

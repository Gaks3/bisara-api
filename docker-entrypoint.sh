#!/bin/sh
set -e

echo "📦 Menjalankan migrasi database Prisma..."
npx prisma migrate deploy

if [ "$AUTO_SEED" = "true" ]; then
  echo "🌱 AUTO_SEED aktif: menjalankan seed data awal..."
  npm run seed || echo "⚠️ Seed dilewati atau sudah pernah diisi."
fi

echo "🚀 Menjalankan Bisara API server..."
exec "$@"

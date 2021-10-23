#!/bin/sh
cp src/config/config.dev.ts src/config/config.ts
echo ""
echo "=========================================="
echo "Installing npm modules"
echo "=========================================="
echo ""
npm install  --development || { echo "Failed on 'npm  install' "; exit 2; }
echo ""
echo "=========================================="
echo "Building Application"
echo "=========================================="
echo ""
npm run build
#!/bin/bash
set -e

echo "Installing dependencies..."
pnpm install

echo "Building static site..."
pnpm next build

echo "Building static server..."
pnpm tsup src/static-server.ts --format cjs --out-dir dist --clean=false

echo "Build completed successfully! Static files in 'out/' directory."

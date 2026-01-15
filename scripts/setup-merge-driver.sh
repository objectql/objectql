#!/bin/bash
# Setup script to configure pnpm-lock.yaml merge driver for this repository
# Run this script once after cloning the repository

set -e

echo "🔧 Setting up pnpm-lock.yaml merge driver..."

# Get the repository root directory
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

# Configure the merge driver in git config (local to this repository)
git config merge.pnpm-merge-driver.name "Automatic merge driver for pnpm-lock.yaml"
git config merge.pnpm-merge-driver.driver "$REPO_ROOT/scripts/pnpm-merge-driver.sh %O %A %B %L %P"
git config merge.pnpm-merge-driver.recursive binary

echo "✅ pnpm-lock.yaml merge driver configured successfully!"
echo ""
echo "ℹ️  From now on, merge conflicts in pnpm-lock.yaml will be resolved automatically."
echo "ℹ️  The merge driver will run 'pnpm install --lockfile-only' to regenerate the lockfile."
echo ""
echo "⚠️  Note: Make sure to resolve any package.json conflicts manually before merging."

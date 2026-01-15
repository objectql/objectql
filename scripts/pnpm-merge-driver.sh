#!/bin/bash
# Git merge driver for pnpm-lock.yaml
# This script automatically resolves merge conflicts in pnpm-lock.yaml
# by regenerating the lockfile using pnpm install
#
# Usage: This script is called automatically by git when a merge conflict
# occurs in pnpm-lock.yaml (configured via .gitattributes)
#
# Arguments (provided by git):
# $1 - %O - ancestor's version
# $2 - %A - current version
# $3 - %B - other branches' version
# $4 - %L - conflict marker size (optional)
# $5 - %P - pathname in which the merged result will be stored

set -e

ANCESTOR=$1
CURRENT=$2
OTHER=$3
PATHNAME=$5

echo "🔄 Resolving pnpm-lock.yaml merge conflict..."

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed or not in PATH"
    echo "Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Get the repository root directory
REPO_ROOT=$(git rev-parse --show-toplevel)

# Change to repository root
cd "$REPO_ROOT"

# First, accept the current version (ours) to resolve the git conflict state
cp "$CURRENT" "$PATHNAME"

echo "📦 Regenerating pnpm-lock.yaml by running pnpm install..."

# Run pnpm install to regenerate the lockfile
# This will merge dependencies from both branches correctly
if pnpm install --lockfile-only --no-frozen-lockfile 2>&1; then
    echo "✅ Successfully regenerated pnpm-lock.yaml"
    
    # Copy the regenerated lockfile to the output location
    if [ -f "$REPO_ROOT/pnpm-lock.yaml" ]; then
        cp "$REPO_ROOT/pnpm-lock.yaml" "$PATHNAME"
        echo "✅ Merge conflict resolved successfully"
        exit 0
    else
        echo "❌ Error: pnpm-lock.yaml not found after regeneration"
        exit 1
    fi
else
    echo "❌ Error: pnpm install failed"
    echo "Please resolve package.json conflicts first, then run: pnpm install"
    exit 1
fi

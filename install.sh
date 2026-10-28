#!/usr/bin/env bash
# Frugal Architect skill installer (macOS / Linux)
# Usage: curl -fsSL https://raw.githubusercontent.com/rabbix07/frugal-architect/main/install.sh | bash
# Override target: SKILL_DIR=/custom/path bash install.sh
set -euo pipefail

SKILL_NAME="frugal-architect"
REPO="rabbix07/frugal-architect"
BRANCH="${BRANCH:-main}"
SKILL_URL="https://raw.githubusercontent.com/${REPO}/${BRANCH}/skills/${SKILL_NAME}/SKILL.md"
SKILL_DIR="${SKILL_DIR:-$HOME/.agents/skills/$SKILL_NAME}"

if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL "$1" -o "$2"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO "$2" "$1"; }
else
  echo "error: curl or wget is required" >&2
  exit 1
fi

mkdir -p "$SKILL_DIR"
fetch "$SKILL_URL" "$SKILL_DIR/SKILL.md"

if [ ! -s "$SKILL_DIR/SKILL.md" ]; then
  echo "error: download failed or produced an empty file" >&2
  exit 1
fi

echo "Installed $SKILL_NAME -> $SKILL_DIR/SKILL.md"
echo "Restart your agent so it picks up the new skill."

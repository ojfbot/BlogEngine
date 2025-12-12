#!/bin/bash

# Security scan for staged files in pre-commit hook

set -e

echo "🔒 Scanning staged files for security issues..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

ISSUES_FOUND=0

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "No relevant files staged for commit"
  exit 0
fi

# API key patterns
API_KEY_PATTERNS=(
  "sk-ant-[a-zA-Z0-9_-]{95,}"
  "sk-[a-zA-Z0-9]{32,}"
  "secret_[a-zA-Z0-9]{32,}"
  "ghp_[a-zA-Z0-9]{36}"
)

echo "Checking staged files..."

for file in $STAGED_FILES; do
  if [ -f "$file" ]; then
    for pattern in "${API_KEY_PATTERNS[@]}"; do
      matches=$(grep -E "$pattern" "$file" || true)

      if [ -n "$matches" ]; then
        echo -e "${RED}❌ Potential API key found in: $file${NC}"
        echo "$matches"
        ISSUES_FOUND=1
      fi
    done
  fi
done

# Check if env.json or .env.local are being committed
SENSITIVE_FILES=("env.json" ".env.local" ".env")

for file in "${SENSITIVE_FILES[@]}"; do
  if echo "$STAGED_FILES" | grep -q "$file"; then
    echo -e "${RED}❌ Attempting to commit sensitive file: $file${NC}"
    ISSUES_FOUND=1
  fi
done

if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ No security issues in staged files${NC}"
  exit 0
else
  echo -e "${RED}❌ Security issues detected. Commit aborted.${NC}"
  echo "Please remove sensitive data before committing."
  exit 1
fi

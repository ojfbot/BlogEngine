#!/bin/bash

# Security check script for BlogEngine
# Scans for common security issues and API key leaks

set -e

echo "🔒 Running security checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any issues were found
ISSUES_FOUND=0

# Check for API keys in code
echo ""
echo "📝 Checking for potential API key leaks..."

# Patterns to search for
PATTERNS=(
  "sk-ant-[a-zA-Z0-9_-]+"  # Anthropic keys
  "sk-[a-zA-Z0-9]{32,}"     # OpenAI keys
  "secret_[a-zA-Z0-9]+"     # Notion keys
  "ghp_[a-zA-Z0-9]{36}"     # GitHub personal access tokens
  "ANTHROPIC_API_KEY\s*=\s*['\"][^'\"]+['\"]"
  "OPENAI_API_KEY\s*=\s*['\"][^'\"]+['\"]"
  "NOTION_API_KEY\s*=\s*['\"][^'\"]+['\"]"
)

for pattern in "${PATTERNS[@]}"; do
  # Search in src directories, excluding node_modules and dist
  if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    matches=$(git grep -E "$pattern" -- ':!node_modules' ':!dist' ':!*.md' ':!env.json' ':!.env.local' ':!pnpm-lock.yaml' || true)
  else
    matches=$(grep -rE "$pattern" packages/ --exclude-dir=node_modules --exclude-dir=dist --exclude="*.md" --exclude="env.json" --exclude=".env.local" --exclude="pnpm-lock.yaml" || true)
  fi

  if [ -n "$matches" ]; then
    echo -e "${RED}❌ Potential API key found:${NC}"
    echo "$matches"
    ISSUES_FOUND=1
  fi
done

if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ No API key leaks detected${NC}"
fi

# Check for env.json in git
echo ""
echo "📝 Checking for sensitive files in git..."

if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  SENSITIVE_FILES=(
    "env.json"
    ".env.local"
    ".env"
  )

  for file in "${SENSITIVE_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" > /dev/null 2>&1 || \
       git ls-files --error-unmatch "packages/*/env.json" > /dev/null 2>&1 || \
       git ls-files --error-unmatch "packages/*/.env.local" > /dev/null 2>&1; then
      echo -e "${RED}❌ Sensitive file '$file' is tracked by git!${NC}"
      ISSUES_FOUND=1
    fi
  done

  if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No sensitive files tracked by git${NC}"
  fi
fi

# Check for hardcoded secrets
echo ""
echo "📝 Checking for hardcoded secrets..."

HARDCODED_PATTERNS=(
  "password\s*=\s*['\"][^'\"]{8,}['\"]"
  "secret\s*=\s*['\"][^'\"]{8,}['\"]"
  "token\s*=\s*['\"][^'\"]{8,}['\"]"
)

for pattern in "${HARDCODED_PATTERNS[@]}"; do
  if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    matches=$(git grep -iE "$pattern" -- ':!node_modules' ':!dist' ':!*.md' ':!env.json.example' ':!*.test.ts' || true)
  else
    matches=$(grep -riE "$pattern" packages/ --exclude-dir=node_modules --exclude-dir=dist --exclude="*.md" --exclude="env.json.example" --exclude="*.test.ts" || true)
  fi

  if [ -n "$matches" ]; then
    echo -e "${YELLOW}⚠️  Potential hardcoded secret found:${NC}"
    echo "$matches"
    # Don't fail build for this, just warn
  fi
done

echo ""
if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ All security checks passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Security issues found. Please fix them before committing.${NC}"
  exit 1
fi

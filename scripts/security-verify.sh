#!/bin/bash

# Verify security configuration is correct

set -e

echo "🔐 Verifying security configuration..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

WARNINGS=0
ERRORS=0

# Check .gitignore exists and has required entries
echo ""
echo "📝 Checking .gitignore..."

if [ ! -f ".gitignore" ]; then
  echo -e "${RED}❌ .gitignore file not found${NC}"
  ERRORS=$((ERRORS + 1))
else
  REQUIRED_ENTRIES=(
    "env.json"
    ".env.local"
    ".env"
    "node_modules"
    "dist"
    "*.log"
  )

  for entry in "${REQUIRED_ENTRIES[@]}"; do
    if ! grep -q "^$entry" .gitignore; then
      echo -e "${YELLOW}⚠️  Missing .gitignore entry: $entry${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  done

  if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ .gitignore properly configured${NC}"
  fi
fi

# Check env.json.example exists
echo ""
echo "📝 Checking env.json.example..."

ENV_EXAMPLE="packages/agent-core/env.json.example"
if [ ! -f "$ENV_EXAMPLE" ]; then
  echo -e "${YELLOW}⚠️  env.json.example not found${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  # Verify it doesn't contain real secrets
  if grep -qE "(sk-ant-|sk-proj-|secret_[a-zA-Z0-9]{32})" "$ENV_EXAMPLE"; then
    echo -e "${RED}❌ env.json.example contains real secrets!${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ env.json.example looks good${NC}"
  fi
fi

# Check Husky is installed
echo ""
echo "📝 Checking Husky hooks..."

if [ -d ".husky" ]; then
  if [ -f ".husky/pre-commit" ]; then
    echo -e "${GREEN}✅ Husky pre-commit hook found${NC}"
  else
    echo -e "${YELLOW}⚠️  Husky pre-commit hook not found${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${YELLOW}⚠️  Husky not installed${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "================================"
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ Security verification failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Security verification completed with $WARNINGS warning(s)${NC}"
  exit 0
else
  echo -e "${GREEN}✅ All security checks passed!${NC}"
  exit 0
fi

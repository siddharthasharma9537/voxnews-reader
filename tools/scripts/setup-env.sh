#!/bin/bash

###############################################################################
# VoxNews Bharat - Local Development Setup Script
#
# This script automates the setup of the development environment by:
# 1. Verifying prerequisites (Node.js, npm)
# 2. Creating .env.local from template
# 3. Prompting for Supabase credentials
# 4. Installing npm dependencies
# 5. Verifying the setup
#
# Usage:
#   bash tools/scripts/setup-env.sh
#
# Or make it executable:
#   chmod +x tools/scripts/setup-env.sh
#   ./tools/scripts/setup-env.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo -e "${BLUE}🚀 VoxNews Bharat - Development Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

###############################################################################
# 1. Check Prerequisites
###############################################################################

echo -e "\n${BLUE}1️⃣  Checking Prerequisites${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed${NC}"
  echo "   Download from: https://nodejs.org/en/download/"
  exit 1
fi

NODE_VERSION=$(node -v)
echo -e "   ${GREEN}✅ Node.js${NC} ${NODE_VERSION}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm is not installed${NC}"
  exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "   ${GREEN}✅ npm${NC} ${NPM_VERSION}"

# Check git
if ! command -v git &> /dev/null; then
  echo -e "${RED}❌ Git is not installed${NC}"
  exit 1
fi

GIT_VERSION=$(git -v)
echo -e "   ${GREEN}✅ Git${NC} ${GIT_VERSION}"

###############################################################################
# 2. Setup Environment Variables
###############################################################################

echo -e "\n${BLUE}2️⃣  Setting up Environment Variables${NC}"

ENV_FILE="${PROJECT_ROOT}/.env.local"
ENV_EXAMPLE="${PROJECT_ROOT}/.env.example"

if [ ! -f "$ENV_EXAMPLE" ]; then
  echo -e "${RED}❌ .env.example not found at ${ENV_EXAMPLE}${NC}"
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  echo -e "   ${YELLOW}⚠️  .env.local already exists${NC}"
  read -p "   Overwrite? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "   ${BLUE}Keeping existing .env.local${NC}"
    ENV_EXISTS=true
  else
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    ENV_EXISTS=false
  fi
else
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo -e "   ${GREEN}✅ Created .env.local${NC}"
  ENV_EXISTS=false
fi

###############################################################################
# 3. Prompt for Supabase Credentials
###############################################################################

echo -e "\n${BLUE}3️⃣  Supabase Configuration${NC}"
echo "   Visit: https://supabase.com/dashboard"
echo "   Settings → API → Copy your credentials below"
echo ""

read -p "   Enter Supabase URL (https://xxx.supabase.co): " SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
  echo -e "   ${RED}❌ Supabase URL is required${NC}"
  exit 1
fi

read -p "   Enter Supabase Anon Key (public key is safe): " SUPABASE_ANON_KEY

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo -e "   ${RED}❌ Supabase Anon Key is required${NC}"
  exit 1
fi

# Update .env.local with Vite-prefixed environment variables
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS sed
  sed -i '' "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=${SUPABASE_URL}|" "$ENV_FILE"
  sed -i '' "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}|" "$ENV_FILE"
else
  # Linux sed
  sed -i "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=${SUPABASE_URL}|" "$ENV_FILE"
  sed -i "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}|" "$ENV_FILE"
fi

echo -e "   ${GREEN}✅ Supabase credentials configured${NC}"

###############################################################################
# 4. Install Dependencies
###############################################################################

echo -e "\n${BLUE}4️⃣  Installing Dependencies${NC}"

if [ -d "$PROJECT_ROOT/node_modules" ]; then
  echo -e "   ${YELLOW}⚠️  node_modules already exists${NC}"
  read -p "   Reinstall dependencies? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$PROJECT_ROOT"
    rm -rf node_modules package-lock.json
    npm install
  else
    echo "   ${BLUE}Skipping npm install${NC}"
  fi
else
  cd "$PROJECT_ROOT"
  npm install
fi

echo -e "   ${GREEN}✅ Dependencies installed${NC}"

###############################################################################
# 5. Verify Setup
###############################################################################

echo -e "\n${BLUE}5️⃣  Verifying Setup${NC}"

# Check if .env.local has required variables
if grep -q "VITE_SUPABASE_URL=https://" "$ENV_FILE" && \
   grep -q "VITE_SUPABASE_ANON_KEY=eyJ" "$ENV_FILE"; then
  echo -e "   ${GREEN}✅ Environment variables configured${NC}"
else
  echo -e "   ${RED}❌ Environment variables incomplete${NC}"
  echo "   Please manually edit: $ENV_FILE"
fi

# Check if npm scripts are available
if npm run 2>&1 | grep -q "dev"; then
  echo -e "   ${GREEN}✅ npm scripts available${NC}"
else
  echo -e "   ${RED}❌ npm scripts not found${NC}"
fi

###############################################################################
# 6. Summary and Next Steps
###############################################################################

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Next Steps:${NC}"
echo -e "1. ${YELLOW}Start development server:${NC}"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo -e "2. ${YELLOW}Open in browser:${NC}"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "3. ${YELLOW}Upload a PDF newspaper and test the app!${NC}"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "   ${BLUE}npm run dev${NC}              Start development server"
echo -e "   ${BLUE}npm run lint${NC}             Run ESLint"
echo -e "   ${BLUE}npm run build${NC}            Build for production"
echo -e "   ${BLUE}npm run preview${NC}          Preview production build"
echo ""

echo -e "${BLUE}Documentation:${NC}"
echo -e "   ${BLUE}docs/PROJECT_BRIEF.md${NC}         Project overview"
echo -e "   ${BLUE}docs/NAMING_CONVENTIONS.md${NC}    Code style guide"
echo -e "   ${BLUE}docs/ARCHITECTURE_DECISIONS.md${NC} Technical decisions"
echo ""

echo -e "${BLUE}Having issues?${NC}"
echo -e "1. Check ${BLUE}.env.local${NC} has correct credentials"
echo -e "2. Verify Supabase project is active"
echo -e "3. Check console for error messages"
echo ""

exit 0

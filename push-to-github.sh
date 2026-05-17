#!/bin/bash
# push-to-github.sh
# Run once from the pakwheels-e2e folder to push the suite to GitHub.
# Usage: bash push-to-github.sh

set -e

echo ""
echo "================================================"
echo "  PakWheels E2E – Push to GitHub"
echo "================================================"
echo ""

# ── Prompt for GitHub username ─────────────────────
read -p "Enter your GitHub username: " GH_USER
REPO_URL="https://github.com/${GH_USER}/pakwheels-e2e.git"

# ── Clean up any stale lock files ──────────────────
rm -f .git/index.lock 2>/dev/null || true

# ── Init (skip if already a repo) ──────────────────
if [ ! -d ".git" ]; then
  echo "==> Initialising git repo..."
  git init
fi

git branch -M main 2>/dev/null || true

# ── Identity ───────────────────────────────────────
git config user.email "jaffar.lone@gmail.com"
git config user.name "Jaafar"

# ── Stage & commit ─────────────────────────────────
echo "==> Staging all files..."
git add .

if git diff --cached --quiet; then
  echo "    Nothing new to commit — working tree clean."
else
  echo "==> Creating initial commit..."
  git commit -m "Initial commit – PakWheels E2E test suite

- Playwright config targeting pakwheels.com
- Page objects: UsedCarsPage, HomePage, NewCarsPage, ForumsPage
- Locators extracted to locators/ directory
- Test suites: used-cars, homepage, new-cars, forums
- .gitignore for node_modules, test-results, allure output"
fi

# ── Remote ─────────────────────────────────────────
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

# ── Push ───────────────────────────────────────────
echo "==> Pushing to GitHub (you may be prompted for credentials)..."
echo "    TIP: Use a Personal Access Token as your password."
echo "         Generate one at: https://github.com/settings/tokens"
echo ""
git push -u origin main

echo ""
echo "✅ Done!  https://github.com/${GH_USER}/pakwheels-e2e"

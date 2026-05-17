#!/bin/bash
# push-to-github.sh
# Pushes (or re-pushes) the full suite — including GitHub Actions — to GitHub.
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

# ── Stage everything (includes .github/workflows/) ─
echo "==> Staging all files..."
git add .

if git diff --cached --quiet; then
  echo "    Nothing new to commit — working tree clean."
else
  echo "==> Committing..."
  git commit -m "Add API tests + split CI into two jobs

- tests/api.spec.js: 9 groups, 50+ HTTP-layer tests (status codes, headers,
  body content, 404 handling, HTTP methods, security headers, response time,
  HTTPS redirects, edge-case paths)
- locators/api-endpoints.js: central URL registry for all API tests
- .github/workflows/e2e.yml: two jobs — api-tests (fast, runs first) then
  e2e-tests (Chrome browser, runs only if API layer is healthy)
- Locators extracted to locators/ directory (used-cars, home, new-cars)
- Page objects updated to import from locators/
- Skippable sort & no-results tests fixed"
fi

# ── Remote ─────────────────────────────────────────
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

# ── Push ───────────────────────────────────────────
echo ""
echo "==> Pushing to GitHub..."
echo "    When prompted for a password, use a Personal Access Token."
echo "    Generate one at: https://github.com/settings/tokens"
echo "    (classic token, 'repo' scope is enough)"
echo ""
git push -u origin main

echo ""
echo "✅ Pushed!  https://github.com/${GH_USER}/pakwheels-e2e"
echo ""
echo "🚀 GitHub Actions is now running your suite."
echo "   Watch it live: https://github.com/${GH_USER}/pakwheels-e2e/actions"

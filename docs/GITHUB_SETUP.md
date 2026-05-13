# GitHub Actions Setup Guide

**Version:** 1.0  
**Last Updated:** May 13, 2026

This guide explains how to configure GitHub Actions, Vercel, and Slack for automated CI/CD deployments.

---

## Overview

The VoxNews Bharat CI/CD pipeline consists of three workflows:

1. **CI** (ci.yml) — Runs on every push and PR to lint, type-check, build, and test
2. **Deploy to Staging** (deploy-staging.yml) — Auto-deploys to Vercel staging when code is pushed to `develop`
3. **Deploy to Production** (deploy-production.yml) — Manual approval + deploys to Vercel production on releases

---

## Prerequisites

You'll need accounts for:
- GitHub (you have this)
- Vercel (https://vercel.com) — for hosting
- (Optional) Slack workspace — for notifications

---

## 1. Vercel Setup

### 1.1 Create Vercel Projects

**Create 2 projects in Vercel:**

1. **Staging Project:**
   - Go to https://vercel.com/new
   - Import repository: `voxnews-reader`
   - Select framework: **Other**
   - Select root directory: `./`
   - Click "Deploy"
   - Wait for deployment to complete
   - Note: Copy the **Project ID** from Settings → General

2. **Production Project:**
   - Repeat the same process
   - This will be your production environment

### 1.2 Get Vercel Credentials

For each project:

1. Go to Project Settings → General
2. Copy:
   - **Project ID** (e.g., `prj_abc123xyz`)
   - **ORG ID** (https://vercel.com/account/tokens → bottom of page shows your ORG ID)

3. Create API Token:
   - Go to https://vercel.com/account/tokens
   - Click "Create"
   - Name: `GitHub Actions`
   - Scopes: Select "Full Access"
   - Copy the token (long string starting with `ver_`)

---

## 2. GitHub Secrets Configuration

### 2.1 Add Secrets to GitHub

1. Go to your GitHub repo
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these secrets:

| Secret Name | Value | Where to get it |
|-------------|-------|-----------------|
| `VERCEL_TOKEN` | API token from Vercel | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Organization ID | Bottom of https://vercel.com/account/tokens |
| `VERCEL_PROJECT_ID_STAGING` | Project ID for staging | Vercel Project Settings → General |
| `VERCEL_PROJECT_ID_PRODUCTION` | Project ID for production | Vercel Project Settings → General |
| `SLACK_WEBHOOK_STAGING` | (Optional) Slack webhook | See section 3.1 |
| `SLACK_WEBHOOK_PRODUCTION` | (Optional) Slack webhook | See section 3.1 |

### 2.2 Verify Secrets

```bash
# You won't see the actual values, but you can verify they exist
# Go to Settings → Secrets → verify all secrets are listed
```

---

## 3. (Optional) Slack Integration

### 3.1 Create Slack Webhooks

**For Staging Notifications:**

1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Name: `VoxNews Bot` (or similar)
5. Choose your workspace
6. Go to "Incoming Webhooks"
7. Toggle "Activate Incoming Webhooks" to ON
8. Click "Add New Webhook to Workspace"
9. Select channel: `#deployments` (or create one)
10. Click "Allow"
11. Copy the **Webhook URL**
12. Add to GitHub Secrets as `SLACK_WEBHOOK_STAGING`

**For Production Notifications:**

Repeat the same process, but select a different channel: `#production-alerts`
Add to GitHub Secrets as `SLACK_WEBHOOK_PRODUCTION`

### 3.2 Test Slack Webhook (Optional)

```bash
# Test if webhook works
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test message from VoxNews"}'
```

---

## 4. Configure Branch Protection

### 4.1 Protect `develop` branch

1. Go to Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `develop`
4. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
5. Required status checks:
   - ✅ lint
   - ✅ type-check
   - ✅ build
   - ✅ security
6. Click "Create"

### 4.2 Protect `main` branch

1. Click "Add rule"
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require deployments to succeed before merging
   - ✅ Require a pull request before merging
   - ✅ Dismiss stale pull request approvals when new commits are pushed
4. Required status checks: (same as develop)
5. Required deployment environments:
   - ✅ staging
6. Click "Create"

---

## 5. Environment Protection (Production)

### 5.1 Setup Production Environment

1. Go to Settings → Environments
2. Click "New environment"
3. Name: `production`
4. Click "Configure environment"
5. Enable:
   - ✅ Required reviewers
   - Add team members or specific users who can approve
6. Add deployment branches:
   - ✅ Allow deployments from specific branches
   - Add: `main`
7. Click "Save protection rules"

### 5.2 Add Production Secrets (Optional)

If production needs different secrets than staging:

1. Go to Settings → Environments → production
2. Add environment-specific secrets:
   - `VERCEL_PROJECT_ID_PRODUCTION`
   - Any other production-specific variables

---

## 6. Workflow Usage

### 6.1 CI Workflow (Automatic)

**Triggers:** Every push to `main`/`develop` and all PRs

**What it does:**
1. Lints code with ESLint
2. Type-checks with TypeScript
3. Builds production bundle
4. Runs tests (when implemented)
5. Audits npm dependencies

**Viewing results:**
- Go to Actions tab
- Click workflow run
- View logs for each job

### 6.2 Staging Deployment (Automatic)

**Triggers:** Every push to `develop` (after CI passes)

**What it does:**
1. Validates CI pipeline passes
2. Builds for production
3. Deploys to Vercel staging environment
4. Posts staging URL as GitHub comment (if from PR)
5. Sends Slack notification

**Accessing staging:**
- Vercel provides URL automatically
- Check GitHub Actions workflow output
- Check Slack notification

### 6.3 Production Deployment (Manual + Approval)

**Triggers:**
- Option A: Create a git release tag (automatic)
  ```bash
  git tag -a v0.1.0 -m "Release 0.1.0"
  git push origin --tags
  # GitHub creates Release automatically
  # Workflow waits for approval
  ```

- Option B: Manual trigger (Actions tab)
  ```
  Actions → Deploy to Production → Run workflow → Enter version
  ```

**What it does:**
1. Runs full CI validation
2. Verifies git tag matches package.json version
3. Builds for production
4. **Waits for manual approval** (environment protection)
5. Reviewer approves deployment
6. Deploys to Vercel production
7. Creates GitHub Release (if workflow_dispatch)
8. Sends Slack notification

**Approving deployment:**
1. Go to Actions tab
2. Click the running "Deploy to Production" workflow
3. Look for "Waiting for you to review"
4. Click "Review deployments"
5. Select reviewers (if applicable)
6. Click "Approve and deploy"
7. Workflow continues to production

---

## 7. Troubleshooting

### CI Workflow Failures

**Lint failures:**
```bash
# Run locally to see errors
npm run lint

# Auto-fix many issues
npm run format
```

**Type-check failures:**
```bash
# Run locally
npx tsc --noEmit
```

**Build failures:**
```bash
# Run locally
npm run build

# Check dist/ folder was created
ls -la dist/
```

### Staging Deployment Issues

**Check logs:**
1. Go to Actions tab
2. Click "Deploy to Staging" workflow
3. Click the failed run
4. Click "deploy-staging" job
5. View "Deploy to Vercel" step output

**Common issues:**
- Vercel project not linked → re-link in Vercel dashboard
- Secrets not set → verify in Settings → Secrets
- Build timeout → check npm logs for slow operations

### Production Deployment Blocked

**If approval is stuck:**
1. Go to Actions tab
2. Click workflow
3. Click "Review deployments"
4. Verify reviewer is in configured list
5. Have that reviewer approve

**If deployment fails:**
1. Check Vercel production project logs
2. Verify all environment variables are set in Vercel
3. Check if production project build is failing

---

## 8. Monitoring & Alerts

### 8.1 Monitor Deployments

**In GitHub:**
- Actions tab shows all workflow runs
- Click a run to see detailed logs
- Failed runs show red ❌

**In Vercel:**
- Dashboard shows deployment history
- Click "Deployments" to see all versions
- Check build logs for errors

**In Slack (if enabled):**
- `#deployments` channel shows staging updates
- `#production-alerts` channel shows production updates

### 8.2 Monitor Performance

After deploying:
1. Go to Vercel project
2. Click "Analytics"
3. Monitor:
   - Page performance (LCP, FCP, etc.)
   - Real user monitoring
   - Error rates

---

## 9. Rollback Procedure

If production deployment has issues:

**Option 1: Vercel Rollback (Fastest)**
1. Go to Vercel dashboard
2. Select production project
3. Click "Deployments"
4. Find the previous stable version
5. Click "..."  → "Promote to Production"
6. Confirm

**Option 2: GitHub Rollback**
1. Go to GitHub Releases
2. Find the previous release (e.g., v0.0.1)
3. Click "Create deployment"
4. Go to Actions → Deploy to Production
5. Approve the deployment

---

## 10. Maintenance & Best Practices

### 10.1 Regular Tasks

- **Weekly:** Review Actions workflow runs for errors
- **Monthly:** Rotate API tokens (Vercel, Slack)
- **Quarterly:** Review and update branch protection rules
- **Yearly:** Audit GitHub permissions and secrets

### 10.2 Security Best Practices

1. ✅ **Never commit secrets** — Use GitHub Secrets only
2. ✅ **Rotate tokens regularly** — Every 90 days
3. ✅ **Limit secret access** — Only use in specific workflows
4. ✅ **Use environment protection** — Require approval for production
5. ✅ **Audit deployments** — Review GitHub deployment records monthly
6. ✅ **Lock branches** — Require status checks + approvals
7. ✅ **Review logs** — Check Actions logs for suspicious activity

### 10.3 Useful Links

- GitHub Actions Docs: https://docs.github.com/en/actions
- Vercel Docs: https://vercel.com/docs
- Slack API: https://api.slack.com
- Semantic Versioning: https://semver.org

---

## 11. Quick Reference

### Deploy to Staging (Automatic)
```bash
# Just push to develop
git push origin develop
# CI runs → Staging deploys automatically
```

### Deploy to Production (Manual)
```bash
# Method 1: Create release tag
git tag -a v0.1.0 -m "Release 0.1.0"
git push origin --tags
# Go to GitHub → Releases → Approve deployment

# Method 2: Manual workflow dispatch
# Go to Actions → Deploy to Production → Run workflow
```

### Test Locally Before Pushing
```bash
npm run lint      # Check code style
npm run build     # Check build works
npx tsc --noEmit  # Type checking
```

---

**Document Owner:** Siddhartha Pothulapati  
**Last Updated:** May 13, 2026  
**Next Review:** May 27, 2026

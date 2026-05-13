# Vercel Deployment Guide

**Quick setup: 5 minutes to first deployment**

---

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository connected
- `vercel.json` configuration ✅ (already created)
- `.vercelignore` configuration ✅ (already created)

---

## Quickest Path: Deploy from GitHub

### Option A: GitHub Integration (Recommended)

**Step 1: Connect GitHub to Vercel**

1. Go to https://vercel.com
2. Click "New Project"
3. Click "Import Git Repository"
4. Search for `voxnews-reader`
5. Click "Import"

**Step 2: Configure Environment Variables**

Vercel dashboard automatically shows:
- Project Name
- Framework: `Other` (Vite detected)
- Build Command: `npm run build`
- Output Directory: `dist`

Click "Continue"

**Step 3: Add Environment Variables**

Click "Environment Variables" and add these:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
VITE_APP_ENV = production
VITE_SENTRY_ENVIRONMENT = production
VITE_SENTRY_RELEASE = v0.1.0
```

**Step 4: Deploy**

Click "Deploy"

⏳ Wait 2-3 minutes for build...

✅ **Done!** You now have a live URL: `https://voxnews-reader.vercel.app`

---

### Option B: CLI Deployment (For Advanced Users)

**Install Vercel CLI:**

```bash
npm install -g vercel
```

**Login:**

```bash
vercel login
```

**Deploy:**

```bash
vercel --prod
```

Follow prompts to configure project.

---

## Environment Variables Setup

### Staging Environment

Create a second Vercel project for staging:

1. Go to Vercel Dashboard
2. Click "New Project"
3. Import same `voxnews-reader` repository
4. Name it: `voxnews-reader-staging`
5. Connect to `develop` branch (not `main`)
6. Add same environment variables
7. Deploy

### Production Environment

Use the first project for production:

1. Keep project linked to `main` branch
2. Set `VITE_APP_ENV = production`
3. Set `VITE_SENTRY_ENVIRONMENT = production`
4. All auto-deployments on `main` branch pushes

---

## Automatic Deployments

### With GitHub Integration

**Staging (`develop` branch):**
- Every push to `develop` → auto-deploys to staging Vercel project
- Preview URL generated automatically

**Production (`main` branch):**
- Every push to `main` → auto-deploys to production
- Uses GitHub Actions approval (see `.github/workflows/deploy-production.yml`)

### Disable Auto-Deploy

If you don't want auto-deployments:

1. Go to Vercel Project Settings
2. Go to "Git"
3. Disable "Automatic Git Integrations"
4. Use GitHub Actions workflows instead

---

## Monitoring & Logs

### View Deployment Logs

1. Go to Vercel Dashboard
2. Select project
3. Click "Deployments"
4. Click on a deployment
5. Click "Build Logs" to see build output
6. Click "Runtime Logs" to see application errors

### Check Build Errors

If build fails:

1. Click on failed deployment
2. Scroll down to see error details
3. Common issues:
   - Missing environment variables
   - npm build command failed
   - TypeScript errors

---

## Performance Monitoring

After deployment:

1. Go to Vercel Project → Analytics
2. Monitor:
   - **Web Vitals** (LCP, FCP, CLS)
   - **Real User Monitoring**
   - **Error rates**
   - **Request latency**

---

## Custom Domain Setup (Optional)

### Add Your Domain

1. Go to Vercel Project Settings
2. Go to "Domains"
3. Click "Add"
4. Enter domain: `voxnews.com`
5. Follow DNS setup instructions
6. Wait 5-10 minutes for DNS propagation

### Enable HTTPS

Automatic! Vercel provides free SSL certificates.

---

## Troubleshooting

### Build Failed

```
Error: Command "npm run build" exited with 1
```

**Fix:**
1. Run `npm run build` locally to see error
2. Fix the error in your code
3. Push to GitHub
4. Vercel will auto-retry

### Missing Environment Variables

```
Error: Missing required environment variable: VITE_SUPABASE_URL
```

**Fix:**
1. Go to Project Settings → Environment Variables
2. Add the missing variable
3. Redeploy (click "..." → "Redeploy")

### Timeout During Build

```
Error: Build timed out after 60 seconds
```

**Fix:**
1. Check if build is slow locally: `npm run build`
2. Optimize dependencies
3. Increase timeout in `vercel.json` (max 3600s)

### Deployment URL Not Loading

1. Check build logs for errors
2. Check environment variables are set
3. Verify `dist/` folder contains HTML files

---

## Rollback to Previous Version

If new deployment has issues:

1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous working version
4. Click "..." menu
5. Click "Promote to Production"

**Done!** Traffic now goes to previous version.

---

## Git Workflow with Vercel

**Recommended workflow:**

```bash
# 1. Create feature branch
git checkout -b feature/pdf-upload

# 2. Make changes & test locally
npm run dev
npm run build

# 3. Commit & push
git commit -m "feat(pdf): add PDF upload"
git push origin feature/pdf-upload

# 4. Create Pull Request
# → GitHub Actions CI runs
# → Vercel creates preview deployment
# → Team reviews deployment URL

# 5. Merge to develop
git merge develop
# → Auto-deploys to staging Vercel project

# 6. Create release when ready
git tag -a v0.1.0 -m "Release 0.1.0"
git push --tags
# → GitHub Actions waits for approval
# → Reviewer approves in Actions tab
# → Auto-deploys to production Vercel project
```

---

## Cost Considerations

**Free Tier Includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function execution (up to 100GB hours/month)
- Analytics
- Edge middleware

**At 10,000 MAU estimate:**
- Bandwidth: ~20-50 GB/month (well within free tier)
- Computation: Minimal (mostly static + client-side)
- **Cost: $0-20/month** (free tier likely sufficient)

---

## Vercel vs Alternatives

| Feature | Vercel | Netlify | AWS |
|---------|--------|---------|-----|
| Git Integration | ✅ Native | ✅ Native | ❌ Manual |
| Preview Deployments | ✅ Yes | ✅ Yes | ❌ No |
| Environment Variables | ✅ Yes | ✅ Yes | ✅ Yes |
| Free Tier | ✅ Generous | ✅ Generous | ⚠️ Limited |
| Serverless Functions | ✅ Edge Functions | ✅ Functions | ✅ Lambda |
| Learning Curve | ✅ Easy | ✅ Easy | ❌ Steep |
| **Best for TanStack Start** | ✅ **Native Support** | ⚠️ Works | ❌ Complex |

**Recommendation:** Vercel is the best choice for TanStack Start.

---

## Next Steps

1. ✅ Create Vercel account
2. ✅ Connect GitHub repository
3. ✅ Add environment variables
4. ✅ Deploy staging project
5. ✅ Deploy production project
6. ✅ Test GitHub Actions workflows
7. ✅ Monitor performance

**Estimated setup time: 15 minutes**

---

**Document Owner:** Siddhartha Pothulapati  
**Last Updated:** May 13, 2026

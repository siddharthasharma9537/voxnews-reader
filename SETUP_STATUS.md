# 🚀 VoxNews TTS Setup Status

## ✅ Complete - Files Created

### Core TypeScript Modules
- ✅ `src/lib/supabase-client.ts` — Supabase client initialization
- ✅ `src/lib/audio-service.ts` — TTS request handler with caching
- ✅ `src/lib/chandra-ocr.ts` — Chandra OCR 2 integration
- ✅ `src/components/AudioPlayer.tsx` — React audio playback UI

### Configuration
- ✅ `.env.local` — Environment variables (with your credentials)
- ✅ `.gitignore` — Already excludes .env.local ✓

### Backend
- ✅ `supabase/functions/generate-audio/index.ts` — Edge Function (TypeScript)
- ✅ `supabase/functions/generate-audio/deno.json` — Deno dependencies

### Database
- ✅ `supabase/migrations/001_create_audio_tables.sql` — Tables, indexes, RLS policies

### Documentation
- ✅ `INTEGRATION_CHECKLIST.md` — Step-by-step setup guide
- ✅ `SETUP_STATUS.md` — This file

---

## 🎯 Next Steps (In Order)

### Step 1: Run Database Migration (5 min)
```bash
1. Go to https://supabase.com/dashboard
2. Select "voxnews-production" project
3. Navigate to SQL Editor
4. Copy/paste contents of supabase/migrations/001_create_audio_tables.sql
5. Click Run
```

### Step 2: Deploy Edge Function (5 min)
```bash
# Option A: Using Supabase CLI
supabase login
supabase functions deploy generate-audio --project-ref zxcoegjyarqvmarxmpgp

# Option B: Manual via Dashboard → Edge Functions → Create Function
```

### Step 3: Get R2 Credentials
Need to fill in `.env.local`:
- `VITE_R2_ACCESS_KEY_ID` — From Cloudflare R2 Settings
- `VITE_R2_SECRET_ACCESS_KEY` — From Cloudflare R2 Settings

Check Cloudflare Dashboard → R2 → (Your bucket) → Settings → API Token

### Step 4: Test Locally
```bash
npm install
npm run dev
# Should start on http://localhost:5173
```

### Step 5: Add GitHub Secrets
Go to: https://github.com/siddharthasharma9537/voxnews-read/settings/secrets/actions

Add these 7 secrets:
```
SUPABASE_URL=https://zxcoegjyarqvmarxmpgp.supabase.co
SUPABASE_ANON_KEY=sb_publishable_ZtaYbwxbjtLowpNNFrsP7g_1HS5V3ay
R2_ACCOUNT_ID=f761eb1751486656daf9b5bda912b62d
R2_ACCESS_KEY_ID=[get from Cloudflare]
R2_SECRET_ACCESS_KEY=[get from Cloudflare]
R2_BUCKET_NAME=voxnews-audio
CHANDRA_OCR_KEY=free-tier
```

### Step 6: Integrate into Main App
Update `src/routes/index.tsx` to:
1. Import AudioPlayer component
2. Call `generateAudio()` when article is selected
3. Render `<AudioPlayer />` in the article detail view

### Step 7: Push to GitHub
```bash
git add .
git commit -m "feat: add TTS backend with Supabase Edge Functions"
git push origin main
```

---

## 📋 Current Architecture

```
VoxNews Reader (TanStack Start)
    ↓
[PDF Upload] → src/lib/pdf-parser.ts (extracts articles)
    ↓
[Article Selected] → src/lib/audio-service.ts
    ↓
Check audio_cache (Supabase)
    ├─ Cache Hit → Return cached URL
    └─ Cache Miss → Call Edge Function
         ↓
[generate-audio Edge Function]
    ├─ English → Google Translate TTS
    └─ Telugu → Indic TTS
         ↓
Store in R2 bucket
Cache in Supabase (audio_cache table)
    ↓
Return audio URL to AudioPlayer component
    ↓
User plays audio in browser
```

---

## 🔑 Credentials Status

| Variable | Status | Value |
|----------|--------|-------|
| VITE_SUPABASE_URL | ✅ Set | https://zxcoegjyarqvmarxmpgp.supabase.co |
| VITE_SUPABASE_ANON_KEY | ✅ Set | sb_publishable_ZtaYbwxbjtLowpNNFrsP7g_1HS5V3ay |
| VITE_R2_ACCOUNT_ID | ✅ Set | f761eb1751486656daf9b5bda912b62d |
| VITE_R2_ACCESS_KEY_ID | ⏳ TODO | Get from Cloudflare R2 settings |
| VITE_R2_SECRET_ACCESS_KEY | ⏳ TODO | Get from Cloudflare R2 settings |
| VITE_R2_BUCKET_NAME | ✅ Set | voxnews-audio |
| VITE_CHANDRA_OCR_KEY | ✅ Set | free-tier |

---

## 📱 File Summary

| File | Purpose | Status |
|------|---------|--------|
| audio-service.ts | TTS request + caching logic | ✅ Created |
| supabase-client.ts | Supabase client init | ✅ Created |
| AudioPlayer.tsx | React component for playback | ✅ Created |
| chandra-ocr.ts | OCR integration (fallback) | ✅ Created |
| generate-audio/index.ts | Backend Edge Function | ✅ Created |
| 001_create_audio_tables.sql | Database schema | ✅ Created |
| .env.local | Environment config | ✅ Created |
| .gitignore | Git ignore rules | ✅ Already excludes .env.local |

---

## 🛠️ Quick Reference

### Check if Edge Function deployed:
```bash
curl https://zxcoegjyarqvmarxmpgp.supabase.co/functions/v1/generate-audio \
  -H "Authorization: Bearer sb_publishable_ZtaYbwxbjtLowpNNFrsP7g_1HS5V3ay"
```

### Monitor database:
```bash
# Check cached audio
SELECT COUNT(*) FROM audio_cache;

# Check TTS usage
SELECT * FROM tts_usage ORDER BY created_at DESC LIMIT 10;
```

### Local dev:
```bash
npm run dev  # Starts on http://localhost:5173
npm run build  # Production build
npm run lint  # ESLint check
```

---

## 🎯 Success Criteria

✅ When complete, you'll have:
- [ ] Database tables created in Supabase
- [ ] Edge Function deployed and tested
- [ ] R2 bucket configured with credentials
- [ ] GitHub Secrets added to repo
- [ ] Local dev server running without errors
- [ ] PDF upload → Article extraction → TTS generation → Audio playback (full flow)
- [ ] Code pushed to GitHub main branch

---

**Last Updated:** May 13, 2026
**Project Status:** 🟡 Files Created | ⏳ Waiting for manual Supabase/R2 setup

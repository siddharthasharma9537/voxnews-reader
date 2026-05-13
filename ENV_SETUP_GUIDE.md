# 🔐 Complete Environment Setup Guide for VoxNews Bharat

This guide walks you through getting every API key, credential, and configuration needed to run the full stack.

**Total Time:** ~30 minutes
**Difficulty:** Easy (mostly copy-paste)

---

## 📋 Quick Checklist

```
□ Chandra OCR 2 API key/endpoint
□ Supabase Project URL + API keys
□ Cloudflare R2 bucket + credentials
□ Google Cloud TTS credentials (optional, for free tier)
□ Indic TTS endpoint (for better Telugu)
□ Environment variables file (.env.local)
```

---

## 1️⃣ CHANDRA OCR 2 (Telugu Text Extraction)

### Option A: Use Free Public API
**Easiest for testing**

```bash
# Chandra OCR 2 Free Endpoint
VITE_CHANDRA_OCR_API=https://api.chandra.ai/v1/ocr
VITE_CHANDRA_OCR_KEY=free-tier  # or request free key
```

**Steps:**
1. Visit: https://chandra.ai (or find their current endpoint)
2. Look for "Free Tier" or "API Access"
3. Get your free API key (usually email signup)
4. Test endpoint:
```bash
curl -X POST https://api.chandra.ai/v1/ocr \
  -H "Authorization: Bearer YOUR_KEY" \
  -F "file=@test.pdf"
```

### Option B: Self-Hosted (Advanced)
If you want to run Chandra OCR 2 locally:

```bash
# Docker setup (if available)
docker pull chandraocr/chandra-ocr-2
docker run -p 8000:8000 chandraocr/chandra-ocr-2

CHANDRA_OCR_API=http://localhost:8000
CHANDRA_OCR_KEY=local
```

### Option C: Use Tesseract.js as Fallback
If Chandra OCR 2 is not available, keep using client-side:
```bash
# In src/lib/pdf-parser.ts - already working!
# No env vars needed for Tesseract
```

---

## 2️⃣ SUPABASE (Backend + Database)

### Step 1: Create Supabase Account
1. Go to: https://supabase.com
2. Click **"Sign Up"** (free tier available)
3. Sign up with GitHub/Google/Email
4. Create a new organization (name: `voxnews`)
5. Create a new project:
   - **Name:** voxnews-production
   - **Database Password:** (save this safely!)
   - **Region:** Choose closest to you (e.g., us-west-1 for US, ap-south-1 for India)
   - Click **Create new project**

*Wait 2-3 minutes for project to spin up*

### Step 2: Get Supabase Credentials

Once project is created:

1. **In Supabase Dashboard → Settings → API**

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (long string)
```

Copy these exactly:
- **Project URL:** Top of the API section
- **Anon Key:** Under "Project API Keys" → "anon"

### Step 3: Create Database Tables

Go to **SQL Editor** → Paste this:

```sql
-- Table for caching generated audio
CREATE TABLE IF NOT EXISTS audio_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash TEXT UNIQUE NOT NULL,
  headline TEXT NOT NULL,
  language TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

-- Table for storing article metadata
CREATE TABLE IF NOT EXISTS articles_processed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_name TEXT NOT NULL,
  article_index INTEGER NOT NULL,
  headline TEXT NOT NULL,
  language TEXT NOT NULL,
  processing_time_ms INTEGER,
  tts_service TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table for tracking TTS costs
CREATE TABLE IF NOT EXISTS tts_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  characters_processed INTEGER NOT NULL,
  tts_service TEXT NOT NULL,
  cost_cents DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_audio_cache_hash ON audio_cache(content_hash);
CREATE INDEX idx_audio_cache_expires ON audio_cache(expires_at);
```

Click **Run** ✅

### Step 4: Create Supabase Edge Function

In **Supabase Dashboard → Edge Functions → Create function**

Name: `generate-audio`

*(We'll add the code in the next section)*

---

## 3️⃣ CLOUDFLARE R2 (Audio Storage)

### Step 1: Create Cloudflare Account
1. Go to: https://dash.cloudflare.com
2. Sign up (free tier)
3. Verify email

### Step 2: Create R2 Bucket

1. **In Cloudflare Dashboard → R2**
2. Click **Create Bucket**
   - **Name:** `voxnews-audio`
   - **Region:** Automatic
   - Click **Create bucket**

### Step 3: Create API Token

1. **In R2 → (Your bucket) → Settings**
2. Scroll to **API Token**
3. Click **Create API Token** → **Create**

```
R2_BUCKET_NAME=voxnews-audio
R2_ACCOUNT_ID=YOUR_ACCOUNT_ID (visible in dashboard)
R2_ACCESS_KEY_ID=abc123... (copy from token)
R2_SECRET_ACCESS_KEY=xyz789... (copy from token)
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

### Step 4: Get Account ID

In Cloudflare Dashboard → R2 → Any bucket → Settings:
```
Your account ID: abc123def456
```

### Step 5: CORS Configuration (Important!)

In **R2 → Settings → CORS**:

```json
[
  {
    "allowedOrigins": ["https://your-domain.com", "http://localhost:5173"],
    "allowedMethods": ["GET", "HEAD", "PUT", "POST"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3000
  }
]
```

---

## 4️⃣ TEXT-TO-SPEECH SERVICES

### Option A: Google Translate API (Free, for English)

```bash
# No API key needed for Google Translate!
# Uses free endpoint: https://translate.google.com/translate_a/...

VITE_TTS_GOOGLE_ENABLED=true
# No key required - uses free tier
```

### Option B: Indic TTS (Free, for Telugu + Indian Languages)

**Option B1: Use Public Indic TTS API**
```bash
VITE_TTS_INDIC_API=https://tts.ai4bharat.org/api/v1/tts
VITE_TTS_INDIC_KEY=free  # Usually no key needed

# Test:
curl -X POST https://tts.ai4bharat.org/api/v1/tts \
  -H "Content-Type: application/json" \
  -d '{
    "input": [{"source": "అర్థవంతమైన వార్తలు"}],
    "controlConfig": {"language": {"sourceLanguage": "te"}},
    "audioConfig": {"audioFormat": "mp3"}
  }'
```

**Option B2: Self-Host Indic TTS (Docker)**

```bash
# Clone and run locally
git clone https://github.com/AI4Bharat/Indic-TTS.git
cd Indic-TTS
docker build -t indic-tts .
docker run -p 8001:8000 indic-tts

# Then use:
VITE_TTS_INDIC_API=http://localhost:8001
```

### Option C: Hybrid (Recommended)
```bash
# Use both for best quality
VITE_TTS_GOOGLE_ENABLED=true
VITE_TTS_INDIC_API=https://tts.ai4bharat.org/api/v1/tts
VITE_TTS_INDIC_ENABLED=true

# Rules:
# - English → Google Translate TTS
# - Telugu → Indic TTS
```

---

## 5️⃣ CREATE .env.local FILE

### Step 1: In your project root, create `.env.local`:

```bash
cd /Users/siddharthapothulapati/Projects/voxnews-reader
touch .env.local
```

### Step 2: Add all variables:

```env
# ============ SUPABASE ============
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============ CLOUDFLARE R2 ============
VITE_R2_ACCOUNT_ID=abc123def456ghi789
VITE_R2_ACCESS_KEY_ID=1234567890abcdef
VITE_R2_SECRET_ACCESS_KEY=abcdefg1234567890xyz
VITE_R2_BUCKET_NAME=voxnews-audio
VITE_R2_ENDPOINT=https://abc123def456ghi789.r2.cloudflarestorage.com

# ============ CHANDRA OCR 2 ============
VITE_CHANDRA_OCR_API=https://api.chandra.ai/v1/ocr
VITE_CHANDRA_OCR_KEY=your-free-api-key

# ============ TEXT-TO-SPEECH ============
VITE_TTS_GOOGLE_ENABLED=true
VITE_TTS_INDIC_API=https://tts.ai4bharat.org/api/v1/tts
VITE_TTS_INDIC_ENABLED=true

# ============ APP CONFIG ============
VITE_APP_NAME=VoxNews Bharat
VITE_ENVIRONMENT=development
```

### Step 3: Save and verify

```bash
cat .env.local
# Should show all variables (without exposing full keys)
```

---

## 🔒 Security Best Practices

### DO NOT commit .env.local to Git!

```bash
# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore
echo "*.key" >> .gitignore
```

### For Production (Deployment):

1. **Cloudflare Workers Environment:**
```bash
# Deploy env vars to Cloudflare
wrangler secret put SUPABASE_URL
wrangler secret put R2_ACCESS_KEY_ID
# etc.
```

2. **Supabase Edge Functions Environment:**
```bash
# In Supabase Dashboard → Edge Functions → (function) → Settings
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
R2_ACCOUNT_ID=...
# etc.
```

---

## ✅ Verification Checklist

Run these commands to verify setup:

### 1. Check Chandra OCR 2
```bash
curl -X POST $VITE_CHANDRA_OCR_API \
  -H "Authorization: Bearer $VITE_CHANDRA_OCR_KEY" \
  -F "file=@sample.pdf"
# Should return: { "pages": [...], "success": true }
```

### 2. Check Supabase Connection
```bash
# In Node.js or browser console:
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
const { data } = await supabase.from('audio_cache').select().limit(1)
console.log(data) // Should return empty array or data
```

### 3. Check R2 Credentials
```bash
# Using s3cmd or AWS CLI:
aws s3 ls s3://voxnews-audio \
  --endpoint-url $VITE_R2_ENDPOINT \
  --access-key $VITE_R2_ACCESS_KEY_ID \
  --secret-key $VITE_R2_SECRET_ACCESS_KEY
# Should list bucket contents
```

### 4. Check TTS Service
```bash
curl "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
# Should return 200 OK

# For Indic TTS:
curl -X POST https://tts.ai4bharat.org/api/v1/tts \
  -H "Content-Type: application/json" \
  -d '{"input":[{"source":"నమస్కారం"}],"controlConfig":{"language":{"sourceLanguage":"te"}}}' \
  | jq .
# Should return audio URL
```

---

## 🚀 Summary of All Environment Variables

| Variable | Source | Example |
|----------|--------|---------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | `eyJhbGc...` |
| `VITE_R2_ACCOUNT_ID` | Cloudflare R2 Dashboard | `abc123def456` |
| `VITE_R2_ACCESS_KEY_ID` | Cloudflare R2 → API Token | `1234567890abcdef` |
| `VITE_R2_SECRET_ACCESS_KEY` | Cloudflare R2 → API Token | `abcdefg1234567890xyz` |
| `VITE_R2_BUCKET_NAME` | Your R2 Bucket Name | `voxnews-audio` |
| `VITE_R2_ENDPOINT` | Cloudflare R2 Dashboard | `https://abc123...r2.cloudflarestorage.com` |
| `VITE_CHANDRA_OCR_API` | Chandra OCR 2 Endpoint | `https://api.chandra.ai/v1/ocr` |
| `VITE_CHANDRA_OCR_KEY` | Chandra OCR 2 API Key | `free-tier-key` |
| `VITE_TTS_GOOGLE_ENABLED` | Hardcoded | `true` |
| `VITE_TTS_INDIC_API` | Indic TTS Endpoint | `https://tts.ai4bharat.org/api/v1/tts` |
| `VITE_TTS_INDIC_ENABLED` | Hardcoded | `true` |

---

## 📞 Troubleshooting

### "API key not working"
- Check for leading/trailing spaces in .env.local
- Verify key is for correct service
- Regenerate key if expired

### "CORS Error on R2"
- Update R2 CORS settings (see Step 4 above)
- Wait 5 minutes for propagation
- Clear browser cache

### "Supabase connection refused"
- Check internet connection
- Verify VITE_SUPABASE_URL is correct
- Check if Supabase project is active

### "Chandra OCR returns empty"
- Verify PDF is readable (not encrypted)
- Check file size (< 100MB recommended)
- Try with a different PDF

---

## 🎉 You're Ready!

Once all env vars are set:

```bash
# Start dev server
npm run dev

# Should load without errors
# .env.local will be automatically loaded by Vite
```

**Next Steps:** Wait for me to provide the complete code for:
1. Modified `pdf-parser.ts` with Chandra OCR 2
2. Supabase Edge Function for TTS
3. R2 upload utility
4. Frontend integration

All environment variables will be used automatically! 🚀

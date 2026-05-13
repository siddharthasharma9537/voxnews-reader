# 🎵 VoxNews TTS Integration Checklist

Complete these steps to get the full TTS pipeline working.

---

## ✅ Step 1: Database Setup (5 min)

### 1.1 Run Migration in Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project: **voxnews-production**
3. Navigate to: **SQL Editor** → **New Query**
4. Copy the SQL migration:
   ```sql
   [Contents of supabase/migrations/001_create_audio_tables.sql]
   ```
5. Click **Run** ✅
6. You should see 3 tables created: `audio_cache`, `articles_processed`, `tts_usage`

### 1.2 Verify Tables

In **Table Editor**, check that you can see:
- `audio_cache` (for caching generated audio)
- `articles_processed` (for tracking)
- `tts_usage` (for cost monitoring)

---

## ✅ Step 2: Deploy Edge Function (5 min)

### 2.1 Deploy generate-audio Function

**Option A: Using Supabase CLI (Recommended)**

```bash
cd /path/to/voxnews-reader

# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the function
supabase functions deploy generate-audio \
  --project-ref zxcoegjyarqvmarxmpgp

# Should output: ✓ Function deployed successfully!
```

**Option B: Manual via Dashboard**

1. Go to: https://supabase.com/dashboard → Your project
2. Navigate to: **Edge Functions** → **Create Function**
3. Name: `generate-audio`
4. Copy entire contents of: `supabase/functions/generate-audio/index.ts`
5. Click **Deploy**

### 2.2 Verify Deployment

Test the function with curl:

```bash
curl -X POST https://zxcoegjyarqvmarxmpgp.supabase.co/functions/v1/generate-audio \
  -H "Authorization: Bearer sb_publishable_ZtaYbwxbjtLowpNNFrsP7g_1HS5V3ay" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "అర్థవంతమైన టెలుగు వార్తలు",
    "body": "ఈ నిర్మాణ ప్రచారం విజయవంతమైంది.",
    "language": "te",
    "contentHash": "test-hash-001"
  }'

# Should return: {"audioUrl": "...", "durationSeconds": 15, "cached": false}
```

---

## ✅ Step 3: GitHub Secrets Setup (3 min)

### 3.1 Add Secrets to GitHub

1. Go to: https://github.com/siddharthasharma9537/voxnews-read/settings/secrets/actions
2. Click **New repository secret** for each:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `SUPABASE_URL` | `https://zxcoegjyarqvmarxmpgp.supabase.co` | Supabase Dashboard |
| `SUPABASE_ANON_KEY` | `sb_publishable_ZtaYbwxbjtLowpNNFrsP7g_1HS5V3ay` | Supabase Dashboard → API |
| `R2_ACCOUNT_ID` | `f761eb1751486656daf9b5bda912b62d` | Cloudflare Dashboard |
| `R2_ACCESS_KEY_ID` | `[YOUR_R2_KEY]` | Cloudflare R2 → Settings |
| `R2_SECRET_ACCESS_KEY` | `[YOUR_R2_SECRET]` | Cloudflare R2 → Settings |
| `R2_BUCKET_NAME` | `voxnews-audio` | Your bucket name |
| `CHANDRA_OCR_KEY` | `free-tier` | Chandra AI |

**Note:** Keep `.env.local` in your `.gitignore` (already done ✓)

---

## ✅ Step 4: Test Locally (5 min)

### 4.1 Install Dependencies

```bash
cd /path/to/voxnews-reader
npm install
```

### 4.2 Start Dev Server

```bash
npm run dev
```

You should see:
```
> voxnews-reader@1.0.0 dev
> tanstack-start dev

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

### 4.3 Test in Browser

1. Open: http://localhost:5173
2. Upload a PDF (any newspaper PDF)
3. Articles should extract correctly
4. **Note:** Audio playback won't work yet until you integrate AudioPlayer into index.tsx

---

## ✅ Step 5: Integrate AudioPlayer Component (10 min)

### 5.1 Update `src/routes/index.tsx`

After the articles parse, add audio playback. In the article card component, add:

```typescript
import { AudioPlayer } from "@/components/AudioPlayer";
import { generateAudio } from "@/lib/audio-service";
import crypto from "crypto";

// When displaying an article:
const contentHash = crypto
  .createHash("md5")
  .update(article.headline + article.body)
  .digest("hex");

const { audioUrl, durationSeconds } = await generateAudio({
  headline: article.headline,
  body: article.body,
  language: article.language || "en",
  contentHash,
});

// Render AudioPlayer:
<AudioPlayer
  audioUrl={audioUrl}
  headline={article.headline}
  durationSeconds={durationSeconds}
  onError={(error) => console.error("Audio error:", error)}
/>
```

### 5.2 Integrate Chandra OCR (Optional)

In `src/lib/pdf-parser.ts`, add OCR fallback:

```typescript
import { extractTextWithChandraOCR } from "./chandra-ocr";

// In the parser:
if (articles.length < 2 && enableOcr) {
  const ocrResult = await extractTextWithChandraOCR(file, (progress) => {
    onProgress?.({ status: "ocr", progress });
  });
  
  const ocrText = formatChandraOCRText(ocrResult);
  // Use OCR text to re-parse articles
}
```

---

## ✅ Step 6: Push to GitHub (2 min)

```bash
cd /path/to/voxnews-reader

# Add all files
git add .

# Commit
git commit -m "feat: add TTS backend with Supabase Edge Functions and audio caching"

# Push to main
git push origin main
```

---

## 🧪 Test the Full Pipeline

### Test Case 1: English Article
1. Upload a newspaper PDF with English articles
2. Select an article
3. Audio should generate (~5-10 seconds)
4. Play button should work
5. Download button should save MP3

### Test Case 2: Telugu Article
1. Upload a PDF with Telugu text
2. Select an article
3. Audio should generate using Indic TTS
4. Playback should work in Telugu

### Test Case 3: Caching
1. Select same article twice
2. First time: ~5-10 seconds (generating)
3. Second time: <1 second (cached)

---

## 🔍 Troubleshooting

### "Edge Function returns 401"
- Check `SUPABASE_ANON_KEY` in .env.local
- Verify function is deployed: Dashboard → Edge Functions

### "Audio URL returns 404"
- Check TTS service is responding (Google Translate / Indic TTS)
- Verify Cloudflare R2 bucket exists and has CORS enabled

### "Tesseract.js throws error"
- This is a fallback for scanned PDFs
- Make sure PDF has extractable text first
- OCR fallback will activate if < 2 articles found

### "Supabase connection refused"
- Check `VITE_SUPABASE_URL` is correct
- Verify internet connection
- Check if project is active in Supabase Dashboard

---

## 📊 Monitoring

### Check Cache Hit Rate
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN cached = true THEN 1 ELSE 0 END) as cached_hits
FROM audio_cache;
```

### Monitor TTS Usage
```sql
SELECT 
  tts_service,
  SUM(characters_processed) as total_chars,
  SUM(cost_cents) as total_cost_cents
FROM tts_usage
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY tts_service;
```

---

## 🚀 Next Steps

1. ✅ Database setup
2. ✅ Edge Function deployment
3. ✅ GitHub Secrets
4. ✅ Local testing
5. ✅ AudioPlayer integration
6. ✅ Push to GitHub
7. **Deploy to Cloudflare Workers** (optional, current setup works)
8. **Connect to sohum.cloud domain** (if using Razorhost)

---

## 📝 Notes

- All audio is cached in PostgreSQL for 30 days
- TTS costs are tracked in `tts_usage` table
- Google Translate TTS is free but lower quality
- Indic TTS is free and better for Telugu
- Edge Function handles routing between services based on language

**You're all set!** 🎉

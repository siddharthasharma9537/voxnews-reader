# Architecture Decision Records (ADRs)

**Version:** 1.0  
**Last Updated:** May 13, 2026  
**Status:** MVP Development

This document records major architecture decisions and their reasoning. Each ADR follows the template:
- **Date:** When decision was made
- **Status:** Proposed, Accepted, Deprecated, Superseded
- **Context:** The problem we faced
- **Decision:** What we chose
- **Consequences:** Positive and negative outcomes

---

## ADR-001: Frontend Framework Selection

**Date:** May 1, 2026  
**Status:** Accepted ✅  
**Decision:** Use **TanStack Start** (full-stack React framework) over Next.js

### Context

We needed a modern React framework that:
1. Supports full-stack development (frontend + backend in one repo)
2. Handles server-side rendering (SSR) efficiently
3. Works with Supabase or external APIs
4. Minimal learning curve for solo developer
5. Good for single-page apps (PDF processing on client)

### Options Considered

**Option A: Next.js 14 (App Router)**
- ✅ Pros:
  - Largest ecosystem and community
  - Built-in API routes
  - Excellent SEO support
  - Vercel integration (seamless deployment)
  - Great TypeScript support
- ❌ Cons:
  - Slightly heavier bundle
  - Some opinionated file structure
  - Not ideal for PDF processing (client-heavy work)

**Option B: TanStack Start (React Router + Vinxi)**
- ✅ Pros:
  - File-based routing (like Next.js)
  - Full-stack by default
  - Works with Cloudflare Workers
  - Lighter bundle for client-side work
  - Excellent for SPA (single-page app) interactions
- ❌ Cons:
  - Smaller community than Next.js
  - Fewer third-party integrations
  - Newer (less battle-tested)

**Option C: Remix**
- ✅ Pros:
  - Excellent data loading patterns
  - Nested routing
  - Web standards focused
- ❌ Cons:
  - Smaller ecosystem than Next.js
  - More complex learning curve
  - Deployment options limited

### Decision

✅ **Chose Option B: TanStack Start**

**Reasoning:**
- Our app is primarily **client-side heavy** (PDF parsing, audio generation happen in browser)
- PDF processing benefits from **lighter overhead** than Next.js provides
- TanStack Start's **full-stack by default** approach aligns with our architecture
- Cloudflare Workers support is important for **edge function deployment**
- File-based routing is familiar to Next.js developers
- Smaller bundle = **faster initial load** for PDF uploads

### Consequences

**Positive:**
- ✅ Minimal bundle overhead
- ✅ Fast development iteration
- ✅ Natural integration with Supabase Edge Functions
- ✅ Excellent for client-side PDF processing
- ✅ Can scale to full-stack if needed

**Negative:**
- ❌ Smaller community means fewer third-party plugins
- ❌ Fewer tutorials compared to Next.js
- ❌ Less battle-tested in production

**Risks:**
- If we need advanced SEO later, Next.js might be better
- Dependency on Vinxi/React Router ecosystem health
- Smaller hiring pool for developers familiar with TanStack Start

**Mitigation:**
- Keep Next.js as fallback if major issues arise
- Invest in team training on TanStack Router
- Document architecture decisions for future team members

---

## ADR-002: Text-to-Speech (TTS) Strategy

**Date:** May 2, 2026  
**Status:** Accepted ✅  
**Decision:** Use **Web Speech API** (browser-native) over external TTS services

### Context

We needed TTS for article audio generation:
1. Must support English and Telugu
2. Must be cost-effective (free or < $50/month)
3. Must work offline or with minimal API calls
4. Must have acceptable audio quality (80%+)
5. Must handle variable content length (short headlines to long articles)

### Options Considered

**Option A: Web Speech API (Browser Native)**
- ✅ Pros:
  - **Zero cost** (built into browser)
  - **Works offline** (no API calls)
  - **90%+ browser support** (Chrome, Safari, Firefox, Edge)
  - **Instant generation** (no server processing)
  - Supports Telugu via language code (te-IN)
  - Can cache generated audio for reuse
- ❌ Cons:
  - Audio quality is 70-80% of professional TTS
  - No control over voice characteristics
  - Different across browsers/OS
  - Pronunciation quirks in English
  - No audio file generation (only playback)

**Option B: Google Cloud Text-to-Speech**
- ✅ Pros:
  - High-quality audio (95%+)
  - Consistent across platforms
  - Good language support including Telugu
  - Neural voices available
  - File generation
- ❌ Cons:
  - **Cost: $15-30 per 1M characters**
  - For 10k MAU reading 5k characters/day: **$750-1500/month**
  - Requires authentication (API keys)
  - API latency (500-1000ms)
  - Requires server-side processing

**Option C: Indic TTS (AI4Bharat)**
- ✅ Pros:
  - **Free API**
  - Specialized for Indian languages
  - Good Telugu support
  - Open-source
- ❌ Cons:
  - **Poor English support**
  - Lower quality than Google
  - Newer/less reliable
  - Network dependency
  - API rate limiting

**Option D: Azure Cognitive Services**
- ✅ Pros:
  - High quality
  - Flexible pricing
- ❌ Cons:
  - **Cost: Similar to Google ($15-30 per 1M)**
  - Complex setup
  - Overkill for MVP

### Decision

✅ **Chose Option A: Web Speech API**

**Reasoning:**
- **Zero cost** is critical for MVP sustainability
- **Offline capability** is a major differentiator (no one else offers this)
- **90%+ browser support** covers realistic user base
- **70-80% quality** is acceptable for news consumption (not for entertainment)
- **Eliminates backend TTS complexity** (no API keys, rate limits, etc.)
- **Easy to upgrade later** if needed

### Consequences

**Positive:**
- ✅ **Zero infrastructure cost** (no TTS API to pay for)
- ✅ **Offline-first** differentiator
- ✅ **Instant audio generation** (no server latency)
- ✅ **Cacheable** (same article = same audio)
- ✅ **Privacy-friendly** (no audio sent to external servers)
- ✅ **Simple implementation** (5 functions in audio-service.ts)

**Negative:**
- ❌ **Audio quality limitations** (pronunciation of some English words)
- ❌ **No voice customization** (can't change speaker)
- ❌ **Browser-dependent** (quality varies by OS/browser)
- ❌ **Cannot generate MP3 files** (only browser playback)

**Risks:**
- If quality feedback is negative, need to switch to Google TTS (+$750/month)
- Some browsers (older Safari, IE) don't support Web Speech API
- Telugu pronunciation might be poor for technical terms

**Mitigation:**
- Monitor user feedback on audio quality in first month
- Add fallback message for unsupported browsers
- Plan upgrade path to Google TTS if needed (v0.2+)
- Use Web Speech API for MVP, professional TTS for premium tier (future)

---

## ADR-003: Database & Backend Selection

**Date:** May 2, 2026  
**Status:** Accepted ✅  
**Decision:** Use **Supabase** (PostgreSQL + Auth + Edge Functions) over Firebase or self-hosted

### Context

We needed a backend with:
1. User authentication (optional for MVP, required for sync)
2. Audio cache storage (metadata only, not audio files)
3. Edge functions for TTS (if needed later)
4. Scalability to 10k+ users
5. Minimal maintenance overhead (solo founder)
6. Cost-effective pricing

### Options Considered

**Option A: Supabase (PostgreSQL + Auth + Edge Functions)**
- ✅ Pros:
  - **PostgreSQL** (relational, structured data)
  - **Built-in Auth** (JWT, social login)
  - **Edge Functions** (serverless compute)
  - **Real-time subscriptions**
  - **Row-Level Security (RLS)**
  - **Free tier** ($0 for MVP scale)
  - **$25-100/month** at 10k MAU
  - No vendor lock-in (can self-host Postgres)
- ❌ Cons:
  - Learning curve for SQL
  - RLS policies are complex
  - Some cold start latency on Edge Functions

**Option B: Firebase (Firestore + Authentication)**
- ✅ Pros:
  - **No-SQL** (simpler for beginners)
  - **Real-time database** built-in
  - **Authentication** included
  - **Good free tier**
  - Google's backing
- ❌ Cons:
  - **No backend functions** (need Cloud Functions separately)
  - **Vendor lock-in** (can't self-host)
  - **Cost scaling** (can be expensive with many reads)
  - Document model less suitable for structured data
  - **No easy migration path**

**Option C: Self-Hosted (Django + PostgreSQL on Railway)**
- ✅ Pros:
  - **Full control**
  - **No vendor lock-in**
  - **Better cost** at small scale
- ❌ Cons:
  - **Too much maintenance** for solo founder
  - Need to manage auth, caching, scaling
  - **Not scalable** without DevOps expertise
  - Database backups, monitoring, security

### Decision

✅ **Chose Option A: Supabase**

**Reasoning:**
- **PostgreSQL is relational** → better for structured data (articles, cache, users)
- **No vendor lock-in** (can self-host PostgreSQL later)
- **All-in-one solution** (Auth + DB + Functions + RLS)
- **Minimal maintenance** (fully managed)
- **Cost-effective** ($0 MVP → $50/month at 10k users)
- **RLS is powerful** for multi-user features (future)
- **Edge Functions** are perfect for batch processing

### Consequences

**Positive:**
- ✅ **Zero DevOps overhead** (managed service)
- ✅ **PostgreSQL flexibility** (can add complex queries later)
- ✅ **No vendor lock-in** (can migrate to self-hosted Postgres)
- ✅ **RLS policies** enable secure multi-user features
- ✅ **Cost-predictable** (transparent pricing)
- ✅ **Generous free tier** (perfect for MVP)

**Negative:**
- ❌ Learning SQL (for team members later)
- ❌ RLS policies are verbose
- ❌ Slight cold start on Edge Functions

**Risks:**
- Supabase is newer than Firebase/AWS RDS
- Depends on Supabase's service reliability
- RLS policies can be complex to debug

**Mitigation:**
- Use Supabase CLI for local development
- Document RLS policies carefully
- Have disaster recovery plan (backups)
- Planned migration path to self-hosted Postgres if needed

---

## ADR-004: PDF Processing Strategy

**Date:** May 3, 2026  
**Status:** Accepted ✅  
**Decision:** Use **Client-side PDF parsing** (PDF.js + Tesseract.js) over server-side processing

### Context

We needed PDF processing that:
1. Handles PDFs up to 100 MB
2. Works offline (no server calls)
3. Doesn't require user authentication
4. Doesn't expose PDFs to external servers (privacy)
5. Fast enough for good UX (< 10 seconds)

### Options Considered

**Option A: Client-Side Processing (PDF.js + Tesseract.js)**
- ✅ Pros:
  - **Works offline** (no server needed)
  - **Privacy** (PDFs never leave user's device)
  - **No authentication** required
  - **Free** (open-source)
  - **Scalable** (each user processes their own PDF)
  - Supports both scanned and digital PDFs
- ❌ Cons:
  - **Heavy JavaScript bundle** (~2-3 MB)
  - **CPU intensive** (can slow down browser)
  - **Longer processing time** (5-15 seconds)
  - OCR quality depends on client hardware

**Option B: Server-Side Processing (Python + API)**
- ✅ Pros:
  - **Fast processing** (server is faster than browser)
  - **Smaller JS bundle**
  - **Consistent quality** (same processing on all users' requests)
- ❌ Cons:
  - **Privacy concern** (PDFs uploaded to server)
  - **Requires authentication**
  - **Cost** ($50-200/month for compute)
  - **Scalability limits** (need auto-scaling)
  - **Overkill for MVP** (adds complexity)

**Option C: Hybrid (Client + Server fallback)**
- ✅ Pros:
  - Best of both worlds
  - Server processes if client fails
- ❌ Cons:
  - **Twice the complexity**
  - **Higher cost**
  - Not necessary for MVP

### Decision

✅ **Chose Option A: Client-Side Processing**

**Reasoning:**
- **Privacy is a feature** (no PDFs on server)
- **No authentication required** → easier onboarding
- **Offline capability** is a major differentiator
- **Free** (no backend compute costs)
- **Sufficient performance** (< 10 seconds is acceptable)
- **Simple architecture** (no server to maintain)

### Consequences

**Positive:**
- ✅ **Privacy by design** (no server-side PDF storage)
- ✅ **Offline-first** (differentiator vs competitors)
- ✅ **No auth required** (faster adoption)
- ✅ **Cost-effective** (no backend compute)
- ✅ **Scales infinitely** (each client is independent)
- ✅ **GDPR compliant** (user controls data)

**Negative:**
- ❌ **Larger JavaScript bundle** (~2-3 MB for PDF.js + Tesseract.js)
- ❌ **Processing blocks UI** (need loading state)
- ❌ **CPU-intensive** (can drain battery on mobile)
- ❌ **OCR quality depends on device** (older devices slower)

**Risks:**
- Some users on low-end devices may experience slowness
- Browser may crash on very large PDFs (> 500 pages)
- OCR accuracy on scanned PDFs varies by quality

**Mitigation:**
- Add progress indicator for transparency
- Limit PDF size to 100 MB
- Add warning for slow devices
- Planned upgrade to server-side for premium tier (v0.3+)

---

## ADR-005: Caching Strategy

**Date:** May 4, 2026  
**Status:** Accepted ✅  
**Decision:** Use **Content Hash + Supabase table** (no Redis) for audio caching

### Context

We needed efficient audio caching because:
1. Same article = same audio (deterministic)
2. Don't want to regenerate same audio twice
3. Multiple users may read same newspaper
4. Reduce bandwidth for repeated articles

### Options Considered

**Option A: Content Hash + Supabase Table**
- ✅ Pros:
  - **Simple** (just metadata storage)
  - **Free** (uses included Supabase storage)
  - **Deterministic** (same content = same hash)
  - **Queryable** (can find cached articles)
  - Audio files stored in cache directory (browser/Supabase)
- ❌ Cons:
  - **Slower than Redis** (database query vs in-memory)
  - Can't cache actual audio files (only metadata)
  - Cold storage retrieval takes 200-500ms

**Option B: Redis Cache**
- ✅ Pros:
  - **Fast** (in-memory, < 50ms)
  - **Scalable** (can store large audio files)
  - **TTL support** (automatic expiration)
- ❌ Cons:
  - **Cost** ($20-50/month for Redis)
  - **Overkill for MVP** (don't have that much traffic)
  - **Adds operational complexity**
  - Learning curve for team

**Option C: CDN + Object Storage (Cloudflare R2)**
- ✅ Pros:
  - **Persistent storage** (not lost on reboot)
  - **CDN caching** (fast retrieval)
  - **Scalable** (can handle large files)
- ❌ Cons:
  - **Complex** (need to manage file uploads)
  - Web Speech API doesn't generate files (only browser playback)
  - Would need backend to convert audio to files first

### Decision

✅ **Chose Option A: Content Hash + Supabase Table**

**Reasoning:**
- **Simple** (just metadata, no audio file management)
- **Free** (no additional costs)
- **Sufficient performance** (< 500ms is acceptable)
- **MVP appropriate** (we don't have that much traffic yet)
- **Easy to upgrade** (switch to Redis later if needed)
- **Clean data structure** (can analyze cache hits/misses)

### Consequences

**Positive:**
- ✅ **Simple implementation** (< 50 lines of code)
- ✅ **No additional costs** (free Supabase storage)
- ✅ **Deterministic** (same content = same hash)
- ✅ **Queryable** (can analyze cache patterns)
- ✅ **Automatic cleanup** (30-day TTL)

**Negative:**
- ❌ **Slower than Redis** (200-500ms vs 10-50ms)
- ❌ **Can't cache actual audio** (only metadata references)
- ❌ **Database query overhead** (scales with users)
- ❌ **No compression** (can't optimize storage)

**Risks:**
- If traffic exceeds 1000 QPS, database will bottleneck
- Metadata-only approach means re-generating audio on each play

**Mitigation:**
- Switch to Redis if cache query time exceeds 100ms in production
- Monitor cache hit rate and adjust TTL if needed
- Plan upgrade to R2 + CDN for v0.2 if performance issues arise

---

## ADR-006: Deployment Platform

**Date:** May 5, 2026  
**Status:** Accepted ✅  
**Decision:** Use **Vercel** (frontend) + **Cloudflare Workers** (for TanStack Start backend)

### Context

We needed deployment that:
1. Handles TanStack Start (full-stack React)
2. Supports serverless functions
3. Has great developer experience
4. Cost-effective for MVP
5. Easy CI/CD setup

### Options Considered

**Option A: Vercel + Cloudflare**
- ✅ Pros:
  - **Vercel** is perfect for Next.js/TanStack Start
  - **Native support** for TanStack Start
  - **Fast deployment** (push to GitHub = live in 30s)
  - **Generous free tier** ($0-20/month)
  - **Edge Functions** via Cloudflare
- ❌ Cons:
  - Slight vendor lock-in to Vercel
  - Learning both platforms

**Option B: Railway (All-in-One)**
- ✅ Pros:
  - **Single platform** for frontend + backend
  - **Docker-based** (flexible)
  - **Good pricing** ($5-50/month)
- ❌ Cons:
  - **Less optimized** for frontend (no edge network)
  - **Slower cold starts** than Vercel
  - **Smaller ecosystem** than Vercel

**Option C: AWS Amplify**
- ✅ Pros:
  - **Integrated with AWS** (auth, storage, etc.)
  - Powerful
- ❌ Cons:
  - **Complex** for solo developer
  - **Expensive** if you make a mistake
  - **Steep learning curve**

**Option D: Self-Hosted (DigitalOcean + Caprover)**
- ✅ Pros:
  - **Full control**
  - **No vendor lock-in**
- ❌ Cons:
  - **Too much DevOps** for solo founder
  - Maintenance burden
  - Security responsibility

### Decision

✅ **Chose Option A: Vercel + Cloudflare**

**Reasoning:**
- **Vercel is the standard** for React/Next.js apps
- **TanStack Start is natively supported** by Vercel
- **Zero cold starts** (always warm)
- **Edge network** for fast global delivery
- **Git-based deployment** (push to GitHub = live)
- **Cloudflare Workers** for serverless if needed

### Consequences

**Positive:**
- ✅ **Minimal DevOps** (fully managed)
- ✅ **Instant deployment** (GitHub integration)
- ✅ **Fast worldwide** (edge network)
- ✅ **Generous free tier** (perfect for MVP)
- ✅ **Built-in CI/CD** (GitHub Actions integration)
- ✅ **Environment management** (staging/prod)

**Negative:**
- ❌ **Slight vendor lock-in** (migrating away is effort)
- ❌ **Cost will increase** as traffic grows
- ❌ **Datadog/Sentry not built-in** (need integration)

**Risks:**
- Vercel pricing can get expensive at scale (> 1M requests/month)
- Vendor lock-in if we need special infrastructure later

**Mitigation:**
- Build with standard Node.js APIs (easy migration)
- Monitor costs carefully
- Plan migration path to self-hosted if needed at scale

---

## ADR-007: Environment Management

**Date:** May 6, 2026  
**Status:** Accepted ✅  
**Decision:** Three environments: **Development, Staging, Production** with separate Supabase projects

### Context

We needed environment separation for:
1. Safe testing without affecting users
2. Different configuration per environment
3. Separate data (dev ≠ prod)
4. CI/CD automation

### Approach

```
Development
├── Local .env.local file
├── Localhost database
├── Live Supabase project (dev branch)
└── For active development

Staging
├── Vercel staging deployment
├── Supabase staging project
├── Auto-deploy on push to staging branch
└── Final QA before production

Production
├── Vercel production deployment
├── Supabase production project
├── Manual approval before deploy
└── Real user data
```

### Decision

✅ **Three separate environments** with dedicated Supabase projects per environment

### Consequences

**Positive:**
- ✅ Safe testing without risking user data
- ✅ Staging exactly mirrors production
- ✅ Clear promotion path (dev → staging → prod)
- ✅ Easy rollback (if prod breaks, revert in Vercel)

**Negative:**
- ❌ Need to manage 3 Supabase projects
- ❌ Data inconsistency (different data in each)
- ❌ Cost multiplied by 3 (though free tier covers all three)

---

## Decision Status Summary

| ADR | Title | Status | Impact |
|-----|-------|--------|--------|
| 001 | Frontend Framework (TanStack Start) | ✅ Accepted | Core architecture |
| 002 | TTS Strategy (Web Speech API) | ✅ Accepted | Cost & differentiation |
| 003 | Database (Supabase) | ✅ Accepted | Backend foundation |
| 004 | PDF Processing (Client-side) | ✅ Accepted | Privacy + offline |
| 005 | Caching (Supabase + hash) | ✅ Accepted | Performance |
| 006 | Deployment (Vercel + Cloudflare) | ✅ Accepted | DevOps simplicity |
| 007 | Environment Management | ✅ Accepted | CI/CD strategy |

---

## Future Decisions (Post-MVP)

These decisions are planned but not final:

- **ADR-008:** Mobile app strategy (native vs React Native vs PWA)
- **ADR-009:** Premium tier pricing model
- **ADR-010:** Analytics & tracking strategy
- **ADR-011:** More languages (Hindi, Kannada, Tamil)
- **ADR-012:** Professional TTS upgrade (if quality feedback requires)

---

**Document Owner:** Siddhartha Pothulapati  
**Last Reviewed:** May 13, 2026  
**Next Review:** May 20, 2026 (post-MVP)

# VoxNews Bharat — Complete Project Analysis

**Project Type:** Mobile-first web application | Audio news delivery platform
**Tech Stack:** TanStack Start (React 19, TypeScript, Vite) | TailwindCSS 4 | Cloudflare Workers
**Primary Use Case:** Share newspaper PDFs on WhatsApp → Converts to AI-narrated audio playlists

---

## 📋 Project Overview

**VoxNews Bharat** is a full-stack web application designed for reading newspapers aloud. Users share PDF files (typically newspaper scans) and the app:
1. Extracts articles using text detection (with OCR fallback for scanned PDFs)
2. Categorizes articles (Business, Sports, Politics, etc.)
3. Creates playable audio playlists with estimated read times
4. Provides a phone-like UI mimicking a native mobile app

**Target Market:** India-focused ("Made for every reader, in every village")
**Integration:** WhatsApp share → VoxNews app flow (native share sheet integration)

---

## 🏗️ Architecture Overview

### Directory Structure:
```
voxnews-reader/
├── src/
│   ├── start.ts              # TanStack Start middleware & error handling
│   ├── server.ts             # Server entry point (Cloudflare Workers)
│   ├── router.tsx            # TanStack Router setup with Query Client
│   ├── routes/
│   │   ├── __root.tsx        # Root layout component
│   │   └── index.tsx         # Main application (all UI + logic)
│   ├── lib/
│   │   ├── pdf-parser.ts     # Core PDF → articles extraction (388 lines)
│   │   ├── error-page.ts     # Error page rendering
│   │   ├── error-capture.ts  # Error boundary logic
│   │   └── utils.ts          # Utilities
│   ├── hooks/
│   │   └── use-mobile.tsx    # Mobile detection hook
│   ├── components/
│   │   └── ui/               # Radix UI primitives (30+ component files)
│   └── routeTree.gen.ts      # Auto-generated route tree
├── vite.config.ts            # Build configuration
├── tsconfig.json             # TypeScript settings
├── package.json              # Dependencies
├── components.json           # shadcn/ui config
├── wrangler.jsonc            # Cloudflare deployment config
└── eslint.config.js          # Linting rules
```

### Key Architectural Decisions:

1. **Monolithic UI Component:** The entire app lives in `src/routes/index.tsx` (~750 lines)
   - Single-page application with tab-based navigation (home/howto/settings)
   - No separate route files for each view (not ideal for scaling)

2. **Client-Side PDF Processing:** All PDF parsing happens in the browser
   - Uses `pdfjs-dist` for text extraction
   - Includes `tesseract.js` for OCR fallback on scanned documents
   - No server-side processing needed

3. **Minimal Backend:** Cloudflare Workers deployment
   - Error middleware for 500-level responses
   - Mostly serves static assets and routing

4. **React Query + TanStack Router:** Modern data fetching & routing
   - Currently underutilized (app is mostly client-side state)
   - Suggests room for backend integration

---

## 🎨 UI/UX Analysis

### Design System:
- **Framework:** TailwindCSS 4 + Radix UI components
- **Component Library:** shadcn/ui (30+ primitive UI components available)
- **Visual Language:** Newspaper-inspired design with newsprint grain texture
- **Color Scheme:** Saffron accent (#orange for India branding) + dark foreground

### Key UI Features:
1. **Phone Frame:** Mimics iPhone form factor (~440px wide)
2. **Status Bar:** Shows time, language, signal strength
3. **Tabbed Navigation:**
   - **Home:** Main playlist & upload interface
   - **How To:** 3-step onboarding guide
   - **Settings:** Wi-Fi mode, OCR toggle, language/voice/speed (UI only)
4. **Now Playing Bar:** Fixed bar showing current article
5. **Bottom Navigation:** 3-tab switcher

### Main Components:
- **PhoneFrame:** Container layout
- **HomeView:** Primary interface with hero card, action tiles, playlist
- **ArticleSheet:** Modal for full article body
- **ImportProgress:** Real-time progress bar during PDF parsing
- **PlaylistItem:** Individual article in queue

---

## 🔧 Core Technologies

### Dependencies (Key):
| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-start` | ^1.167.50 | Full-stack React framework |
| `@tanstack/react-router` | ^1.168.25 | File-based routing |
| `@tanstack/react-query` | ^5.83.0 | Data fetching & caching |
| `pdfjs-dist` | ^5.7.284 | PDF parsing |
| `tesseract.js` | ^7.0.0 | OCR for scanned PDFs |
| `@radix-ui/*` | ~v1.2+ | Headless UI primitives |
| `tailwindcss` | ^4.2.1 | Styling |
| `lucide-react` | ^0.575.0 | Icon library |

### Build & Deploy:
- **Build Tool:** Vite 7.3
- **Language:** TypeScript 5.8
- **Linting:** ESLint 9.32
- **Formatting:** Prettier 3.7
- **Deployment:** Cloudflare Workers + Wrangler

---

## 📊 Code Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| TypeScript Files | 11 | Main business logic |
| Main App Component | ~755 lines | Monolithic, needs refactoring |
| PDF Parser | 388 lines | Core algorithm |
| UI Component Files | 30+ | Radix UI primitives |
| Total Dependencies | 70+ | Includes many UI primitives |

---

## 🔑 Core Functionality

### 1. PDF Import & Parsing
- **Input:** File upload or WhatsApp share
- **Validation:** PDF format check
- **Processing:** Text extraction + headline detection (size-based)
- **Article Detection:** Y-position discontinuities mark boundaries
- **OCR Fallback:** If <2 articles detected, runs Tesseract.js
- **Output:** `ParsedArticle[]` with headline, body, category, minutes

### 2. Article Categorization
Uses regex patterns on headline + body:
- **Business:** market, sensex, rupee, rbi, gdp, stock
- **Sports:** cricket, football, match, tournament
- **Politics:** election, minister, parliament, government
- **Science:** isro, space, research, ai
- **Weather, Culture, Opinion** (default: National)

### 3. Playlist Management
- Toggle articles in/out of queue
- Track currently playing article
- Calculate total duration (180 words/minute)
- Display now-playing bar

### 4. Settings (UI Only)
- Wi-Fi only mode for audio downloads
- OCR fallback toggle
- Language selection (Hindi + English)
- Voice selection (Aarav · Natural)
- Playback speed (1.0×)

---

## ⚙️ State Management

All state in `src/routes/index.tsx`:
```typescript
tab: "home" | "howto" | "settings"    // Current tab
doc: ImportedDoc | null               // Loaded PDF metadata
queue: string[]                        // Article IDs to play
playing: string | null                // Currently playing article
wifiOnly: boolean                      // Settings toggle
enableOcr: boolean                     // Settings toggle
openArticle: Article | null            // Selected article modal
importing: boolean                     // Loading state
importError: string | null             // Error message
progress: ProgressUpdate | null        // PDF parsing progress
```

---

## 🚀 Build & Deployment

**Build Process:**
1. Vite bundles TypeScript → JavaScript
2. TailwindCSS JIT compilation
3. Cloudflare Wrangler packaging
4. Deploy to Cloudflare Workers edge network

**Environment:** Cloudflare Workers (edge compute) + global CDN

---

## ✅ Strengths

1. **Client-Side Processing** — No server load for PDFs
2. **Modern Stack** — React 19, TypeScript, Vite, TailwindCSS 4
3. **Smart Heuristics** — Size-based headline detection + regex categorization
4. **Great UX** — Native phone-like interface with smooth interactions
5. **Accessibility** — Built on Radix UI (ARIA compliant)
6. **Privacy** — PDFs never uploaded to servers

---

## ⚠️ Weaknesses & Technical Debt

### 1. **Monolithic Component** 🔴
- `index.tsx` = 755 lines (should split into separate files)

### 2. **Unused Dependencies** 🟡
- `recharts`, `sonner`, `react-hook-form` not used (adds bundle size)

### 3. **Settings Are Stubs** 🟡
- No persistent storage (localStorage)
- Language/voice/speed don't actually work

### 4. **Missing Audio Implementation** 🔴
- No audio player component
- No text-to-speech integration
- Core feature not working

### 5. **No Data Persistence** 🟡
- Articles lost on page refresh
- No localStorage caching

### 6. **Limited Error Recovery** 🟡
- No retry logic
- No partial extraction feedback

### 7. **No Test Coverage** ❌
- Zero test files
- PDF parser (388 lines) needs unit tests

### 8. **Camera Scan** 🟡
- UI button exists but no implementation

### 9. **Type Safety Gaps** 🟡
- `Article` type duplicated
- Missing error type definitions

### 10. **Accessibility Issues** 🟡
- Missing focus management in modals
- Some buttons lack `aria-label`

---

## 🔮 Recommendations

### High Priority:
1. **Refactor index.tsx** → Split into feature files
2. **Add localStorage persistence** for docs & settings
3. **Implement Audio Playback** (core missing feature)
4. **Remove unused dependencies**
5. **Add unit tests** for PDF parser

### Medium Priority:
6. **Connect real settings** (Wi-Fi, OCR, language)
7. **Implement camera scan**
8. **Add error boundaries**
9. **Performance optimizations** (code splitting, bundling)
10. **Accessibility fixes** (focus management, WCAG AA)

---

## 📈 Development Roadmap

**Phase 1 (Current):** PDF parsing ✅
**Phase 2 (Next):** Audio generation + TTS integration
**Phase 3:** Smart features (summaries, custom markers)
**Phase 4:** Social features (sharing, comments)
**Phase 5:** Multi-language support (Marathi, Bengali, Tamil)

---

## 🎓 Summary

**VoxNews Bharat** is an **alpha-ready MVP** with solid fundamentals but needs:
- ✅ Strong: modern tech stack, great UX, client-side processing
- ⚠️ Needs: refactoring, audio implementation, backend integration

**Status:** 🟢 Alpha | ⚠️ Pre-production | 🔲 Audio not implemented

---

*Analysis generated 2026-05-13*

# Naming Conventions: VoxNews Bharat

**Version:** 1.0  
**Last Updated:** May 13, 2026  
**Status:** Active

---

## Overview

This document establishes standardized naming conventions across the VoxNews Bharat codebase to ensure consistency, clarity, and maintainability. All team members must follow these conventions in pull requests and code reviews.

**Key Principle:** Names should be explicit, unambiguous, and reveal intent at a glance.

---

## 1. Database Naming Conventions

### Tables

**Format:** `snake_case` (lowercase, underscores separate words)  
**Rule:** Plural nouns, descriptive, business-domain terminology

```sql
-- ✅ GOOD
CREATE TABLE articles (...);
CREATE TABLE audio_cache (...);
CREATE TABLE user_preferences (...);
CREATE TABLE pdf_uploads (...);

-- ❌ BAD
CREATE TABLE Article (...);  -- PascalCase
CREATE TABLE articles_tbl (...);  -- "tbl" suffix
CREATE TABLE ac (...);  -- Too abbreviated
```

### Columns

**Format:** `snake_case` (lowercase, underscores separate words)  
**Rules:**
- Be descriptive; avoid single letters (`id` is OK, `x` is not)
- Use `_at` suffix for timestamps: `created_at`, `updated_at`, `expires_at`
- Use `_id` suffix for foreign keys: `user_id`, `article_id`
- Use `is_` prefix for booleans: `is_active`, `is_cached`, `is_deleted`
- Use `_count` suffix for counters: `view_count`, `error_count`

```sql
-- ✅ GOOD
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
headline TEXT NOT NULL
created_at TIMESTAMP DEFAULT NOW()
is_cached BOOLEAN DEFAULT FALSE
view_count INTEGER DEFAULT 0

-- ❌ BAD
userId (camelCase)
title (too generic, use headline)
created (missing _at)
cached (missing is_ prefix)
cnt (too abbreviated)
```

### Primary Keys

**Format:** `id` (UUID)  
**Rule:** All tables have a UUID primary key named `id`

```sql
-- ✅ GOOD
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- ❌ BAD
CREATE TABLE articles (
  article_id UUID PRIMARY KEY,  -- Use 'id', not 'article_id'
  ...
);
```

### Foreign Keys

**Format:** `{table_singular}_id` or `{table_plural}_id`  
**Rule:** Clearly reference the related table

```sql
-- ✅ GOOD
user_id UUID REFERENCES users(id)
article_id UUID REFERENCES articles(id)
cache_entry_id UUID REFERENCES cache_entries(id)

-- ❌ BAD
uid (too abbreviated)
user_fk (redundant suffix)
article (no _id suffix)
```

### Indexes

**Format:** `idx_{table}_{column(s)}` or `idx_{table}_{purpose}`  
**Rule:** Prefix all indexes with `idx_`, then table name, then column(s)

```sql
-- ✅ GOOD
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_audio_cache_content_hash ON audio_cache(content_hash);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE UNIQUE INDEX idx_audio_cache_unique_hash ON audio_cache(content_hash);

-- ❌ BAD
CREATE INDEX articles_user_id (...)  -- Missing idx_ prefix
CREATE INDEX idx_ac (...);  -- Too abbreviated
CREATE INDEX user_articles_idx (...);  -- _idx suffix instead of idx_ prefix
```

### Unique Constraints

**Format:** `uq_{table}_{column(s)}`  
**Rule:** Use `uq_` prefix for unique constraints

```sql
-- ✅ GOOD
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE(email);
ALTER TABLE audio_cache ADD CONSTRAINT uq_audio_cache_hash UNIQUE(content_hash);

-- ❌ BAD
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE(email);
```

### Check Constraints

**Format:** `chk_{table}_{purpose}`  
**Rule:** Use `chk_` prefix, describe the validation rule

```sql
-- ✅ GOOD
ALTER TABLE articles ADD CONSTRAINT chk_articles_reading_time_positive CHECK(reading_time_minutes > 0);
ALTER TABLE audio_cache ADD CONSTRAINT chk_audio_cache_ttl_valid CHECK(expires_at > created_at);

-- ❌ BAD
ALTER TABLE articles ADD CONSTRAINT check1 CHECK(...);  -- No descriptive suffix
```

---

## 2. TypeScript & Code Naming Conventions

### Functions

**Format:** `camelCase`  
**Rules:**
- Verb + noun pattern: `generateAudio`, `extractArticles`, `validatePDF`
- Getters use `get` prefix: `getArticles`, `getUserPreference`
- Async functions use explicit names: `async fetchArticles`, `async generateAudioAsync`
- Pure functions: `calculateReadingTime`, `formatDuration`

```typescript
// ✅ GOOD
function generateAudio(text: string, language: string): Promise<string> { ... }
function extractArticles(pdf: PDFDocument): Article[] { ... }
function getArticleById(id: string): Article | null { ... }
async function fetchUserPreferences(userId: string): Promise<Preferences> { ... }

// ❌ BAD
function generate_audio() { ... }  -- snake_case
function GA() { ... }  -- Too abbreviated
function generateAudioForTextWithLanguage() { ... }  -- Too verbose
function doStuff() { ... }  -- Vague verb
```

### Variables & Constants

**Format:**
- Regular variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Booleans: `is`, `has`, `can`, `should` prefix: `isActive`, `hasError`, `canDelete`

```typescript
// ✅ GOOD
const MAX_PDF_SIZE = 100 * 1024 * 1024;  // 100 MB
const DEFAULT_LANGUAGE = "en-US";

let currentArticle: Article;
let isLoading = false;
let hasError = false;
let canDeleteCache = user.role === "admin";

// ❌ BAD
const maxPdfSize = 100 * 1024 * 1024;  -- Constants use UPPER_SNAKE_CASE
let current_article: Article;  -- Variables use camelCase
const loading = false;  -- Boolean should have is/has/can prefix
const ARTICLE_TEXT = "...";  -- Not a constant, use camelCase
```

### React Components

**Format:** `PascalCase`  
**Rules:**
- Each component file exports one default component with same name
- Use `{ComponentName}.tsx` as filename
- Prop interfaces: `{ComponentName}Props`
- State interfaces: `{ComponentName}State` (if needed)

```typescript
// ✅ GOOD - AudioPlayer.tsx
interface AudioPlayerProps {
  audioUrl: string;
  onPlay?: () => void;
}

export default function AudioPlayer({ audioUrl, onPlay }: AudioPlayerProps) {
  return <audio src={audioUrl} onPlay={onPlay} />;
}

// ❌ BAD
interface Props { ... }  -- Too generic
function audio_player() { ... }  -- Should be PascalCase
export const AudioPlayer = (...) => { ... }  -- Use default export for main component
```

### Types & Interfaces

**Format:** `PascalCase`  
**Rules:**
- Use `I` prefix only for abstract interfaces (rarely needed with TypeScript)
- Use `Type` suffix for type aliases (optional, but encouraged for clarity)
- Export all types/interfaces (use `export` keyword)

```typescript
// ✅ GOOD
interface Article {
  id: string;
  headline: string;
  body: string;
}

type ArticleStatus = "draft" | "published" | "archived";

interface AudioCacheEntry {
  contentHash: string;
  audioUrl: string;
  expiresAt: Date;
}

// ❌ BAD
interface IArticle { ... }  -- Unnecessary I prefix
type article = "draft" | "published";  -- Type should be PascalCase
interface ArticleProps extends Props { ... }  -- Props suffix is for React component props only
```

### Enums

**Format:** `PascalCase`  
**Rules:**
- Enum name: PascalCase
- Enum values: `UPPER_SNAKE_CASE`

```typescript
// ✅ GOOD
enum AudioLanguage {
  ENGLISH = "en-US",
  TELUGU = "te-IN",
  HINDI = "hi-IN",
}

enum CacheStatus {
  HIT = "hit",
  MISS = "miss",
  EXPIRED = "expired",
}

// ❌ BAD
enum audioLanguage { ... }  -- Should be PascalCase
enum AudioLanguage {
  english = "en-US",  -- Values should be UPPER_SNAKE_CASE
  telugu = "te-IN",
}
```

### Class Names

**Format:** `PascalCase`  
**Rules:**
- Each class in its own file
- Filename matches class name: `PDFParser.ts`
- Use design patterns in naming: `Factory`, `Service`, `Manager`, `Handler`

```typescript
// ✅ GOOD - PDFParser.ts
class PDFParser {
  parse(pdf: File): Promise<Article[]> { ... }
}

// ✅ GOOD - AudioService.ts
class AudioService {
  generate(text: string, language: string): Promise<string> { ... }
}

// ❌ BAD
class pdf_parser { ... }  -- Should be PascalCase
class ParsePDF { ... }  -- Awkward naming, prefer PDFParser
```

### Private & Protected Members

**Format:** Use `#` (private) or `_` prefix (protected)  
**Rule:** TypeScript 3.8+, use `#` for truly private fields

```typescript
// ✅ GOOD
class AudioPlayer {
  #supabaseClient = createClient(...);  // Private
  protected cacheKey = "audio_cache";   // Protected

  #generateContent(): string { ... }

  protected getCache(): Record<string, string> { ... }
}

// ⚠️ ACCEPTABLE (legacy)
class AudioPlayer {
  private supabaseClient = createClient(...);
  protected cacheKey = "audio_cache";
}

// ❌ BAD
class AudioPlayer {
  _supabaseClient = createClient(...);  -- Should use # for private
  supabaseClient = createClient(...);   -- No privacy indicator
}
```

---

## 3. File & Folder Naming Conventions

### Folder Structure

```
src/
├── components/          # React components (PascalCase.tsx)
│   ├── AudioPlayer.tsx
│   ├── ArticleSheet.tsx
│   └── PDFUploader.tsx
├── routes/             # Route components (index.tsx, [param].tsx)
│   └── index.tsx
├── lib/                # Utilities and services (kebab-case.ts)
│   ├── audio-service.ts
│   ├── pdf-parser.ts
│   ├── supabase-client.ts
│   └── constants.ts
├── hooks/              # Custom React hooks (use*.ts)
│   ├── useAudio.ts
│   ├── useLocalStorage.ts
│   └── usePDFParser.ts
├── types/              # TypeScript types (kebab-case.ts)
│   ├── audio.ts
│   ├── article.ts
│   └── cache.ts
├── utils/              # Pure utility functions (kebab-case.ts)
│   ├── format.ts
│   ├── validation.ts
│   └── hash.ts
├── styles/             # Global styles (kebab-case.css)
│   └── global.css
└── config/             # Configuration files (kebab-case.ts)
    └── environment.ts
```

### Component Files

**Format:** `{ComponentName}.tsx`  
**Rule:** PascalCase, one component per file (in most cases)

```
src/components/
├── AudioPlayer.tsx        -- Default export: AudioPlayer component
├── AudioPlayerControls.tsx
├── ArticleSheet.tsx
├── PDFUploader.tsx
└── ErrorBoundary.tsx
```

### Utility / Service Files

**Format:** `kebab-case.ts` or `kebab-case.service.ts`  
**Rule:** Lowercase, kebab-case, optional `.service` suffix

```
src/lib/
├── audio-service.ts      -- Exports AudioService class
├── pdf-parser.ts         -- Exports PDFParser class
├── supabase-client.ts    -- Exports createClient function
└── cache.ts              -- Exports cache utilities
```

### Hook Files

**Format:** `use{HookName}.ts`  
**Rule:** Start with `use` prefix (React convention)

```
src/hooks/
├── useAudio.ts           -- Default export: useAudio hook
├── useLocalStorage.ts
├── usePDFParser.ts
└── useUserPreferences.ts
```

### Type Files

**Format:** `kebab-case.ts`  
**Rule:** Lowercase, kebab-case, exports type definitions

```
src/types/
├── article.ts            -- Article, ArticleStatus interfaces
├── audio.ts              -- AudioOptions, AudioLanguage enums
├── cache.ts              -- CacheEntry, CacheStatus interfaces
└── index.ts              -- Re-exports all types
```

### Test Files

**Format:** `{filename}.test.ts` or `{filename}.spec.ts`  
**Rule:** Same name as source file, with `.test.ts` suffix

```
src/lib/
├── audio-service.ts
├── audio-service.test.ts  -- Tests for audio-service.ts
├── pdf-parser.ts
└── pdf-parser.test.ts
```

---

## 4. API Endpoint Naming Conventions

### REST API Routes

**Format:** `/api/v1/{resource}/{id?}/{action?}`  
**Rules:**
- Version prefix: `/v1`, `/v2` (enables backward compatibility)
- Resource names: plural, lowercase, kebab-case: `/api/v1/articles`, `/api/v1/audio-cache`
- ID parameter: `/:id` (no resource prefix)
- Sub-resources: `/api/v1/articles/:id/comments`
- Actions: use HTTP verbs, avoid action suffixes like `/save` or `/create`

```
// ✅ GOOD REST Endpoints
GET    /api/v1/articles              -- List articles
POST   /api/v1/articles              -- Create article
GET    /api/v1/articles/:id          -- Get article by ID
PUT    /api/v1/articles/:id          -- Update article
DELETE /api/v1/articles/:id          -- Delete article
GET    /api/v1/articles/:id/comments -- Get article comments

GET    /api/v1/audio-cache           -- List cache entries
GET    /api/v1/audio-cache/stats     -- Get cache statistics
DELETE /api/v1/audio-cache           -- Clear cache

POST   /api/v1/pdf/parse             -- Parse PDF (action: use noun + verb)
POST   /api/v1/audio/generate        -- Generate audio

// ❌ BAD (Anti-patterns)
GET    /api/getArticles              -- Don't repeat HTTP verb
POST   /api/create-article           -- Use HTTP POST, not "create-" suffix
POST   /api/articles/save            -- Use HTTP PUT for updates
GET    /api/v1/articles/get/123      -- Redundant "get" verb
DELETE /api/v1/articles/delete/123   -- Redundant "delete" verb
POST   /api/generateAudio            -- Use kebab-case
```

### Query Parameters

**Format:** `camelCase`  
**Rules:**
- Filter: `?filter=` or `?status=`
- Pagination: `?page=1&limit=10` or `?offset=0&limit=10`
- Sorting: `?sort=created_at&order=desc`
- Search: `?search=query` or `?q=query`

```
// ✅ GOOD
GET /api/v1/articles?page=1&limit=10&sort=created_at&order=desc
GET /api/v1/articles?status=published&language=en-US
GET /api/v1/audio-cache/stats?days=30

// ❌ BAD
GET /api/v1/articles?Page=1&Limit=10  -- Should be camelCase
GET /api/v1/articles?is_published=true  -- Use camelCase
GET /api/v1/articles?sort_by=created&sort_order=desc  -- Verbose
```

---

## 5. Environment Variable Naming Conventions

### Format: `CATEGORY_NAME` (UPPER_SNAKE_CASE)

**Rules:**
- All environment variables in UPPERCASE
- Use underscores to separate words
- Group related variables by prefix: `SUPABASE_*`, `CLOUDFLARE_*`, `SENTRY_*`, `APP_*`
- Private keys/secrets: `*_SECRET` or `*_KEY` suffix

```bash
# ✅ GOOD - .env.local

# Application
APP_NAME=VoxNews
APP_ENV=development
APP_DEBUG=true
APP_LOG_LEVEL=debug

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...  # Never commit

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxx
CLOUDFLARE_API_TOKEN=xxxxxxxxxxxx  # Never commit
CLOUDFLARE_R2_BUCKET_NAME=voxnews-audio
CLOUDFLARE_R2_REGION=auto

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxxxx

# Feature Flags
ENABLE_DARK_MODE=true
ENABLE_OCR_FALLBACK=true
ENABLE_USER_ACCOUNTS=false

# ❌ BAD
supabaseUrl=...  -- Should be UPPER_SNAKE_CASE
supabase_url=...  -- Should be UPPER_SNAKE_CASE
SUPABASEURL=...  -- Missing underscore separator
debug_mode=true  -- Should be in APP_ prefix
```

---

## 6. Git Naming Conventions

### Branch Names

**Format:** `{type}/{description}` where type is one of: `feature`, `fix`, `refactor`, `docs`, `chore`, `test`  
**Rules:**
- Lowercase, kebab-case for description
- Reference issue number: `feature/pdf-upload-#42` or `fix/cache-expiry-#55`
- Be descriptive: `feature/web-speech-api` (good), `feature/audio` (vague)

```
// ✅ GOOD Branch Names
feature/pdf-upload-component
feature/web-speech-api-integration
fix/audio-cache-expiration
fix/mobile-responsive-layout-#42
refactor/audio-service-architecture
docs/api-documentation
test/audio-player-e2e

// ❌ BAD Branch Names
feature/new-feature  -- Too vague
feature/audioComponent  -- camelCase, not kebab-case
Feature/pdf  -- Capitalized
bugfix/something  -- Use 'fix', not 'bugfix'
hotfix/critical-issue  -- Use 'fix' or 'feature'
master-v2  -- Don't branch off master with version suffix
```

### Commit Messages

**Format:** `{type}({scope}): {description}`  
**Rules:**
- Type: `feat`, `fix`, `refactor`, `docs`, `test`, `style`, `chore`
- Scope (optional): Component or module name in lowercase
- Description: Imperative mood, lowercase, no period
- Body (optional): Explain **why**, not **what**
- Footer (optional): Reference issue: `Closes #42`

```
// ✅ GOOD Commit Messages
feat(audio): implement web speech api integration
fix(cache): resolve audio expiration logic
refactor(pdf-parser): simplify article extraction
docs: add naming conventions guide
test(audio-player): add unit tests for controls

// ✅ GOOD with body and footer
feat(audio): implement web speech api integration

Add support for generating audio using browser's native
Text-to-Speech API instead of external TTS service.

- Supports English (en-US) and Telugu (te-IN)
- Reduces API costs by 100%
- Enables offline functionality

Closes #42

// ❌ BAD Commit Messages
"updated stuff"  -- Vague, no type/scope
"FIX: Audio Cache"  -- Type should be lowercase, use camelCase for scope
"added new feature"  -- Vague description
"Refactored the audio generation function because it was slow"  -- Reason in description, not type
```

### Release Tags

**Format:** `v{major}.{minor}.{patch}` (Semantic Versioning)  
**Rules:**
- Format: `vX.Y.Z` (e.g., `v0.1.0`, `v1.2.3`)
- Pre-releases: `v1.0.0-alpha.1`, `v1.0.0-beta.1`, `v1.0.0-rc.1`
- Increment rules:
  - MAJOR: Breaking changes
  - MINOR: New features (backward compatible)
  - PATCH: Bug fixes (backward compatible)

```
// ✅ GOOD Release Tags
v0.1.0  -- MVP launch (first release)
v0.2.0  -- User accounts + OAuth2 (new features)
v1.0.0  -- Stable release (production-ready)
v1.1.0  -- New language support
v1.1.1  -- Security patch
v2.0.0  -- Major redesign (breaking changes)

// ❌ BAD
v1 (too vague, missing minor/patch)
version-1.0.0 (use v prefix)
1.0.0 (missing v prefix)
v1.0.0.0 (too many segments)
v1.0.0-BETA (pre-release should be lowercase)
```

---

## 7. CSS & Tailwind Naming Conventions

### Class Names

**Format:** Use Tailwind utility classes (predefined)  
**Rules:**
- Compose with Tailwind utilities: `flex items-center gap-4`
- Custom classes (rare): `kebab-case`
- BEM pattern (if necessary): `.block__element--modifier`
- Avoid generic names: `red`, `big`, `box`

```jsx
// ✅ GOOD - Tailwind Utilities
<div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white shadow-md">
  <h2 className="text-lg font-semibold text-gray-900">Articles</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Load More
  </button>
</div>

// ✅ GOOD - Custom CSS (rare)
const customStyles = `
  .article-card {
    @apply rounded-lg shadow-md p-4;
  }
  
  .article-card--highlighted {
    @apply border-l-4 border-blue-500;
  }
`;

// ❌ BAD - Generic or non-Tailwind
<div className="container-div article-box">  -- Too generic
<div className="red bigFont">  -- No semantic meaning
<div className="ml-4 mr-4 pt-2 pb-2">  -- Not enough utility consolidation
```

### CSS Variables

**Format:** `--{category}-{name}`  
**Rules:**
- Prefix with category: `--color-`, `--spacing-`, `--font-`
- All lowercase, kebab-case

```css
/* ✅ GOOD */
:root {
  --color-primary: #3b82f6;
  --color-primary-dark: #1e40af;
  --color-danger: #ef4444;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --font-sans: system-ui, sans-serif;
  --font-mono: Menlo, monospace;
}

/* ❌ BAD */
--primary: #3b82f6;  -- Missing category
--ColorPrimary: #3b82f6;  -- Should be kebab-case
--col-primary: #3b82f6;  -- Abbreviation not clear
```

---

## 8. Summary Table

| Item | Format | Example |
|------|--------|---------|
| Database Tables | `snake_case` (plural) | `articles`, `audio_cache` |
| Database Columns | `snake_case` | `created_at`, `user_id`, `is_active` |
| Primary Keys | `id` | `id UUID PRIMARY KEY` |
| Indexes | `idx_{table}_{column}` | `idx_articles_user_id` |
| Functions | `camelCase` | `generateAudio()`, `extractArticles()` |
| Variables | `camelCase` | `currentArticle`, `maxPdfSize` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PDF_SIZE`, `DEFAULT_LANGUAGE` |
| React Components | `PascalCase` | `AudioPlayer.tsx` |
| Component Props | `{Component}Props` | `AudioPlayerProps` |
| Types/Interfaces | `PascalCase` | `Article`, `AudioLanguage` |
| Utilities/Services | `kebab-case` | `audio-service.ts` |
| Folders | `lowercase` or `kebab-case` | `components/`, `src/lib/` |
| API Routes | `/api/v1/{resource}` | `/api/v1/articles` |
| API Query Params | `camelCase` | `?page=1&limit=10` |
| Environment Variables | `UPPER_SNAKE_CASE` | `SUPABASE_URL`, `APP_ENV` |
| Git Branches | `{type}/{description}` | `feature/pdf-upload` |
| Commit Messages | `{type}({scope}): {description}` | `feat(audio): add web speech api` |
| Git Tags | `v{major}.{minor}.{patch}` | `v0.1.0`, `v1.2.3` |
| CSS Classes | Tailwind utilities + `kebab-case` | `flex items-center`, `.article-card` |
| CSS Variables | `--{category}-{name}` | `--color-primary`, `--spacing-md` |

---

## 9. Enforcement & Tools

### Pre-commit Hooks (Future)
- **ESLint:** Catch naming violations in TypeScript/JavaScript
- **Prettier:** Auto-format code
- **Husky:** Run hooks before commit

### Code Review Checklist
- [ ] All functions follow `camelCase` naming
- [ ] All React components are `PascalCase` in `PascalCase.tsx` files
- [ ] All utilities are `kebab-case.ts`
- [ ] Database schemas use `snake_case` for tables and columns
- [ ] Environment variables use `UPPER_SNAKE_CASE`
- [ ] Git branches follow `{type}/{description}` format
- [ ] Commit messages follow conventional commits format

### IDE Configuration
- Install ESLint extension
- Enable auto-format on save (Prettier)
- Configure TypeScript strict mode

---

## 10. Exceptions & When to Deviate

**You may deviate from these conventions when:**

1. **Third-party libraries:** Use naming as defined by the library
   ```typescript
   // OK to use library's naming convention
   import { createClient } from "@supabase/supabase-js";
   ```

2. **Migrating legacy code:** Document exceptions in a migration plan
   ```typescript
   // TODO: Rename getUserData to getUser (legacy naming)
   function getUserData() { ... }
   ```

3. **Database migrations:** Old column names require explicit mapping
   ```typescript
   // MIGRATION: old_column_name -> new_column_name
   ALTER TABLE users RENAME COLUMN old_column_name TO new_column_name;
   ```

4. **External APIs:** Use provider's endpoint naming as-is
   ```typescript
   // OK to use external API naming (even if it doesn't match conventions)
   const response = await fetch("/api/v1/getUser");
   ```

**Always document exceptions with a `TODO` or `MIGRATION` comment explaining why.**

---

## 11. Migration Guide for Existing Code

If you encounter code that violates these conventions:

1. **Open an issue:** Create a GitHub issue with the tag `naming-convention`
2. **Schedule refactor:** Include in a future sprint, don't mix with feature work
3. **Use regex find-replace:** For large-scale renames
4. **Update tests:** Ensure tests still pass after renaming
5. **Document in commit:** Include in commit message: `refactor: rename getUserData to getUser`

Example issue:
```markdown
**Title:** Rename old_function to newFunction (naming convention)

**Description:**
The function `old_function` in src/lib/utils.ts violates camelCase convention.

**Acceptance Criteria:**
- [ ] Rename old_function to newFunction
- [ ] Update all imports
- [ ] Update tests
- [ ] Verify no regressions
```

---

**Document Owner:** Siddhartha Pothulapati  
**Last Reviewed:** May 13, 2026  
**Next Review:** May 27, 2026 (2 weeks)

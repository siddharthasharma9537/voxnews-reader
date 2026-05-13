# User Stories: VoxNews Bharat

**Version:** 1.0  
**Last Updated:** May 13, 2026  
**Status:** MVP Development

---

## Epic 1: PDF Management & Article Extraction

### Story 1.1: Upload Newspaper PDF

**As a** newspaper reader  
**I want** to upload a PDF of my newspaper  
**So that** I can convert it into an audio playlist

**Acceptance Criteria:**
- [ ] User can tap "Upload PDF" button
- [ ] Native file picker opens (not blocked by browser)
- [ ] Accepts PDF files up to 100 MB
- [ ] Rejects non-PDF files with clear error message
- [ ] Shows loading progress while parsing
- [ ] Displays notification when complete in < 10 seconds
- [ ] Works on mobile (iOS/Android) and desktop browsers

**Priority:** P0 (Launch Blocker)  
**Effort:** Medium (6-8 hours)  
**Dependencies:** None  
**Acceptance Status:** ✅ Complete

---

### Story 1.2: Extract Articles from PDF

**As a** newspaper reader  
**I want** the app to automatically identify articles, headlines, and content  
**So that** I don't have to manually structure the newspaper

**Acceptance Criteria:**
- [ ] Correctly identifies 90%+ of articles
- [ ] Extracts headline, body text, and category
- [ ] Estimates reading time based on word count (80 WPM)
- [ ] Identifies source/publication name
- [ ] Handles multi-column layouts
- [ ] Falls back to OCR for scanned PDFs (< 5 second additional delay)
- [ ] Displays helpful error if no text found

**Priority:** P0 (Launch Blocker)  
**Effort:** Medium (8-10 hours)  
**Dependencies:** Story 1.1  
**Acceptance Status:** ✅ Complete

---

### Story 1.3: OCR Fallback for Scanned PDFs

**As a** user with a scanned newspaper  
**I want** the app to use OCR if it can't extract text directly  
**So that** I can convert scanned PDFs too

**Acceptance Criteria:**
- [ ] Detects when PDF has no selectable text
- [ ] Triggers Tesseract.js for OCR
- [ ] OCR accuracy > 85% on clear scans
- [ ] Takes < 5 seconds per page
- [ ] Shows user a toggle for "OCR fallback" in settings
- [ ] Warns about longer processing time
- [ ] Works offline (all OCR happens client-side)

**Priority:** P0 (Launch Blocker)  
**Effort:** Medium (6-8 hours)  
**Dependencies:** Story 1.2  
**Acceptance Status:** ✅ Complete

---

## Epic 2: Article Display & Management

### Story 2.1: Display Article Queue

**As a** user with extracted articles  
**I want** to see all articles in a playlist view  
**So that** I can decide what to listen to

**Acceptance Criteria:**
- [ ] Shows all articles as a scrollable list
- [ ] Each item displays: article number, headline, category, source, read time
- [ ] Highlights currently playing article
- [ ] Shows play/pause button for each article
- [ ] Shows queue position ("1 of 15 articles")
- [ ] Displays total listen time for entire queue
- [ ] Responsive on mobile and desktop

**Priority:** P0 (Launch Blocker)  
**Effort:** Small (4-5 hours)  
**Dependencies:** Story 1.2  
**Acceptance Status:** ✅ Complete

---

### Story 2.2: View Full Article Text

**As a** user wanting to read instead of listen  
**I want** to tap an article and see the full body text  
**So that** I can read if I prefer

**Acceptance Criteria:**
- [ ] Tapping article opens modal/sheet with full text
- [ ] Text is readable (proper font size, contrast, line height)
- [ ] Shows headline, category, source, and estimated time
- [ ] Includes "Generate Audio" button in modal
- [ ] Can close modal and return to queue
- [ ] Text is selectable (copy to clipboard)
- [ ] Responsive on mobile (full-screen modal)

**Priority:** P0 (Launch Blocker)  
**Effort:** Small (3-4 hours)  
**Dependencies:** Story 2.1  
**Acceptance Status:** ✅ Complete

---

### Story 2.3: Queue Management (Add/Remove)

**As a** user wanting a custom listening order  
**I want** to add or remove articles from my queue  
**So that** I only listen to what interests me

**Acceptance Criteria:**
- [ ] Each article has a "+" button to add to queue
- [ ] Each article has a "✓" or "×" button to remove from queue
- [ ] Queue count updates in real-time
- [ ] Total listen time recalculates when articles are added/removed
- [ ] Visual feedback when article is queued/dequeued
- [ ] Can select multiple articles at once (future: P1)

**Priority:** P0 (Launch Blocker)  
**Effort:** Small (2-3 hours)  
**Dependencies:** Story 2.1  
**Acceptance Status:** ✅ Complete

---

## Epic 3: Audio Generation & Caching

### Story 3.1: Generate Audio from Article Text

**As a** user wanting to listen to an article  
**I want** to tap "Generate Audio" and hear the article read aloud  
**So that** I can consume news hands-free

**Acceptance Criteria:**
- [ ] User selects language (English or Telugu)
- [ ] Taps "Generate Audio" button
- [ ] Audio starts playing within 2 seconds (first time)
- [ ] Uses Web Speech API (browser native, no API calls)
- [ ] Reads headline + body text in selected language
- [ ] Audio quality is intelligible (80%+ clarity)
- [ ] Shows loading spinner during generation
- [ ] Handles errors gracefully (show error message)

**Priority:** P0 (Launch Blocker)  
**Effort:** Medium (6-8 hours)  
**Dependencies:** Story 2.2  
**Acceptance Status:** ✅ Complete

---

### Story 3.2: Cache Audio for Reuse

**As a** user who reads the same newspaper twice  
**I want** the app to remember generated audio  
**So that** I don't wait for regeneration

**Acceptance Criteria:**
- [ ] Audio is cached in Supabase after first generation
- [ ] Cache key is content hash (SHA-256)
- [ ] Cache has 30-day expiration
- [ ] Subsequent plays use cached audio (< 500ms)
- [ ] Shows "Using cached audio" badge
- [ ] Automatic cleanup of expired cache
- [ ] Cache size monitoring (dashboard in future)

**Priority:** P0 (Launch Blocker)  
**Effort:** Medium (4-5 hours)  
**Dependencies:** Story 3.1  
**Acceptance Status:** ✅ Complete

---

### Story 3.3: View Cache Stats

**As a** power user  
**I want** to see how much audio is cached  
**So that** I understand the app's storage footprint

**Acceptance Criteria:**
- [ ] Displays: total cached articles, total size (MB), cache hit rate
- [ ] Shows cache statistics in Settings panel
- [ ] Provides "Clear Cache" button
- [ ] Warns before deleting cache
- [ ] Shows breakdown by language (EN vs TE)

**Priority:** P1 (Post-Launch)  
**Effort:** Small (2-3 hours)  
**Dependencies:** Story 3.2  
**Acceptance Status:** 📋 Planned

---

## Epic 4: Audio Playback & Controls

### Story 4.1: Play/Pause/Skip Controls

**As a** user listening to audio  
**I want** standard playback controls  
**So that** I can manage playback

**Acceptance Criteria:**
- [ ] Play button starts audio from current position
- [ ] Pause button stops audio at current position
- [ ] Next button skips to next article in queue
- [ ] Previous button goes to previous article
- [ ] All buttons are accessible (keyboard + touch)
- [ ] Visual feedback when buttons are pressed
- [ ] Controls are always visible (sticky player)

**Priority:** P0 (Launch Blocker)  
**Effort:** Medium (5-6 hours)  
**Dependencies:** Story 3.1  
**Acceptance Status:** ✅ Complete

---

### Story 4.2: Progress Bar & Time Display

**As a** user listening to an article  
**I want** to see how far through the article I am  
**So that** I can jump to specific points

**Acceptance Criteria:**
- [ ] Progress bar shows current playback position
- [ ] Displays elapsed time and total duration
- [ ] Can drag progress bar to seek
- [ ] Seeking is smooth (no stuttering)
- [ ] Time updates in real-time
- [ ] Works on mobile (draggable slider)

**Priority:** P0 (Launch Blocker)  
**Effort:** Small (3-4 hours)  
**Dependencies:** Story 4.1  
**Acceptance Status:** ✅ Complete

---

### Story 4.3: Volume & Speed Controls

**As a** user with hearing or time constraints  
**I want** to adjust volume and playback speed  
**So that** I can customize my listening experience

**Acceptance Criteria:**
- [ ] Volume slider (0-100%)
- [ ] Mute button (0% volume)
- [ ] Speed options: 0.75x, 1x, 1.5x, 2x
- [ ] Speed preference persists across sessions
- [ ] Visual indicator of current speed
- [ ] Volume adjusts system audio (respects device volume)

**Priority:** P0 (Launch Blocker)  
**Effort:** Small (3-4 hours)  
**Dependencies:** Story 4.1  
**Acceptance Status:** ✅ Complete

---

### Story 4.4: Download Audio (Future)

**As a** user with poor connectivity  
**I want** to download articles as MP3  
**So that** I can listen offline

**Acceptance Criteria:**
- [ ] Download button in player
- [ ] Downloads generated audio as .mp3 file
- [ ] Shows progress during download
- [ ] Can download multiple articles at once
- [ ] Downloaded files stored locally
- [ ] Offline playback without internet

**Priority:** P1 (Post-Launch)  
**Effort:** Medium (5-6 hours)  
**Dependencies:** Story 3.1  
**Acceptance Status:** 📋 Planned

---

## Epic 5: Language Selection & Preferences

### Story 5.1: Select Audio Language

**As a** Telugu speaker  
**I want** to choose the language for audio generation  
**So that** I hear content in my native language

**Acceptance Criteria:**
- [ ] Language toggle shows: English | Telugu
- [ ] Selection applies to current article only
- [ ] Can generate same article in both languages
- [ ] Visual indicator of current language
- [ ] Changes take effect immediately
- [ ] Works for all articles in queue

**Priority:** P0 (Launch Blocker)  
**Effort:** Small (2-3 hours)  
**Dependencies:** Story 3.1  
**Acceptance Status:** ✅ Complete

---

### Story 5.2: Remember Language Preference

**As a** repeat user  
**I want** my language choice to persist  
**So that** I don't reset it every time

**Acceptance Criteria:**
- [ ] App remembers last selected language
- [ ] Preference synced across sessions
- [ ] Set language applies to all future articles
- [ ] Can override per-article
- [ ] Preference stored in localStorage

**Priority:** P1 (Post-Launch)  
**Effort:** Small (1-2 hours)  
**Dependencies:** Story 5.1  
**Acceptance Status:** 📋 Planned

---

### Story 5.3: Add More Languages

**As a** Hindi or Kannada speaker  
**I want** the app to support my language  
**So that** I can use it too

**Acceptance Criteria:**
- [ ] Hindi (hi-IN) support
- [ ] Kannada (kn-IN) support
- [ ] Tamil (ta-IN) support
- [ ] Bengali (bn-IN) support
- [ ] Web Speech API detects language and renders properly
- [ ] User toggle shows all available languages

**Priority:** P2 (Future Roadmap)  
**Effort:** Small (1-2 hours per language)  
**Dependencies:** Story 5.1  
**Acceptance Status:** 📋 Planned (v0.2+)

---

## Epic 6: User Experience & Accessibility

### Story 6.1: Mobile-Responsive Design

**As a** mobile user  
**I want** the app to work well on my phone  
**So that** I can read/listen on the go

**Acceptance Criteria:**
- [ ] App is responsive on screens 320px-1920px wide
- [ ] Touch targets are at least 44px (tap-friendly)
- [ ] Text is readable without zooming
- [ ] Bottom navigation doesn't overlap content
- [ ] Works in portrait and landscape
- [ ] No horizontal scrolling needed

**Priority:** P0 (Launch Blocker)  
**Effort:** Medium (6-8 hours)  
**Dependencies:** All stories  
**Acceptance Status:** ✅ Complete

---

### Story 6.2: Dark Mode Support

**As a** user reading at night  
**I want** a dark mode option  
**So that** I don't strain my eyes

**Acceptance Criteria:**
- [ ] Dark mode respects system preference
- [ ] Manual toggle in settings
- [ ] All colors are WCAG AA compliant in dark mode
- [ ] Text contrast is at least 4.5:1
- [ ] Preference persists across sessions

**Priority:** P1 (Post-Launch)  
**Effort:** Small (3-4 hours)  
**Dependencies:** All UI stories  
**Acceptance Status:** 📋 Planned

---

### Story 6.3: Accessibility (Screen Reader Support)

**As a** blind user  
**I want** the app to work with screen readers  
**So that** I can navigate independently

**Acceptance Criteria:**
- [ ] All buttons have descriptive labels
- [ ] Images have alt text
- [ ] Form inputs are labeled
- [ ] Semantic HTML used throughout
- [ ] Focus indicators visible (for keyboard users)
- [ ] Color is not the only indicator
- [ ] WCAG 2.1 AA compliance

**Priority:** P1 (Post-Launch)  
**Effort:** Medium (6-8 hours)  
**Dependencies:** All stories  
**Acceptance Status:** 📋 Planned

---

### Story 6.4: Error Handling & Feedback

**As a** user encountering a problem  
**I want** clear error messages  
**So that** I understand what went wrong

**Acceptance Criteria:**
- [ ] Network errors show helpful message (not "404")
- [ ] PDF parsing errors are explained
- [ ] Audio generation failures suggest solutions
- [ ] Toast notifications for successful actions
- [ ] Loading states are clear (spinner, "Loading...")
- [ ] No silent failures

**Priority:** P0 (Launch Blocker)  
**Effort:** Small (3-4 hours)  
**Dependencies:** All stories  
**Acceptance Status:** ✅ Partial

---

## Epic 7: Authentication & User Accounts (Post-MVP)

### Story 7.1: Guest Mode (No Login Required)

**As a** new user  
**I want** to use the app immediately without an account  
**So that** I can try it out quickly

**Acceptance Criteria:**
- [ ] App works completely without login
- [ ] PDF upload works for guests
- [ ] Audio generation works for guests
- [ ] No "Sign up" nag screen
- [ ] Optional account creation later

**Priority:** P0 (Launch Blocker)  
**Effort:** Small  
**Dependencies:** All core stories  
**Acceptance Status:** ✅ Complete

---

### Story 7.2: Optional Google Login

**As a** user wanting to sync across devices  
**I want** to login with Google  
**So that** my preferences sync

**Acceptance Criteria:**
- [ ] Google OAuth2 integration
- [ ] Login button in settings
- [ ] Automatic user profile creation
- [ ] Reading history synced
- [ ] Optional (not required)

**Priority:** P1 (Post-Launch)  
**Effort:** Medium (4-5 hours)  
**Dependencies:** Story 7.1  
**Acceptance Status:** 📋 Planned

---

## Story Prioritization Matrix

| Epic | Story | Priority | Status | Est. Hours |
|------|-------|----------|--------|-----------|
| 1 | PDF Upload | P0 | ✅ Complete | 8 |
| 1 | Article Extraction | P0 | ✅ Complete | 10 |
| 1 | OCR Fallback | P0 | ✅ Complete | 8 |
| 2 | Article Queue | P0 | ✅ Complete | 5 |
| 2 | View Article Text | P0 | ✅ Complete | 4 |
| 2 | Queue Management | P0 | ✅ Complete | 3 |
| 3 | Generate Audio | P0 | ✅ Complete | 8 |
| 3 | Cache Audio | P0 | ✅ Complete | 5 |
| 3 | Cache Stats | P1 | 📋 Planned | 3 |
| 4 | Play/Pause/Skip | P0 | ✅ Complete | 6 |
| 4 | Progress Bar | P0 | ✅ Complete | 4 |
| 4 | Volume/Speed | P0 | ✅ Complete | 4 |
| 4 | Download Audio | P1 | 📋 Planned | 6 |
| 5 | Select Language | P0 | ✅ Complete | 3 |
| 5 | Remember Language | P1 | 📋 Planned | 2 |
| 5 | Add More Languages | P2 | 📋 Planned | 2-4 |
| 6 | Mobile Responsive | P0 | ✅ Complete | 8 |
| 6 | Dark Mode | P1 | 📋 Planned | 4 |
| 6 | Accessibility | P1 | 📋 Planned | 8 |
| 6 | Error Handling | P0 | ✅ Partial | 4 |
| 7 | Guest Mode | P0 | ✅ Complete | - |
| 7 | Google Login | P1 | 📋 Planned | 5 |

**MVP Completion:** 19 stories ready, ~100 hours invested  
**Post-MVP (v0.2+):** 9 stories planned, ~45 hours remaining

---

**Document Owner:** Siddhartha Pothulapati  
**Last Reviewed:** May 13, 2026  
**Next Review:** May 20, 2026 (post-MVP launch)

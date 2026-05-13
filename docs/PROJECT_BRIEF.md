# Project Brief: VoxNews Bharat

**Version:** 1.0  
**Last Updated:** May 13, 2026  
**Status:** MVP Development

---

## Problem Statement

Indian newspaper readers cannot easily consume news in their native languages. Most digital newspapers are text-only, creating barriers for users who:
- Prefer listening over reading
- Have limited time while commuting
- Have visual impairments
- Struggle with English-language newspapers

**The Pain Point:** A typical Indian wants to read their favorite newspaper (The Hindu, Mint, TOI) but must either:
1. Struggle with dense text-based PDFs, or
2. Manually copy-paste articles into separate TTS tools

---

## Proposed Solution

**VoxNews Bharat** is a free, offline-capable audio newspaper app that transforms any newspaper PDF into a personalized audio playlist in the user's native language.

**How it works:**
1. User shares a newspaper PDF via WhatsApp or file manager
2. App extracts articles and metadata automatically
3. User selects language preference (English or Telugu)
4. App generates audio for each article using free, browser-native TTS
5. User plays articles as an audio queue, anytime, anywhere

**Key Value Props:**
- ✅ **Free** — No API costs, no subscriptions
- ✅ **Offline** — Works without internet after initial PDF import
- ✅ **Native Languages** — English + Telugu (expandable to Hindi, Kannada, etc.)
- ✅ **No Account Required** — Share PDF, get audio immediately
- ✅ **Personal** — Listen to YOUR newspaper, in YOUR language

---

## Success Metrics

### User Metrics
- [ ] **95%+ article extraction accuracy** — Correctly identifies headlines, body text, categories
- [ ] **< 2 seconds per article** to generate audio on first request
- [ ] **90%+ browser support** for Web Speech API (covers 95%+ of users)
- [ ] **< 500ms cached audio playback** (from Supabase cache)
- [ ] **4.5+ star rating** in app stores (if distributed)

### Business Metrics
- [ ] **Support 10,000+ monthly active users** within first year
- [ ] **< 0.1% error rate** in production
- [ ] **99.9% uptime** for core functionality
- [ ] **< 50ms API latency** (p95) for audio generation
- [ ] **Zero support costs** — No customer service needed (self-service app)

### Technical Metrics
- [ ] **60%+ test coverage** across unit, integration, E2E
- [ ] **< 100ms Largest Contentful Paint (LCP)**
- [ ] **Accessibility score: 95+** (WCAG AA compliant)
- [ ] **100+ hours average session time** per user per month
- [ ] **< 50MB disk usage** for app (lightweight)

---

## MVP Scope (v0.1.0)

### Must Have (Launch Blockers) — P0
These features are **required** for MVP launch. App is non-functional without them.

- [x] **PDF Upload & Parsing**
  - Accept PDF files (< 100 MB)
  - Extract text and structure
  - Identify articles, headlines, categories
  - Fallback to OCR for scanned PDFs

- [x] **Article Display**
  - Show extracted articles in a queue/playlist
  - Display headline, source, estimated read time
  - Show article body when user taps "Read"

- [x] **Audio Generation (Web Speech API)**
  - Generate audio for any article text
  - Support English (en-US) and Telugu (te-IN)
  - Estimate duration based on text length
  - Play audio in browser using HTML5 audio element

- [x] **Audio Caching**
  - Cache generated audio in Supabase
  - Avoid re-generating same article
  - 30-day cache expiration
  - Track cache hits vs. misses

- [x] **Playback Controls**
  - Play / Pause / Skip
  - Progress bar with time tracking
  - Volume control
  - Speed adjustment (1x, 1.5x, 2x)

- [x] **Language Selection**
  - Toggle between English and Telugu
  - Apply to entire queue
  - Remember user preference

- [ ] **Basic UI/UX**
  - Responsive design (mobile-first)
  - Newspaper-like aesthetic (as designed)
  - Intuitive navigation
  - Loading states and error messages

### Should Have (Post-Launch Priority) — P1
These features improve user experience but are **not required** for MVP. Target: v0.2.0 (2-3 weeks after launch)

- [ ] **OAuth2 Social Login**
  - Google login
  - GitHub login (for testers)
  - Automatic user profile creation

- [ ] **User Accounts & Sync**
  - Save reading history across devices
  - Sync bookmarks (favorite articles)
  - Reading preferences (language, speed, volume)

- [ ] **Advanced Search & Filtering**
  - Search articles by keyword
  - Filter by category
  - Sort by date, relevance, or length

- [ ] **Offline Download**
  - Download entire newspaper as MP3
  - Queue management (add/remove articles)
  - Offline playback without internet

- [ ] **Email Notifications**
  - Daily newspaper digest
  - New content alerts
  - Personalized reading recommendations

- [ ] **Dark Mode**
  - System-wide dark mode support
  - Reduce eye strain for evening readers

### Could Have (Future Roadmap) — P2
These features represent significant expansion. Target: v0.3.0+ (3+ months)

- [ ] **Mobile Apps**
  - Native iOS app
  - Native Android app
  - Offline storage and syncing

- [ ] **More Languages**
  - Hindi (hi-IN)
  - Kannada (kn-IN)
  - Tamil (ta-IN)
  - Bengali (bn-IN)

- [ ] **Premium Tier** (if needed for sustainability)
  - Ad-free experience
  - Priority processing
  - Advanced analytics
  - Newspaper subscription partnerships

- [ ] **AI-Powered Features**
  - Article summarization
  - Sentiment analysis
  - Trending articles detection
  - Personalized recommendations

- [ ] **Third-Party Integrations**
  - Slack/Teams bot for sharing articles
  - RSS feed support
  - Podcast platform integration
  - Smart speaker support (Alexa, Google Home)

- [ ] **Analytics Dashboard**
  - User reading patterns
  - Popular articles
  - Language preferences by region
  - Performance metrics

### Won't Have (Explicitly Out of Scope)

These features are **explicitly NOT planned** for this project (at least for MVP):

- ❌ **Paywall/Subscription** — Keep it free
- ❌ **Advertising** — No ads to maintain simplicity
- ❌ **News Curation** — Not a news aggregator; only works with PDFs user provides
- ❌ **Community Features** — No social sharing, comments, forums
- ❌ **Real-time Updates** — PDF-based, not live news
- ❌ **Enterprise/B2B** — Built for consumers, not newspapers
- ❌ **Video Content** — Audio-only
- ❌ **Multi-account** — Single-user per device
- ❌ **AI Transcription** — Web Speech API only, no custom training

---

## Technical Constraints

### Performance
- **PDF load time:** < 5 seconds for 100 MB file
- **Article extraction:** < 10 seconds per 50 pages
- **Audio generation:** < 2 seconds per article (first time)
- **Cached playback:** < 500ms to start
- **Page load:** < 1 second (initial paint)
- **API response:** < 200ms (p95)

### Security
- **OWASP Top 10 compliance** — No SQL injection, XSS, CSRF, etc.
- **Data encryption** — All data in transit uses TLS
- **User privacy** — No tracking, no data selling
- **PDF safety** — Scan for malware before processing
- **Rate limiting** — Max 100 requests/minute per user
- **Authentication** — JWT tokens with 15-minute expiry

### Scalability
- **Support 10,000+ daily active users** within first 6 months
- **Horizontal scaling** — Can scale to 100k+ users with infrastructure
- **Database:** PostgreSQL with connection pooling
- **Storage:** Cloudflare R2 for unlimited file storage
- **Edge computing:** Supabase Edge Functions for TTS processing

### Availability
- **99.9% uptime SLA** (allows 43 minutes downtime per month)
- **No single point of failure** — All services have redundancy
- **Graceful degradation** — App still works if cache is down
- **Automatic failover** — Edge Functions retry on failure
- **Health checks** — Monitoring on all critical services

### Compliance
- **GDPR** — Optional user accounts, no forced data collection
- **Accessibility (WCAG 2.1 AA)** — Screen reader support, keyboard navigation
- **Browser support** — Modern browsers (last 2 versions)
- **Mobile** — Responsive design for all screen sizes

---

## Timeline

### Phase 0: Planning & Setup (1 week)
**Status:** ✅ Completed
- Project brief & scope definition
- Tech stack selection
- Repository initialization
- Database schema design

### Phase 1: MVP Development (4 weeks)
**Status:** 🔄 In Progress (Weeks 2-5)
- PDF parsing + OCR fallback
- Article extraction & display
- Web Speech API integration
- Audio caching (Supabase)
- Playback UI & controls
- Language selection
- Basic styling

**Deliverable:** Fully functional MVP (web app only)

### Phase 2: Polish & Testing (2 weeks)
**Status:** 📋 Planned (Weeks 6-7)
- Bug fixes & edge cases
- Unit & integration tests
- E2E testing
- Performance optimization
- Accessibility audit
- Documentation

**Deliverable:** Production-ready MVP (v0.1.0)

### Phase 3: Launch & Monitoring (1 week)
**Status:** 📋 Planned (Week 8)
- Deploy to production (Vercel)
- Setup monitoring (Sentry, logs)
- Announce & gather feedback
- Monitor for bugs

**Deliverable:** Live application

### Phase 4: Post-Launch Iteration (Ongoing)
**Status:** 📋 Planned (Weeks 9+)
- Fix reported bugs
- Optimize based on analytics
- Plan v0.2.0 features
- Consider mobile apps

**Current Sprint:** MVP completion

---

## Team & Roles

### Current Team (Solo)
- **Siddhartha Pothulapati** — Founder, Full-stack Developer

### Planned Hires (Post-MVP)
- UI/UX Designer (contract)
- QA/Testing Engineer (part-time)
- Mobile Developer (contract)

---

## Budget & Resources

### Development
- **Frontend:** TanStack Start, React, shadcn/ui, Tailwind CSS ✅ (free/open-source)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions) ✅ ($25-100/month at scale)
- **Storage:** Cloudflare R2 ✅ ($0.015 per GB)
- **Hosting:** Vercel ✅ ($20-50/month at scale)
- **Monitoring:** Sentry ✅ (free tier available)
- **OCR:** Tesseract.js ✅ (free, open-source)
- **TTS:** Web Speech API ✅ (browser-native, free)

### Infrastructure Costs (at 10k MAU)
- Supabase: ~$50/month
- Vercel: ~$20/month
- Cloudflare R2: ~$10/month
- **Total:** ~$80/month (sustainable model)

### Development Cost
- Solo founder: Estimated 200-300 hours to MVP
- Post-MVP iteration: 20-30 hours/month

---

## Success Definition

### MVP is "Done" When:
1. ✅ User can upload any newspaper PDF
2. ✅ App automatically extracts 90%+ of articles correctly
3. ✅ Each article has audio in English + Telugu
4. ✅ Audio plays reliably in Chrome/Safari/Firefox
5. ✅ Cached articles load in < 500ms
6. ✅ UI is intuitive and mobile-responsive
7. ✅ No data leaks or security issues
8. ✅ Deployed to production (vercel.app)
9. ✅ 60%+ test coverage
10. ✅ Monitoring & error tracking active

### Not Required for MVP:
- ❌ User accounts/login
- ❌ Mobile app
- ❌ Advanced search
- ❌ Multiple languages (just EN + TE)
- ❌ Community features
- ❌ Monetization

---

## Competitive Advantages

1. **Free & Open Model** — Unlike Audible, Blinkist, Pocket (all paid)
2. **Offline-Capable** — Works without internet (unique for audio)
3. **Native Languages** — Focused on Indian languages (most apps are English-only)
4. **Zero Account Friction** — Share → Listen (no signup required)
5. **Newspaper-Specific** — Designed for newspaper consumption patterns
6. **Technology Stack** — Modern, scalable, easy to extend

---

## Key Questions & Answers

**Q: Why Web Speech API instead of professional TTS?**  
A: Free, offline-capable, no API costs, 90%+ browser support. Quality is 80% of professional TTS at 0% cost.

**Q: Why Supabase instead of Firebase or traditional backend?**  
A: PostgreSQL (relational), edge functions (compute), auth included, no vendor lock-in, generous free tier.

**Q: How will you make money?**  
A: MVP is freemium. Future options: premium features, newspaper partnerships, B2B licensing. No ads.

**Q: What about newspapers' copyright?**  
A: Users are sharing their own PDFs they've already purchased/received. Fair use applies.

**Q: Can you add more languages?**  
A: Yes, easily. Just add language code to settings and Web Speech API handles it. Planned for v0.2.

---

## Next Steps (This Week)

1. [ ] Install missing `@supabase/supabase-js` dependency
2. [ ] Create Phase 1 documentation (you are here)
3. [ ] Create GitHub Actions CI workflow
4. [ ] Deploy to production (Vercel)
5. [ ] Test audio generation end-to-end

---

**Document Owner:** Siddhartha Pothulapati  
**Last Reviewed:** May 13, 2026  
**Next Review:** June 13, 2026 (post-MVP)

## Description

<!-- 
Provide a clear, concise summary of your changes.
What problem does this PR solve? What feature does it add?

Examples:
- "Implement Web Speech API audio generation for articles"
- "Fix audio cache expiration logic"
- "Add TypeScript types for Supabase responses"
-->

### Problem Statement
<!-- What issue does this PR address? Link to the GitHub issue: Closes #123 -->

### Solution
<!-- How does this PR solve the problem? What approach did you take? -->

### Changes Made
<!-- List the key changes. Be specific. -->

---

## Type of Change

<!-- Mark with an "x" the relevant option(s) -->

- [ ] 🎨 **Style** — Code style change (formatting, naming, structure - no logic change)
- [ ] ✨ **Feature** — New feature or functionality
- [ ] 🐛 **Bug Fix** — Fixes an existing issue or regression
- [ ] ♻️ **Refactor** — Code restructuring without changing behavior
- [ ] 📚 **Documentation** — Documentation update (README, JSDoc, etc.)
- [ ] ⚡ **Performance** — Performance improvement
- [ ] ✅ **Test** — Adding or updating tests
- [ ] 🔧 **Chore** — Build system, dependencies, CI/CD configuration
- [ ] 🚀 **Infrastructure** — Deployment, environment setup, etc.

---

## Testing

### How was this tested?

<!-- Describe the testing you performed. -->

- [ ] Manual testing (describe steps)
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added
- [ ] Regression testing (existing functionality still works)

### Test Results

<!-- Share test output, coverage reports, or screenshots if applicable. -->

---

## Screenshots / Videos (if applicable)

<!-- If this PR has visual changes, include screenshots or video demos. -->

---

## Checklist

### Code Quality

- [ ] ✅ Code follows the [NAMING_CONVENTIONS.md](../docs/NAMING_CONVENTIONS.md)
- [ ] ✅ Code follows the [FULLSTACK_DEV_STANDARDS.md](../docs/FULLSTACK_DEV_STANDARDS.md)
- [ ] ✅ Linting passes: `npm run lint`
- [ ] ✅ Type checking passes: `npm run type-check`
- [ ] ✅ No console.log, console.error, or debug statements left in code
- [ ] ✅ No hardcoded secrets, API keys, or sensitive data
- [ ] ✅ No commented-out code (use git history instead)
- [ ] ✅ No unused variables or imports
- [ ] ✅ Error handling is appropriate (no silent failures)

### Testing

- [ ] ✅ All existing tests pass: `npm test`
- [ ] ✅ New tests added for new functionality
- [ ] ✅ Tests are meaningful (not just 100% coverage for coverage's sake)
- [ ] ✅ Edge cases and error scenarios covered
- [ ] ✅ No flaky tests

### Documentation

- [ ] ✅ JSDoc comments added for functions (if applicable)
- [ ] ✅ Complex logic has explanatory comments
- [ ] ✅ TypeScript interfaces/types are documented (if new)
- [ ] ✅ README updated (if user-facing changes)
- [ ] ✅ CHANGELOG updated (if release-worthy)

### Database Changes (if applicable)

- [ ] ✅ Migration file created in `supabase/migrations/`
- [ ] ✅ Migration is idempotent (can run multiple times safely)
- [ ] ✅ Migration tested locally
- [ ] ✅ Database naming conventions followed (see NAMING_CONVENTIONS.md)
- [ ] ✅ Row-Level Security (RLS) policies are in place
- [ ] ✅ Indexes created for new foreign keys

### API Changes (if applicable)

- [ ] ✅ API follows REST conventions (GET, POST, PUT, DELETE)
- [ ] ✅ Endpoint naming follows `/api/v1/{resource}` format
- [ ] ✅ API documentation updated
- [ ] ✅ Error responses are consistent
- [ ] ✅ Rate limiting considered

### Configuration Changes (if applicable)

- [ ] ✅ Environment variables documented in `.env.example`
- [ ] ✅ Configuration changes are backward compatible
- [ ] ✅ Secrets are not committed to version control
- [ ] ✅ Feature flags used for breaking changes

### Git Practices

- [ ] ✅ Branch follows naming convention: `{type}/{description}` (e.g., `feature/pdf-upload`)
- [ ] ✅ Commit messages follow convention: `{type}({scope}): {description}`
- [ ] ✅ Commits are logical and focused (not too large, not too small)
- [ ] ✅ No merge commits (use rebase or squash)
- [ ] ✅ PR title is clear and descriptive

---

## Performance Impact

<!-- Does this PR affect performance? Memory usage? Bundle size? -->

- [ ] No performance impact
- [ ] Performance improvement (describe metrics)
- [ ] Potential performance impact (describe and mitigation plan)

### Metrics (if applicable)

<!-- Add any relevant metrics: bundle size, runtime, etc. -->

---

## Browser & Environment Testing

<!-- Mark the environments you tested in -->

- [ ] ✅ Chrome (latest)
- [ ] ✅ Safari (latest)
- [ ] ✅ Firefox (latest)
- [ ] ✅ Mobile (iOS/Android)
- [ ] ✅ Dark mode
- [ ] ✅ Network throttled (slow 3G)

---

## Breaking Changes

<!-- Are there any breaking changes? If yes, describe them and migration steps. -->

- [ ] No breaking changes
- [ ] Breaking changes (describe migration path)

### Migration Steps (if breaking)

<!-- Describe how users/developers should handle this change. -->

---

## Related Issues & PRs

<!-- Link to related issues and PRs -->

- Related to: #123
- Depends on: #456
- Supersedes: #789

---

## Deployment Notes

<!-- Any special considerations for deployment? -->

- Environment variables needed: (list here)
- Database migrations to run: (list here)
- Verification steps: (describe how to verify in production)

---

## Reviewer Checklist

<!-- For reviewers: Did this PR meet expectations? -->

- [ ] ✅ Description is clear and complete
- [ ] ✅ Changes match the description
- [ ] ✅ Code quality is high
- [ ] ✅ Tests are adequate
- [ ] ✅ No security issues
- [ ] ✅ Documentation is updated
- [ ] ✅ All CI checks pass

---

## Additional Notes

<!-- Any additional context? Edge cases? Known issues? -->

---

## Checklist for Maintainers (if this is your PR to main/production)

- [ ] ✅ All conversations resolved
- [ ] ✅ All CI checks passing
- [ ] ✅ At least 1 approval from a reviewer
- [ ] ✅ Ready to merge / Deploy to staging first
- [ ] ✅ Verify in staging environment before production

---

**Thank you for your contribution!** 🎉

If you have any questions or need clarification, please feel free to ask in the comments.
